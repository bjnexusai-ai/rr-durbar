
(function(){'use strict';
/* Live menu + server prices for outlets that are connected to Rista. Add more outlets here later. */
var API='https://rr-durbar-api.ramana-peravali.workers.dev';
var LIVE={moghalrajpuram:'MR',singhnagar:'SN',bhavanipuram:'BH',poranki:'PO',autonagar:'AT'};
var NAMES={moghalrajpuram:'Moghalrajpuram',singhnagar:'Singhnagar',bhavanipuram:'Bhavanipuram',poranki:'Poranki',autonagar:'Autonagar'};
var COD=['MR'];   /* outlets that may take the TEST order (pay at outlet) */
var TEST=false;try{var pv=/^rr-durbar-preview\./.test(location.hostname);if(pv&&/[?&]test=1\b/.test(location.search))sessionStorage.setItem('rrTest','1');TEST=pv&&sessionStorage.getItem('rrTest')==='1'}catch(e){}
var codBusy=false,codId='';
var doc=document,$=function(i){return doc.getElementById(i)};
var p3=$('lvPage'),sel=$('rr-order-outlet')||doc.createElement('select');
if(!p3)return;
function el(t,c,x){var n=doc.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function money(n){var r=Math.round(n*100)/100;return '\u20B9'+r.toLocaleString('en-IN',{minimumFractionDigits:r%1?2:0,maximumFractionDigits:2})}
function slugNow(){var m=/[?&]outlet=([a-z]+)/.exec(location.search);return m&&LIVE[m[1]]?m[1]:null}
function toast(m,err){if(window.rrToast)window.rrToast(m,err?{type:'error'}:undefined)}

/* ---------- state (in memory only) ---------- */
var S={code:null,menu:null,loadedAt:0,loading:false,failed:false,cat:0,q:'',lines:{},order:[],quote:null,quoteFor:'',quoteBusy:false,quoteFailed:false,seq:0};
var dishById={};   /* variant or dish id -> {dish, label} */
function count(){return S.order.reduce(function(s,id){return s+S.lines[id].qty},0)}
function sig(){return S.order.map(function(id){return id+':'+S.lines[id].qty}).join(',')}

/* ---------- API ---------- */
function getMenu(code){
  S.loading=true;S.failed=false;
  return fetch(API+'/api/menu?branch='+encodeURIComponent(code)).then(function(r){if(!r.ok)throw new Error('menu '+r.status);return r.json()}).then(function(j){
    if(!j||!Array.isArray(j.categories))throw new Error('bad menu');
    S.menu=(function(m){var cs=(m&&m.categories)||[];function ok(d){return d.variants&&d.variants.length?d.variants.some(function(v){return !v.soldOut}):!d.soldOut}cs.forEach(function(c){c.items=(c.items||[]).filter(ok).map(function(d,i){return {d:d,i:i}}).sort(function(x,y){return (ok(y.d)?1:0)-(ok(x.d)?1:0)||x.i-y.i}).map(function(x){return x.d})});m.categories=cs.filter(function(c){return c.items.length});m.availCount=cs.reduce(function(n,c){return n+c.items.filter(ok).length},0);return m})(j);S.code=code;S.loadedAt=Date.now();dishById={};
    j.categories.forEach(function(c){c.items.forEach(function(d){
      if(d.variants&&d.variants.length)d.variants.forEach(function(v){dishById[v.id]={dish:d,label:v.label,v:v}});
      else dishById[d.id]={dish:d,label:'',v:d}})});
    S.loading=false;
  }).then(function(){if(!S.menu||S.failed)return;S.prices={};return fetch(API+'/api/prices?branch='+encodeURIComponent(code)).then(function(r){return r.ok?r.json():{}}).then(function(j){S.prices=(j&&j.prices)||{}}).catch(function(){S.prices={}})}).catch(function(){S.loading=false;S.failed=true});
}
var qT=null;
function askQuote(){
  clearTimeout(qT);
  if(!S.order.length){S.quote=null;S.quoteFor='';S.quoteFailed=false;paintCart();return}
  S.quoteBusy=true;S.quoteFailed=false;paintCart();
  qT=setTimeout(function(){
    var my=++S.seq,mine=sig();
    fetch(API+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:S.code,items:S.order.map(function(id){return {id:id,qty:S.lines[id].qty}})})})
    .then(function(r){if(!r.ok)throw new Error('quote '+r.status);return r.json()}).then(function(j){
      if(my!==S.seq)return;S.quote=j;S.quoteFor=mine;S.quoteBusy=false;S.quoteFailed=false;paintCart()})
    .catch(function(){if(my!==S.seq)return;S.quote=null;S.quoteFor='';S.quoteBusy=false;S.quoteFailed=true;paintCart()});
  },250);
}

/* ---------- cart actions ---------- */
function addLine(id){var L=S.lines[id];if(L)L.qty=Math.min(99,L.qty+1);else{S.lines[id]={qty:1};S.order.push(id)}changed()}
function setQty(id,q){if(!S.lines[id])return;if(q<=0){delete S.lines[id];S.order.splice(S.order.indexOf(id),1)}else S.lines[id].qty=Math.min(99,q);changed()}
function changed(){S.quote=null;S.quoteFor='';askQuote();feedNote()}
function lineName(id){var m=dishById[id];if(!m)return id;return m.dish.name+(m.label?' ('+m.label+')':'')}
function feedNote(){
  var nt=$('odNote');if(!nt)return;
  if(!S.order.length){nt.value='';nt.dispatchEvent(new Event('input',{bubbles:true}));return}
  var t=S.order.map(function(id){return S.lines[id].qty+' \u00D7 '+lineName(id)}).join(', ');
  if(S.quote&&S.quoteFor===sig()&&S.quote.allOk)t+=' | Total '+money(S.quote.total)+' (incl. GST)';
  nt.value=t;nt.dispatchEvent(new Event('input',{bubbles:true}));
}

/* ---------- paint ---------- */
var cartBox=null,goBtn=null,listBox=null;
function paintCart(){
  if(!cartBox)return;cartBox.textContent='';
  if(!S.order.length){cartBox.appendChild(el('p','p3-sub','Your cart is empty. Add a dish above.'));if(goBtn)goBtn.disabled=false;updMb();return}
  var q=S.quote&&S.quoteFor===sig()?S.quote:null,byId={};
  if(q)q.lines.forEach(function(l){byId[l.id]=l});
  S.order.forEach(function(id){
    var L=S.lines[id],ql=byId[id],bad=ql&&!ql.ok,r=el('div','p3-line'+(bad?' bad':'')),n=el('span','',lineName(id)),qb=el('div','p3-q'),mi=el('button','','\u2212'),o=el('output','',String(L.qty)),pl=el('button','','+');
    mi.type=pl.type='button';mi.setAttribute('aria-label','Decrease '+lineName(id));pl.setAttribute('aria-label','Increase '+lineName(id));
    mi.addEventListener('click',function(){setQty(id,S.lines[id].qty-1)});pl.addEventListener('click',function(){setQty(id,S.lines[id].qty+1)});
    qb.appendChild(mi);qb.appendChild(o);qb.appendChild(pl);r.appendChild(n);r.appendChild(qb);
    var pr=el('span','',bad?(ql.reason==='sold_out'?'Sold out':'Not available'):ql?money(ql.lineTotal):'\u2026');r.appendChild(pr);
    if(bad){var rm=el('button','lv-rm','Remove');rm.type='button';rm.addEventListener('click',function(){setQty(id,0)});r.appendChild(rm)}
    cartBox.appendChild(r)});
  if(q){
    if(q.allOk){
      var a=el('div','p3-tot');a.appendChild(el('span','','Subtotal'));a.appendChild(el('span','',money(q.subtotal)));cartBox.appendChild(a);
      var g=el('div','p3-tot');g.appendChild(el('span','','GST'));g.appendChild(el('span','',money(q.tax)));cartBox.appendChild(g);
      var t=el('div','p3-tot');t.appendChild(el('span','','Total'));t.appendChild(el('span','',money(q.total)));cartBox.appendChild(t);
    }else cartBox.appendChild(el('p','lv-msg err','Some dishes cannot be ordered right now. Please remove them to continue.'));
  }else if(S.quoteFailed){
    var m=el('p','lv-msg err','Could not get the prices. ');var b=el('button','','Try again');b.type='button';b.addEventListener('click',askQuote);m.appendChild(b);cartBox.appendChild(m);
  }else cartBox.appendChild(el('p','lv-small','Getting prices\u2026'));
  if(q&&q.allOk&&window.RR_CHECKOUT_V2===true){var cv=el('button','btn-gold rr-cv2','Checkout and pay online');cv.type='button';cv.addEventListener('click',function(){try{localStorage.setItem('rr_cart_v2',JSON.stringify({items:S.order.map(function(id){return {id:id,name:lineName(id),qty:S.lines[id].qty,p:(S.prices&&S.prices[id])||0}}),outlet:slugNow()||''}))}catch(e){}location.href='/checkout/v2/'});cartBox.appendChild(cv)}if(goBtn)goBtn.disabled=!(q&&q.allOk);
  feedNote();updMb();
}
var mbBtn=null;
function updMb(){var bar=doc.querySelector('#ordering .od-mbar');if(!bar)return;mbBtn=bar.querySelector('.rr-mb-cart');if(!mbBtn)return;
  var q=S.quote&&S.quoteFor===sig()&&S.quote.allOk?S.quote:null;mbBtn.textContent='Cart \u00B7 '+count()+(q?' \u00B7 '+money(q.total):'')}

/* ---------- TEST order: pay at outlet (needs the secret test code; shown only when the page was opened with test=1) ---------- */
function codBox(code){
  var w=el('div','lv-cod');w.appendChild(el('h4','','Test order \u00B7 pay at outlet'));
  w.appendChild(el('p','lv-small','For testing only. This sends the order to the outlet system with no payment. Tell the outlet first.'));
  function field(label,type,ac){var l=el('label','lv-f');l.appendChild(el('span','',label));var i=el('input');i.type=type;if(ac)i.autocomplete=ac;l.appendChild(i);w.appendChild(l);return i}
  var nm=field('Name','text','name'),ph=field('Phone (10 digits)','tel','tel'),cd=field('Test code','password','off');ph.inputMode='numeric';ph.maxLength=14;
  var out=el('p','lv-msg');out.setAttribute('role','status');
  var b=el('button','p3-go','Place test order');b.type='button';
  function say(t,err){out.className='lv-msg'+(err?' err':'');out.textContent=t}
  b.addEventListener('click',function(){
    if(codBusy)return;
    var q=S.quote&&S.quoteFor===sig()?S.quote:null;
    if(!count()||!q||!q.allOk){say('Add dishes and wait for the prices first.',true);return}
    if(nm.value.trim().length<2){say('Please enter the name.',true);return}
    if(!/^(\+?91)?[6-9]\d{9}$/.test(ph.value.replace(/[\s-]/g,''))){say('Please enter a 10 digit mobile number.',true);return}
    if(!cd.value){say('Please enter the test code.',true);return}
    codBusy=true;b.disabled=true;say('Sending\u2026');
    if(!codId)codId='W'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
    fetch(API+'/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:code,orderId:codId,name:nm.value,phone:ph.value,code:cd.value,items:S.order.map(function(id){return {id:id,qty:S.lines[id].qty}})})})
    .then(function(r){return r.json().then(function(j){return {s:r.status,j:j||{}}},function(){return {s:r.status,j:{}}})})
    .then(function(x){var j=x.j;
      if(x.s===200&&j.dryRun)say('Dry run OK. Nothing was sent. Total '+money(j.total)+'. Ref '+j.orderId);
      else if(x.s===200){say('Order sent. Rista invoice '+(j.invoiceNumber||'(not returned)')+'. Total '+money(j.total)+(j.cashierNotified?'. Cashier notified.':'. Cashier notice not confirmed.'));S.lines={};S.order=[];codId='';changed()}
      else if(x.s===404)say('Test code not accepted.',true);
      else if(x.s===409)say('Some dishes cannot be ordered now. Remove them and try again.',true);
      else if(x.s===502)say('Rista did not accept the order ('+(j.status||'error')+'). '+(j.detail||''),true);
      else say('Could not place the order ('+x.s+').',true)})
    .catch(function(){say('No connection. Please try again.',true)})
    .then(function(){codBusy=false;b.disabled=false})});
  w.appendChild(b);w.appendChild(out);return w}

function dishRow(d){
  var out=d.variants&&d.variants.length?d.variants.every(function(v){return v.soldOut}):!!d.soldOut,row=el('div','lv-d'+(out?' lv-so':'')),ph=el('div','lv-ph');
  if(d.image){var im=doc.createElement('img');im.src=d.image;im.alt='';im.loading='lazy';im.decoding='async';im.referrerPolicy='no-referrer';im.addEventListener('error',function(){im.remove()});ph.appendChild(im)}
  var b=el('div','lv-b'),n=el('h4','lv-n');
  if(d.veg===true||d.veg===false){var v=el('span','lv-veg'+(d.veg?'':' nv'));v.setAttribute('role','img');v.setAttribute('aria-label',d.veg?'Vegetarian':'Non-vegetarian');n.appendChild(v)}
  n.appendChild(doc.createTextNode(d.name));b.appendChild(n);
  if(d.description)b.appendChild(el('p','lv-ds',d.description.split(/(?<=\.)\s/)[0]));
  var act=el('div','lv-act');
  function btn(label,id,off,why){var pr=S.prices&&S.prices[id],x=el('button','lv-add',off?why:'+ '+label+(pr?' \u00B7 '+money(pr):''));x.type='button';x.disabled=!!off;if(!off){x.setAttribute('aria-label','Add '+d.name+(label!=='Add'?' ('+label+')':''));x.addEventListener('click',function(){addLine(id);toast(d.name+' added')})}return x}
  if(d.variants&&d.variants.length){d.variants.forEach(function(v){act.appendChild(btn(v.label,v.id,v.soldOut||!v.orderable,v.soldOut?v.label+' \u00B7 sold out':v.label+' \u00B7 call'))})}
  else if(d.soldOut)act.appendChild(el('span','lv-off','Sold out'));
  else if(!d.orderable)act.appendChild(el('span','lv-off','Call to order'));
  else act.appendChild(btn('Add',d.id,false));
  b.appendChild(act);row.appendChild(ph);row.appendChild(b);return row}

function paintList(){
  if(!listBox)return;listBox.textContent='';var cats=S.menu.categories,items;
  if(S.q){var t=S.q.toLowerCase();items=[];cats.forEach(function(c){c.items.forEach(function(d){if(d.name.toLowerCase().indexOf(t)>-1)items.push(d)})});items=items.slice(0,60)}
  else items=(cats[S.cat]||{items:[]}).items;
  if(!S.q&&S.menu.categories.every(function(c){return !(c.items&&c.items.length)})){var am=el('p','lv-msg','No dishes are available at this outlet right now. It may be closed or still getting ready. ');var aa=el('a','','Call 77020 77999');aa.href='tel:+917702077999';am.appendChild(aa);listBox.appendChild(am);return}
   if(!items.length){listBox.appendChild(el('p','lv-msg',S.q?'No dish found. Try another word.':'No dishes in this section.'));return}
  items.forEach(function(d){listBox.appendChild(dishRow(d))})}

function note(text,err,retry){var m=el('p','lv-msg'+(err?' err':''),text);if(retry){var b=el('button','','Try again');b.type='button';b.addEventListener('click',function(){S.loadedAt=0;render()});m.appendChild(b)}
  var a=el('a','','Call 7702077999');a.href='tel:7702077999';if(err)m.appendChild(a);return m}

function render(){
  var slug=slugNow();
  if(!slug){obs.disconnect();p3.classList.add('lv');p3.textContent='';var mm=el('p','lv-msg','Please choose your outlet first. ');var aa=el('a','lv-change','Choose outlet');aa.href='?page=pickup';mm.appendChild(aa);p3.appendChild(mm);return}
  var code=LIVE[slug];
  obs.disconnect();
  try{
    p3.classList.add('lv');p3.setAttribute('aria-live','off');p3.textContent='';
    p3.appendChild(el('p','rr-eyebrow','Pickup'));p3.appendChild(el('h1','rr-heading','Your pickup order \u00B7 '+NAMES[slug]));
    p3.appendChild(el('p','p3-sub','Live menu from the outlet. Add dishes, then send the order to the outlet on WhatsApp.'));
    var cpar=el('p','lv-small'),chg=el('a','lv-change','Change outlet');chg.href='?page=pickup';cpar.appendChild(chg);p3.appendChild(cpar);
    if(window.RRCart&&RRCart.count()>0){var w=el('p','lv-msg','Dishes you added from the menu page are not in this order. ');var cb=el('button','','Remove them');cb.type='button';cb.addEventListener('click',function(){RRCart.clear();w.remove()});w.appendChild(cb);p3.appendChild(w)}
    var fresh=S.menu&&S.code===code&&Date.now()-S.loadedAt<60000;
    if(!fresh){
      if(S.loading){p3.appendChild(note('Loading the menu\u2026'))}
      else if(S.failed){p3.appendChild(note('The live menu is not available right now. ',true,true))}
      else{p3.appendChild(note('Loading the menu\u2026'));getMenu(code).then(function(){render()})}
      cartBox=goBtn=listBox=null;return}
    /* tools */
    if(S.menu.availCount<20)p3.appendChild(el('p','lv-msg','Most dishes at this outlet are unavailable right now. Please check again later or call the outlet.'));var tools=el('div','lv-tools'),s=el('input','lv-search');s.type='search';s.placeholder='Search dishes';s.value=S.q;s.setAttribute('aria-label','Search dishes');
    s.addEventListener('input',function(){S.q=s.value.trim();chips.hidden=!!S.q;paintList()});tools.appendChild(s);p3.appendChild(tools);
    var chips=el('div','lv-chips');chips.setAttribute('role','group');chips.setAttribute('aria-label','Menu sections');chips.hidden=!!S.q;
    S.menu.categories.forEach(function(c,i){var ch=el('button','lv-chip',c.name);ch.type='button';ch.setAttribute('aria-pressed',String(i===S.cat));ch.addEventListener('click',function(){S.cat=i;[].forEach.call(chips.children,function(x,j){x.setAttribute('aria-pressed',String(j===i))});paintList()});chips.appendChild(ch)});
    p3.appendChild(chips);
    listBox=el('div','lv-list');p3.appendChild(listBox);paintList();
    p3.appendChild(el('p','lv-small','Item prices are before GST where applicable. The final amount with GST is shown in your cart.'));
    if(S.menu.soldOutKnown===false)p3.appendChild(el('p','lv-small','Sold-out marks are not available right now. The outlet will confirm each dish.'));
    cartBox=el('div','p3-cart');cartBox.id='rrP3Cart';p3.appendChild(cartBox);
    var nw=el('label','lv-name');nw.appendChild(el('span','','Your name'));var ni=el('input');ni.type='text';ni.autocomplete='name';ni.value=S.name||'';ni.addEventListener('input',function(){S.name=ni.value});nw.appendChild(ni);p3.appendChild(nw);
    goBtn=el('button','p3-go','Review & send on WhatsApp');goBtn.type='button';goBtn.id='rrP3Go';
    goBtn.addEventListener('click',function(){
      if(!count()){toast('Add at least one dish first',true);return}
      var q=S.quote&&S.quoteFor===sig()?S.quote:null;if(!q||!q.allOk){toast('Please wait for the prices',true);return}
      if(!(S.name||'').trim()){ni.focus();toast('Add your name first',true);return}
      var tx="Hi RR Durbar, I'd like to place a pickup order.\nOutlet: "+NAMES[slug]+"\nName: "+S.name.trim()+"\nOrder: "+S.order.map(function(id){return S.lines[id].qty+' x '+lineName(id)}).join(', ')+"\nTotal: "+money(q.total)+' (incl. GST)';
      window.open('https://wa.me/917702077999?text='+encodeURIComponent(tx),'_blank','noopener')});
    p3.appendChild(goBtn);
    p3.appendChild(el('p','p3-note','Online payment is not live yet. The outlet confirms your order on WhatsApp or by phone. Prices come from the outlet\u2019s system.'));
    if(TEST&&COD.indexOf(code)>-1)p3.appendChild(codBox(code));
    if(S.order.length&&!(S.quote&&S.quoteFor===sig()))askQuote();else paintCart();
  }finally{obs.observe(p3,{childList:true});}
}

/* The existing script rebuilds #rrP3 whenever the step changes. We watch it and put the live panel back. */
var obs=new MutationObserver(function(){});
var pg=$('pickup-menu'),lastKey='';
function onPage(){if(pg.classList.contains('rr-page-visible')){var k=location.search;if(k!==lastKey||!p3.firstChild){lastKey=k;render()}}else lastKey=''}
new MutationObserver(onPage).observe(pg,{attributes:true,attributeFilter:['class']});window.addEventListener('popstate',function(){setTimeout(onPage,50)});onPage();

/* Pickup page: "Order pickup" for a live outlet goes to Order Now, step 3, with the outlet chosen */
window.rrOrderLive=function(slug){var h='?page=pickup-menu&outlet='+slug;if(window.rrGo)window.rrGo(h);else location.href=h};
/* v88: picking an outlet in the Order Now dropdown goes straight to its menu page (no location wait) */
var osel=$('rr-order-outlet');
if(osel)osel.addEventListener('change',function(e){
  var o=osel.options[osel.selectedIndex];if(!o||!o.value)return;
  e.stopImmediatePropagation();
  var t=(o.text+' '+o.value).toLowerCase(),slug=null;for(var k in LIVE)if(t.indexOf(k)>-1)slug=k;
  osel.selectedIndex=0;
  if(slug)window.rrOrderLive(slug);else toast('This outlet takes orders by phone: 7702077999',true)
},true);
window.RR_LIVE_OUTLETS=LIVE;
})();

;

(function(){'use strict';
var doc=document,nav=doc.querySelector('nav.top-nav');if(!nav||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var links=nav.querySelector('.nav-links'),last=window.scrollY,tick=false;
window.addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;var y=window.scrollY,d=y-last;
 var open=doc.querySelector('.mobile-menu[aria-expanded="true"]')||nav.contains(doc.activeElement)||(links&&links.matches(':hover'));
 if(y<320||open||d<-6)doc.body.classList.remove('rr-nav-hide');else if(d>10)doc.body.classList.add('rr-nav-hide');
 if(Math.abs(d)>6)last=y;else if(y<320)last=y})},{passive:true});
})();

;
(function(){
var P={home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6"/>',
menu:'<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6M9 3v6"/><path d="M17 21V3c-2 1-3 4-3 8h3"/>',
order:'<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
branches:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
catering:'<path d="M3 17h18"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V5"/><path d="M10 5h4"/>',
contact:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
track:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
policies:'<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M10 12h6M10 16h6"/>'};
function key(t){t=(t||'').toLowerCase();return t.indexOf('home')>-1?'home':t.indexOf('about')>-1?'about':t.indexOf('track')>-1?'track':t.indexOf('order')>-1?'order':t.indexOf('menu')>-1?'menu':t.indexOf('branch')>-1?'branches':t.indexOf('cater')>-1?'catering':t.indexOf('contact')>-1?'contact':t.indexOf('polic')>-1?'policies':''}
function icons(){document.querySelectorAll('.mobile-nav-panel a').forEach(function(a){if(a.querySelector('.rr-ni'))return;var k=key(a.textContent);if(!k)return;var s=document.createElement('span');s.className='rr-ni';s.setAttribute('aria-hidden','true');s.innerHTML='<svg viewBox="0 0 24 24" focusable="false">'+P[k]+'</svg>';a.insertBefore(s,a.firstChild)})}
icons();addEventListener('load',function(){icons();setTimeout(icons,600)});
var pn=document.querySelector('.mobile-nav-panel');if(pn&&window.MutationObserver)new MutationObserver(icons).observe(pn,{childList:true});
})();
;
(function(){
if(!matchMedia('(max-width:1050px) and (min-height:500px)').matches)return;
var P={Home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
Menu:'<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6M9 3v6"/><path d="M17 21V3c-2 1-3 4-3 8h3"/>',
Order:'<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
Branches:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
Contact:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'};
P.About='<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>';P.Catering='<path d="M3 17h18"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V5"/>';
var T=[['Home','Home'],['About Us','About'],['Menu','Menu'],['Order Now','Order'],['Branches','Branches'],['Catering','Catering'],['Contact','Contact']];
var src=document.querySelectorAll('.nav-links a');if(!src.length)return;
var bar=document.createElement('nav');bar.id='rr-tabbar';bar.setAttribute('aria-label','Main navigation');
T.forEach(function(t){var a=[].filter.call(src,function(x){return x.textContent.trim().toLowerCase()===t[0].toLowerCase()})[0];if(!a)return;
 var l=document.createElement('a');l.setAttribute('href',a.getAttribute('href'));l.dataset.k=t[1];
 l.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+P[t[1]]+'</svg><span>'+t[0]+'</span>';bar.appendChild(l)});
if(bar.children.length<3)return;
document.body.appendChild(bar);document.documentElement.classList.add('rr-tabs');
function sync(){var q=location.search+location.hash,cur='Home';
 if(/page=menu/.test(q))cur='Menu';else if(/page=order|page=pickup|ordering/.test(q))cur='Order';else if(/page=branches|br-locator/.test(q))cur='Branches';else if(/page=about/.test(q))cur='About';else if(/page=catering/.test(q))cur='Catering';else if(/page=contact|#contact/.test(q))cur='Contact';
 else if(/page=home/.test(q))cur='Home';else if(/page=/.test(q))cur='';
 [].forEach.call(bar.children,function(a){var on=a.dataset.k===cur;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(cur!==bar.__cur){bar.__cur=cur;var o=bar.querySelector('.on');if(o&&bar.scrollWidth>bar.clientWidth+2)bar.scrollTo({left:Math.max(0,o.offsetLeft-(bar.clientWidth-o.offsetWidth)/2),behavior:'auto'})}}
sync();['popstate','hashchange','click'].forEach(function(e){addEventListener(e,function(){setTimeout(sync,60);setTimeout(sync,500)})});
setInterval(sync,1500);
})();
;
(function(){
var box=document.getElementById('musicBox'),btn=document.getElementById('musicButton'),txt=document.getElementById('musicText'),au=document.getElementById('royalAudio');
if(!box||!btn||!au)return;
/* the whole pill is the button, not just the small circle */
box.style.cursor='pointer';
box.addEventListener('click',function(e){if(e.target.closest('#musicButton'))return;btn.click()});
/* tell the visitor when the browser refused or the file did not load */
btn.addEventListener('click',function(){setTimeout(function(){if(au.paused&&txt&&/^Off/.test(txt.textContent)){txt.textContent=au.error?'Music unavailable':'Tap again to play'}},1800)});
})();
;
(function(){var L=window.RR_LISTINGS||{};var h=document.querySelector('#m52 .ord');if(!h)return;h.querySelectorAll('a.m52-btn').forEach(function(a){var u=L[a.textContent.trim().toLowerCase()];if(!u||a.getAttribute('href'))return;a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('off');a.removeAttribute('aria-disabled');a.removeAttribute('title')})})();
;
(function(){function fix(){var s=document.getElementById("rr-order-outlet");if(!s)return;Array.prototype.slice.call(s.options).forEach(function(o){if(/patamatalanka/i.test(o.text+" "+o.value))s.removeChild(o)})}fix();var s=document.getElementById("rr-order-outlet");if(s&&window.MutationObserver)new MutationObserver(fix).observe(s,{childList:true});document.addEventListener("DOMContentLoaded",fix);window.addEventListener("load",fix)})();
;
(function(){var S=[[10,0],[8,0],[6,0],[4,0],[4,14],[3,13],[2,12.5],[2,12]];function q(x){return document.querySelector(x)}function fits(){var c=q(".nav-contact"),l=q(".nav-links"),a=q(".nav-actions"),n=q(".nav-inner");if(!c||!l||!a||!n)return true;var lr=l.getBoundingClientRect();if(!lr.width)return true;var cs=getComputedStyle(n),nr=n.getBoundingClientRect(),cr=c.getBoundingClientRect(),ar=a.getBoundingClientRect();return cr.right<=nr.right-parseFloat(cs.paddingRight)+1&&cr.right<=innerWidth-16&&lr.right<=ar.left}function apply(p,f){var L=document.querySelectorAll(".nav-links a");for(var i=0;i<L.length;i++){L[i].style.setProperty("padding-left",p+"px","important");L[i].style.setProperty("padding-right",p+"px","important");if(f)L[i].style.setProperty("font-size",f+"px","important");else L[i].style.removeProperty("font-size")}}function fit(){for(var i=0;i<S.length;i++){apply(S[i][0],S[i][1]);if(fits())return}}var t;function later(){clearTimeout(t);t=setTimeout(fit,60)}fit();window.addEventListener("resize",later);window.addEventListener("load",function(){fit();setTimeout(fit,1500)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit)})();
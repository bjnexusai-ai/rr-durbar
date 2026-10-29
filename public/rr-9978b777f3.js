(function(){
var STAFF_NUMBER='917702077999';
var ORDER_URL='?page=order-now#ordering';
var root=document.getElementById('rrw'),panel=document.getElementById('rrw-panel'),body=document.getElementById('rrw-body'),form=document.getElementById('rrw-form'),input=document.getElementById('rrw-name'),launch=document.getElementById('rrw-launch');
var WA='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
var started=false,name='',reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var wait=function(ms){return new Promise(function(r){setTimeout(r,reduce?60:ms)})};
var toEnd=function(){body.scrollTop=body.scrollHeight};
function bubble(text,me){var d=document.createElement('div');d.className='rrw-msg'+(me?' me':'');d.textContent=text;body.appendChild(d);toEnd();return d}
async function bot(text){var t=document.createElement('div');t.className='rrw-typing';t.innerHTML='<i></i><i></i><i></i>';body.appendChild(t);toEnd();await wait(350);t.remove();bubble(text);await wait(150)}
var OUTLETS=[['Singhnagar','singhnagar'],['Moghalrajpuram','moghalrajpuram'],['Bhavanipuram','bhavanipuram'],['Poranki','poranki'],['Autonagar','autonagar']];
function clearOpts(){body.querySelectorAll('.rrw-opts').forEach(function(x){x.remove()})}
function lnk(cls,href,label){var a=document.createElement('a');a.className=cls;a.href=href;a.textContent=label;a.addEventListener('click',close);return a}
function btn(label,fn){var b=document.createElement('button');b.type='button';b.className='rrw-chip';b.textContent=label;b.addEventListener('click',fn);return b}
function options(){
 clearOpts();
 var w=document.createElement('div');w.className='rrw-opts';
 var o=lnk('rrw-opt rrw-order',ORDER_URL,'🍽️  Order Now');
 var g=document.createElement('div');g.className='rrw-grid';
 g.append(lnk('rrw-chip','?page=menu#menu-page','📖 Menu'),btn('🥡 Pickup menu',pickOutlet),lnk('rrw-chip','?page=branches#br-locator','📍 Branches'),lnk('rrw-chip','?page=catering#catering','🎉 Catering'),lnk('rrw-chip','?page=about-us#about','👑 About us'),lnk('rrw-chip','?page=contact#contact','📞 Contact'));
 var msg="Hi RR Durbar, "+(name?"I'm "+name+". ":"")+"I'd like to talk to the restaurant staff.";
 var s=document.createElement('a');s.className='rrw-opt rrw-staff';s.target='_blank';s.rel='noopener noreferrer';s.href='https://wa.me/'+STAFF_NUMBER+'?text='+encodeURIComponent(msg);s.innerHTML=WA+'<span>Talk to restaurant staff</span>';
 w.append(o,g,s);body.appendChild(w);toEnd();
}
async function pickOutlet(){
 clearOpts();bubble('Pickup menu',true);await wait(200);
 await bot('Which outlet will you pick up from?');
 var w=document.createElement('div');w.className='rrw-opts';
 var g=document.createElement('div');g.className='rrw-grid';
 OUTLETS.forEach(function(x){g.appendChild(lnk('rrw-chip','?page=pickup-menu&outlet='+x[1],x[0]))});
 g.appendChild(lnk('rrw-chip','tel:+'+STAFF_NUMBER,'Patamatalanka · call'));
 g.appendChild(btn('← Back',options));
 w.appendChild(g);body.appendChild(w);toEnd();
}
async function run(){
 await bot('\uD83D\uDC4B Welcome to RR Durbar!');
 await bot('How can we assist you today?');
 await bot('First, may I have your name?');
 form.hidden=false;setTimeout(function(){input.focus({preventScroll:true})},50);
}
async function proceed(n){
 form.hidden=true;name=n;
 if(n){bubble(n,true);await wait(300);await bot('Nice to meet you, '+n+'! Choose an option below.')}
 else{await bot('No problem! Choose an option below.')}
 options();
}
function open(){root.classList.add('open');panel.setAttribute('aria-hidden','false');launch.setAttribute('aria-expanded','true');if(!started){started=true;run()}}
function close(){root.classList.remove('open');panel.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','false')}
launch.addEventListener('click',function(){root.classList.contains('open')?close():open()});
document.getElementById('rrw-close').addEventListener('click',close);
form.addEventListener('submit',function(e){e.preventDefault();proceed(input.value.trim())});
document.getElementById('rrw-skip').addEventListener('click',function(){proceed('')});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
window.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#rrw-body a');if(t)close()},true);
})();
;
(function(){var el=document.getElementById('awards');if(!el)return;if(!('IntersectionObserver' in window)){el.classList.add('rrA-in');return}var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){el.classList.add('rrA-in');io.disconnect()}},{threshold:.12});io.observe(el)})();
;
(function(){
var MAP=[['#bestsellers .rr-food-card','?page=menu#menu-page','View menu'],['#why-us .rr-card','?page=about-us#story','Our story'],['#awards .rrA-card','?page=about-us#story','Our story']];
MAP.forEach(function(m){document.querySelectorAll(m[0]).forEach(function(el){
 if(el.dataset.rrc)return;el.dataset.rrc=m[1];el.tabIndex=0;el.setAttribute('role','link');
 var host=el.querySelector('figcaption')||el;var more=document.createElement('span');more.className='rrC-more';more.textContent=m[2];host.appendChild(more);
 var go=function(){if(window.rrGo&&/^[?#]/.test(m[1]))window.rrGo(m[1]);else location.href=m[1]};
 el.addEventListener('click',function(e){if(e.target.closest('a,button'))return;go()});
 el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
})});
/* mobile nav parity: add the 3 pages the desktop bar does not list */
var panel=document.querySelector('.mobile-nav-panel');
if(panel){[['Loyalty / Rewards','?page=loyalty#loyalty'],['Contact','?page=contact#contact'],['Catering','?page=catering#catering'],['Policies','?page=policies#policies']].forEach(function(l){if(panel.querySelector('a[href="'+l[1]+'"]'))return;var a=document.createElement('a');a.setAttribute('href',l[1]);a.textContent=l[0];a.addEventListener('click',function(){var mb=document.querySelector('.mobile-menu');if(panel.classList.contains('open')&&mb)mb.click()});panel.appendChild(a)})}
/* reveal + count-up */
if(!('IntersectionObserver' in window)||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
function count(el){var t=el.textContent.trim();var mm=t.match(/^(\d+)(.*)$/);if(!mm)return;var end=+mm[1],suf=mm[2],t0=performance.now();(function f(n){var p=Math.min(1,(n-t0)/1100);el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+suf;if(p<1)requestAnimationFrame(f)})(t0)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);el.classList.add('rr-in');
 if(el.classList.contains('rr-stat')){var st=el.querySelector('strong');if(st)count(st)}
 setTimeout(function(){el.classList.remove('rr-rv','rr-in')},1400+(parseInt(el.style.getPropertyValue('--rd'))||0))})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function scan(){document.querySelectorAll('main>section.rr-page-visible:not(#home):not(#awards) .rr-container>*').forEach(function(ch){
 var kids=(/grid|flex/.test(getComputedStyle(ch).display)&&ch.children.length>1)?Array.prototype.slice.call(ch.children):[ch];
 kids.forEach(function(k,i){if(k.dataset.rrs)return;k.dataset.rrs='1';k.classList.add('rr-rv');k.style.setProperty('--rd',(Math.min(i,8)*70)+'ms');io.observe(k)})})}
scan();
var rrq=0;new MutationObserver(function(){if(rrq)return;rrq=setTimeout(function(){rrq=0;scan()},250)}).observe(document.querySelector('main')||document.body,{attributes:true,attributeFilter:['class'],subtree:true});
})();
;

(()=>{
/* Ordering chips: set real listing URLs here when the client supplies them (never guess). */
window.RR_LISTINGS=window.RR_LISTINGS||{swiggy:'https://www.swiggy.com/city/vijayawada/rr-durbar-siddhartha-nagar-labbipet-rest68611',zomato:'https://www.zomato.com/vijayawada/restaurants/rrs-durbar?category=1'};
/* Form delivery: set to the WordPress endpoint (wp_mail via WP Mail SMTP) at conversion.
   Expected: POST JSON {form,fields}; respond 200 {ok:true}. Empty = not connected, and NO success is ever shown. */
const RR_FORM_ENDPOINT='';
const WA='917702077999';
const msgs={catering:'Online enquiries are not live yet. Please use Send on WhatsApp or call 77020 77999.',contact:'Online messages are not live yet. Please use Send on WhatsApp or call 77020 77999.',checkout:'Online payment is not live yet. Please call 77020 77999 to place your pickup order.'};
function vals(f){const o={};f.querySelectorAll('input,select,textarea').forEach(e=>{if(e.name)o[e.name]=e.value.trim()});return o}
function validate(f){let ok=true;f.querySelectorAll('.rr-err').forEach(e=>e.remove());
 f.querySelectorAll('input,select,textarea').forEach(e=>{e.removeAttribute('aria-invalid');let m='';const v=e.value.trim();
  if(e.required&&!v)m='This field is required.';
  else if(e.type==='tel'&&v&&!/^\+?[\d\s-]{10,14}$/.test(v))m='Enter a valid phone number.';
  else if(e.type==='email'&&v&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))m='Enter a valid email address.';
  if(m){ok=false;e.setAttribute('aria-invalid','true');const s=document.createElement('small');s.className='rr-err';s.textContent=m;e.after(s)}});
 if(!ok){const b=f.querySelector('[aria-invalid]');b&&b.focus()}return ok}
function status(f,t,tone){const p=f.querySelector('.rr-form-status');if(!p)return;p.textContent=t;p.hidden=!t;p.dataset.tone=tone||''}
document.querySelectorAll('form[data-rr-form]').forEach(f=>{
 const kind=f.dataset.rrForm,btn=f.querySelector('[data-rr-submit]');let busy=false;
 f.addEventListener('submit',async e=>{e.preventDefault();if(busy||!validate(f))return;
  if(!RR_FORM_ENDPOINT){status(f,msgs[kind],'notice');return}
  busy=true;btn.disabled=true;const label=btn.textContent;btn.textContent='Sending…';status(f,'');
  try{const r=await fetch(RR_FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form:kind,fields:vals(f)})});
   if(!r.ok)throw 0;status(f,'Thank you. We have received your request and will get back to you shortly.');f.reset()}
  catch(_){status(f,'Something went wrong, so your request was not sent. Please try again, or use WhatsApp or call.','error')}
  finally{busy=false;btn.disabled=false;btn.textContent=label}});
 const wa=f.querySelector('[data-rr-wa]');
 if(wa)wa.addEventListener('click',e=>{if(!validate(f)){e.preventDefault();return}
  const v=vals(f),t='Hi RR Durbar, '+(kind==='catering'?'catering enquiry':'message')+':\n'+Object.entries(v).filter(([,x])=>x).map(([k,x])=>k+': '+x).join('\n');
  wa.href='https://wa.me/'+WA+'?text='+encodeURIComponent(t)})});
/* page H1: first heading on routed (non-home) pages */
function h1(){document.querySelectorAll('.rr-h1').forEach(e=>e.classList.remove('rr-h1'));
 if(document.body.classList.contains('rr-home-route'))return;
 const first=[...document.querySelectorAll('main>section.rr-page-visible')].sort((a,b)=>(+a.style.order||0)-(+b.style.order||0))[0];
 const h=first&&first.querySelector('.rr-heading');if(h)h.classList.add('rr-h1')}
h1();
})();

;

(()=>{
let q=0;const kick=()=>{if(!q){q=requestAnimationFrame(()=>{q=0;run()})}};
const now=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':');return +p[0]*60+ +p[1]};
const mins=t=>{const m=t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);if(!m)return null;let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;return h*60+ +m[2]};
function run(){
 document.querySelectorAll('.rr-location-card:not([data-rr-st])').forEach(c=>{c.dataset.rrSt='1';
  const p=[...c.querySelectorAll('p')].find(x=>/AM\s*[\u2013-]\s*\d/.test(x.textContent));if(!p)return;
  const r=p.textContent.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*[\u2013-]\s*(\d{1,2}:\d{2}\s*[AP]M)/i);if(!r)return;
  const a=mins(r[1]),b=mins(r[2]),n=now(),open=a<=b?(n>=a&&n<b):(n>=a||n<b);
  const s=document.createElement('span');s.className='rr-open-status';s.dataset.open=open?'1':'0';s.textContent=open?'Open now':'Closed now';p.after(s)});
 document.querySelectorAll('a.rr-order-chip[aria-disabled="true"]').forEach(a=>{const b=document.createElement('button');b.type='button';b.disabled=true;b.className=a.className;b.textContent=a.textContent;b.title=a.title||'Link coming soon';a.replaceWith(b)});
 const mq=document.querySelector('.rrA-marquee');
 if(mq&&!mq.parentNode.querySelector('.rrA-pause')){const t=mq.querySelector('.rrA-track'),b=document.createElement('button');b.type='button';b.className='rrA-pause';b.setAttribute('aria-pressed','false');b.textContent='Pause awards';
  b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',String(!on));b.textContent=on?'Pause awards':'Play awards';t&&t.classList.toggle('is-paused',!on)});mq.before(b)}
}
run();new MutationObserver(kick).observe(document.body,{childList:true,subtree:true});
/* contact dock: hide while scrolling down, return on scroll up */
const dock=document.querySelector('.rrw');let y=window.scrollY;
if(dock)addEventListener('scroll',()=>{const c=window.scrollY,d=c-y;if(Math.abs(d)<8)return;dock.classList.toggle('rr-away',d>0&&c>240);y=c},{passive:true});
})();

;

(function(){var s=document.querySelector('.rrm-lights');if(!s)return;
function build(){var w=s.parentNode.clientWidth,sw=110,n=Math.ceil(w/sw),h=46,o='';
o+='<path d="';for(var i=0;i<n;i++){o+=(i?'':'M0 6 ')+'Q'+(i*sw+sw/2)+' 40 '+((i+1)*sw)+' 6 ';}o+='" fill="none" stroke="#8a6a24" stroke-width="1.4"/>';
for(var i=0;i<n;i++){for(var k=1;k<=5;k++){var t=k/6,x=i*sw+t*sw,y=(1-t)*(1-t)*6+2*(1-t)*t*40+t*t*6;
o+='<g class="rrm-bulb b'+((i+k)%3)+'"><line x1="'+x+'" y1="'+y+'" x2="'+x+'" y2="'+(y+5)+'" stroke="#8a6a24" stroke-width="1"/><ellipse cx="'+x+'" cy="'+(y+9)+'" rx="3.2" ry="4.4"/></g>';}}
s.setAttribute('viewBox','0 0 '+w+' '+h);s.setAttribute('width',w);s.setAttribute('height',h);s.innerHTML=o;}
build();var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});})();


;

(function(){
const OUTLETS = [{"id": "singhnagar", "name": "Singhnagar", "address": "42-3-3, Budameru Centre, Ramakrishnapuram, Vijayawada, 520011", "hours": "Open daily 11:00 AM – 11:30 PM", "pos": [154, 85], "lat": 16.5332, "lng": 80.6358, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5332,80.6358", "photo": null, "photoAlt": ""}, {"id": "moghalrajpuram", "name": "Moghalrajpuram", "address": "40-7-3, Near Jammichettu Centre, Moghalrajpuram, Vijayawada, 520010", "hours": "Open daily 11:00 AM – 11:30 PM", "pos": [328, 125], "lat": 16.5057, "lng": 80.6384, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5057,80.6384", "photo": "assets/a3767495a0-w.webp", "photoAlt": "Carved golden ceiling, chandelier and framed artwork at the Moghalrajpuram outlet"}, {"id": "bhavanipuram", "name": "Bhavanipuram", "address": "D.No 76/8/15, Taruni Nilayam, Crombay Road, Bhavanipuram, Vijayawada, 520012", "hours": "Open daily 11:00 AM – 11:30 PM", "pos": [171, 245], "lat": 16.5369, "lng": 80.5898, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5369,80.5898", "photo": "assets/72e238c39f.webp", "photoAlt": "Booth seating along the painted elephant mural wall at the Bhavanipuram outlet"}, {"id": "poranki", "name": "Poranki", "address": "15-160, Vijayawada Rd, Poranki, Vijayawada, 521137", "hours": "Open daily 11:00 AM – 11:30 PM", "pos": [261, 370], "lat": 16.4801, "lng": 80.6922, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.4801,80.6922", "photo": null, "photoAlt": ""}, {"id": "patamatalanka", "name": "Patamatalanka", "address": "FMR4+G2F, Krishnaveni School Road, Patamatalanka, Vijayawada, 520010", "hours": "Open daily 11:00 AM – 11:30 PM", "pos": [505, 365], "lat": 16.4912, "lng": 80.6554, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.4912,80.6554", "photo": null, "photoAlt": ""}, {"id": "autonagar", "name": "Autonagar", "address": "Besides RR Chickens, Ballemvari Street, Murali Nagar, Auto Nagar, Vijayawada, 520007", "hours": "Call for hours", "pos": [502, 510], "lat": 16.5161, "lng": 80.6728, "phone": "+91 77020 77999", "tel": "+917702077999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5161,80.6728", "photo": null, "photoAlt": ""}];
const NS='http://www.w3.org/2000/svg';
const root=document.getElementById('br-locator');if(!root)return;
const $=(s,r=root)=>r.querySelector(s), $$=(s,r=root)=>[...r.querySelectorAll(s)];

/* ── outlet geometry ── */
const MW=1220,MH=890,HUB=[790, 300],PX={"singhnagar": [545, 223], "moghalrajpuram": [563, 388], "bhavanipuram": [223, 201], "poranki": [939, 542], "patamatalanka": [682, 475], "autonagar": [760, 700]};
const geo={}; OUTLETS.forEach(o=>{o.pos=PX[o.id];geo[o.id]=o.pos});

function el(n,a={},p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}

function buildMap(){
  const svg=$('#land');
  if(svg){const rg=el('g',{id:'routes'},svg);
  OUTLETS.forEach(o=>{const d=routePath(o);el('path',{d,class:'flow'},rg);const p=el('path',{d,class:'route','data-id':o.id},rg);const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.setProperty('--len',L)});}
  const hub=$('.hub');hub.style.left=(HUB[0]/MW*100)+'%';hub.style.top=(HUB[1]/MH*100)+'%';
}
function routePath(o){const [x,y]=o.pos,dx=x-HUB[0],dy=y-HUB[1],d=Math.hypot(dx,dy),s=(OUTLETS.indexOf(o)%2?1:-1)*.16;
  const mx=(x+HUB[0])/2-dy*s,my=(y+HUB[1])/2+dx*s;return `M${HUB[0]},${HUB[1]}Q${mx.toFixed(1)},${my.toFixed(1)} ${x},${y}`}

function buildPins(){
  const host=$('#pins');
  OUTLETS.forEach(o=>{
    const b=document.createElement('button');b.type='button';b.className='pin';b.dataset.id=o.id;
    b.style.setProperty('--x',(o.pos[0]/MW*100)+'%');b.style.setProperty('--y',(o.pos[1]/MH*100)+'%');
    b.setAttribute('aria-label',o.name+' outlet');b.setAttribute('aria-pressed','false');
    b.innerHTML=`<span class="pin-head"><svg viewBox="0 0 36 44" aria-hidden="true"><defs><linearGradient id="brh-pg${o.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a1a2a"/><stop offset="1" stop-color="#4a0a14"/></linearGradient></defs><path d="M18 43C9 31 2 25 2 16.500 2 8 9 2 18 2s16 6 16 14.500C34 25 27 31 18 43z" fill="url(#brh-pg${o.id})" stroke="#f6d78e" stroke-width="2"/><g transform="translate(8.500 8)" fill="#f6d78e"><path d="m1 6 3.500 2.800L9.500 2l5 6.800L18 6l-1.800 9.500H2.800z"/></g></svg></span><span class="pin-lab">${o.name}</span>`;
    host.appendChild(b);
  });
}

/* ── selection ── */
let current=null;
function select(id,{scroll=false}={}){
  const o=OUTLETS.find(x=>x.id===id);if(!o)return;
  current=id;
  $$('.pin').forEach(p=>{const on=p.dataset.id===id;p.classList.toggle('on',on);p.setAttribute('aria-pressed',on)});
  $$('#olist button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id));
  $$('.route').forEach(p=>{p.classList.remove('on');if(p.dataset.id===id){void p.getBoundingClientRect();p.classList.add('on')}});
  $('#pName').textContent=o.name;$('#pAddr').textContent=o.address;$('#pHours').innerHTML=o.hours.replace(/^Open daily /,'Open daily<br>');
  $('#pDir').href=o.directions;$('#pCall').href='tel:'+o.tel;$('#pCall').textContent='Call '+o.phone;
  const ph=$('#pPhoto'),img=$('#pImg');
  if(o.photo){img.src=o.photo;img.alt=o.photoAlt;ph.classList.remove('empty')}else{img.removeAttribute('src');img.alt='';ph.classList.add('empty')}
  const body=$('#pBody');body.classList.remove('swap');void body.offsetWidth;body.classList.add('swap');
  if(scroll)$('#map').scrollIntoView({behavior:'smooth',block:'center'});
}
function hover(id,on){$$(`.pin[data-id="${id}"]`).forEach(p=>p.classList.toggle('is-hover',on));$$(`#olist button[data-id="${id}"]`).forEach(b=>b.classList.toggle('is-hover',on))}

buildMap();buildPins();
root.addEventListener('click',e=>{const t=e.target.closest('[data-id]');if(!t)return;
  if(t.matches('.pin,#olist button'))select(t.dataset.id);
  if(t.matches('[data-show]'))select(t.dataset.id,{scroll:true})});
$$('.pin,#olist button').forEach(n=>{n.addEventListener('mouseenter',()=>hover(n.dataset.id,true));n.addEventListener('mouseleave',()=>hover(n.dataset.id,false))});
$('#olist').addEventListener('keydown',e=>{const k={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];if(!k)return;e.preventDefault();
  const i=OUTLETS.findIndex(o=>o.id===current),n=OUTLETS[(i+k+OUTLETS.length)%OUTLETS.length];select(n.id);$(`#olist button[data-id="${n.id}"]`).focus()});
select(OUTLETS[1].id);

/* ── 2.5D tilt (mouse only) ── */
(function(){
  const map=$('#map'),stage=$('.stage');
  if(!map||matchMedia('(hover:none)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const hero=root;let raf=0;
  hero.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const r=stage.getBoundingClientRect();
    const nx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(window.innerWidth/2)));
    const ny=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(window.innerHeight/2)));
    cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{map.classList.add('live');
      map.style.setProperty('--ry',(nx*7).toFixed(2)+'deg');
      map.style.setProperty('--rx',(-ny*5).toFixed(2)+'deg')});
  });
  hero.addEventListener('pointerleave',()=>{map.classList.remove('live');map.style.removeProperty('--ry');map.style.removeProperty('--rx')});
})();
})();

;
(function(){var t=document.querySelector('.rr-timeline');if(!t)return;
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;if(rm)return;
t.classList.add('rr-draw');var raf=0;
function upd(){raf=0;var r=t.getBoundingClientRect();if(!r.height)return;var mid=innerHeight*.62;
var p=Math.max(0,Math.min(1,(mid-r.top)/r.height));t.style.setProperty('--p',p.toFixed(3));
[].forEach.call(t.children,function(a){var b=a.getBoundingClientRect();a.classList.toggle('rr-lit',b.top+24<mid)})}
function q(){if(!raf)raf=requestAnimationFrame(upd)}
addEventListener('scroll',q,{passive:true});addEventListener('resize',q);upd();setTimeout(upd,600)})();
;
(function(){var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;

var busy=false,tk=0;function comp(){var n=document.querySelector('nav.top-nav');if(!n)return;try{var e=new DOMMatrixReadOnly(getComputedStyle(n).transform).m41||0;n.style.setProperty('--rr-c8',(e*.1)+'px');n.style.setProperty('--rr-c92',(e*.08)+'px')}catch(x){}}comp();addEventListener('resize',comp);function sc(){tk=0;document.body.classList.toggle('rr-scrolled',scrollY>70)}
addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(sc)},{passive:true});sc();
})();
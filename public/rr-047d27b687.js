(function(){var s=document.getElementById('loyalty');if(!s)return;
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var b=s.querySelector('.lc-tb'),c=document.getElementById('lc-tc');
b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);c.hidden=o});
if('IntersectionObserver' in window&&!rm){s.classList.add('lc-js');var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){s.classList.add('lc-in-view');io.disconnect()}},{threshold:.1});io.observe(s)}
})();

;
(function(){var g=document.getElementById('otGrid');var OT=[{"name": "Singhnagar", "address": "42-3-3, Budameru Centre, Ramakrishnapuram, Vijayawada, 520011", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893112999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5332,80.6358", "photo": "assets/br-singhnagar-m.webp", "photoAlt": "RR's Joints storefront at the Singhnagar outlet at dusk"}, {"name": "Moghalrajpuram", "address": "40-7-3, Near Jammichettu Centre, Moghalrajpuram, Vijayawada, 520010", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+919849982304", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5057,80.6384", "photo": "assets/a3767495a0-w.webp", "photoAlt": "Carved golden ceiling, chandelier and framed artwork at the Moghalrajpuram outlet"}, {"name": "Bhavanipuram", "address": "D.No 76/8/15, Taruni Nilayam, Crombay Road, Bhavanipuram, Vijayawada, 520012", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893115999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5369,80.5898", "photo": "assets/72e238c39f.webp", "photoAlt": "Booth seating along the painted elephant mural wall at the Bhavanipuram outlet"}, {"name": "Poranki", "address": "15-160, Vijayawada Rd, Poranki, Vijayawada, 521137", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893116999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.4801,80.6922", "photo": "assets/br-poranki-m.webp", "photoAlt": "RR Durbar building and signage at the Poranki outlet"}, {"name": "Autonagar", "address": "Besides RR Chickens, Ballemvari Street, Murali Nagar, Auto Nagar, Vijayawada, 520007", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+919963551970", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5161,80.6728", "photo": "assets/br-autonagar-m.webp", "photoAlt": "RR Durbar takeaway storefront at the Autonagar outlet at night"}];if(!g)return;function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
OT.forEach(function(o,i){var c=el('article','ot-card'),t=el('div','ot-top');if(o.photo){var im=el('img');im.src=o.photo;im.alt=o.photoAlt||'';im.loading='lazy';im.decoding='async';t.appendChild(im)}
t.appendChild(el('span','ot-no',String(i+1).padStart(2,'0')));t.appendChild(el('h3','ot-name',o.name));c.appendChild(t);
var b=el('div','ot-body');b.appendChild(el('p','ot-addr',o.address));b.appendChild(el('p','ot-hrs',o.hours));
var a=el('div','ot-act'),d=el('a','ot-dir','Directions');d.href=o.directions;d.target='_blank';d.rel='noopener';var p=el('a','ot-call','Call');p.href='tel:'+o.tel;a.appendChild(d);a.appendChild(p);b.appendChild(a);c.appendChild(b);g.appendChild(c)})})();
;
(function(){
/* FILL IN: one Rista ordering link and the real GPS lat/lng per outlet. Empty values are handled. */
var CFG={singhnagar:{rista:"",live:true,lat:16.5332,lng:80.6358},moghalrajpuram:{rista:"",live:true,lat:16.5057,lng:80.6384},bhavanipuram:{rista:"",live:true,lat:16.5369,lng:80.5898},poranki:{rista:"",live:true,lat:16.4801,lng:80.6922},patamatalanka:{rista:"",lat:16.4912,lng:80.6554},autonagar:{rista:"",live:true,lat:16.5161,lng:80.6728}};
var O=[{"id": "singhnagar", "name": "Singhnagar", "address": "42-3-3, Budameru Centre, Ramakrishnapuram, Vijayawada, 520011", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893112999", "phone": "+91 78931 12999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5332,80.6358", "pos": [565, 263]}, {"id": "moghalrajpuram", "name": "Moghalrajpuram", "address": "40-7-3, Near Jammichettu Centre, Moghalrajpuram, Vijayawada, 520010", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+919849982304", "phone": "+91 98499 82304", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5057,80.6384", "pos": [588, 471]}, {"id": "bhavanipuram", "name": "Bhavanipuram", "address": "D.No 76/8/15, Taruni Nilayam, Crombay Road, Bhavanipuram, Vijayawada, 520012", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893115999", "phone": "+91 78931 15999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5369,80.5898", "pos": [318, 258]}, {"id": "poranki", "name": "Poranki", "address": "15-160, Vijayawada Rd, Poranki, Vijayawada, 521137", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+917893116999", "phone": "+91 78931 16999", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.4801,80.6922", "pos": [907, 630]}, {"id": "autonagar", "name": "Autonagar", "address": "Besides RR Chickens, Ballemvari Street, Murali Nagar, Auto Nagar, Vijayawada, 520007", "hours": "Open daily 11:00 AM – 11:59 PM", "tel": "+919963551970", "phone": "+91 99635 51970", "directions": "https://www.google.com/maps/dir/?api=1&destination=16.5161,80.6728", "pos": [763, 817]}],MW=1220,MH=890,list=document.getElementById('pkList'),pins=document.getElementById('pkPins');if(!list)return;
var user=null,sel=null,nearId=null;
function e(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function km(a,b,c,d){var r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 12742*Math.asin(Math.sqrt(h))}
function status(o){var m=/(\d+):(\d+)\s*(AM|PM)\s*\S+\s*(\d+):(\d+)\s*(AM|PM)/i.exec(o.hours||'');if(!m)return{t:o.hours||'Call for hours',k:'call'};
var f=function(h,mi,ap){h=+h%12;if(/p/i.test(ap))h+=12;return h*60+ +mi},a=f(m[1],m[2],m[3]),b=f(m[4],m[5],m[6]);
var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),H=+parts.find(function(p){return p.type==='hour'}).value%24,M=+parts.find(function(p){return p.type==='minute'}).value,n=H*60+M;
return n>=a&&n<b?{t:'Open now · until 11:59 PM',k:'open'}:{t:'Closed now · opens 11:00 AM',k:'closed'}}
function pinSvg(){return '<svg viewBox="0 0 36 44" aria-hidden="true"><path d="M18 43C9 31 2 25 2 16.5 2 8 9 2 18 2s16 6 16 14.5C34 25 27 31 18 43z" fill="#6f0f1c" stroke="#f6d78e" stroke-width="2"/></svg>'}
function select(id){sel=id;[].forEach.call(document.querySelectorAll('#pickup .pk-card'),function(c){c.classList.toggle('on',c.dataset.id===id)});[].forEach.call(document.querySelectorAll('#pickup .pk-pin'),function(c){c.classList.toggle('on',c.dataset.id===id)})}
function render(){var rows=O.map(function(o,i){var c=CFG[o.id]||{},d=(user&&c.lat!=null&&c.lng!=null)?km(user.lat,user.lng,c.lat,c.lng):null;return{o:o,i:i,c:c,d:d}});
if(user)rows.sort(function(a,b){return(a.d==null)-(b.d==null)||a.d-b.d});
nearId=(user&&rows[0]&&rows[0].d!=null)?rows[0].o.id:null;list.textContent='';pins.textContent='';
rows.forEach(function(r){var o=r.o,st=status(o),card=e('article','pk-card'),top=e('div','pk-top');card.dataset.id=o.id;
top.appendChild(e('span','pk-no',String(r.i+1).padStart(2,'0')));var hn=e('h3','pk-name',o.name);hn.dataset.brand=(window.RR_BRAND||{})[o.id]||'';top.appendChild(hn);if(r.d!=null)top.appendChild(e('span','pk-dist',(r.d<10?r.d.toFixed(1):Math.round(r.d))+' km away'));card.appendChild(top);
if(o.id===nearId)card.appendChild(e('span','pk-ribbon','Nearest to you'));
card.appendChild(e('p','pk-addr',o.address));card.appendChild(e('p','pk-st '+st.k,st.t));
var act=e('div','pk-act'),go=e('a','pk-go');
if(r.c.live){go.href='?page=pickup-menu&outlet='+encodeURIComponent(o.id);go.textContent='Order pickup from '+o.name;go.addEventListener('click',function(ev){ev.preventDefault();if(window.rrOrderLive)window.rrOrderLive(o.id)})}else if(r.c.rista){go.href=r.c.rista;go.target='_blank';go.rel='noopener';go.textContent='Order pickup from '+o.name}else{go.href='tel:'+o.tel;go.className+=' off';go.textContent='Call to order · '+o.phone}
var dir=e('a','pk-dir','Directions');dir.href=o.directions;dir.target='_blank';dir.rel='noopener';act.appendChild(go);act.appendChild(dir);card.appendChild(act);
card.addEventListener('click',function(ev){if(!ev.target.closest('a'))select(o.id)});list.appendChild(card);
var pin=e('button','pk-pin'+(o.id===nearId?' near':''));pin.type='button';pin.dataset.id=o.id;pin.style.setProperty('--x',o.pos[0]/MW*100+'%');pin.style.setProperty('--y',o.pos[1]/MH*100+'%');pin.setAttribute('aria-label',o.name);pin.innerHTML=pinSvg()+'<b>'+(r.i+1)+'</b>';
pin.addEventListener('click',function(){select(o.id);card.scrollIntoView({behavior:'smooth',block:'center'})});pins.appendChild(pin)});
select(sel||nearId||rows[0].o.id)}
var btn=document.getElementById('pkLoc'),msg=document.getElementById('pkMsg');
btn.addEventListener('click',function(){if(!navigator.geolocation){msg.textContent='Location is not available on this device.';return}msg.textContent='Finding outlets near you… please allow location access.';
navigator.geolocation.getCurrentPosition(function(p){user={lat:p.coords.latitude,lng:p.coords.longitude};var any=O.some(function(o){return CFG[o.id]&&CFG[o.id].lat!=null});msg.textContent=any?'Outlets listed nearest first, with distance from you.':'Location received. Distances appear once outlet coordinates are added.';render()},function(){msg.textContent='Location is off, so distances are hidden. Tap "Use my location" to try again, or choose any outlet below.'},{timeout:10000,maximumAge:300000})});
[].forEach.call(document.querySelectorAll('#pickup [data-pk-d]'),function(b){b.addEventListener('click',function(){var a=document.getElementById(b.dataset.pkD);if(a&&a.href&&a.href.slice(-1)!=='#')window.open(a.href,'_blank','noopener')})});
/* Pickup buttons on Order Now now open this page */
document.addEventListener('click',function(ev){var t=ev.target.closest&&ev.target.closest('#odPickupBtn,.od-mbar [data-t="p"]');if(!t)return;ev.preventDefault();ev.stopImmediatePropagation();location.href='?page=pickup'},true);
render();
/* auto-ask for the visitor's location as soon as the Pickup page opens (browser shows its own permission prompt) */
var asked=false,sec=document.getElementById('pickup');
function vis(){return sec&&sec.classList.contains('rr-page-visible')}
function ask(){if(asked||!vis())return;asked=true;btn.click()}
if(sec){ask();new MutationObserver(ask).observe(sec,{attributes:true,attributeFilter:['class']});window.addEventListener('load',ask)}
})();
;
(function(){
var ORDER='?page=order-now#ordering',PICK='?page=pickup';
function band(txt){var d=document.createElement('div');d.className='rr-ctaband';d.setAttribute('data-rr-cta','1');var p=document.createElement('p');p.textContent=txt;var a=document.createElement('div');a.className='cb-act';a.innerHTML='<a class="cb-go" href="'+ORDER+'">Order Now</a><a class="cb-pk" href="'+PICK+'">Order Pickup</a>';d.appendChild(p);d.appendChild(a);return d}
var T={updates:'Fresh from the Durbar kitchen. Order now.',trust:'Taste the tradition for yourself.',honours:'Award-winning flavours, at your table.',reviews:'Try it yourself. Order today.',gallery:'Hungry yet? Order your favourites.',loyalty:'Ready for your next royal meal?',stats:'Taste the story. Order now.',awards:'Taste what the awards are about.',reels:'Hungry? Order in a minute.','br-list':'Prefer to eat at home? Order pickup or delivery.',contact:'Skip the call. Order online.',locations:'Order from your nearest outlet.'};
Object.keys(T).forEach(function(id){var s=document.getElementById(id);if(!s||s.querySelector('[data-rr-cta]'))return;var c=s.querySelector('.rr-container,.rv-in,.wrap')||s;c.appendChild(band(T[id]))});
var o=document.querySelector('#outlets .ot-more');if(o&&!o.querySelector('.rr-gold-button.pk')){var a=document.createElement('a');a.className='rr-gold-button pk';a.href=PICK;a.textContent='Order pickup';a.style.marginLeft='10px';o.appendChild(a);o.style.flexWrap='wrap';o.style.gap='10px'}
var hb=document.querySelector('#home .hero-bottom');if(hb&&!document.querySelector('.rr-hero-order')){var h=document.createElement('div');h.className='rr-hero-order';h.setAttribute('data-rr-cta','1');h.innerHTML='<a class="cb-go" href="'+ORDER+'">Order Now</a><a class="cb-pk" href="'+PICK+'">Order Pickup</a>';var f=hb.querySelector('.hero-first');if(f&&f.nextSibling)hb.insertBefore(h,f.nextSibling);else hb.insertBefore(h,hb.firstChild)}
var cards=document.getElementById('odCards');if(cards&&!document.querySelector('.od-dots')){var dots=document.createElement('div');dots.className='od-dots';dots.setAttribute('aria-hidden','true');dots.innerHTML='<i class="on"></i><i></i><i></i>';cards.parentNode.insertBefore(dots,cards.nextSibling);
function upd(){var k=[].slice.call(cards.children).filter(function(x){return x.classList.contains('od-oc')});if(!k.length)return;var mid=cards.scrollLeft+cards.clientWidth/2,best=0,bd=1e9;k.forEach(function(c,i){var cx=c.offsetLeft+c.offsetWidth/2,d=Math.abs(cx-mid);if(d<bd){bd=d;best=i}});[].forEach.call(dots.children,function(d,i){d.classList.toggle('on',i===best)})}
/* visual order is Pickup, Swiggy, Zomato */
cards.addEventListener('scroll',function(){requestAnimationFrame(upd)},{passive:true});window.addEventListener('resize',upd)}
})();
;
(function(){var s=document.getElementById('awards');if(!s)return;var nx=s.querySelector('.rg-ar.next'),w=s.querySelector('.rg-stagewrap'),vis=false,hold=false;
if(!nx||!w)return;if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.2}).observe(w);else vis=true;
['mouseenter','focusin','touchstart'].forEach(function(ev){w.addEventListener(ev,function(){hold=true})});['mouseleave','focusout'].forEach(function(ev){w.addEventListener(ev,function(){hold=false})});w.addEventListener('touchend',function(){setTimeout(function(){hold=false},5000)});
var v=s.querySelector('video');if(v){v.addEventListener('play',function(){hold=true});v.addEventListener('pause',function(){hold=false})}
setInterval(function(){var m=document.querySelector('.rg-modal:not([hidden]),.rg-lb.on');if(vis&&!hold&&!m&&!document.hidden&&getComputedStyle(nx).display!=='none')nx.click()},2800)})();
;
(function(){var sec=document.getElementById('reviews');if(!sec)return;var nx=sec.querySelector('.rv-ar.next'),st=document.getElementById('rv-stage'),wrap=sec.querySelector('.rv-stagewrap');if(!nx||!st||!wrap)return;
var vis=false,hold=false,user=false;
var b=document.createElement('button');b.type='button';b.className='rv-pp';b.textContent='\u23F8';b.setAttribute('aria-label','Pause reviews');
b.onclick=function(){user=!user;b.textContent=user?'\u25B6':'\u23F8';b.setAttribute('aria-label',user?'Play reviews':'Pause reviews')};wrap.appendChild(b);
if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.3}).observe(sec);else vis=true;
['mouseenter','focusin','touchstart','pointerdown'].forEach(function(ev){st.addEventListener(ev,function(){hold=true})});
['mouseleave','focusout'].forEach(function(ev){st.addEventListener(ev,function(){hold=false})});
['touchend','pointerup'].forEach(function(ev){st.addEventListener(ev,function(){setTimeout(function(){hold=false},3000)})});
setInterval(function(){if(vis&&!hold&&!user&&!document.hidden)nx.click()},3800)})();
;

(function(){
var R=document.getElementById("m52");if(!R)return;
var D=[{"category": "Veg Starters", "name": "Crispy Corn", "description": "Crunchy golden corn kernels tossed with spices, offering a perfect blend of flavor and crispiness in every bite!", "dietary": "veg", "sd": "Crunchy golden corn kernels tossed with spices, offering a perfect blend of flavor and crispiness in every bite"}, {"category": "Veg Starters", "name": "Peanut Masala", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Starters", "name": "Veg Shangrilla", "description": "A mixed vegetable starter cut in diamond shape because you're soo precious to us!", "dietary": "veg", "sd": "A mixed vegetable starter cut in diamond shape because you're soo precious to us"}, {"category": "Veg Starters", "name": "Dreamnut Paneer", "description": "Delicious paneer starter that gives you good dreams with nuts", "dietary": "veg", "sd": "Delicious paneer starter that gives you good dreams with nuts"}, {"category": "Veg Starters", "name": "Veg Manchurian", "description": "Most popular vegetarian starter made more popular by our chefs.", "dietary": "veg", "sd": "Most popular vegetarian starter made more popular by our chefs"}, {"category": "Veg Starters", "name": "Chilli Baby Corn", "description": "A delightfully flavorful dish prepared with crunchy fried baby corn, tossed in a wok with fresh veggies, chilli sauce and other masalas.", "dietary": "veg", "sd": "A delightfully flavorful dish prepared with crunchy fried baby corn, tossed in a wok with fresh veggies, chilli sauce and other masalas"}, {"category": "Veg Starters", "name": "Crispy Baby Corn", "description": "Crunchy, golden-fried baby corn coated in a flavorful batter, perfect as a snack or appetizer!", "dietary": "veg", "sd": "Crunchy, golden-fried baby corn coated in a flavorful batter, perfect as a snack or appetizer"}, {"category": "Veg Starters", "name": "Chilli Mushroom", "description": "A delightfully flavorful dish prepared with mushrooms tossed in a wok with fresh veggies, chilli sauce and other masalas.", "dietary": "veg", "sd": "A delightfully flavorful dish prepared with mushrooms tossed in a wok with fresh veggies, chilli sauce and other masalas"}, {"category": "Veg Starters", "name": "Mushroom Manchurian", "description": "A flavourful Chinese dish with succulent mushrooms, rich in aromatic flavours.", "dietary": "veg", "sd": "A flavourful Chinese dish with succulent mushrooms, rich in aromatic flavours"}, {"category": "Veg Starters", "name": "Mushroom-65", "description": "Juicy mushrooms tossed in our homemade 65 masala.", "dietary": "veg", "sd": "Juicy mushrooms tossed in our homemade 65 masala"}, {"category": "Veg Starters", "name": "Salt & Pepper Mushroom", "description": "Baby Mushrooms tossed in a delightful combination of salt and pepper.", "dietary": "veg", "sd": "Baby Mushrooms tossed in a delightful combination of salt and pepper"}, {"category": "Veg Starters", "name": "Veg Spring Roll", "description": "Assorted vegetables stir fried with Chinese sauces, wrapped in a roll and deep fried", "dietary": "veg", "sd": "Assorted vegetables stir fried with Chinese sauces, wrapped in a roll and deep fried"}, {"category": "Veg Starters", "name": "Chilli Paneer", "description": "A delightfully flavorful dish prepared with crunchy fried paneer, tossed in a wok with fresh veggies, chilli sauce and other masalas.", "dietary": "veg", "sd": "A delightfully flavorful dish prepared with crunchy fried paneer, tossed in a wok with fresh veggies, chilli sauce and other masalas"}, {"category": "Veg Starters", "name": "Paneer-65", "description": "Paneer and 65 masala! Aha! What a combination!", "dietary": "veg", "sd": "Paneer and 65 masala"}, {"category": "Veg Starters", "name": "Paneer Majestic", "description": "Our best-selling starter and chef special.", "dietary": "veg", "sd": "Our best-selling starter and chef special"}, {"category": "Veg Starters", "name": "Butter Garlic Paneer", "description": "Love hurts but love for this paneer starter never hurts!", "dietary": "veg", "sd": "Love hurts but love for this paneer starter never hurts"}, {"category": "Veg Starters", "name": "Masala Paneer Popcorn", "description": "Paneer cubes coated with bread crumbs and deep fried to make it a perfectly crispy snack.", "dietary": "veg", "sd": "Paneer cubes coated with bread crumbs and deep fried to make it a perfectly crispy snack"}, {"category": "Veg Starters", "name": "Nalla Kaaram Paneer Vepudu", "description": "Succulent paneer pan-fried with our grandma-made nalla kaaram and traditional spices.", "dietary": "veg", "sd": "Succulent paneer pan-fried with our grandma-made nalla kaaram and traditional spices"}, {"category": "Veg Starters", "name": "Paneer Tikka Pakoda", "description": "Crispy on the outside and juicy panner tikka inside, a combination made perfectly for you!", "dietary": "veg", "sd": "Crispy on the outside and juicy panner tikka inside, a combination made perfectly for you"}, {"category": "Veg Starters", "name": "Crispy Veg", "description": "Mixed vegetables coated with batter, deep-fried and seasoned to perfection", "dietary": "veg", "sd": "Mixed vegetables coated with batter, deep-fried and seasoned to perfection"}, {"category": "Veg Starters", "name": "Butter Garlic Mushroom", "description": "Juicy mushrooms tossed in a heavenly combination of butter and garlic", "dietary": "veg", "sd": "Juicy mushrooms tossed in a heavenly combination of butter and garlic"}, {"category": "Egg Starters", "name": "Chilli Egg", "description": "Delicious Egg tossed in our homemade chilli sauce", "dietary": "egg", "sd": "Delicious Egg tossed in our homemade chilli sauce"}, {"category": "Egg Starters", "name": "Crispy Egg", "description": "Juicy Egg slightly coated in batter and fried to perfection", "dietary": "egg", "sd": "Juicy Egg slightly coated in batter and fried to perfection"}, {"category": "Egg Starters", "name": "Egg 65", "description": null, "dietary": "egg", "sd": ""}, {"category": "Non-Veg Starters", "name": "Naatu Naatu Special Wings (8 pcs)", "description": "Delightful chicken wings properly prepared in desi style that makes you dance naatu naatu naatu..!!", "dietary": "non-veg", "sd": "Delightful chicken wings properly prepared in desi style that makes you dance naatu naatu naatu"}, {"category": "Non-Veg Starters", "name": "Durbar Special Wings (8 Pcs)", "description": "8pcs wings tossed in our chef-special sauces making you crave for more!", "dietary": "non-veg", "sd": "8pcs wings tossed in our chef-special sauces making you crave for more"}, {"category": "Non-Veg Starters", "name": "Tandoori Half Wings (12 pcs)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Starters", "name": "Chicken Fried Wings [6 Pieces]", "description": "Yummy wings that will give you Wings!", "dietary": "non-veg", "sd": "Yummy wings that will give you Wings"}, {"category": "Non-Veg Starters", "name": "Chicken Half Wings [12 Pieces]", "description": "Crispy and flavourful chicken half wings marinated and deep fried to perfection", "dietary": "non-veg", "sd": "Crispy and flavourful chicken half wings marinated and deep fried to perfection"}, {"category": "Non-Veg Starters", "name": "Chicken Lollipops (6 Pcs)", "description": "6 pcs of delicious wings tossed in hot and sweet sauces.", "dietary": "non-veg", "sd": "6 pcs of delicious wings tossed in hot and sweet sauces"}, {"category": "Non-Veg Starters", "name": "Chilli Chicken", "description": "A mouthwatering dish prepared with chicken fried to perfection and stir fried with spicy sauces", "dietary": "non-veg", "sd": "A mouthwatering dish prepared with chicken fried to perfection and stir fried with spicy sauces"}, {"category": "Non-Veg Starters", "name": "Chicken 65", "description": "Delicious chicken chunks tossed in our specially made 65 masala", "dietary": "non-veg", "sd": "Delicious chicken chunks tossed in our specially made 65 masala"}, {"category": "Non-Veg Starters", "name": "Bhimavaram Kodi Vepudu", "description": "Light coated chicken marinated in chilli paste, curd and cooked with love from Bhimavaram", "dietary": "non-veg", "sd": "Light coated chicken marinated in chilli paste, curd and cooked with love from Bhimavaram"}, {"category": "Non-Veg Starters", "name": "Chicken Majestic", "description": "Delicious chicken tossed in indian spices, its stir fried and majestically served.", "dietary": "non-veg", "sd": "Delicious chicken tossed in indian spices, its stir fried and majestically served"}, {"category": "Non-Veg Starters", "name": "Raju Gari Kodi Vepudu", "description": "Legend says that this chicken starter united all the Kings in Andhra!", "dietary": "non-veg", "sd": "Legend says that this chicken starter united all the Kings in Andhra"}, {"category": "Non-Veg Starters", "name": "Chicken Manchurian", "description": "Yummy chicken chunks tossed in our specially made manchurian sauce", "dietary": "non-veg", "sd": "Yummy chicken chunks tossed in our specially made manchurian sauce"}, {"category": "Non-Veg Starters", "name": "Cashewnut Chicken", "description": "Juicy boneless chicken pieces fried with aromatic delicious South Indian spices and lots of cashews", "dietary": "non-veg", "sd": "Juicy boneless chicken pieces fried with aromatic delicious South Indian spices and lots of cashews"}, {"category": "Non-Veg Starters", "name": "Butter Garlic Chicken", "description": "A flavour packed dish comprising of tender chicken chunks tossed in a heavenly combination of butter and garlic.", "dietary": "non-veg", "sd": "A flavour packed dish comprising of tender chicken chunks tossed in a heavenly combination of butter and garlic"}, {"category": "Non-Veg Starters", "name": "Guntur Chilli Chicken", "description": "One of our lip smacking spicy regional dishes. Made with chilly powder from well-known guntur region, this chilli chicken is one of its kind that you wouldnt want to even share with your best friend.", "dietary": "non-veg", "sd": "One of our lip smacking spicy regional dishes"}, {"category": "Non-Veg Starters", "name": "Chicken Gulzara", "description": "Tasty, tender, flavourful chicken starter that goes perfectly with biryani or just as it is.", "dietary": "non-veg", "sd": "Tasty, tender, flavourful chicken starter that goes perfectly with biryani or just as it is"}, {"category": "Non-Veg Starters", "name": "Chicken 555", "description": "Juicy chicken chunks, cooked in a mixture of spices and chinese sauces.", "dietary": "non-veg", "sd": "Juicy chicken chunks, cooked in a mixture of spices and chinese sauces"}, {"category": "Non-Veg Starters", "name": "Creamy Milkha Chicken", "description": "Succulent boneless chicken made with creamy, cheesy and garlicy", "dietary": "non-veg", "sd": "Succulent boneless chicken made with creamy, cheesy and garlicy"}, {"category": "Non-Veg Starters", "name": "Durbar's Supreme Chicken", "description": "Delicious chicken tenderloin pieces marinated with our special masalas and fried perfectly with crumb coating. A starter especially close to our hearts!", "dietary": "non-veg", "sd": "Delicious chicken tenderloin pieces marinated with our special masalas and fried perfectly with crumb coating"}, {"category": "Non-Veg Starters", "name": "Coriander Chilli Chicken", "description": "Juicy chicken tossed in a delicious mix of coriander and traditional masalas.", "dietary": "non-veg", "sd": "Juicy chicken tossed in a delicious mix of coriander and traditional masalas"}, {"category": "Sea Food", "name": "Chilli Fish", "description": "A mouthwatering dish prepared with boneless fish fried to perfection and stir fried with spicy sauces", "dietary": "non-veg", "sd": "A mouthwatering dish prepared with boneless fish fried to perfection and stir fried with spicy sauces"}, {"category": "Sea Food", "name": "Apollo Fish", "description": "Boneless fish pieces fried until crispy and then tossed in a delectable sauce made with yoghurt, curry leaves, and green chilies.", "dietary": "non-veg", "sd": "Boneless fish pieces fried until crispy and then tossed in a delectable sauce made with yoghurt, curry leaves, and green chilies"}, {"category": "Sea Food", "name": "Andhra fish roast", "description": "A spicy and flavorful delicacy featuring boneless fish marinated in bold Andhra-style spices, pan-roasted to perfection for a crispy, aromatic, and irresistible treat!", "dietary": "non-veg", "sd": "A spicy and flavorful delicacy featuring boneless fish marinated in bold Andhra-style spices, pan-roasted to perfection for a crispy, aromatic, and irresistible treat"}, {"category": "Sea Food", "name": "Maharaja Tawa Fish", "description": "A full fish fillet marinated in special homemade masala and pan-fried to perfection. Served with mint chutney.", "dietary": "non-veg", "sd": "A full fish fillet marinated in special homemade masala and pan-fried to perfection"}, {"category": "Sea Food", "name": "Chilli Prawns", "description": "A mouthwatering dish prepared with prawns fried to perfection and stir fried with spicy sauces", "dietary": "non-veg", "sd": "A mouthwatering dish prepared with prawns fried to perfection and stir fried with spicy sauces"}, {"category": "Sea Food", "name": "Loose Prawns", "description": "Fresh prawns marinated with special spices from our house and deep-fried to prepare one of the most appealing snacks.", "dietary": "non-veg", "sd": "Fresh prawns marinated with special spices from our house and deep-fried to prepare one of the most appealing snacks"}, {"category": "Sea Food", "name": "Butter Garlic Prawns", "description": "A crispy starter with deep-fried fresh prawns tossed in butter and garlic providing an aromatic taste.", "dietary": "non-veg", "sd": "A crispy starter with deep-fried fresh prawns tossed in butter and garlic providing an aromatic taste"}, {"category": "Sea Food", "name": "Nalla Kaaram Royyala Vepudu", "description": "Juicy prawns pan-fried with our grandma-made nalla kaaram and traditional spices.", "dietary": "non-veg", "sd": "Juicy prawns pan-fried with our grandma-made nalla kaaram and traditional spices"}, {"category": "Sea Food", "name": "Lemon Heaven Fish", "description": "One of our chefs signatures. Diced fish marinated with lemon and some heavenly spices and tawa-fried in desi ghee.", "dietary": "non-veg", "sd": "One of our chefs signatures"}, {"category": "Sea Food", "name": "Durbar's Crispy Prawns", "description": "Juicy prawns marinated with special masalas, cooked till perfectly crisp and tossed in garlic.", "dietary": "non-veg", "sd": "Juicy prawns marinated with special masalas, cooked till perfectly crisp and tossed in garlic"}, {"category": "Veg Biryanis", "name": "Veg Biryani", "description": "Comes with yummy biryani with veggies cooked in dum style and our signature gravy and raita. Serves 1-2.", "dietary": "veg", "sd": "Comes with yummy biryani with veggies cooked in dum style and our signature gravy and raita"}, {"category": "Veg Biryanis", "name": "Veg Biryani (Couple Pack)", "description": "Comes with 1kg of our yummy veg biryani and raitha and our signature gravy. Serves 2-3.", "dietary": "veg", "sd": "Comes with 1kg of our yummy veg biryani and raitha and our signature gravy"}, {"category": "Veg Biryanis", "name": "Veg Biryani Family Pack", "description": "Comes with mixed veg curry, butter naan, raita and our signature gravy. Serves 3-4.", "dietary": "veg", "sd": "Comes with mixed veg curry, butter naan, raita and our signature gravy"}, {"category": "Veg Biryanis", "name": "Special Veg Biryani", "description": "Comes with mixed veg curry, raita and our signature gravy. Serves 1-2.", "dietary": "veg", "sd": "Comes with mixed veg curry, raita and our signature gravy"}, {"category": "Veg Biryanis", "name": "Kaju Biryani", "description": "Aromatic basmati rice cooked with golden roasted cashews and rich spices for a royal, nutty twist on classic biryani", "dietary": "veg", "sd": "Aromatic basmati rice cooked with golden roasted cashews and rich spices for a royal, nutty twist on classic biryani"}, {"category": "Veg Biryanis", "name": "Mushroom Tikka Biryani", "description": "Delicious mix of biryani rice and mushroom tikka masala makes this dish unique. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "veg", "sd": "Delicious mix of biryani rice and mushroom tikka masala makes this dish unique"}, {"category": "Veg Biryanis", "name": "Paneer Biryani", "description": "Served with delicious Paneer masala and our signature Gravy and Raita. Serves 1-2.", "dietary": "veg", "sd": "Served with delicious Paneer masala and our signature Gravy and Raita"}, {"category": "Veg Biryanis", "name": "Kaju Paneer Biryani", "description": "A rich and aromatic biryani made with fragrant basmati rice, succulent paneer, crunchy cashews, and a blend of authentic spices for a royal and flavorful experience!", "dietary": "veg", "sd": "A rich and aromatic biryani made with fragrant basmati rice, succulent paneer, crunchy cashews, and a blend of authentic spices for a royal and flavorful experience"}, {"category": "Veg Biryanis", "name": "Paneer Tikka Biryani", "description": "Comes with juicy paneer tikka on the top with raitha and our signature gravy. Serves 1-2.", "dietary": "veg", "sd": "Comes with juicy paneer tikka on the top with raitha and our signature gravy"}, {"category": "Veg Biryanis", "name": "Special Veg Biryani Couple Pack", "description": null, "dietary": "veg", "sd": ""}, {"category": "Egg Biryanis", "name": "Egg Biryani", "description": "Comes with delicious Egg Masala and Biryani rice. Served with our signature Gravy and Raita. Serves 1-2.", "dietary": "egg", "sd": "Comes with delicious Egg Masala and Biryani rice"}, {"category": "Egg Biryanis", "name": "Egg 65 Biryani", "description": "Our chefs special. Comes with delicious egg 65 on the top with raita and our signature gravy. Serves 1-2.", "dietary": "egg", "sd": "Our chefs special"}, {"category": "Egg Biryanis", "name": "Mughlai Egg Biryani", "description": "Comes with mild, light spice yet rich in flavour egg curry and with raita and our signature gravy. Serves 1-2.", "dietary": "egg", "sd": "Comes with mild, light spice yet rich in flavour egg curry and with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Biryani Rice", "description": "Comes with 500gms Non-veg biryani rice. Serves 1.", "dietary": "non-veg", "sd": "Comes with 500gms Non-veg biryani rice"}, {"category": "Non-Veg Biryani", "name": "Chicken Dum Biryani (Mini)", "description": "Comes with 2 chicken dum pieces and delicious biryani rice and raita and our signature gravy. Serves 1.", "dietary": "non-veg", "sd": "Comes with 2 chicken dum pieces and delicious biryani rice and raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Chicken Dum Biryani (Regular)", "description": "Richly flavoured aromatic rice and marinated chicken cooked in dum-style in our secret masala. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Richly flavoured aromatic rice and marinated chicken cooked in dum-style in our secret masala"}, {"category": "Non-Veg Biryani", "name": "Chicken Dum Biryani (Couple)", "description": "Comes with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Comes with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Chicken Dum Biryani (Family)", "description": "Comes with chicken dum biryani, boneless chicken curry, butter naan, raita and our signature gravy. Serves 3-4.", "dietary": "non-veg", "sd": "Comes with chicken dum biryani, boneless chicken curry, butter naan, raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Chicken Fry Biryani Mini", "description": "Comes with our mouthwatering biryani rice and chicken fry perfectly enough for a single person. Served with raita and gravy.", "dietary": "non-veg", "sd": "Comes with our mouthwatering biryani rice and chicken fry perfectly enough for a single person"}, {"category": "Non-Veg Biryani", "name": "Chicken Fry Biryani (Regular)", "description": "A delicious preparation with crispy chicken fried pieces slow cooked with rice in an aromatic blend of our secret spices. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "A delicious preparation with crispy chicken fried pieces slow cooked with rice in an aromatic blend of our secret spices"}, {"category": "Non-Veg Biryani", "name": "Chicken Fry Biryani (Couple)", "description": "A delicious preparation with crispy chicken fried pieces slow cooked with rice in an aromatic blend of secret spices. Comes with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "A delicious preparation with crispy chicken fried pieces slow cooked with rice in an aromatic blend of secret spices"}, {"category": "Non-Veg Biryani", "name": "Chicken Fry Biryani (Family)", "description": "Served with dum biryani rice and juicy chicken fry that makes your family's stomachs the happiest. Also, comes with boneless chicken curry, butter naan, raita and our signature gravy. Serves 3-4.", "dietary": "non-veg", "sd": "Served with dum biryani rice and juicy chicken fry that makes your family's stomachs the happiest"}, {"category": "Non-Veg Biryani", "name": "Special Chicken Biryani Mini", "description": "Comes with our mouthwatering biryani rice and special chicken boneless curry perfectly enough for a single person. Served with raita and gravy.", "dietary": "non-veg", "sd": "Comes with our mouthwatering biryani rice and special chicken boneless curry perfectly enough for a single person"}, {"category": "Non-Veg Biryani", "name": "Special Chicken Biryani (Regular)", "description": "Comes with our special boneless chicken curry with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with our special boneless chicken curry with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Special Chicken Biryani (Couple)", "description": "Comes with our special boneless chicken curry with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Comes with our special boneless chicken curry with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Special Chicken Biryani (Family)", "description": "Comes with dum biryani rice, boneless chicken curry, half-plate chicken starter, butter naan, raita and our signature gravy. Serves 3-4.", "dietary": "non-veg", "sd": "Comes with dum biryani rice, boneless chicken curry, half-plate chicken starter, butter naan, raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Mutton Dum Biryani (Regular)", "description": "Served with delicious mutton marinated in our secret spices and slow-cooked in dum style. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Served with delicious mutton marinated in our secret spices and slow-cooked in dum style"}, {"category": "Non-Veg Biryani", "name": "Mutton Dum Biryani (Couple)", "description": "Served with delicious mutton marinated in our secret spices and slow-cooked in dum style. Comes with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Served with delicious mutton marinated in our secret spices and slow-cooked in dum style"}, {"category": "Non-Veg Biryani", "name": "Fish Biryani (Regular)", "description": "Comes with delicious boneless fish masala, raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with delicious boneless fish masala, raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Fish Tikka Biryani", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Biryani", "name": "Mutton Fry Biryani (Regular)", "description": "Served with juicy mutton fry that is prepared in proper Andhra style and biryani rice with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Served with juicy mutton fry that is prepared in proper Andhra style and biryani rice with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Mutton Fry Biryani (Couple)", "description": "Served with juicy mutton fry that is prepared in proper Andhra style and biryani rice with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Served with juicy mutton fry that is prepared in proper Andhra style and biryani rice with raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Prawn Biryani", "description": "Comes with delicious prawns masala with dum biryani rice and raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with delicious prawns masala with dum biryani rice and raita and our signature gravy"}, {"category": "Non-Veg Biryani", "name": "Prawns Biryani (Couple)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Special Biryani", "name": "Chicken Wings Biryani", "description": "Comes with 4 delicious wings tossed in our special gravy and flavourful biryani. Comes with raitha and gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with 4 delicious wings tossed in our special gravy and flavourful biryani"}, {"category": "Special Biryani", "name": "Special Chicken Wings Biryani", "description": "Comes with 4 delicious wings tossed in our special gravy, couple pack biryani rice and our special chicken boneless curry. Comes with raitha and gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Comes with 4 delicious wings tossed in our special gravy, couple pack biryani rice and our special chicken boneless curry"}, {"category": "Special Biryani", "name": "Chicken Joint Biryani", "description": "Comes with one full joint tossed in spices and flavourful dum biryani rice. Served with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with one full joint tossed in spices and flavourful dum biryani rice"}, {"category": "Special Biryani", "name": "Chicken Double Joint Biryani", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Special Biryani", "name": "Chicken Tikka Biryani", "description": "Comes with juicy wet chicken tikka, raitha and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with juicy wet chicken tikka, raitha and our signature gravy"}, {"category": "Special Biryani", "name": "Ulavacharu Chicken Biryani", "description": "Served with juicy chicken tossed in Andhra's favourite Ulavacharu. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Served with juicy chicken tossed in Andhra's favourite Ulavacharu"}, {"category": "Special Biryani", "name": "Punjabi Chicken Biryani", "description": "Comes with 4 leg pieces tossed in our specially prepared base, raitha and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with 4 leg pieces tossed in our specially prepared base, raitha and our signature gravy"}, {"category": "Special Biryani", "name": "Potlam Biryani", "description": "Our chefs signature. Comes with mutton kheema and prawns wrapped in an omelette. Served with raita and our signature gravy. Serves 1-2", "dietary": "non-veg", "sd": "Our chefs signature"}, {"category": "Special Biryani", "name": "Dilkush Chicken Biryani", "description": "Made with specially marinated wings curry and also comes with complimentary boneless chicken curry, raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Made with specially marinated wings curry and also comes with complimentary boneless chicken curry, raita and our signature gravy"}, {"category": "Special Biryani", "name": "Royal Chicken Biryani", "description": "Comes with half-tandoori tossed in a special gravy, complimentary boneless chicken curry, raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Comes with half-tandoori tossed in a special gravy, complimentary boneless chicken curry, raita and our signature gravy"}, {"category": "Special Biryani", "name": "Murgh Mehfil Biryani", "description": "A unique speciality! combination of 3 types of bone and boneless chicken kebabs. Comes with raitha and our signature gravy. Serves 2.", "dietary": "non-veg", "sd": "A unique speciality"}, {"category": "Special Biryani", "name": "Mutton Keema Biryani", "description": "Comes with juicy mutton keema curry prepared in Andhra style, raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Comes with juicy mutton keema curry prepared in Andhra style, raita and our signature gravy"}, {"category": "Special Biryani", "name": "Nalli Gosht Biryani", "description": "Comes with 2 Nallis with mutton keema curry on the side and a couple pack dum biryani rice and served with raita and our signature gravy. Serves 2-3.", "dietary": "non-veg", "sd": "Comes with 2 Nallis with mutton keema curry on the side and a couple pack dum biryani rice and served with raita and our signature gravy"}, {"category": "Special Biryani", "name": "Murgh Musallam Biryani", "description": "Comes with full tandoori tossed in our special gravy and family pack biryani rice. Comes with raitha and gravy. For 3-4 persons.", "dietary": "non-veg", "sd": "Comes with full tandoori tossed in our special gravy and family pack biryani rice"}, {"category": "Special Biryani", "name": "Veg Butta Biryani", "description": null, "dietary": "veg", "sd": ""}, {"category": "Special Biryani", "name": "Non Veg Butta Biryani", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Pulao", "name": "Gutti Vankaya Pulao", "description": "Served with stuffed Gutti Vankay tossed in a special masala and delicious pulao rice and raitha and our signature gravy. Serves 1-2.", "dietary": "veg", "sd": "Served with stuffed Gutti Vankay tossed in a special masala and delicious pulao rice and raitha and our signature gravy"}, {"category": "Pulao", "name": "Raju Gari Kodi Pulao", "description": "Our best-selling regional item. Made with boneless chicken marinated in special spices and cooked delicately with pulao rice. Comes with raitha and gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Our best-selling regional item"}, {"category": "Pulao", "name": "Konaseema Kodi Pulao", "description": "Flavours of Konaseema with rich aroma and flavour packed chicken with delicious pulao rice. Comes with raita and our signature gravy. Serves 1-2.", "dietary": "non-veg", "sd": "Flavours of Konaseema with rich aroma and flavour packed chicken with delicious pulao rice"}, {"category": "Veg Kebabs", "name": "Paneer Tikka", "description": "Chunks of paneer are marinated with cashewnut paste, kashmiri chilly powder and traditional spices and are grilled in tandoor oven. Comes with onion, tomato and capsicum as top-up garnish.", "dietary": "veg", "sd": "Chunks of paneer are marinated with cashewnut paste, kashmiri chilly powder and traditional spices and are grilled in tandoor oven"}, {"category": "Veg Kebabs", "name": "Malai Paneer Tikka", "description": "Our chefs signature item. Paneer cubes, almond paste with cream and curd in our special spices and top up garnish with onion, tomato and capsicum.", "dietary": "veg", "sd": "Our chefs signature item"}, {"category": "Veg Kebabs", "name": "Achari Paneer Tikka", "description": null, "dietary": "veg", "sd": ""}, {"category": "Non-Veg Kebabs", "name": "Tandoori Full Joint [1 Piece]", "description": "1 piece of Chicken Full Joint marinated in our homemade tandoor masala and char-grilled to perfection.", "dietary": "non-veg", "sd": "1 piece of Chicken Full Joint marinated in our homemade tandoor masala and char-grilled to perfection"}, {"category": "Non-Veg Kebabs", "name": "Chicken Tandoori [Half]", "description": "Juicy chicken seasoned with freshly ground spices and cooked to perfection in our homemade tandoori masala.", "dietary": "non-veg", "sd": "Juicy chicken seasoned with freshly ground spices and cooked to perfection in our homemade tandoori masala"}, {"category": "Non-Veg Kebabs", "name": "Chicken Tandoori [Full]", "description": "Juicy chicken seasoned with freshly ground spices and cooked to perfection in our homemade tandoori masala.", "dietary": "non-veg", "sd": "Juicy chicken seasoned with freshly ground spices and cooked to perfection in our homemade tandoori masala"}, {"category": "Non-Veg Kebabs", "name": "Palleturi Kodi Kebab", "description": "Spicy, smoky and perfectly grilled with authentic south indian village flavors.", "dietary": "non-veg", "sd": "Spicy, smoky and perfectly grilled with authentic south indian village flavors"}, {"category": "Non-Veg Kebabs", "name": "Murgh Afghani Kebab (Boneless)", "description": "Our chefs signature! Juicy boneless chicken pieces  marinated in pista, green chillies, cream, curd and in-house special spices and grilled to perfection.", "dietary": "non-veg", "sd": "Our chefs signature"}, {"category": "Non-Veg Kebabs", "name": "Farhan Spice Tangdi Kebab", "description": "Juicy tangdi kebab with added flavours from our Master Chef", "dietary": "non-veg", "sd": "Juicy tangdi kebab with added flavours from our Master Chef"}, {"category": "Non-Veg Kebabs", "name": "Chicken Tikka", "description": "Super soft chunks of chicken are coated with a spicy and peppery masala and grilled to perfection.", "dietary": "non-veg", "sd": "Super soft chunks of chicken are coated with a spicy and peppery masala and grilled to perfection"}, {"category": "Non-Veg Kebabs", "name": "Murgh Malai Kebab", "description": "Succulent pieces of boneless chicken, almond paste with cream, curd and special spices cooked to perfection.", "dietary": "non-veg", "sd": "Succulent pieces of boneless chicken, almond paste with cream, curd and special spices cooked to perfection"}, {"category": "Non-Veg Kebabs", "name": "Kalmi Kebab [4 Pieces]", "description": "Chicken drumsticks coated in rich and flavoursome marinade & grilled in Charcoal tandoori oven.", "dietary": "non-veg", "sd": "Chicken drumsticks coated in rich and flavoursome marinade & grilled in Charcoal tandoori oven"}, {"category": "Non-Veg Kebabs", "name": "Achari Chicken Tikka", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Kebabs", "name": "Fish Tikka", "description": "Succulent pieces of fish marinated in our homemade tandoor masala and char-grilled to perfection.", "dietary": "non-veg", "sd": "Succulent pieces of fish marinated in our homemade tandoor masala and char-grilled to perfection"}, {"category": "Non-Veg Kebabs", "name": "Leafy Fish Kebab", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Kebabs", "name": "Kandhari Kebab [6 Pieces]", "description": "Chicken wings marinated in green chillies, almond, pista, pudina, cream and curd in indian spices and grilled to perfection.", "dietary": "non-veg", "sd": "Chicken wings marinated in green chillies, almond, pista, pudina, cream and curd in indian spices and grilled to perfection"}, {"category": "Breads", "name": "Phulka", "description": null, "dietary": "veg", "sd": ""}, {"category": "Breads", "name": "Roti", "description": null, "dietary": "veg", "sd": ""}, {"category": "Breads", "name": "Plain Naan", "description": null, "dietary": "veg", "sd": ""}, {"category": "Breads", "name": "Butter Naan", "description": "North Indian bread with a generous serving of butter that tastes brilliant when paired with a gravy.", "dietary": "veg", "sd": "North Indian bread with a generous serving of butter that tastes brilliant when paired with a gravy"}, {"category": "Breads", "name": "Garlic Naan", "description": "North Indian bread with a generous serving of butter and garlic that tastes brilliant when paired with a gravy.", "dietary": "veg", "sd": "North Indian bread with a generous serving of butter and garlic that tastes brilliant when paired with a gravy"}, {"category": "Veg Fried Rice", "name": "Veg Fried Rice", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Fried Rice", "name": "Special Veg Fried Rice", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Fried Rice", "name": "Paneer Fried Rice", "description": null, "dietary": "veg", "sd": ""}, {"category": "Egg Fried Rice", "name": "Egg Fried Rice", "description": null, "dietary": "egg", "sd": ""}, {"category": "Non-veg Fried Rice", "name": "Chicken Fried Rice", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-veg Fried Rice", "name": "Special Chicken Fried Rice", "description": "Comes with boneless special chicken curry. Served with raitha and our signature gravy.", "dietary": "non-veg", "sd": "Comes with boneless special chicken curry"}, {"category": "Noodles", "name": "Veg Noodles", "description": null, "dietary": "veg", "sd": ""}, {"category": "Noodles", "name": "Egg Noodles", "description": "Served with gravy and sauce", "dietary": "egg", "sd": "Served with gravy and sauce"}, {"category": "Noodles", "name": "Veg Schezwan Noodles", "description": "Noodles tossed with crunchy veggies, bold Schezwan sauce, and aromatic spices for the perfect street-style experience", "dietary": "veg", "sd": "Noodles tossed with crunchy veggies, bold Schezwan sauce, and aromatic spices for the perfect street-style experience"}, {"category": "Noodles", "name": "Egg Schezwan Noodles", "description": "Noodles tossed with egg, bold Schezwan sauce, and aromatic spices for the perfect street-style experience", "dietary": "egg", "sd": "Noodles tossed with egg, bold Schezwan sauce, and aromatic spices for the perfect street-style experience"}, {"category": "Noodles", "name": "Chicken Schezwan Noodles", "description": "Noodles tossed with chicken, bold Schezwan sauce, and aromatic spices for the perfect street-style experience", "dietary": "non-veg", "sd": "Noodles tossed with chicken, bold Schezwan sauce, and aromatic spices for the perfect street-style experience"}, {"category": "Curd Rice", "name": "Curd Rice", "description": "Cool and comforting South Indian dsih made with creamy curd, soft rice, and a touch of mild spices.", "dietary": "veg", "sd": "Cool and comforting South Indian dish made with creamy curd, soft rice, and a touch of mild spices"}, {"category": "Veg Curries", "name": "Plain Palak", "description": "Nutritious and healthy, spinach puree, cook in garlic and ginger tadka, spices", "dietary": "veg", "sd": "Nutritious and healthy, spinach puree, cook in garlic and ginger tadka, spices"}, {"category": "Veg Curries", "name": "Palak Paneer", "description": "Paneer cubes tossed in rich garlic flavored spinach gravy toped with cream and green chillies.", "dietary": "veg", "sd": "Paneer cubes tossed in rich garlic flavored spinach gravy toped with cream and green chillies"}, {"category": "Veg Curries", "name": "Mixed Veg Curry", "description": "A delicious curry made with mixed fresh vegetables and traditional spices.", "dietary": "veg", "sd": "A delicious curry made with mixed fresh vegetables and traditional spices"}, {"category": "Veg Curries", "name": "Kaju Curry", "description": "Creamy, mildly spiced curry made with rich cashews simmered in a luscious tomato-onion gravy — a true vegetarian delight.", "dietary": "veg", "sd": "Creamy, mildly spiced curry made with rich cashews simmered in a luscious tomato-onion gravy — a true vegetarian delight"}, {"category": "Veg Curries", "name": "Kadai Veg Curry", "description": "Veg Kadai gravy is filled with rich flavors, aromatic spices and vegetables", "dietary": "veg", "sd": "Veg Kadai gravy is filled with rich flavors, aromatic spices and vegetables"}, {"category": "Veg Curries", "name": "Methi Chaman", "description": "Delicious gravy made out of methi leaves, tomatoes, cashews, paneer and cream! Combines perfectly well with roti or rice!", "dietary": "veg", "sd": "Delicious gravy made out of methi leaves, tomatoes, cashews, paneer and cream"}, {"category": "Veg Curries", "name": "Mushroom Masala", "description": "A dish that is packed with flavours from fresh mushrooms, tart tomatoes and aromatic spices.", "dietary": "veg", "sd": "A dish that is packed with flavours from fresh mushrooms, tart tomatoes and aromatic spices"}, {"category": "Veg Curries", "name": "Kaju Paneer Curry", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Curries", "name": "Kadai Paneer", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Curries", "name": "Paneer Tikka Masala", "description": "Soft cubes of paneer mixed with very rich butter and blended onions, tomatoes and masala spices.", "dietary": "veg", "sd": "Soft cubes of paneer mixed with very rich butter and blended onions, tomatoes and masala spices"}, {"category": "Veg Curries", "name": "Veg Manchuria Wet", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Curries", "name": "Paneer Bhurji", "description": null, "dietary": "veg", "sd": ""}, {"category": "Egg Main Course", "name": "Egg Omelette Masala", "description": null, "dietary": "egg", "sd": ""}, {"category": "Egg Main Course", "name": "Egg Bhurji", "description": null, "dietary": "egg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Liver Fry", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Andhra Chicken Curry (Bone)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Andhra Chicken Curry (Boneless)", "description": "Delicious and authentic spicy chicken gravy made with traditional andhra spices.", "dietary": "non-veg", "sd": "Delicious and authentic spicy chicken gravy made with traditional andhra spices"}, {"category": "Non-Veg Curries", "name": "Chicken Fry (Bone)", "description": "Andhra style chicken prepared with chicken pieces cooked in seasoned indian whole spices in homemade gravy.", "dietary": "non-veg", "sd": "Andhra style chicken prepared with chicken pieces cooked in seasoned indian whole spices in homemade gravy"}, {"category": "Non-Veg Curries", "name": "RR Special Chicken Curry (Boneless)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Methi Chicken (Boneless)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Tikka Masala (Boneless)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Maharani (Boneless)", "description": "Mughlai dish made with boneless chicken in a rich gravy made of onion-cashew paste, green chilly paste and many other spices.", "dietary": "non-veg", "sd": "Mughlai dish made with boneless chicken in a rich gravy made of onion-cashew paste, green chilly paste and many other spices"}, {"category": "Non-Veg Curries", "name": "Kadai Chicken Curry (Boneless)", "description": "Juicy chicken marinated in authentic tandoori masala and cooked to perfection.", "dietary": "non-veg", "sd": "Juicy chicken marinated in authentic tandoori masala and cooked to perfection"}, {"category": "Non-Veg Curries", "name": "Chicken Chettinad Curry (Boneless)", "description": "Packed with flavours, this peppery chicken curry is made with boneless chicken and hot spices.", "dietary": "non-veg", "sd": "Packed with flavours, this peppery chicken curry is made with boneless chicken and hot spices"}, {"category": "Non-Veg Curries", "name": "Prawns Curry", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Nellore Chepala Pulusu (Boneless)", "description": "One of our signature items!", "dietary": "non-veg", "sd": "One of our signature items"}, {"category": "Non-Veg Curries", "name": "Mutton Fry", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Mutton Curry", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Mutton Keema Masala", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Manchurian Wet", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Butter Chicken", "description": "Marinated tandoori chicken served in a mild but aromatic curry made and nourished with goodness by our master-chefs.", "dietary": "non-veg", "sd": "Marinated tandoori chicken served in a mild but aromatic curry made and nourished with goodness by our master-chefs"}, {"category": "Non-Veg Curries", "name": "Fish Curry (Boneless)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Afghani Curry (Boneless)", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Chicken Fry (Half)", "description": "Andhra style chicken prepared with chicken pieces cooked in seasoned indian whole spices and fried to perfection.", "dietary": "non-veg", "sd": "Andhra style chicken prepared with chicken pieces cooked in seasoned indian whole spices and fried to perfection"}, {"category": "Non-Veg Curries", "name": "Chicken Liver Fry [Half]", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non-Veg Curries", "name": "Andhra Chicken Curry (Bone) (Half)", "description": "Delicious and authentic spicy chicken gravy made with traditional andhra spices.", "dietary": "non-veg", "sd": "Delicious and authentic spicy chicken gravy made with traditional andhra spices"}, {"category": "Veg Soups", "name": "Cream Of Mushroom And Spinach", "description": "A rich and creamy delight made with juicy mushrooms, fresh spinach, and flavorful herbs, offering a comforting and hearty experience in every sip!", "dietary": "veg", "sd": "A rich and creamy delight made with juicy mushrooms, fresh spinach, and flavorful herbs, offering a comforting and hearty experience in every sip"}, {"category": "Veg Soups", "name": "Tomato Soup", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Soups", "name": "Veg Manchow Soup", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Soups", "name": "Veg Corn Soup", "description": null, "dietary": "veg", "sd": ""}, {"category": "Veg Soups", "name": "Veg Hot And Sour Soup", "description": "A bold and flavorful Indo-Chinese soup with a perfect balance of heat and tang, loaded with fresh veggies and aromatic spices for a comforting delight!", "dietary": "veg", "sd": "A bold and flavorful Indo-Chinese soup with a perfect balance of heat and tang, loaded with fresh veggies and aromatic spices for a comforting delight"}, {"category": "Non Veg Soups", "name": "Chicken Manchow Soup", "description": null, "dietary": "non-veg", "sd": ""}, {"category": "Non Veg Soups", "name": "Chicken Hot & Sour Soup", "description": "A bold and flavorful Indo-Chinese soup with a perfect balance of heat and tang, loaded with chicken, fresh veggies and aromatic spices for a comforting delight!", "dietary": "non-veg", "sd": "A bold and flavorful Indo-Chinese soup with a perfect balance of heat and tang, loaded with chicken, fresh veggies and aromatic spices for a comforting delight"}, {"category": "Desserts", "name": "Apricot Delight", "description": "A luscious dessert made with soft, moist cake layered with juicy apricots", "dietary": "veg", "sd": "A luscious dessert made with soft, moist cake layered with juicy apricots"}, {"category": "Desserts", "name": "Mango Delight (Seasonal Special)", "description": "A luscious dessert made with soft, moist cake layered with fresh, juicy Banginapalli mangoes. The perfect tropical indulgence for mango lovers this season!", "dietary": "veg", "sd": "A luscious dessert made with soft, moist cake layered with fresh, juicy Banginapalli mangoes"}, {"category": "Samosas (Powered by Wings & Samosas)", "name": "Paneer Mirch Samosa (4 Pcs)", "description": "A hit mix of juicy paneer with some spiciness for the hardcore paneer lovers.", "dietary": "veg", "sd": "A hit mix of juicy paneer with some spiciness for the hardcore paneer lovers"}];
var IM={};["bhimavaram-kodi-vepudu", "butter-garlic-chicken", "chicken-555", "chicken-dum-biryani-regular", "chicken-fry-biryani-regular", "chicken-gulzara", "chilli-chicken", "crispy-baby-corn", "curd-rice", "dilkush-chicken-biryani", "durbar-s-supreme-chicken", "egg-65", "egg-biryani", "guntur-chilli-chicken", "gutti-vankaya-pulao", "kaju-paneer-biryani", "kaju-paneer-curry", "lemon-heaven-fish", "murgh-mehfil-biryani", "murgh-musallam-biryani", "mutton-fry-biryani-regular", "mutton-keema-biryani", "naatu-naatu-special-wings-8-pcs", "non-veg-butta-biryani", "paneer-tikka", "peanut-masala", "plain-palak", "raju-gari-kodi-vepudu", "special-chicken-biryani-family", "special-chicken-biryani-regular", "veg-noodles"].forEach(function(k){IM[k]="images/menu/"+k+".webp"});
var CAT={"Special Biryani": "special-biryani", "Non-Veg Biryani": "non-veg-biryani", "Veg Biryanis": "veg-biryanis", "Egg Biryanis": "egg-biryanis", "Pulao": "pulao", "Non-Veg Starters": "non-veg-starters", "Veg Starters": "veg-starters", "Egg Starters": "egg-starters", "Samosas (Powered by Wings & Samosas)": "samosas", "Non-Veg Kebabs": "non-veg-kebabs", "Veg Kebabs": "veg-kebabs", "Sea Food": "sea-food", "Non-Veg Curries": "non-veg-curries", "Veg Curries": "veg-curries", "Egg Main Course": "egg-main-course", "Veg Fried Rice": "veg-fried-rice", "Non-veg Fried Rice": "non-veg-fried-rice", "Egg Fried Rice": "egg-fried-rice", "Noodles": "noodles", "Curd Rice": "curd-rice", "Veg Soups": "veg-soups", "Non Veg Soups": "non-veg-soups", "Breads": "breads", "Desserts": "desserts"};

var G=[
{id:"biryani",t:"Biryani & Pulao",s:"Dum-cooked in the Durbar way",b:"biryani",c:["Special Biryani","Non-Veg Biryani","Veg Biryanis","Egg Biryanis","Pulao"]},
{id:"starters",t:"Starters",s:"Crisp, spicy, made to share",b:"starters",c:["Non-Veg Starters","Veg Starters","Egg Starters","Samosas (Powered by Wings & Samosas)"]},
{id:"kebabs",t:"Kebabs",s:"From the tandoor",b:"kebabs",c:["Non-Veg Kebabs","Veg Kebabs"]},
{id:"seafood",t:"Sea Food",s:"Coastal flavours",b:"seafood",c:["Sea Food"]},
{id:"curries",t:"Curries & Main Course",s:"Rich gravies for rice and breads",b:"curries",c:["Non-Veg Curries","Veg Curries","Egg Main Course"]},
{id:"rice",t:"Rice & Noodles",s:"Fried rice, noodles and curd rice",b:"rice",c:["Veg Fried Rice","Non-veg Fried Rice","Egg Fried Rice","Noodles","Curd Rice"]},
{id:"more",t:"Soups, Breads & Desserts",s:"The rest of the table",b:"",c:["Veg Soups","Non Veg Soups","Breads","Desserts"]}];
var slug=function(n){return n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};
D.forEach(function(x,i){x.i=i;x.s=slug(x.name);x.k=x.dietary==="veg"?"v":/egg/i.test(x.dietary||"")?"e":"n";x.p=IM[x.s]||"";x.d=x.sd||""});
var mode="hybrid",H7=["L","T","","","W","",""],B8=["L","","","W","","","",""],RR={1:["L"],2:["W","W"],3:["W","",""],4:["L","","","W"],5:["L","","","",""],6:["W","","","","","W"]};
function SZ(n){var o=[],k;if(mode==="tiles"){for(k=0;k<n;k++)o.push("");return o}if(mode==="bento"){for(k=0;k<n;k++)o.push(B8[k%8]);return o}var f=n-n%7;for(k=0;k<f;k++)o.push(H7[k%7]);return o.concat(RR[n%7]||[])}
var $=function(i){return document.getElementById(i)},q="",veg=false,all=false,cur=-1;
var esc=function(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function ok(x){return(!veg||x.k==="v")&&(!q||(x.name+" "+x.description+" "+x.category).toLowerCase().indexOf(q)>-1)}
function render(){
 var n=D.filter(ok).length;
 $("m52-sub").textContent=D.length+" dishes · "+D.filter(function(x){return x.p}).length+" with photos · pickup from your nearest outlet";
 var ph=D.filter(function(x){return x.p&&ok(x)});
 $("m52-pics").innerHTML=(!q&&ph.length)?'<div class="sh"><h2>The Durbar in pictures</h2><p>Tap any dish for details.</p></div><div class="mz">'+ph.map(function(x,k){var z=SZ(ph.length)[k];return'<button class="m52-t m52-'+z+'" data-i="'+x.i+'"><img src="'+x.p+'" srcset="'+x.p.replace("images/menu/","images/menu/m/")+' 560w, '+x.p+' 900w" sizes="'+((z==="L"||z==="W")?"(max-width:700px) 100vw, 700px":"(max-width:700px) 50vw, 360px")+'" '+(k>=0?'loading="lazy" ':'')+'alt="'+esc(RRDN(x.name,"menu"))+'" decoding="async"><span class="m52-dot '+x.k+'"></span><span class="m52-plus" aria-hidden="true">+</span><span class="nm">'+esc(RRDN(x.name,"menu"))+(z==="L"&&x.d?"<small>"+esc(x.d)+"</small>":"")+"</span></button>"}).join("")+"</div>":"";
 var out=G.map(function(g,gi){
  var cs=g.c.map(function(c){var it=D.filter(function(x){return x.category===c&&ok(x)});return it.length?{c:c,it:it}:null}).filter(Boolean);
  if(!cs.length)return"";
  var cnt=cs.reduce(function(a,b){return a+b.it.length},0);
  return'<section class="grp" id="m52-g-'+g.id+'"><div class="gh"><h2>'+g.t+'</h2><p>'+g.s+" · "+cnt+' dishes</p></div>'+
  cs.map(function(c,ci){return"<details"+((q||all||(gi===0&&ci===0))?" open":"")+"><summary class=\"m52-b-"+CAT[c.c]+"\"><span>"+esc(c.c.replace(" (Powered by Wings & Samosas)",""))+"<small>"+c.it.length+"</small></span></summary><div class=\"dl\">"+
   c.it.map(function(x){return'<div class="dish" data-i="'+x.i+'" role="button" tabindex="0"><span class="m52-dot '+x.k+'" title="'+(x.k==="v"?"Veg":x.k==="e"?"Egg":"Non-veg")+'"></span>'+(x.p?'<img class="th" src="'+x.p.replace("images/menu/","images/menu/t/")+'" width="68" height="68" loading="lazy" alt="" decoding="async">':"")+'<div class="tx"><b>'+esc(x.name)+"</b>"+(x.d?"<p>"+esc(x.d)+"</p>":"")+'</div><a class="m52-add" href="/order-now/#ordering">+ Add</a></div>'}).join("")+"</div></details>"}).join("")+"</section>"+(g.id==="biryani"?'<a class="m52-cat" href="/catering/#catering-form"><span class="m52-cat-t"><small>Catering &amp; Events</small><b>Hosting a crowd? Plan your event</b></span><span class="m52-cat-go" aria-hidden="true">&rarr;</span></a>':"")});
 $("m52-list").innerHTML=out.join("")||'<div class="m52-empty">No dishes found.</div>';
 $("m52-ch").innerHTML=G.filter(function(g){return $("m52-g-"+g.id)}).map(function(g){return'<button class="m52-chip" data-g="'+g.id+'">'+g.t.split(" &")[0].split(",")[0]+"</button>"}).join("");
}
function show(i){var x=D[i];cur=i;$("m52-sh").innerHTML=(x.p?'<img src="'+x.p+'" srcset="'+x.p.replace("images/menu/","images/menu/m/")+' 560w, '+x.p+' 900w" sizes="(max-width:520px) 100vw, 520px" alt="'+esc(RRDN(x.name,"menu"))+'">':"")+'<div class="sb"><button class="x" aria-label="Close" id="m52-cx">&times;</button><span class="m52-dot '+x.k+'"></span> <small>'+(x.k==="v"?"Vegetarian":x.k==="e"?"Egg":"Non-vegetarian")+"</small><h3>"+esc(RRDN(x.name,"menu"))+"</h3><p>"+esc(x.d||"Made fresh at RR Durbar.")+'</p><div class="acts"><a class="m52-btn gold" href="/order-now/#ordering">Order pickup</a><a class="m52-btn" target="_blank" rel="noopener" href="https://wa.me/919849982052?text='+encodeURIComponent("Hi RR Durbar, I would like to order: "+x.name)+'">WhatsApp</a></div></div>';$("m52-ov").classList.add("o")}
function close(){$("m52-ov").classList.remove("o")}
R.addEventListener("pointermove",function(e){var t=e.target.closest&&e.target.closest(".m52-t");if(!t||e.pointerType==="touch")return;var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;t.style.setProperty("--mx",(x*100).toFixed(1)+"%");t.style.setProperty("--my",(y*100).toFixed(1)+"%");t.style.setProperty("--ry",((x-.5)*7).toFixed(2)+"deg");t.style.setProperty("--rx",((.5-y)*7).toFixed(2)+"deg")});
R.addEventListener("pointerout",function(e){var t=e.target.closest&&e.target.closest(".m52-t");if(t&&!t.contains(e.relatedTarget)){t.style.setProperty("--rx","0deg");t.style.setProperty("--ry","0deg")}});
R.addEventListener("click",function(e){var t=e.target;
 if(t.closest(".m52-add"))return;
 var sm=t.closest("summary");if(sm&&sm.parentNode.tagName==="DETAILS"&&document.startViewTransition&&!matchMedia("(prefers-reduced-motion:reduce)").matches){e.preventDefault();var dd=sm.parentNode;dd.style.viewTransitionName="m52open";document.startViewTransition(function(){dd.open=!dd.open}).finished.finally(function(){dd.style.viewTransitionName=""});return}
 if(t.id==="m52-ov"||t.id==="m52-cx")return close();
 var a=t.closest("[data-i]");if(a){var ti=a.classList.contains("m52-t")?a.querySelector("img"):null;if(ti&&document.startViewTransition&&!matchMedia("(prefers-reduced-motion:reduce)").matches){ti.style.viewTransitionName="dishimg";document.startViewTransition(function(){show(+a.dataset.i);ti.style.viewTransitionName="";var si=document.querySelector("#m52-sh img");if(si)si.style.viewTransitionName="dishimg"}).finished.finally(function(){var si=document.querySelector("#m52-sh img");if(si)si.style.viewTransitionName=""});return}return show(+a.dataset.i)}
 var m=t.closest("[data-m]");if(m){mode=m.dataset.m;return render()}
 var g=t.closest("[data-g]");if(g){var el=$("m52-g-"+g.dataset.g);if(el){var d=el.querySelector("details");if(d)d.open=true;el.scrollIntoView({behavior:"smooth"})}}});
document.addEventListener("keydown",function(e){if(e.key==="Escape")close();if(e.key==="Enter"&&e.target.classList.contains("dish"))show(+e.target.dataset.i)});
$("m52-q").addEventListener("input",function(e){q=e.target.value.trim().toLowerCase();render()});
$("m52-vg").addEventListener("change",function(e){veg=e.target.checked;render()});
$("m52-ex").addEventListener("click",function(){all=!all;$("m52-ex").textContent=all?"Collapse all":"Expand all";render()});
render();


var NAV=document.querySelector(".top-nav,header.rr-header,.site-header"),SEC=document.getElementById("menu-page"),fullH=0;
function top_(){if(!NAV||getComputedStyle(NAV).position==="static")return;var h=Math.round(NAV.getBoundingClientRect().bottom);if(h>fullH||!scrollY)fullH=Math.max(h,0);R.style.setProperty("--m52-top",Math.max(h,0)+"px");if(SEC&&SEC.offsetParent){var y=SEC.getBoundingClientRect().top+scrollY;SEC.style.paddingTop=Math.max(0,(fullH||h)-y)+"px"}}
top_();addEventListener("resize",top_);addEventListener("scroll",top_,{passive:true});addEventListener("load",top_);
})();

;
(function(){
var R=document.getElementById('m52');if(!R)return;
var rm=function(){return matchMedia('(prefers-reduced-motion:reduce)').matches};
var $=function(i){return document.getElementById(i)};
/* ---- reduced motion: stop the cursor tilt script; chip jumps land just under the sticky bar (instant when reduced) ---- */
R.addEventListener('pointermove',function(e){if(rm()&&e.target.closest&&e.target.closest('.m52-t'))e.stopPropagation()},true);
R.addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('[data-g]');if(!g)return;e.stopPropagation();var el=$('m52-g-'+g.dataset.g);if(el){var d=el.querySelector('details');if(d)d.open=true;var tgt=function(){var bb=R.querySelector('.bar');return el.getBoundingClientRect().top+scrollY-(bb?bb.getBoundingClientRect().bottom:100)-16};scrollTo({top:tgt(),behavior:rm()?'auto':'smooth'});var fix=function(){if(Math.abs(scrollY-tgt())>8)scrollTo({top:tgt(),behavior:'auto'})};if('onscrollend' in window){addEventListener('scrollend',function(){fix()},{once:true})}else{setTimeout(fix,1100)}}},true);
/* ---- 1. scroll-spy + sliding pill on the top chips ---- */
var ch=$('m52-ch'),pill=document.createElement('span'),spyId='',tk=false;pill.className='m61-pill';pill.setAttribute('aria-hidden','true');
function barBottom(){var b=R.querySelector('.bar');return b?b.getBoundingClientRect().bottom:100}
function place(){if(!ch)return;if(!pill.parentNode)ch.insertBefore(pill,ch.firstChild);
 var on=ch.querySelector('.m52-chip[data-g="'+spyId+'"]');
 ch.querySelectorAll('.m52-chip').forEach(function(c){var a=c===on;c.classList.toggle('m61-spy',a);if(a)c.setAttribute('aria-current','true');else c.removeAttribute('aria-current')});
 if(!on){pill.classList.remove('on');return}
 pill.style.width=on.offsetWidth+'px';pill.style.transform='translateX('+on.offsetLeft+'px)';pill.classList.add('on');
 var l=on.offsetLeft-(ch.clientWidth-on.offsetWidth)/2;if(ch.scrollWidth>ch.clientWidth)ch.scrollTo({left:Math.max(0,l),behavior:rm()?'auto':'smooth'})}
function spy(){tk=false;var line=barBottom()+60,id='';R.querySelectorAll('.grp').forEach(function(g){if(g.getBoundingClientRect().top<=line)id=g.id.replace('m52-g-','')});
 var last=R.querySelector('.grp:last-of-type');if(last&&last.getBoundingClientRect().bottom<0)id='';
 if(id!==spyId){spyId=id;place()}}
addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(spy)}},{passive:true});
addEventListener('resize',function(){place()});
/* ---- 2. Add -> stepper, toast, order bar ---- */
var cart={};try{cart=JSON.parse(localStorage.getItem('rrMenuCart')||'{}')||{}}catch(e){}
function save(){try{localStorage.setItem('rrMenuCart',JSON.stringify(cart))}catch(e){}try{dispatchEvent(new CustomEvent('rr:cart',{detail:cart}))}catch(e){}}
var bar=document.createElement('div');bar.id='m61-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Your order');
bar.innerHTML='<div class="t"><b id="m61-n"></b><span id="m61-l"></span></div><button type="button" id="m61-clr">Clear</button><a href="/order-now/#ordering">Order pickup</a>';
var toast=document.createElement('div');toast.id='m61-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
R.appendChild(bar);R.appendChild(toast);
var tt;function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},1700)}
function total(){var n=0;for(var k in cart)n+=cart[k].q;return n}
function paintBar(bump){var n=total();bar.classList.toggle('on',n>0);$('m61-n').textContent=n+(n===1?' item':' items')+' in your order';
 var names=Object.keys(cart).map(function(k){return cart[k].n+(cart[k].q>1?' ×'+cart[k].q:'')});$('m61-l').textContent=names.join(', ');
 if(bump&&!rm()&&bar.animate)bar.animate([{scale:1},{scale:1.04},{scale:1}],{duration:260})}
function paintRows(){R.querySelectorAll('#m52-list .dish').forEach(function(d){var k=d.dataset.i,q=cart[k]?cart[k].q:0,st=d.querySelector('.m61-step');
 d.classList.toggle('m61-in',q>0);
 if(q>0){if(!st){st=document.createElement('span');st.className='m61-step';st.innerHTML='<button type="button" class="m61-minus" aria-label="Remove one">&minus;</button><b aria-live="polite"></b><button type="button" class="m61-plus" aria-label="Add one more">+</button>';d.appendChild(st)}
  var nm=d.querySelector('.tx b');st.querySelector('.m61-minus').setAttribute('aria-label','Remove one '+(nm?nm.textContent:''));st.querySelector('b').textContent=q}
 else if(st)st.remove()})}
function fly(from){if(rm()||!from||!from.animate)return;var a=from.getBoundingClientRect(),b=bar.getBoundingClientRect(),d=document.createElement('i');
 d.style.cssText='position:fixed;z-index:2147482002;left:'+(a.left+a.width/2-7)+'px;top:'+(a.top+a.height/2-7)+'px;width:14px;height:14px;border-radius:50%;background:#C58A1B;pointer-events:none';document.body.appendChild(d);
 var dx=(b.left+40)-(a.left+a.width/2),dy=(window.innerHeight-40)-(a.top+a.height/2);
 d.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(.4)',opacity:.6}],{duration:560,easing:'cubic-bezier(.5,0,.75,.4)'}).onfinish=function(){d.remove()}}
function setQ(k,n,q,src){if(q<=0){delete cart[k]}else{cart[k]={n:n,q:q}}save();paintRows();paintBar(q>0);if(src&&q>0){say(q===1?'Added · '+n:n+' × '+q)}if(q<=0)say('Removed · '+n)}
R.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
 var a=t.closest('.m52-add');
 if(a){var d=a.closest('.dish');if(!d)return;e.preventDefault();e.stopPropagation();var nm=d.querySelector('.tx b'),k=d.dataset.i,n=nm?nm.textContent:'Dish';fly(a);setQ(k,n,1,true);var p=d.querySelector('.m61-plus');if(p)p.focus({preventScroll:true});return}
 var pl=t.closest('.m61-plus'),mi=t.closest('.m61-minus');
 if(pl||mi){var d2=t.closest('.dish');e.preventDefault();e.stopPropagation();var k2=d2.dataset.i,c=cart[k2];if(!c)return;setQ(k2,c.n,c.q+(pl?1:-1),!!pl);if(mi&&!cart[k2]){var ad=d2.querySelector('.m52-add');if(ad)ad.focus({preventScroll:true})}return}
 var sa=t.closest('.m61-sheetadd');
 if(sa){e.preventDefault();e.stopPropagation();var k3=sa.dataset.i,n3=sa.dataset.n,c3=cart[k3];setQ(k3,n3,(c3?c3.q:0)+1,true);sa.textContent='Added ✓ · tap to add another';return}
},true);
$('m61-clr').addEventListener('click',function(){cart={};save();paintRows();paintBar(false);say('Order cleared')});
/* popup: add an "Add to order" button next to Order pickup */
function sheet(){var s=$('m52-sh'),ac=s&&s.querySelector('.acts');if(!ac||ac.querySelector('.m61-sheetadd'))return;var h=s.querySelector('h3'),i=null;
 var all=R.querySelectorAll('#m52-list .dish');var nm=h?h.textContent:'';all.forEach(function(d){var b=d.querySelector('.tx b');if(b&&b.textContent===nm)i=d.dataset.i});
 if(i==null)return;var b=document.createElement('button');b.type='button';b.className='m52-btn m61-sheetadd';b.dataset.i=i;b.dataset.n=nm;b.textContent=cart[i]?'Add another ('+cart[i].q+' in order)':'Add to order';ac.insertBefore(b,ac.firstChild)}
if($('m52-sh'))new MutationObserver(sheet).observe($('m52-sh'),{childList:true});
/* ---- 3. filter animation: FLIP the tiles that stay, fade/rise the ones that appear ---- */
var snap={};
function take(){snap={};R.querySelectorAll('#m52-pics .m52-t').forEach(function(t){snap[t.dataset.i]=t.getBoundingClientRect()});snap.__y=scrollY}
['input','change'].forEach(function(ev){R.addEventListener(ev,take,true)});
R.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#m52-ex,[data-m]'))take()},true);
var raf=0;
function after(){raf=0;paintRows();place();spy();
 if(rm()||!document.body.animate){snap={};return}
 var k=0;R.querySelectorAll('#m52-pics .m52-t').forEach(function(t){var o=snap[t.dataset.i],n=t.getBoundingClientRect();
  if(o&&snap.__y!=null){var dx=o.left-n.left,dy=o.top-n.top-(snap.__y-scrollY)*0;if(Math.abs(dx)>1||Math.abs(dy)>1)t.animate([{translate:dx+'px '+dy+'px'},{translate:'0 0'}],{duration:480,easing:'cubic-bezier(.22,.8,.24,1)'})}
  else if(Object.keys(snap).length>1){t.animate([{opacity:0,scale:.9},{opacity:1,scale:1}],{duration:420,delay:Math.min(k++,10)*35,easing:'cubic-bezier(.22,.8,.24,1)',fill:'backwards'})}});
 if(Object.keys(snap).length>1){var g=0;R.querySelectorAll('#m52-list .grp').forEach(function(s){s.animate([{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:380,delay:Math.min(g++,6)*50,easing:'cubic-bezier(.22,.8,.24,1)',fill:'backwards'})})}
 snap={}}
var mo=new MutationObserver(function(){if(!raf)raf=requestAnimationFrame(after)});
['m52-pics','m52-list','m52-ch'].forEach(function(id){var el=$(id);if(el)mo.observe(el,{childList:true})});
paintRows();paintBar(false);place();spy();
})();
;
(function(){
var W=document.querySelector('.rrw'),P=W&&W.querySelector('.rrw-panel');if(!W||!P)return;
function fit(){
 if(!W.classList.contains('open')){P.style.maxHeight='';return}
 P.style.maxHeight='';
 var cs=getComputedStyle(P),ws=getComputedStyle(W),wr=W.getBoundingClientRect(),sc=W.offsetWidth?wr.width/W.offsetWidth:1,bp=parseFloat(cs.bottom)||0;
 var ref=(ws.transform!=='none'||cs.position!=='fixed')?wr.bottom:innerHeight,pb=ref-bp*(ws.transform!=='none'?sc:1);
 var nav=document.querySelector('.top-nav'),nb=nav?Math.max(0,nav.getBoundingClientRect().bottom):0;
 var avail=(pb-nb-14)/(ws.transform!=='none'?sc:1);
 if(avail<P.offsetHeight)P.style.maxHeight=Math.max(140,Math.floor(avail))+'px'}
function later(){fit();setTimeout(fit,450);setTimeout(fit,1200)}
new MutationObserver(later).observe(W,{attributes:true,attributeFilter:['class']});
addEventListener('resize',fit);addEventListener('orientationchange',function(){setTimeout(fit,300)});
})();
;

/* v65: reveal animation + fix for signature dishes that have no menu item (they were dead tiles: no price, no Add, no popup) */
(function(){
 var bs=document.getElementById('bestsellers');if(!bs)return;
 var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function run(){
  var grid=bs.querySelector('.sig-bento'),cards=grid?[].slice.call(grid.querySelectorAll('.rr-signature-card')):[];
  if(!cards.length)return false;
  cards.forEach(function(c){
   if(c.dataset.dish||c.classList.contains('sig-nolink'))return;
   var h=c.querySelector('h3'),copy=c.querySelector('.rr-food-copy');if(!h||!copy)return;
   c.classList.add('sig-nolink');
   var f=document.createElement('div');f.className='rr-sig-foot';
   var a=document.createElement('a');a.className='sig-more';a.href='?page=menu#menu-page';a.textContent='See on menu \u2192';
   f.appendChild(document.createElement('span'));f.appendChild(a);copy.appendChild(f);
   c.setAttribute('role','link');c.setAttribute('tabindex','0');c.setAttribute('aria-label',h.textContent+' \u2014 see the menu');
   c.addEventListener('click',function(e){if(!e.target.closest('a'))a.click()});
   c.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target===c){e.preventDefault();a.click()}});
  });
  if(!grid.dataset.sigReveal){
   grid.dataset.sigReveal='1';
   if(!RM&&'IntersectionObserver' in window){
    grid.classList.add('sig-armed');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);e.target.classList.add('sig-in')}})},{threshold:.12});
    cards.forEach(function(c,i){c.style.setProperty('--sd',(i%4)*80+'ms');io.observe(c)});
    setTimeout(function(){cards.forEach(function(c){c.classList.add('sig-in')})},4000);
   }
  }
  return true;
 }
 var t=0,mo=new MutationObserver(function(){cancelAnimationFrame(t);t=requestAnimationFrame(function(){setTimeout(function(){if(run())mo.disconnect()},0)})});
 mo.observe(bs,{childList:true,subtree:true});
 if(document.readyState!=='loading')setTimeout(function(){if(run())mo.disconnect()},0);else document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){if(run())mo.disconnect()},0)});
})();

;

/* v71 founder reveal. WebGL fragment shader: noise-driven draw order for the gold sketch, engraved hatching from the photo's own tones,
   a light sweep that wakes the portrait in gold monochrome, a colour bloom spreading from the eyes, then the signature drawn from the font outlines.
   One number (progress 0..1) drives everything. Falls back to the finished photo without WebGL or with reduced motion. */
window.__fndBoot=function(){
var story=document.getElementById('story'),fnd=document.getElementById('fnd');
if(!story||!fnd)return;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function stat(){fnd.classList.add('fnd-static');fnd.classList.remove('fnd-gl-on');document.documentElement.classList.remove('fnd-js')}
if(reduce||!window.gsap||!window.SplitText){stat();return}
gsap.registerPlugin(ScrollTrigger,SplitText);ScrollTrigger.config({ignoreMobileResize:true});
document.documentElement.classList.add('fnd-js');

var frame=fnd.querySelector('.fnd-frame'),cv=document.getElementById('fndGL');
var target=0,P=0,mouse={x:-1,y:-1,a:0,tx:-1,ty:-1,ta:0},dirty=true,visible=false,glOK=false;
function cl(x,a,b){return x<a?a:x>b?b:x}
function ss(a,b,x){x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x)}

/* ---------- signature (SVG outlines) + flourish + role ---------- */
var glyphs=[].slice.call(fnd.querySelectorAll('.fnd-sg path')),fl=fnd.querySelector('.fnd-fl path.dr'),rl=fnd.querySelector('.fnd-rl');
function sig(p){
 var s=cl((p-.78)/.19,0,1),n=glyphs.length;
 for(var i=0;i<n;i++){
  var st=i/n*.66,g=cl((s-st)/.34,0,1),f=ss(.5,1,g);
  var el=glyphs[i];el.style.strokeDashoffset=(1-g).toFixed(4);el.style.fillOpacity=f.toFixed(3);el.style.strokeOpacity=(g<=0?0:1-f).toFixed(3);
 }
 var t=cl((p-.93)/.05,0,1);fl.style.strokeDashoffset=(1-t).toFixed(3);
 var r=cl((p-.95)/.05,0,1);rl.style.opacity=r.toFixed(3);rl.style.transform='translate3d(0,'+(6*(1-r)).toFixed(2)+'px,0)';
}

/* ---------- arch + lattice texture (R = arch lines, G = lattice, B = fine dots) ---------- */
function makeArch(){
 var W=1008,H=953,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
 x.fillStyle='#000';x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';x.lineJoin='round';x.lineCap='round';
 var cx=W/2,x0=.085*W,x1=.915*W,ys=.44*H,ap=.04*H;
 function arch(k,ox){x.beginPath();var a=cx-(cx-x0)*k,b=cx+(x1-cx)*k,yb=H+40,y2=H-(H-ys)*k,ya=H-(H-ap)*k;
  x.moveTo(a,yb);x.lineTo(a,y2);x.bezierCurveTo(a,y2-.19*H*k,cx-.09*W*k,ya+.13*H*k,cx,ya);
  x.bezierCurveTo(cx+.09*W*k,ya+.13*H*k,b,y2-.19*H*k,b,y2);x.lineTo(b,yb)}
 /* lattice, clipped inside the inner arch */
 x.save();arch(.93);x.clip();x.strokeStyle='rgb(0,255,0)';x.lineWidth=1.6;
 var st=74;for(var k=-H;k<W+H;k+=st){x.beginPath();x.moveTo(k,0);x.lineTo(k+H,H);x.stroke();x.beginPath();x.moveTo(k,H);x.lineTo(k+H,0);x.stroke()}
 x.strokeStyle='rgb(0,255,0)';x.lineWidth=1.3;
 for(var gy=0;gy<H;gy+=st)for(var gx=(gy/st%2)?st/2:0;gx<W;gx+=st){x.beginPath();x.arc(gx,gy,8,0,6.2832);x.stroke()}
 x.restore();
 /* arch lines */
 x.strokeStyle='rgb(255,0,0)';x.lineWidth=7;arch(1);x.stroke();
 x.lineWidth=2.6;arch(.968);x.stroke();
 x.strokeStyle='rgb(0,0,255)';x.lineWidth=4;x.setLineDash([1,13]);arch(.935);x.stroke();x.setLineDash([]);
 x.strokeStyle='rgb(255,0,0)';x.lineWidth=2;arch(.9);x.stroke();
 /* pillar capitals */
 [x0,x1].forEach(function(px){
  x.lineWidth=3.2;x.strokeStyle='rgb(255,0,0)';
  x.strokeRect(px-17,ys+8,34,12);x.strokeRect(px-12,ys+26,24,8);
  x.beginPath();x.moveTo(px-17,ys+14);x.quadraticCurveTo(px,ys-18,px+17,ys+14);x.stroke();
  for(var by=ys+60;by<H;by+=84){x.beginPath();x.arc(px,by,6,0,6.2832);x.stroke()}
 });
 /* finial at the apex */
 x.lineWidth=3;x.beginPath();x.moveTo(cx,ap-4);x.lineTo(cx,ap-30);x.stroke();x.beginPath();x.arc(cx,ap-36,6,0,6.2832);x.stroke();
 return c;
}

/* ---------- GL ---------- */
var VS='attribute vec2 p;varying vec2 vUv;void main(){vUv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
var FS=[
'#ifdef GL_FRAGMENT_PRECISION_HIGH','precision highp float;','#else','precision mediump float;','#endif',
'varying vec2 vUv;uniform sampler2D uCol,uSk,uArch;uniform vec2 uRes;uniform float uP,uT,uPx;uniform vec3 uM;',
'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}',
'float sq(float x){return x*x;}','float ph(float a,float b){return clamp((uP-a)/(b-a),0.,1.);}',
'vec4 sam(sampler2D t,vec2 q){vec2 m=step(vec2(0.),q)*step(q,vec2(1.));return texture2D(t,q)*m.x*m.y;}',
'void main(){',
' vec2 uv=vUv;',
' vec2 q=uv;',
' float sketchP=ph(0.,.36),archP=ph(.04,.34),engr=ph(.30,.52),sweepP=ph(.46,.65),bloomP=ph(.58,.88),fin=ph(.80,1.);',
' vec3 gold=vec3(.95,.72,.30),goldH=vec3(1.,.88,.55),goldD=vec3(.72,.48,.16);q+=(uM.xy-.5)*vec2(.014,.010)*uM.z*fin;',
/* background room */
' vec2 bq=uv-vec2(.5,.46);float br=length(bq*vec2(1.,.92));',
' vec3 col=mix(vec3(.995,.978,.925),vec3(.945,.88,.74),smoothstep(0.,.9,br));col*=.958+.05*fbm(uv*uRes/uPx*.18)+.022*vn(uv*uRes/uPx*1.3);',

' vec3 ar=texture2D(uArch,uv).rgb;',
/* lattice: blooms outward from the face */
' float ln=fbm(uv*4.+2.);float lr=length((uv-vec2(.5,.45))*vec2(1.,.9))+(ln-.5)*.3;',
' float lat=ar.g*(1.-smoothstep(ph(.12,.8)*1.15-.18,ph(.12,.8)*1.15,max(lr,0.)))*(.14+.16*fin);',

/* arch drawn from both feet up to the apex, noise on the front */
' float at=(1.-uv.y)/.97+(fbm(uv*7.)-.5)*.07;float ad=smoothstep(at,at+.02,archP*1.12);',
' float af=exp(-sq((archP*1.12-at)/.035))*step(.001,archP)*(1.-ph(.34,.5));',
' float aLine=clamp(ar.r+ar.b*.8,0.,1.)*ad;',
' vec3 archC=mix(goldD,goldH,smoothstep(.0,.9,1.-uv.y)*.6+.2*sin(uv.x*30.+uT*.8)*.5+.2);',

/* photo layers */
' vec4 ph0=sam(uCol,q);float pa=smoothstep(.40,.97,ph0.a);vec3 rgb=ph0.a>.01?ph0.rgb/ph0.a:vec3(0.);',
' float lum=dot(rgb,vec3(.299,.587,.114));',
' vec2 E=vec2(.576,.379);',
/* halo behind the figure (blurred alpha ring), intensifies at the end */
' float h=0.;for(int i=0;i<8;i++){float a=float(i)*.7854;vec2 d=vec2(cos(a),sin(a));h+=sam(uCol,q+d*.035).a+sam(uCol,q+d*.08).a;}h/=16.;',
' col=mix(col,vec3(.60,.36,.10),clamp(h*(1.-pa)*ph(.5,1.)*.55,0.,1.));',
/* light sweep and gold-toned monochrome wake-up */
' vec2 dir=normalize(vec2(.78,-.62));float s=dot(uv-.5,dir)+(fbm(uv*3.5+uT*.05)-.5)*.16;float c0=mix(-.82,.92,sweepP);',
' float sepM=smoothstep(c0+.04,c0-.30,s)*step(.001,sweepP);',
' float band=exp(-sq((s-c0)/.07))*pow(max(sin(3.14159*sweepP),0.),.6)*step(.001,sweepP);',
' float streak=exp(-sq((s-c0)/.032))*pow(max(sin(3.14159*sweepP),0.),.6)*step(.001,sweepP);',
' vec3 mono=mix(vec3(.10,.045,.02),vec3(.97,.86,.68),pow(lum,1.1));',
/* colour bloom from the eyes, noisy edge, golden ripple on the front */
' float cd=length((q-E)*vec2(1.,.85));float cn=max(cd+(fbm(q*4.5+3.)-.5)*.30,0.);float R=bloomP*1.3;',
' float cm=1.-smoothstep(R-.15,R,cn);',
' float ring=exp(-sq((cn-R+.075)/.05))*max(sin(3.14159*cl01(bloomP)),0.);',
' vec3 pr=mix(mono,rgb,cm);float pv=pa*max(sepM,cm);',
' col=mix(col,pr,pv);',
' col+=vec3(1.,.66,.26)*ring*.30*pa;',
' col+=vec3(1.,.74,.34)*band*.22*pa+vec3(1.,.84,.55)*streak*.16*pa;',
/* sketch: noise-driven draw order, top of head downward */
' float sk=sam(uSk,q).a;float glow=0.;for(int i=0;i<8;i++){float a=float(i)*.7854;glow+=sam(uSk,q+vec2(cos(a),sin(a))*.0045).a;}glow/=8.;',
' float o=q.y*.78+abs(q.x-.5)*.22+(fbm(q*5.)-.5)*.36+.04;float head=sketchP*1.28-.10;',
' float dr=smoothstep(o,o+.04,head);float fr=exp(-sq((head-o)/.05))*step(.001,sketchP);',
' float ink=clamp(sk*1.7,0.,1.);float fade=1.-.80*ph(.64,.96);float brush=exp(-sq(length((uv-uM.xy)*vec2(1.,1.15))/.17))*uM.z*fin;fade=max(fade,brush*.95);',
' float la=clamp(ink+glow*.22,0.,1.)*dr*fade;',
' col=mix(col,vec3(.40,.24,.06),la);',
' col=mix(col,vec3(.88,.52,.04),clamp(ink*fr*.9+glow*dr*.25,0.,1.)*(1.-ph(.5,.8)*.7)*fade);',
/* engraving: hatch density follows the photo's own darkness */
' float dk=clamp((.80-lum)*1.35,0.,1.)*pa;',
' vec2 px=q*uRes/uPx;float sp=3.6;',
' float hx=(px.x*.7071+px.y*.7071)/sp;float h1=1.-smoothstep(dk*.40-.06,dk*.40+.06,abs(fract(hx)-.5));',
' float gx=(px.x*.7071-px.y*.7071)/(sp*1.1);float h2=1.-smoothstep(max(dk-.42,0.)*.55-.05,max(dk-.42,0.)*.55+.05,abs(fract(gx)-.5));',
' float hatch=clamp(h1*step(.04,dk)+h2*step(.46,dk),0.,1.);',
' float o2=o*.9+.18*fbm(q*9.)+.05;float hd=smoothstep(o2,o2+.06,engr*1.32-.06);',
' float hf=exp(-sq((engr*1.32-.06-o2)/.06))*step(.001,engr);',
' float hv=hatch*hd*.68*(1.-ph(.56,.80));',
' col=mix(col,vec3(.50,.31,.09),hv);col=mix(col,vec3(.88,.52,.04),clamp(hatch*hf*.6,0.,1.)*(1.-ph(.56,.8)));',
/* motes */
' float pt=0.;for(int L=0;L<2;L++){float fL=float(L);vec2 g=uv*vec2(10.+8.*fL,12.5+10.*fL)+vec2(0.,uT*(.25+.2*fL));vec2 id=floor(g),f=fract(g)-.5;',
'  float r1=hash(id+fL*17.),r2=hash(id*1.7+3.+fL);vec2 off=(vec2(r1,r2)-.5)*.6;float d=length(f-off);',
'  float tw=.5+.5*sin(uT*(1.2+r1*2.)+r2*20.);pt+=pow(max(0.,1.-d/(.07+.05*r2)),2.)*step(.55,r1)*tw;}',
' col=mix(col,vec3(.78,.52,.16),clamp(pt*(.25+.5*fin+.2*sweepP)*(1.-.9*pa),0.,.7));',
/* cursor light, only once the portrait is alive */
' float md=length((uv-uM.xy)*vec2(1.,1.15));col+=vec3(1.,.8,.45)*exp(-md*md*45.)*.20*uM.z*fin*(.4+.6*pa);',
/* grade */
' col*=1.-.10*smoothstep(.50,.95,br);col+=(hash(uv*uRes+uT)-.5)*.022;',
' gl_FragColor=vec4(col,1.);}'
].join('\n').replace(/cl01\(/g,'clamp01(').replace('void main(){','float clamp01(float x){return clamp(x,0.,1.);}\nvoid main(){');

var gl,prog,U={},tex={};
function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn('fnd shader',gl.getShaderInfoLog(o));return null}return o}
function mk(src,pre){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!!pre);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
function imgReady(im){return im.decode?im.decode().catch(function(){}):Promise.resolve()}
var dpr=1,t0=performance.now(),last=t0;
function size(){var b=frame.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,matchMedia('(max-width:700px)').matches?1.5:1.75);
 var w=Math.max(2,Math.round(b.width*dpr)),h=Math.max(2,Math.round(b.height*dpr));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}dirty=true}
function draw(now){
 var dt=Math.min(.25,(now-last)/1000);last=now;
 var k=1-Math.exp(-dt*5.2);var dP=target-P;P+=dP*k;if(Math.abs(target-P)<.0004)P=target;
 mouse.x+=(mouse.tx-mouse.x)*.2;mouse.y+=(mouse.ty-mouse.y)*.2;mouse.a+=(mouse.ta-mouse.a)*.12;
 sig(P);moveHand(P);quote(P);audio(P,dt);
 gl.uniform1f(U.uP,P);gl.uniform1f(U.uT,(now-t0)/1000);gl.uniform2f(U.uRes,cv.width,cv.height);gl.uniform1f(U.uPx,dpr);gl.uniform3f(U.uM,mouse.x,mouse.y,mouse.a);
 gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function loop(now){if(!glOK)return;requestAnimationFrame(loop);if(visible||dirty||P!==target){draw(now);dirty=false}}
function init(){
 try{gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'})||cv.getContext('experimental-webgl')}catch(e){}
 if(!gl)return Promise.reject('nogl');
 var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return Promise.reject('shader');
 prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return Promise.reject('link');
 gl.useProgram(prog);var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 var loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 ['uCol','uSk','uArch','uRes','uP','uT','uPx','uM'].forEach(function(n){U[n]=gl.getUniformLocation(prog,n)});
 var ic=new Image(),is=new Image();ic.src='assets/founder-color-gl.webp';is.src='assets/founder-sketch.webp';
 return Promise.all([imgReady(ic),imgReady(is)]).then(function(){
  gl.activeTexture(gl.TEXTURE0);tex.c=mk(ic,true);gl.activeTexture(gl.TEXTURE1);tex.s=mk(is,true);gl.activeTexture(gl.TEXTURE2);tex.a=mk(makeArch(),false);
  gl.uniform1i(U.uCol,0);gl.uniform1i(U.uSk,1);gl.uniform1i(U.uArch,2);
  size();glOK=true;fnd.classList.add('fnd-gl-on');draw(performance.now());requestAnimationFrame(loop);
 });
}
cv.addEventListener('webglcontextlost',function(e){e.preventDefault();glOK=false;stat()});
if(window.ResizeObserver)new ResizeObserver(function(){if(glOK)size()}).observe(frame);
if(window.IntersectionObserver)new IntersectionObserver(function(en){visible=en[0].isIntersecting}).observe(frame);else visible=true;
frame.addEventListener('pointermove',function(e){var b=frame.getBoundingClientRect();mouse.tx=(e.clientX-b.left)/b.width;mouse.ty=(e.clientY-b.top)/b.height;mouse.ta=1;if(mouse.x<0){mouse.x=mouse.tx;mouse.y=mouse.ty}});
frame.addEventListener('pointerleave',function(){mouse.ta=0});
init().catch(function(){stat()});


/* ---------- drawing hand: follows the pen front of the sketch ---------- */
var hand=fnd.querySelector('.fnd-hand');
function moveHand(p){
 if(!hand)return;var sp=cl(p/.36,0,1),op=ss(.012,.05,p)*(1-ss(.33,.395,p));
 if(op<=0){hand.style.opacity=0;return}
 var qx=.5+.30*Math.sin(sp*46)*(.4+.6*Math.sin(Math.PI*sp)),qy=cl((sp*1.28-.14)/.78,-.05,1.05);
 var u=qx,v=qy,b=frame.getBoundingClientRect(),w=b.width*.36,k=w/220;
 hand.style.width=w+'px';hand.style.opacity=op.toFixed(3);
 hand.style.transform='translate3d('+(u*b.width-12*k).toFixed(1)+'px,'+(v*b.height-12*k).toFixed(1)+'px,0) rotate('+(-14+Math.sin(sp*92)*1.4).toFixed(2)+'deg)';hand.style.transformOrigin='5.45% 4.6%';
}
/* ---------- quote (type the text into data-quote on #fndQ; empty = nothing shown) ---------- */
var qEl=document.getElementById('fndQ'),qDone=false;
if(qEl&&qEl.getAttribute('data-quote')){var qt=qEl.getAttribute('data-quote');qEl.textContent='';qt.split('').forEach(function(c,i){var s=document.createElement('span');s.className='c';s.style.setProperty('--i',i);s.textContent=c;qEl.appendChild(s)});qEl.setAttribute('aria-label',qt)}
function quote(p){if(qEl&&!qDone&&p>=.975&&qEl.childNodes.length){qDone=true;qEl.classList.add('in')}}
/* ---------- sound (off until tapped): pen scratch while the sketch draws, soft chime at the end ---------- */
var ac,gn,soundOn=false,pPrev=0,chimed=false,sb=fnd.querySelector('.fnd-snd');
function ensureAudio(){if(ac)return;var A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=new A();
 var buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 var nz=ac.createBufferSource();nz.buffer=buf;nz.loop=true;var f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=2800;f.Q.value=.9;
 gn=ac.createGain();gn.gain.value=0;nz.connect(f);f.connect(gn);gn.connect(ac.destination);nz.start()}
function chime(){if(!ac)return;[523.25,784,1046.5].forEach(function(fr,i){var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=fr;
 var t=ac.currentTime+i*.12;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+2.3)})}
function audio(p,dt){
 if(!soundOn||!ac){pPrev=p;return}
 var sp=Math.abs(p-pPrev)/Math.max(dt,.001);pPrev=p;var on=p>.005&&p<.36?Math.min(.06,sp*1.6):0;
 gn.gain.setTargetAtTime(on,ac.currentTime,.05);if(p>=.97&&!chimed){chimed=true;chime()}if(p<.9)chimed=false}
if(sb)sb.addEventListener('click',function(){soundOn=!soundOn;sb.setAttribute('aria-pressed',soundOn);sb.classList.toggle('on',soundOn);if(soundOn){ensureAudio();if(ac&&ac.resume)ac.resume()}else if(gn)gn.gain.value=0});

/* test/debug hook: ?fnd=0.55 freezes the reveal at that progress */
var qs=/[?&]fnd=([0-9.]+)/.exec(location.search);
window.__fnd={set:function(p){target=P=cl(p,0,1);dirty=true;if(glOK)draw(performance.now())},get:function(){return P}};

/* ---------- story text (ink drying) and scroll driver ---------- */
function start(){
 var copy=story.querySelector('[data-story-copy]');
 var spans=copy&&copy.querySelectorAll('span');
 if(!spans||!spans.length)return false;
 var go=function(){
  var sp=new SplitText(spans,{type:'words,chars',wordsClass:'wd',charsClass:'ch'}),chars=sp.chars,n=chars.length,last=-1;
  story.classList.add('typing');
  var caret=document.createElement('span');caret.className='fnd-caret';caret.setAttribute('aria-hidden','true');story.querySelector('.rra-main').appendChild(caret);
  var host=story.querySelector('.rra-main');
  function paint(i){
   if(i>last){for(var k=last+1;k<=i;k++)chars[k].classList.add('on')}else if(i<last){for(var k=last;k>i;k--)chars[k].classList.remove('on')}
   last=i;var c=chars[Math.max(i,0)],b=host.getBoundingClientRect(),r=c.getBoundingClientRect();
   caret.style.transform='translate3d('+(r.right-b.left+1)+'px,'+(r.top-b.top+r.height*.12)+'px,0)';caret.style.height=r.height*.76+'px';caret.classList.add('vis');
  }
  var wide=function(){return matchMedia('(min-width:981px)').matches};
  var played=false;
  ScrollTrigger.create({trigger:copy,start:'top 80%',end:'bottom 62%',onUpdate:function(s){
   var i=Math.min(n-1,Math.floor(s.progress*n)-1);paint(i);if(s.progress>=1)caret.classList.remove('vis');
   
  }});
  /* narrow screens: portrait sits above the text, so it plays once, in time, when it scrolls into view */
  var playOnce=function(){
   if(qs||played)return;played=true;var o={v:0};gsap.to(o,{v:1,duration:7,ease:'power1.inOut',onUpdate:function(){target=o.v;dirty=true}});
  };
  /* v77b: start only when the portrait's centre reaches 70% down the screen (was 'top 85%', which fired on load on tall screens) */
  /* v79: the sketch plays ONLY after the visitor has scrolled (wheel/touch/keys/scrollbar) and the portrait's centre is above 70% of the screen. Never on page open, never on a timer. */
  var engaged=false;
  var tryPlay=function(){
   if(played||!engaged||qs)return;var r=fnd.getBoundingClientRect();
   if(r.height>0&&r.top+r.height/2<innerHeight*.7&&r.bottom>innerHeight*.15)playOnce();
  };
  var eng=function(){if(!engaged){engaged=true;tryPlay()}};
  ['wheel','touchmove','pointerdown'].forEach(function(ev){window.addEventListener(ev,eng,{passive:true,once:true})});
  window.addEventListener('keydown',function(e){if(/^(ArrowDown|ArrowUp|PageDown|PageUp|Home|End| )$/.test(e.key))eng()},{passive:true});
  window.addEventListener('scroll',tryPlay,{passive:true});
  ScrollTrigger.create({trigger:fnd,start:'center 70%',onUpdate:tryPlay,onToggle:tryPlay});
  if(qs)window.__fnd.set(parseFloat(qs[1]));
  ScrollTrigger.refresh();
 };
 (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(go);
 return true;
}
var tries=0,iv=setInterval(function(){if(start()||++tries>50){clearInterval(iv);if(tries>50)stat()}},100);
};
(function(){var fnd=document.getElementById('fnd');
if(!fnd||matchMedia('(prefers-reduced-motion:reduce)').matches){window.__fndBoot();return}
var done=0;function load(){if(done)return;done=1;var L=['assets/js/gsap.min.js','assets/js/ScrollTrigger.min.js','assets/js/SplitText.min.js'],i=0;
(function next(){if(i>=L.length){window.__fndBoot();return}var e=document.createElement('script');e.src=L[i++];e.onload=next;e.onerror=function(){window.__fndBoot()};document.head.appendChild(e)})()}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es.some(function(x){return x.isIntersecting})){o.disconnect();load()}},{rootMargin:'1500px 0px'}).observe(fnd)}else addEventListener('load',load);
})();

;
(function(){var e=document.querySelector(".a73-yrs");if(e){var y=new Date().getFullYear()-1991;e.textContent="Since 1991, "+y+" years"}})()
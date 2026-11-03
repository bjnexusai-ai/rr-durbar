(function(){var z=document.getElementById('rrAz');function c(){z.classList.remove('on')}z.onclick=c;document.addEventListener('keydown',function(e){if(e.key==='Escape')c()});document.addEventListener('click',function(e){var p=e.target.closest&&e.target.closest('#awards .rrA-photo[data-zoom]');if(!p)return;var i=p.querySelector('img');z.querySelector('img').src=i.src;z.querySelector('img').alt=i.alt;z.classList.add('on')})})();
;

(function(){if(!('IntersectionObserver' in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('rr-off',!e.isIntersecting)})},{rootMargin:'120px 0px'});
function go(){document.querySelectorAll('section,footer,.rrm-lights').forEach(function(n){io.observe(n)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();

;

(function(){
/* ---- Awards viewer (About): arrows, Escape, swipe, focus return ---- */
var z=document.getElementById('rrAz');
if(z){
 var photos=function(){return [].slice.call(document.querySelectorAll('#awards .rrA-photo'))};
 var cur=0,lastFocus=null;
 var cap=document.createElement('p');cap.className='rrAz-cap';z.appendChild(cap);
 function mk(cls,label,txt){var b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.textContent=txt;z.appendChild(b);return b}
 var bx=mk('rrAz-x','Close enlarged photo','×'),bp=mk('rrAz-nav rrAz-prev','Previous photo','‹'),bn=mk('rrAz-nav rrAz-next','Next photo','›');
 z.setAttribute('aria-modal','true');
 function show(i){var P=photos();if(!P.length)return;cur=(i+P.length)%P.length;var im=P[cur].querySelector('img'),fc=P[cur].closest('figure').querySelector('figcaption'),t=fc&&fc.querySelector('strong'),s=fc&&fc.querySelector('span:not(.rrA-zoomhint)');
  var zi=z.querySelector('img');zi.src=im.src;zi.alt=im.alt;
  cap.innerHTML='';if(t){var b=document.createElement('b');b.textContent=t.textContent;cap.appendChild(b)}if(s)cap.appendChild(document.createTextNode(s.textContent));
  var keep=lastFocus;lastFocus=null;z.classList.remove('on');void z.offsetWidth;z.classList.add('on');lastFocus=keep}
 function close(){z.classList.remove('on')}
 new MutationObserver(function(){if(!z.classList.contains('on')&&lastFocus){var f=lastFocus;lastFocus=null;if(f.focus)f.focus()}}).observe(z,{attributes:true,attributeFilter:['class']});
 bx.addEventListener('click',function(e){e.stopPropagation();close()});
 bp.addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
 bn.addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
 cap.addEventListener('click',function(e){e.stopPropagation()});
 z.querySelector('img').addEventListener('click',function(e){e.stopPropagation()});
 /* every award photo opens the viewer; photos are keyboard reachable */
 function prep(){photos().forEach(function(p,i){p.setAttribute('data-zoom','1');p.tabIndex=0;p.setAttribute('role','button');var im=p.querySelector('img');p.setAttribute('aria-label','Enlarge photo: '+(im&&im.alt||('award '+(i+1))));
  var fc=p.closest('figure').querySelector('figcaption');if(fc&&!fc.querySelector('.rrA-zoomhint')){var h=document.createElement('span');h.className='rrA-zoomhint';h.setAttribute('aria-hidden','true');h.textContent='Tap photo to enlarge';fc.appendChild(h)}})}
 prep();
 document.addEventListener('click',function(e){var p=e.target.closest&&e.target.closest('#awards .rrA-photo');if(!p)return;lastFocus=p;show(photos().indexOf(p));bx.focus()});
 document.addEventListener('keydown',function(e){
  var p=document.activeElement;if((e.key==='Enter'||e.key===' ')&&p&&p.matches&&p.matches('#awards .rrA-photo')){e.preventDefault();p.click();return}
  if(!z.classList.contains('on'))return;
  if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1)}
  else if(e.key==='ArrowRight'){e.preventDefault();show(cur+1)}
  else if(e.key==='Escape'){close()}
  else if(e.key==='Tab'){var f=[bx,bp,bn],i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});
 var sx=null;z.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
 z.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1))},{passive:true});
}
/* ---- Instagram viewer: focus handling and swipe ---- */
var B=document.getElementById('igBox');
if(B){
 var ret=null;
 new MutationObserver(function(){if(B.classList.contains('on')){ret=ret||document.activeElement;var x=B.querySelector('.ig-x');x&&x.focus()}else if(ret){if(ret.focus&&document.contains(ret))ret.focus();ret=null}}).observe(B,{attributes:true,attributeFilter:['class']});
 var tx=null;B.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
 B.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>50){var b=B.querySelector(dx<0?'.ig-next':'.ig-prev');b&&b.click()}},{passive:true});
}
})();

;

(function(){
var norm=function(t){return (t||'').toLowerCase().replace(/[^a-z]/g,'')};
function mark(list,id){list.forEach(function(c){var on=c.dataset.outlet===id;c.classList.toggle('is-selected',on);if(on)c.setAttribute('aria-current','true');else c.removeAttribute('aria-current')})}
/* Branches page: card <-> map marker, both directions */
var cards=[].slice.call(document.querySelectorAll('#br-list .brx-card'));
cards.forEach(function(c){var h=c.querySelector('h3');c.dataset.outlet=norm(h&&h.textContent)});
var pins=[].slice.call(document.querySelectorAll('#br-locator .pin'));
if(cards.length&&pins.length){
 pins.forEach(function(p){new MutationObserver(function(){if(p.classList.contains('on'))mark(cards,p.dataset.id)}).observe(p,{attributes:true,attributeFilter:['class']})});
 var cur=pins.filter(function(p){return p.classList.contains('on')})[0];if(cur)mark(cards,cur.dataset.id);
 cards.forEach(function(c){c.addEventListener('click',function(e){if(e.target.closest('a,button'))return;var p=document.querySelector('#br-locator .pin[data-id="'+c.dataset.outlet+'"]');if(p)p.click();else mark(cards,c.dataset.outlet)})});
}
/* Locations page: simple single selection */
var lc=[].slice.call(document.querySelectorAll('#locations .rr-location-card'));
lc.forEach(function(c){var h=c.querySelector('h3');c.dataset.outlet=norm(h&&h.textContent);c.addEventListener('click',function(e){if(e.target.closest('a,button'))return;mark(lc,c.dataset.outlet)})});
})();

;

/* The page script removes unapproved placeholder reviews (no fake reviews). When approved reviews are added
   as <div class="rr-review-row"> inside #reviews, this turns them into a swipeable row automatically. */
(function(){
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function init(row){
 if(row.dataset.rrSwipe)return;row.dataset.rrSwipe='1';
 row.tabIndex=0;row.setAttribute('role','region');row.setAttribute('aria-label','Guest reviews. Swipe or use the arrow keys to see more.');
 var ctl=document.createElement('div');ctl.className='rr-swipe-ctl';
 function b(l,t){var x=document.createElement('button');x.type='button';x.setAttribute('aria-label',l);x.textContent=t;ctl.appendChild(x);return x}
 var pv=b('Previous reviews','\u2039'),nx=b('Next reviews','\u203A');
 row.parentNode.insertBefore(ctl,row.nextSibling);
 var step=function(){var c=row.children[0];return c?c.getBoundingClientRect().width+20:300};
 function go(d){row.scrollBy({left:d*step(),behavior:rm?'auto':'smooth'})}
 pv.addEventListener('click',function(){go(-1)});nx.addEventListener('click',function(){go(1)});
 function upd(){var over=row.scrollWidth>row.clientWidth+4;ctl.classList.toggle('on',over);pv.disabled=row.scrollLeft<4;nx.disabled=row.scrollLeft+row.clientWidth>=row.scrollWidth-4}
 row.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
 row.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
 upd();setTimeout(upd,600);
}
function scan(){document.querySelectorAll('#reviews .rr-review-row').forEach(init)}
var host=document.getElementById('reviews');
if(host){scan();new MutationObserver(scan).observe(host,{childList:true,subtree:true})}
})();

;

(function(){
 function vis(e){return e.offsetParent!==null&&!e.closest('.rr-page-hidden')}
 function fix(){
  document.querySelectorAll('[data-rr-h1]').forEach(function(e){e.removeAttribute('role');e.removeAttribute('aria-level');e.removeAttribute('data-rr-h1')});
  var h1=[].slice.call(document.querySelectorAll('h1')).some(vis);if(h1)return;
  var h=[].slice.call(document.querySelectorAll('h2')).filter(vis)[0];
  if(h){h.setAttribute('role','heading');h.setAttribute('aria-level','1');h.setAttribute('data-rr-h1','1')}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(fix,400)});else setTimeout(fix,400);
 document.addEventListener('click',function(){setTimeout(fix,600)},true);
 window.addEventListener('popstate',function(){setTimeout(fix,600)});
})();

;

/* RR Durbar motion — PHASE 1. Plain JS, one rAF scroll handler, no libraries. */
(function(){
 var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
 ready(function(){
  /* 1. scroll progress line */
  if(!RM){var bar=document.createElement('div');bar.className='rr-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
   var tk=0,hh=0,ht=0;function up(){tk=0;var n=Date.now();if(!hh||n-ht>700||scrollY>hh){hh=document.documentElement.scrollHeight-innerHeight;ht=n}var h=hh;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0).toFixed(4)+')'}
   addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(up)},{passive:true});addEventListener('resize',function(){hh=0;up()});up();}
  /* 2. hero: gold rule + word-by-word headline + swipe */
  document.querySelectorAll('.hero .slide').forEach(function(s){
   var ey=s.querySelector('.hero-eyebrow');
   if(ey&&!s.querySelector('.rr-rule')){var r=document.createElement('span');r.className='rr-rule';r.setAttribute('aria-hidden','true');ey.after(r)}
   /* v67: headline word-split removed - it re-animated text that had already faded in (double reveal) */
  });
  var hero=document.querySelector('.hero');
  if(hero&&window.goSlide){var x0=null,y0=0;
   hero.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
   hero.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.4)return;
    var sl=[].slice.call(hero.querySelectorAll('.slide')),i=sl.findIndex(function(s){return s.classList.contains('active')});
    window.goSlide(i+(dx<0?1:-1))},{passive:true})}
  /* 3. count-up for About "verified stats" (confirmed figures only; years are never animated) */
  /* v73: duplicate count-up removed (it zeroed the numbers and raced the generic counter) */
  /* 4. button shine: inject the sheen element into primary buttons */
  if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches)
   document.querySelectorAll('.btn-gold,.hero-primary,.rr-gold-button,.cx-btn,.rrm-btn,.rrf-banner-btn').forEach(function(b){
    if(b.querySelector('.rr-shine')||b.tagName==='INPUT')return;b.classList.add('rr-shine-host');var s=document.createElement('i');s.className='rr-shine';s.setAttribute('aria-hidden','true');b.appendChild(s)});
 });
})();


;

/* RR Durbar motion — PHASE 2. Reuses one IntersectionObserver; no libraries. */
(function(){
 var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
 function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
 ready(function(){
  /* 1. updates: staggered, alternating slide-in, once */
  var ups=[].slice.call(document.querySelectorAll('#updates .rr-updates-grid>.rr-update'));
  if(!RM&&ups.length&&'IntersectionObserver' in window){
   document.body.classList.add('rr-m-arm');
   var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add('rr-m-in')})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
   ups.forEach(function(u,i){u.style.setProperty('--d',(i%3)*90+'ms');io.observe(u)})}
  /* 2. menu categories: tilt up to 3deg toward the cursor */
  if(!RM&&FINE)document.querySelectorAll('#menu .category').forEach(function(c){var p=c.querySelector('.cat-photo'),raf=0;if(!p)return;
   c.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){c.classList.add('rr-tilting');c.style.setProperty('--ty',(x*6).toFixed(2)+'deg');c.style.setProperty('--tx',(-y*6).toFixed(2)+'deg')})},{passive:true});
   c.addEventListener('pointerleave',function(){cancelAnimationFrame(raf);c.classList.remove('rr-tilting');c.style.setProperty('--tx','0deg');c.style.setProperty('--ty','0deg')})});
  /* 3. bestsellers (phones): mark the card nearest the centre */
  var row=document.querySelector('#bestsellers .rr-grid-3');
  if(row&&!RM){var tk=0;function mark(){tk=0;var cs=[].slice.call(row.children),mid=row.getBoundingClientRect().left+row.clientWidth/2,best=null,bd=1e9;
    cs.forEach(function(c){var r=c.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);if(d<bd){bd=d;best=c}});
    cs.forEach(function(c){c.classList.toggle('rr-center',c===best)})}
   row.addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(mark)},{passive:true});addEventListener('resize',mark);mark()}
 });
})();


;

/* RR Durbar motion — PHASE 3. No libraries; touch devices skip tilt. */
(function(){
 var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
 function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
 ready(function(){
  /* 1. Branches: pins drop one by one (60 ms apart) when the map script creates them */
  var host=document.getElementById('pins');
  function setup(){
   var pins=[].slice.call(host.querySelectorAll('.pin')),cards=[].slice.call(document.querySelectorAll('#br-list .brx-card'));
   if(!pins.length)return false;
   if(!RM)pins.forEach(function(p,i){p.style.setProperty('--pd',i*60+'ms');p.classList.add('rr-drop')});
   /* link pin <-> card by outlet name; fall back to order */
   function norm(s){return (s||'').toLowerCase().replace(/[^a-z]/g,'')}
   pins.forEach(function(p,i){
    var nm=norm((p.getAttribute('aria-label')||'').replace(/ outlet$/i,'')),c=cards.find(function(k){return nm&&norm(k.textContent).indexOf(nm)>-1})||cards[i];
    if(!c)return;
    function on(v){p.classList.toggle('rr-link-on',v);c.classList.toggle('rr-link-on',v)}
    ['mouseenter','focus'].forEach(function(ev){p.addEventListener(ev,function(){on(true)});c.addEventListener(ev,function(){on(true)})});
    ['mouseleave','blur'].forEach(function(ev){p.addEventListener(ev,function(){on(false)});c.addEventListener(ev,function(){on(false)})});
    p.addEventListener('click',function(){on(true);setTimeout(function(){on(false)},1600)});
   });
   return true}
  if(host&&!setup()){var mo=new MutationObserver(function(){if(setup())mo.disconnect()});mo.observe(host,{childList:true})}
  /* 2. Order Now: 3D tilt + glare on outlet cards (cards may be re-rendered, so delegate) */
  var od=document.getElementById('ordering');
  if(od&&!RM&&FINE){var raf=0;
   od.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var c=e.target.closest&&e.target.closest('.od-oc');if(!c)return;
    if(!c.classList.contains('rr-t3d')){c.classList.add('rr-t3d');var g=document.createElement('i');g.className='rr-glare';g.setAttribute('aria-hidden','true');c.appendChild(g)}
    var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){c.classList.add('rr-tilting');c.style.setProperty('--ty',((x-.5)*8).toFixed(2)+'deg');c.style.setProperty('--tx',((.5-y)*8).toFixed(2)+'deg');c.style.setProperty('--gx',(x*100)+'%');c.style.setProperty('--gy',(y*100)+'%')})},{passive:true});
   od.addEventListener('pointerout',function(e){var c=e.target.closest&&e.target.closest('.od-oc');if(!c||c.contains(e.relatedTarget))return;
    cancelAnimationFrame(raf);c.classList.remove('rr-tilting');c.style.setProperty('--tx','0deg');c.style.setProperty('--ty','0deg')})}
 });
})();


;

/* RR Durbar motion — PHASE 4 (polish). */
(function(){
 var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
 function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
 ready(function(){
  /* 1. page cross-fade: the router changes document.title on every page switch */
  var main=document.getElementById('main-content'),ti=document.querySelector('title'),first=true;
  if(!RM&&main&&ti)new MutationObserver(function(){if(first){first=false}
   main.classList.remove('rr-xfade');void main.offsetWidth;main.classList.add('rr-xfade')}).observe(ti,{childList:true,characterData:true,subtree:true});
  first=false;
  /* 2. magnetic main CTA (desktop only, max 5 px) */
  var cta=document.querySelector('.hero-primary');
  if(cta&&FINE&&!RM){var raf=0;cta.classList.add('rr-mag');
   cta.addEventListener('pointermove',function(e){var r=cta.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width*10,y=(e.clientY-r.top-r.height/2)/r.height*10;
    cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){cta.style.translate=x.toFixed(1)+'px '+y.toFixed(1)+'px'})},{passive:true});
   cta.addEventListener('pointerleave',function(){cancelAnimationFrame(raf);cta.style.translate='0 0'})}
  /* 3. footer logo + columns reveal once */
  var cols=[].slice.call(document.querySelectorAll('footer .rrf-grid>*'));
  if(!RM&&cols.length&&'IntersectionObserver' in window){document.body.classList.add('rr-m-arm');
   var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add('rr-m-in')})},{threshold:.1});
   cols.forEach(function(c,i){c.style.setProperty('--d',i*90+'ms');io.observe(c)})}
 });
})();


;

/* PHASE 7: hero pause on hover. State-based (#home:hover) so it survives slide changes under a still cursor; uses rrHeroPause/rrHeroResume from the engine */
(function(){var h=document.getElementById('home');if(!h||!matchMedia('(hover:hover)').matches)return;var over=false,t=0;
function chk(){t=0;var on=!!h.querySelector('.hero-actions:hover,.hero-nav-controls:hover,.hero-thumbs:hover');if(on&&!over){over=true;window.rrHeroPause&&window.rrHeroPause()}else if(!on&&over){over=false;window.rrHeroResume&&window.rrHeroResume()}}
function q(){if(!t)t=setTimeout(chk,60)}
document.addEventListener('mousemove',q,{passive:true});document.addEventListener('mouseover',q,{passive:true});document.addEventListener('mouseout',q,{passive:true});window.addEventListener('scroll',q,{passive:true});})();


;

/* RR Durbar motion — PHASE 8 (menu scroll-spy, branches filter, pickup expand). Reduced-motion: no animation, behaviour unchanged. */
(function(){
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* ===== 1. MENU: sliding pill + scroll-spy ===== */
function menu(){
 var bar=document.querySelector('#menu-page .rr-category-chips'),box=document.getElementById('rr-menu-items');
 if(!bar||!box||!bar.querySelector('[data-menu-filter]'))return false;
 if(bar.__rr8)return true;bar.__rr8=1;
 var chips={},pill=document.createElement('span'),active='all',lock=0,lt=0,raf=0;
 pill.className='rr-pill';pill.setAttribute('aria-hidden','true');bar.insertBefore(pill,bar.firstChild);bar.classList.add('rr-has-pill');
 bar.querySelectorAll('[data-menu-filter]').forEach(function(b){chips[b.dataset.menuFilter]=b});
 function groups(){return [].slice.call(box.querySelectorAll('[data-menu-group]')).filter(function(g){return !g.hidden})}
 function groupOf(c){return box.querySelector('[data-menu-group="'+(window.CSS&&CSS.escape?CSS.escape(c):c)+'"]')}
 function off(){return (parseFloat(getComputedStyle(bar).top)||0)+bar.offsetHeight+14}
 function place(){var c=chips[active];if(!c)return;pill.style.width=c.offsetWidth+'px';pill.style.height=c.offsetHeight+'px';pill.style.transform='translate('+c.offsetLeft+'px,'+c.offsetTop+'px)';pill.classList.add('on');
  var l=c.offsetLeft-(bar.clientWidth-c.offsetWidth)/2;if(bar.scrollWidth>bar.clientWidth+2){bar.scrollTo({left:Math.max(0,l),behavior:RM?'auto':'smooth'})}}
 function edges(){var sl=bar.scrollLeft,mx=bar.scrollWidth-bar.clientWidth;bar.style.setProperty('--fl',sl>4?'26px':'0px');bar.style.setProperty('--fr',sl<mx-4?'26px':'0px')}
 function setActive(c){if(!chips[c])c='all';active=c;Object.keys(chips).forEach(function(k){if(k!=='rr-veg')chips[k].setAttribute('aria-pressed',String(k===c))});place()}
 function spy(){raf=0;if(lock||!bar.offsetParent)return;var o=off()+6,cur='all';groups().forEach(function(g){if(g.getBoundingClientRect().top<=o)cur=g.dataset.menuGroup});
  var gs=groups(),last=gs[gs.length-1];if(last&&window.innerHeight+scrollY>=document.documentElement.scrollHeight-4&&last.getBoundingClientRect().top<innerHeight)cur=last.dataset.menuGroup;
  if(cur!==active)setActive(cur)}
 function q(){if(!raf)raf=requestAnimationFrame(spy)}
 function settle(){lock=0;q()}
 function go(c,tries){
  if(!bar.offsetParent){if((tries||0)<15)setTimeout(function(){go(c,(tries||0)+1)},120);return}
  var y;if(c==='all'||!chips[c]){var g0=groups()[0];y=g0?g0.getBoundingClientRect().top+scrollY-off():0;c='all'}
  else{var g=groupOf(c);if(!g||g.hidden)return;y=g.getBoundingClientRect().top+scrollY-off()+2}
  lock=1;setActive(c);clearTimeout(lt);lt=setTimeout(settle,900);
  scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'});if(RM)settle()}
 /* take over chip clicks (capture, before the old filter handler) */
 bar.addEventListener('click',function(e){var b=e.target.closest('[data-menu-filter]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();go(b.dataset.menuFilter)},true);
 var veg=document.getElementById('rr-veg-toggle');
 if(veg)veg.addEventListener('click',function(){setTimeout(function(){
  Object.keys(chips).forEach(function(k){if(k==='all')return;var g=groupOf(k);chips[k].hidden=!g||g.hidden});
  if(chips[active]&&chips[active].hidden)active='all';place();edges();q()},0)});
 addEventListener('scroll',function(){if(lock){clearTimeout(lt);lt=setTimeout(settle,140)}q()},{passive:true});
 bar.addEventListener('scroll',edges,{passive:true});addEventListener('resize',function(){place();edges()});
 /* old filter handler is bypassed: show every category, then honour ?category= */
 if(window.__rrChooseCategory)window.__rrChooseCategory('all');
 window.__rrChooseCategory=function(c){setTimeout(function(){go(c)},c==='all'?0:420)};
 var want=new URLSearchParams(location.search).get('category');
 setActive('all');edges();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){place();edges()});
 if(want)setTimeout(function(){go(want)},700);
 return true}
/* ===== 2. BRANCHES: area filter (reflow animation, pin dimming) ===== */
function branches(){
 var list=document.getElementById('br-list'),grid=list&&list.querySelector('.brx-grid');
 if(!grid||!grid.children.length)return false;if(grid.__rr8)return true;grid.__rr8=1;
 var cards=[].slice.call(grid.querySelectorAll('.brx-card')),token=0;
 function idOf(c){var h=c.querySelector('h3');return h?h.textContent.toLowerCase().replace(/[^a-z]/g,''):''}
 function nameOf(c){var h=c.querySelector('h3');return h?h.textContent.trim():''}
 function isOpen(c){var t=(c.querySelector('.brx-hrs')||{}).textContent||'',m=t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*\S+\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);if(!m)return false;
  function mins(h,mi,ap){h=+h%12;if(/pm/i.test(ap))h+=12;return h*60+ +mi}
  var q=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':'),n=(+q[0])*60+(+q[1]);
  return n>=mins(m[1],m[2],m[3])&&n<mins(m[4],m[5],m[6])}
 var bar=document.createElement('div');bar.className='brx-filter';bar.setAttribute('role','group');bar.setAttribute('aria-label','Filter outlets by area');
 function chip(label,val,dot){var b=document.createElement('button');b.type='button';b.className='brx-fchip';b.dataset.f=val;b.setAttribute('aria-pressed',String(val==='all'));if(dot){var i=document.createElement('i');i.setAttribute('aria-hidden','true');b.appendChild(i)}b.appendChild(document.createTextNode(label));bar.appendChild(b);return b}
 chip('All outlets','all');chip('Open now','open',1);cards.forEach(function(c){chip(nameOf(c),idOf(c))});
 var count=document.createElement('p');count.className='brx-count';count.setAttribute('aria-live','polite');
 var empty=document.createElement('p');empty.className='brx-empty';empty.textContent='No outlet is open right now. Our outlets open daily from 11:00 AM to 11:59 PM. Choose an outlet to see its hours, or call ahead.';
 grid.parentNode.insertBefore(bar,grid);grid.parentNode.insertBefore(count,grid);grid.parentNode.insertBefore(empty,grid.nextSibling);
 function match(c,f){return f==='all'||(f==='open'?isOpen(c):idOf(c)===f)}
 function pins(f){document.querySelectorAll('#br-locator .pin').forEach(function(p){p.classList.toggle('brx-dim',f!=='all'&&f!=='open'?p.dataset.id!==f:f==='open'?!isOpen(cards.filter(function(c){return idOf(c)===p.dataset.id})[0]||document.createElement('i')):false)})}
 var cur='all';
 function apply(f){
  var my=++token,ease='cubic-bezier(.22,.72,.18,1)';cur=f;grid.classList.toggle('brx-filtered',f!=='all');
  [].forEach.call(bar.children,function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f))});
  var before=new Map();cards.forEach(function(c){if(!c.hidden)before.set(c,c.getBoundingClientRect())});
  var show=cards.filter(function(c){return match(c,f)}),leaving=cards.filter(function(c){return !c.hidden&&show.indexOf(c)<0});
  function finish(){if(my!==token)return;
   cards.forEach(function(c){c.getAnimations&&c.getAnimations().forEach(function(a){a.cancel()});c.hidden=show.indexOf(c)<0});
   if(!RM)show.forEach(function(c,i){var o=before.get(c),n=c.getBoundingClientRect();
    if(o){var dx=o.left-n.left,dy=o.top-n.top;if(dx||dy)c.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:520,easing:ease})}
    else c.animate([{opacity:0,transform:'translateY(18px) scale(.96)'},{opacity:1,transform:'none'}],{duration:480,delay:i*60,easing:ease,fill:'backwards'})});
   empty.classList.toggle('on',!show.length);count.textContent=show.length?('Showing '+show.length+' of '+cards.length+' outlets'):'';
   pins(f);
   if(f!=='all'&&f!=='open'){var pin=document.querySelector('#br-locator .pin[data-id="'+f+'"]');if(pin&&pin.getAttribute('aria-pressed')!=='true')pin.click()}}
  if(RM||!leaving.length){finish();return}
  leaving.forEach(function(c){c.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.94)'}],{duration:200,easing:'ease-in',fill:'forwards'})});
  setTimeout(finish,210)}
 bar.addEventListener('click',function(e){var b=e.target.closest('.brx-fchip');if(b&&b.dataset.f!==cur)apply(b.dataset.f)});
 count.textContent='';
 return true}
/* ===== 3. PICKUP: height expand, staged reveal, completion tick ===== */
function pickup(){
 var right=document.getElementById('odRight'),det=document.getElementById('odDetail'),sel=document.getElementById('rr-order-outlet'),tm=document.getElementById('rr-pickup-time'),note=document.getElementById('odNote');
 if(!right||!det||!sel||!note)return false;if(right.__rr8)return true;right.__rr8=1;
 var h0=0,ease='cubic-bezier(.22,.72,.18,1)';
 var head=right.querySelector('.od-rh'),tick=document.createElement('span');tick.className='od8-tick';tick.setAttribute('role','img');tick.setAttribute('aria-label','Pickup details complete');
 tick.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.2 3.2L17 8.8"/></svg>';if(head)head.appendChild(tick);
 function rec(){h0=right.offsetHeight}
 document.addEventListener('change',function(e){if(e.target===sel)rec()},true);
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#odPickupBtn'))rec()},true);
 function stage(){if(RM)return;var kids=[].slice.call(det.children);kids.forEach(function(k,i){k.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:440,delay:120+i*75,easing:ease,fill:'backwards'})})}
 function expand(){if(RM||!h0){return}var h1=right.offsetHeight,a=h0;h0=0;if(Math.abs(h1-a)<6)return;
  var ov=right.style.overflow;right.style.overflow='hidden';
  var an=right.animate([{height:a+'px'},{height:h1+'px'}],{duration:560,easing:ease});
  an.onfinish=an.oncancel=function(){right.style.overflow=ov}}
 new MutationObserver(function(){if(!det.hidden){expand();stage()}}).observe(det,{attributes:true,attributeFilter:['hidden']});
 sel.addEventListener('change',function(){if(!det.hidden){setTimeout(stage,30)}});
 function done(){var ok=!!(sel.value&&tm&&tm.value&&note.value.trim());tick.classList.toggle('on',ok)}
 ['input','change'].forEach(function(ev){[sel,tm,note].forEach(function(e){e&&e.addEventListener(ev,function(){setTimeout(done,0)})})});done();
 return true}
/* ===== boot ===== */
function boot(){[menu,branches,pickup].forEach(function(fn){var n=0;(function t(){var ok=false;try{ok=fn()}catch(e){console.error('[rr-p8]',e)}if(!ok&&n++<40)setTimeout(t,150)})()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


;

/* RR Durbar v16 - PHASE 10 JS: keep the hero paused while the cursor is over it, even after an arrow click / key / swipe changes slide */
(function(){
 var g=window.goSlide,h=document.getElementById('home');
 if(typeof g!=='function'||!h||!matchMedia('(hover:hover)').matches)return;
 window.goSlide=function(i){
  var r=g.apply(this,arguments);
  if(h.querySelector('.hero-actions:hover,.hero-nav-controls:hover,.hero-thumbs:hover')&&window.rrHeroPause)window.rrHeroPause();
  return r};
})();


;

/* ===== v23 Phase 1 — foundations. Exposes: RRDishes, RRModal, rrToast, RRCart, rrFlyToCart, rrAddToCart ===== */
(function(){
  'use strict';
  var doc=document, root=doc.documentElement;
  var reduce=function(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches};
  function el(tag,cls,txt){var n=doc.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n}

  /* ---------- 1.5 scroll lock (shared, counted) ---------- */
  var lockN=0;
  function lock(){if(lockN++===0)root.classList.add('rrm-locked')}
  function unlock(){if(lockN>0&&--lockN===0)root.classList.remove('rrm-locked')}

  /* ---------- 1.2 dish data model (built from #rr-data-inline; no markup changes) ---------- */
  var RRDishes=(function(){
    var list=[],map={},cats=[],sig={};
    function slug(s){return String(s).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
    try{
      var raw=JSON.parse(doc.getElementById('rr-data-inline').textContent);
      cats=(raw.menu_categories||[]).slice();
      ((raw.about_page||{}).signature_dishes||[]).forEach(function(n){sig[String(n).trim().toLowerCase()]=1});
      (raw.menu_items||[]).forEach(function(it){
        if(!it||!it.name)return;
        var id=slug(it.name),n=2,base=id;while(map[id]){id=base+'-'+n++}
        var m=/serves\s+(\d+(?:\s*-\s*\d+)?)/i.exec(it.description||'');
        var d={id:id,name:String(it.name).trim(),category:it.category||'',price:Number(it.price)||0,
          diet:it.dietary||'veg',description:it.description||'',serves:m?m[1].replace(/\s+/g,''):null,
          signature:!!sig[String(it.name).trim().toLowerCase()],image:null};
        list.push(d);map[id]=d;
      });
    }catch(e){if(window.console)console.warn('RRDishes: could not read menu data',e)}
    function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
    return {
      all:function(){return list.slice()},
      get:function(id){return map[id]||null},
      categories:function(){return cats.slice()},
      byCategory:function(c){return list.filter(function(d){return d.category===c})},
      signature:function(){return list.filter(function(d){return d.signature})},
      /* ranked search: name-prefix > word-prefix > name-contains > category > description */
      search:function(q,limit){
        var t=norm(q);if(!t)return [];var words=t.split(' '),out=[];
        list.forEach(function(d){
          var nm=norm(d.name),cat=norm(d.category),ds=norm(d.description),s=0;
          if(nm.indexOf(t)===0)s=100;
          else if((' '+nm).indexOf(' '+t)>-1)s=80;
          else if(nm.indexOf(t)>-1)s=60;
          else if(words.every(function(w){return nm.indexOf(w)>-1||cat.indexOf(w)>-1}))s=45;
          else if(cat.indexOf(t)>-1)s=30;
          else if(ds.indexOf(t)>-1)s=15;
          if(s)out.push([s,d]);
        });
        out.sort(function(a,b){return b[0]-a[0]||a[1].name.localeCompare(b[1].name)});
        out=out.map(function(x){return x[1]});
        return limit?out.slice(0,limit):out;
      }
    };
  })();

  /* ---------- 1.4 toast ---------- */
  var toastEl,toastT;
  function rrToast(msg,opt){
    opt=opt||{};
    if(!toastEl){toastEl=el('div');toastEl.id='rrToast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');doc.body.appendChild(toastEl)}
    toastEl.textContent=msg;toastEl.classList.toggle('err',opt.type==='error');
    void toastEl.offsetWidth;toastEl.classList.add('on');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},opt.duration||2600);
  }

  /* ---------- 1.1 modal / sheet primitive ---------- */
  var stack=[];
  var FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function visibleFocusables(c){return Array.prototype.filter.call(c.querySelectorAll(FOCUSABLE),function(n){return n.offsetParent!==null||n===doc.activeElement})}

  function openModal(o){
    o=o||{};
    var opener=doc.activeElement;
    var layer=el('div','rrm-layer');
    var back=el('div','rrm-backdrop');
    var dlg=el('div','rrm-dialog'+(o.size?' rrm-'+o.size:'')+(o.className?' '+o.className:''));
    dlg.setAttribute('role',o.role||'dialog');dlg.setAttribute('aria-modal','true');
    if(o.labelledBy)dlg.setAttribute('aria-labelledby',o.labelledBy);else dlg.setAttribute('aria-label',o.title||'Dialog');
    dlg.tabIndex=-1;
    var grab=el('div','rrm-grab');grab.setAttribute('aria-hidden','true');
    var x=el('button','rrm-x','×');x.type='button';x.setAttribute('aria-label',o.closeLabel||'Close');
    var body=el('div','rrm-body');
    if(typeof o.content==='string')body.innerHTML=o.content;else if(o.content)body.appendChild(o.content);
    dlg.appendChild(grab);dlg.appendChild(x);dlg.appendChild(body);
    layer.appendChild(back);layer.appendChild(dlg);
    doc.body.appendChild(layer);
    lock();

    var closed=false,inst={el:layer,dialog:dlg,body:body};
    function close(why){
      if(closed)return;closed=true;
      var i=stack.indexOf(inst);if(i>-1)stack.splice(i,1);
      layer.classList.remove('rrm-in');layer.classList.add('rrm-out');
      var done=function(){if(layer.parentNode)layer.parentNode.removeChild(layer);unlock();
        if(opener&&opener.focus&&doc.contains(opener)){try{opener.focus({preventScroll:true})}catch(_){}}
        if(typeof o.onClose==='function')o.onClose(why||'close')};
      if(reduce())done();else setTimeout(done,260);
    }
    inst.close=close;
    x.addEventListener('click',function(){close('button')});
    back.addEventListener('click',function(){if(o.dismissible!==false)close('backdrop')});

    /* swipe-down to close (bottom-sheet on phones) */
    var sy=null,dy=0,st=0,dragging=false;
    function ts(e){if(window.innerWidth>680)return;var inBody=body.contains(e.target);if(inBody&&body.scrollTop>0)return;sy=e.touches[0].clientY;dy=0;st=Date.now();dragging=false}
    function tm(e){if(sy===null)return;dy=e.touches[0].clientY-sy;if(dy>6){dragging=true;dlg.classList.add('rrm-dragging');dlg.style.transform='translateY('+dy+'px)';if(e.cancelable)e.preventDefault()}else if(dy<0&&!dragging){sy=null}}
    function te(){if(sy===null)return;var v=dy/Math.max(1,Date.now()-st);dlg.classList.remove('rrm-dragging');dlg.style.transform='';
      if(dragging&&(dy>110||v>.6))close('swipe');sy=null;dragging=false}
    dlg.addEventListener('touchstart',ts,{passive:true});
    dlg.addEventListener('touchmove',tm,{passive:false});
    dlg.addEventListener('touchend',te,{passive:true});
    dlg.addEventListener('touchcancel',te,{passive:true});

    stack.push(inst);
    requestAnimationFrame(function(){requestAnimationFrame(function(){layer.classList.add('rrm-in')})});
    setTimeout(function(){
      var f=o.initialFocus&&dlg.querySelector(o.initialFocus);
      (f||dlg).focus({preventScroll:true});
    },30);
    return inst;
  }
  /* one global key handler: Esc closes the top modal, Tab is trapped inside it */
  doc.addEventListener('keydown',function(e){
    var top=stack[stack.length-1];if(!top)return;
    if(e.key==='Escape'){e.preventDefault();top.close('escape');return}
    if(e.key==='Tab'){
      var f=visibleFocusables(top.dialog);
      if(!f.length){e.preventDefault();top.dialog.focus();return}
      var first=f[0],last=f[f.length-1],a=doc.activeElement;
      if(!top.dialog.contains(a)){e.preventDefault();first.focus()}
      else if(e.shiftKey&&(a===first||a===top.dialog)){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
    }
  });
  var RRModal={open:openModal,closeTop:function(){var t=stack[stack.length-1];if(t)t.close('api')},isOpen:function(){return stack.length>0}};

  /* ---------- cart store (in memory) + header button + drawer ---------- */
  var RRCart=(function(){
    var lines={},order=[],btn,countEl,drawer,backdrop,itemsEl,totalEl,drawerOpener;
    function fmt(n){var r=Math.round(n*100)/100;return '\u20B9'+r.toLocaleString('en-IN',{minimumFractionDigits:r%1?2:0,maximumFractionDigits:2})}
    function count(){return order.reduce(function(s,id){return s+lines[id].qty},0)}
    function total(){return order.reduce(function(s,id){return s+lines[id].qty*lines[id].dish.price},0)}
    function ensureBtn(){
      if(btn)return;
      var actions=doc.querySelector('.nav-actions');if(!actions)return;
      btn=el('button','rr-cart-btn');btn.type='button';btn.setAttribute('aria-label','Open your order');btn.title='Your order';
      btn.innerHTML='<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
      countEl=el('span','rr-cart-count','0');countEl.setAttribute('aria-hidden','true');btn.appendChild(countEl);
      btn.addEventListener('click',function(){toggle(true)});
      var mm=actions.querySelector('.mobile-menu');actions.insertBefore(btn,mm||null);
    }
    function ensureDrawer(){
      if(drawer)return;
      drawer=doc.getElementById('drawer');backdrop=doc.getElementById('backdrop');
      itemsEl=doc.getElementById('cartItems');totalEl=doc.getElementById('total');
      if(!drawer)return;
      drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-label','Your order');drawer.setAttribute('aria-hidden','true');
      if('inert' in drawer)drawer.inert=true;
      var chk=drawer.querySelector('.checkout');
      if(chk)chk.addEventListener('click',function(){
        if(!count()){rrToast('Add a dish to continue');return}
        toggle(false);if(window.rrGo)window.rrGo('?page=order-now#ordering');else location.href='?page=order-now#ordering';
      });
      var x=drawer.querySelector('.close');if(x)x.setAttribute('aria-label','Close your order');
      doc.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open')&&!stack.length){toggle(false)}});
    }
    function emptyNode(){var d=el('div','empty');var b=el('b','','Your table is waiting.');d.appendChild(b);d.appendChild(doc.createTextNode('Add a dish and build your Durbar feast.'));return d}
    function render(opt){
      opt=opt||{};ensureBtn();ensureDrawer();
      var c=count();
      doc.body.classList.toggle('rr-cart-has',c>0||order.length>0);
      if(countEl)countEl.textContent=c>99?'99+':String(c);
      if(btn)btn.setAttribute('aria-label','Open your order, '+c+(c===1?' item':' items'));
      if(totalEl)totalEl.textContent=fmt(total());
      if(itemsEl){
        itemsEl.textContent='';
        if(!order.length){itemsEl.appendChild(emptyNode())}
        else order.forEach(function(id){
          var L=lines[id],d=L.dish,row=el('div','rr-ci');row.dataset.id=id;
          var left=el('div');left.appendChild(el('b','',d.name));
          left.appendChild(el('small','',d.category+(d.serves?' \u00B7 Serves '+d.serves:'')));
          var price=el('div','rr-ci-price',fmt(d.price*L.qty));
          var qty=el('div','rr-ci-qty');
          var minus=el('button','rr-ci-btn','\u2212');minus.type='button';minus.setAttribute('aria-label','Decrease quantity of '+d.name);
          var n=el('span','rr-ci-n',String(L.qty));n.setAttribute('aria-live','polite');
          if(opt.popId===id)n.classList.add('rr-pop');
          var plus=el('button','rr-ci-btn','+');plus.type='button';plus.setAttribute('aria-label','Increase quantity of '+d.name);
          minus.addEventListener('click',function(){setQty(id,L.qty-1,{popId:id})});
          plus.addEventListener('click',function(){setQty(id,L.qty+1,{popId:id})});
          qty.appendChild(minus);qty.appendChild(n);qty.appendChild(plus);
          var rm=el('button','rr-ci-rm','Remove');rm.type='button';rm.setAttribute('aria-label','Remove '+d.name);
          rm.addEventListener('click',function(){remove(id)});
          row.appendChild(left);row.appendChild(price);row.appendChild(qty);row.appendChild(rm);
          itemsEl.appendChild(row);
        });
      }
      doc.dispatchEvent(new CustomEvent('rr:cart',{detail:{count:c,total:total(),lines:order.map(function(i){return {id:i,qty:lines[i].qty}})}}));
    }
    function resolve(x){return typeof x==='string'?RRDishes.get(x):(x&&x.id?x:null)}
    function add(x,qty,opt){
      var d=resolve(x);if(!d)return false;qty=Math.max(1,parseInt(qty,10)||1);
      if(lines[d.id])lines[d.id].qty=Math.min(99,lines[d.id].qty+qty);else{lines[d.id]={dish:d,qty:Math.min(99,qty)};order.push(d.id)}
      if(!opt||opt.render!==false)render({popId:d.id});
      return true;
    }
    function setQty(id,q,opt){if(!lines[id])return;q=parseInt(q,10)||0;if(q<=0){remove(id);return}lines[id].qty=Math.min(99,q);render(opt)}
    function remove(id){if(!lines[id])return;delete lines[id];order.splice(order.indexOf(id),1);render()}
    function clear(){lines={};order=[];render()}
    function bump(){
      ensureBtn();if(!btn||reduce())return;
      btn.classList.remove('rr-bump');void btn.offsetWidth;btn.classList.add('rr-bump');
      setTimeout(function(){btn.classList.remove('rr-bump')},560);
    }
    function toggle(force){
      ensureDrawer();if(!drawer)return;
      var open=typeof force==='boolean'?force:!drawer.classList.contains('open');
      if(open===drawer.classList.contains('open'))return;
      drawer.classList.toggle('open',open);if(backdrop)backdrop.classList.toggle('show',open);
      drawer.setAttribute('aria-hidden',String(!open));if('inert' in drawer)drawer.inert=!open;
      if(open){drawerOpener=doc.activeElement;lock();render();setTimeout(function(){var c=drawer.querySelector('.close');if(c)c.focus({preventScroll:true})},60)}
      else{unlock();if(drawerOpener&&drawerOpener.focus&&doc.contains(drawerOpener)){try{drawerOpener.focus({preventScroll:true})}catch(_){}}}
    }
    function btnRect(){ensureBtn();if(!btn)return null;doc.body.classList.add('rr-cart-has');return btn.getBoundingClientRect()}
    var api={add:add,setQty:setQty,remove:remove,clear:clear,count:count,total:total,fmt:fmt,render:render,bump:bump,toggle:toggle,
      items:function(){return order.map(function(i){return {dish:lines[i].dish,qty:lines[i].qty}})},_btnRect:btnRect};
    if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',function(){ensureBtn();ensureDrawer();render()});else{ensureBtn();ensureDrawer();render()}
    return api;
  })();
  window.toggleCart=function(){RRCart.toggle()};   /* the markup already calls toggleCart() */

  /* ---------- 1.3 fly-to-cart ---------- */
  function rrFlyToCart(src,opt){
    opt=opt||{};
    return new Promise(function(resolve){
      var target=RRCart._btnRect();
      if(!src||!target||reduce()||!src.getBoundingClientRect||!target.width){resolve();return}
      var s=src.getBoundingClientRect();
      if(!s.width||!s.height||s.bottom<0||s.top>innerHeight){resolve();return}
      var size=Math.max(44,Math.min(opt.size||84,Math.max(s.width,s.height)));
      var fly=el('div','rr-fly');fly.setAttribute('aria-hidden','true');
      fly.style.width=fly.style.height=size+'px';
      var img=src.tagName==='IMG'?src:src.querySelector&&src.querySelector('img');/*rr-motion-b*/if(!img&&src.closest){var rrC=src.closest('.rr-food-card,.m52-t,.dish,.p3-d,article'),rrI=rrC&&rrC.querySelector('img');if(rrI&&rrI.currentSrc){img=rrI;var rrR=rrI.getBoundingClientRect();if(rrR.width&&rrR.height&&rrR.bottom>0&&rrR.top<innerHeight){s=rrR;size=Math.max(56,Math.min(opt.size||96,Math.max(s.width,s.height)));fly.style.width=fly.style.height=size+'px'}}}
      var bg=img&&img.currentSrc?img.currentSrc:'';
      if(!bg){var cs=getComputedStyle(src).backgroundImage;if(cs&&cs!=='none')bg=cs.replace(/^url\(["']?|["']?\)$/g,'')}
      if(bg&&bg.indexOf('gradient')<0)fly.style.backgroundImage='url("'+bg+'")';
      doc.body.appendChild(fly);
      var sx=s.left+s.width/2-size/2,sy=s.top+s.height/2-size/2;
      var tx=target.left+target.width/2-size/2,ty=target.top+target.height/2-size/2;
      var cx=(sx+tx)/2,cy=Math.min(sy,ty)-Math.max(60,Math.abs(tx-sx)*.18);   /* arc control point */
      var kf=[],N=14;
      for(var i=0;i<=N;i++){var t=i/N,u=1-t;
        var x=u*u*sx+2*u*t*cx+t*t*tx,y=u*u*sy+2*u*t*cy+t*t*ty;
        var sc=1-.78*t*t;
        kf.push({transform:'translate3d('+x+'px,'+y+'px,0) scale('+sc+')',opacity:i===N?.15:1,offset:t});
      }
      var a=fly.animate(kf,{duration:opt.duration||640,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
      var fin=function(){if(fly.parentNode)fly.parentNode.removeChild(fly);resolve()};
      a.onfinish=fin;a.oncancel=fin;
    });
  }
  /* convenience: add + flight + bounce + toast in one call (used by Quick Add in Phase 2) */
  function rrAddToCart(id,srcEl,qty,opt){
    opt=opt||{};var d=RRDishes.get(id);if(!d){rrToast('That dish is unavailable',{type:'error'});return Promise.resolve(false)}
    RRCart.add(id,qty,{render:false});
    var done=function(){RRCart.render({popId:id});RRCart.bump();if(opt.toast!==false)rrToast(d.name+' added to your order')};
    if(!srcEl||reduce()){done();return Promise.resolve(true)}
    return rrFlyToCart(srcEl).then(function(){done();return true});
  }

  window.RRDishes=RRDishes;window.RRModal=RRModal;window.rrToast=rrToast;window.RRCart=RRCart;
  window.rrFlyToCart=rrFlyToCart;window.rrAddToCart=rrAddToCart;
  window.RR=window.RR||{};Object.assign(window.RR,{dishes:RRDishes,modal:RRModal,toast:rrToast,cart:RRCart,fly:rrFlyToCart,addToCart:rrAddToCart,lock:lock,unlock:unlock});
})();

;

/* ===== v24 Phase 2 — builds on v23 foundations (RRDishes / RRModal / RRCart / rrAddToCart). Exposes RR.openDish, RR.openSearch, RR.menuSearch ===== */
(function(){
  'use strict';
  if(!window.RRDishes||!window.RRModal||!window.RRCart||!window.rrAddToCart)return;
  var doc=document,D=window.RRDishes,Cart=window.RRCart,Modal=window.RRModal;
  var SHOW_PRICES=window.RR_SHOW_PRICES!==false;              /* set window.RR_SHOW_PRICES=false to hide every price */
  var reduce=function(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches};
  function el(t,c,x){var n=doc.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
  var money=function(n){return Cart.fmt(n)};

  /* ---------- dish helpers ---------- */
  var ALIAS={'chicken fry biryani':'murgh musallam biryani','chicken dum biryani':'murgh mehfil biryani','chicken lollipops':'naatu naatu special wings (8 pcs)','vankay biryani':'gutti vankaya pulao','butta biryani':'non veg butta biryani','naatu naatu wings':'guntur chilli chicken','durbar supreme chicken':"durbar's supreme chicken"},REV={};Object.keys(ALIAS).forEach(function(k){REV[ALIAS[k]]=k});
  var byName={};D.all().forEach(function(d){byName[d.name.trim().toLowerCase()]=d});
  D.byName=function(n){var k=String(n||'').trim().toLowerCase();return byName[k]||byName[ALIAS[k]]||null};
  D.image=function(d){var m=window.RR_SIG_IMG||{},k=d.name.trim().toLowerCase();return m[k]||m[REV[k]]||null};
  function dietCls(d){return d.diet==='non-veg'?'nv':d.diet==='egg'?'eg':''}
  function dietLabel(d){return d.diet==='non-veg'?'Non-vegetarian':d.diet==='egg'?'Contains egg':'Vegetarian'}
  function dot(d){var s=el('span','rr-diet '+dietCls(d));s.setAttribute('role','img');s.setAttribute('aria-label',dietLabel(d));return s}
  var PLUS='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/></svg>';
  var CROWN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="m2 7 4 3 6-6 6 6 4-3-2 12H4z"/></svg>';

  /* ---------- favourites (in memory) ---------- */
  var favs={};
  function heartBtn(d){
    var b=el('button','rr-heart');b.type='button';b.dataset.id=d.id;b.innerHTML=HEART;
    function sync(){var on=!!favs[d.id];b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',(on?'Remove ':'Save ')+d.name+(on?' from favourites':' to favourites'))}
    sync();b.addEventListener('click',function(e){e.stopPropagation();toggleFav(d)});return b;
  }
  function toggleFav(d){
    favs[d.id]=!favs[d.id];
    [].forEach.call(doc.querySelectorAll('.rr-heart[data-id="'+d.id+'"]'),function(b){
      var on=!!favs[d.id];b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',(on?'Remove ':'Save ')+d.name+(on?' from favourites':' to favourites'))});
    window.rrToast(favs[d.id]?d.name+' saved to favourites':'Removed from favourites');
  }

  /* ---------- quick add ---------- */
  function quickAdd(btn,d){
    window.rrAddToCart(d.id,btn,1);
    if(btn.classList&&btn.classList.contains('rr-qadd')){
      var old=btn.dataset.l||btn.textContent;btn.dataset.l=old;btn.classList.add('rr-done');var sig=btn.closest&&btn.closest('.rr-signature-card');if(sig){btn.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'}else{btn.textContent='Added'}
      clearTimeout(btn._t);btn._t=setTimeout(function(){btn.classList.remove('rr-done');btn.innerHTML=sig?PLUS:PLUS+' Add'},1300);
    }
  }
  function qaddBtn(d,label){var b=el('button','rr-qadd');b.type='button';b.innerHTML=PLUS+(label==='plus'?'':' Add');b.setAttribute('aria-label','Add '+d.name+' to your order');b.dataset.id=d.id;return b}

  /* ---------- pairings (static rules) ---------- */
  function pairings(d){
    var cat=d.category.toLowerCase(),veg=d.diet==='veg',all=D.all();
    function pick(re,n,skip){
      return all.filter(function(x){return x.id!==d.id&&re.test(x.category.toLowerCase())&&(!veg||x.diet==='veg')&&!(skip&&skip[x.id])})
        .map(function(x,i){return [x,i]}).sort(function(a,b){return (b[0].signature-a[0].signature)||(a[1]-b[1])}).slice(0,n).map(function(p){return p[0]});
    }
    var out=[];
    if(/biryani|pulao|rice|noodles/.test(cat)){out=pick(/starters|kebabs/,2).concat(pick(/desserts/,1))}
    else if(/starters|kebabs|soups|sea food|samosa/.test(cat)){out=pick(/biryani/,2).concat(pick(/breads/,1))}
    else if(/curries|main course/.test(cat)){out=pick(/breads/,2).concat(pick(/biryani/,1))}
    else if(/breads/.test(cat)){out=pick(/curries/,3)}
    else{out=pick(/biryani/,3)}
    var seen={};return out.filter(function(x){if(seen[x.id])return false;seen[x.id]=1;return true}).slice(0,3);
  }

  /* ---------- dish popup ---------- */
  function openDish(d0){
    if(!d0)return null;
    var wrap=el('div','rr-dish'),inst=null;
    function render(d){
      var qty=1;wrap.textContent='';
      var ph=el('div','rr-dish-photo'),src=D.image(d);
      if(src){var im=el('img');im.src=src;im.alt=d.name;ph.appendChild(im)}
      else{var cr=el('div','rr-crown');cr.innerHTML=CROWN;cr.appendChild(el('span','',d.category));ph.appendChild(cr)}
      ph.appendChild(heartBtn(d));
      var info=el('div','rr-dish-info'),eb=el('div','rr-dish-eyebrow');eb.appendChild(el('span','',d.category));
      if(d.signature){var sb=el('span','rr-sig-badge','Signature');eb.appendChild(sb)}
      info.appendChild(eb);
      var h=el('h2','',d.name);info.appendChild(h);
      var meta=el('div','rr-dish-meta'),m1=el('span');m1.appendChild(dot(d));m1.appendChild(doc.createTextNode(dietLabel(d)));meta.appendChild(m1);
      if(d.serves)meta.appendChild(el('span','','Serves '+d.serves));
      info.appendChild(meta);
      if(d.description)info.appendChild(el('p','rr-dish-desc',d.description));
      var buy=el('div','rr-dish-buy');
      if(SHOW_PRICES)buy.appendChild(el('div','rr-dish-price',money(d.price)));
      var q=el('div','rr-dish-qty'),mi=el('button','','\u2212'),out=el('output','','1'),pl=el('button','','+');
      mi.type=pl.type='button';mi.setAttribute('aria-label','Decrease quantity');pl.setAttribute('aria-label','Increase quantity');out.setAttribute('aria-live','polite');
      q.appendChild(mi);q.appendChild(out);q.appendChild(pl);buy.appendChild(q);
      var add=el('button','rr-dish-add');add.type='button';
      function lab(){add.textContent=SHOW_PRICES?'Add to order \u00B7 '+money(d.price*qty):'Add to order'}lab();
      mi.addEventListener('click',function(){if(qty>1){qty--;out.textContent=qty;lab()}});
      pl.addEventListener('click',function(){if(qty<20){qty++;out.textContent=qty;lab()}});
      add.addEventListener('click',function(){window.rrAddToCart(d.id,ph,qty);if(inst)inst.close('added')});
      buy.appendChild(add);info.appendChild(buy);
      var pr=pairings(d);
      if(pr.length){
        var pw=el('div','rr-pair');pw.appendChild(el('h3','','Goes well with'));var row=el('div');
        pr.forEach(function(p){var b=el('button','',p.name+(SHOW_PRICES?' \u00B7 '+money(p.price):''));b.type='button';
          b.addEventListener('click',function(){render(p);if(inst){inst.dialog.setAttribute('aria-label',p.name);inst.body.scrollTop=0;var a=wrap.querySelector('.rr-dish-add');if(a)a.focus({preventScroll:true})}});row.appendChild(b)});
        pw.appendChild(row);info.appendChild(pw);
      }
      wrap.appendChild(ph);wrap.appendChild(info);
    }
    render(d0);
    inst=Modal.open({title:d0.name,content:wrap,size:'lg',initialFocus:'.rr-dish-add'});
    return inst;
  }

  /* ---------- search overlay ---------- */
  function hl(node,text,q){
    var i=q?text.toLowerCase().indexOf(q.toLowerCase()):-1;
    if(i<0){node.appendChild(doc.createTextNode(text));return}
    node.appendChild(doc.createTextNode(text.slice(0,i)));var m=el('mark','',text.slice(i,i+q.length));node.appendChild(m);node.appendChild(doc.createTextNode(text.slice(i+q.length)));
  }
  function openSearch(initial){
    if(doc.querySelector('.rr-sdlg'))return;
    var root=el('div','rr-s'),bar=el('div','rr-sbar');
    bar.insertAdjacentHTML('beforeend','<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>');
    var inp=el('input');inp.type='search';inp.placeholder='Search biryani, starters, seafood\u2026';inp.setAttribute('aria-label','Search the menu');inp.autocomplete='off';inp.spellcheck=false;
    inp.setAttribute('role','combobox');inp.setAttribute('aria-expanded','true');inp.setAttribute('aria-controls','rrSList');inp.setAttribute('aria-autocomplete','list');
    bar.appendChild(inp);root.appendChild(bar);
    var quick=el('div','rr-squick');
    ['Biryani','Starters','Sea food','Veg','Egg','Desserts'].forEach(function(t){var b=el('button','',t);b.type='button';b.addEventListener('click',function(){inp.value=t;run();inp.focus()});quick.appendChild(b)});
    root.appendChild(quick);
    var head=el('div','rr-shead'),list=el('ul','rr-slist');list.id='rrSList';list.setAttribute('role','listbox');list.setAttribute('aria-label','Search results');
    var foot=el('div','rr-sfoot'),hint=el('span','','\u2191 \u2193 to move \u00B7 Enter to open \u00B7 Esc to close'),all=el('button','','');all.type='button';
    foot.appendChild(hint);foot.appendChild(all);
    root.appendChild(head);root.appendChild(list);root.appendChild(foot);
    var inst=Modal.open({title:'Search the menu',content:root,className:'rr-sdlg',initialFocus:'input'});
    var results=[],active=-1,q='';
    function setActive(i,scroll){
      var items=list.children;if(!items.length){active=-1;inp.removeAttribute('aria-activedescendant');return}
      active=(i+items.length)%items.length;
      [].forEach.call(items,function(li,n){li.setAttribute('aria-selected',String(n===active))});
      inp.setAttribute('aria-activedescendant',items[active].id);if(scroll!==false)items[active].scrollIntoView({block:'nearest'});
    }
    function run(){
      q=inp.value.trim();list.textContent='';
      results=q?D.search(q,8):D.signature().slice(0,6);
      var total=q?D.search(q).length:0;
      head.textContent=q?(total?total+(total===1?' dish':' dishes')+' found':''):'Signature dishes';
      quick.style.display=q?'none':'flex';
      if(!results.length){
        var n=el('li','rr-snone');n.setAttribute('role','presentation');n.appendChild(el('b','','No dishes found'));n.appendChild(doc.createTextNode('Try \u201Cbiryani\u201D, \u201Cprawn\u201D or \u201Cpaneer\u201D.'));list.appendChild(n);
        all.style.display='none';active=-1;return;
      }
      results.forEach(function(d,i){
        var li=el('li','rr-sres');li.id='rrs'+i;li.setAttribute('role','option');li.setAttribute('aria-selected','false');li.dataset.id=d.id;
        li.appendChild(dot(d));
        var mid=el('div'),b=el('b');hl(b,d.name,q);mid.appendChild(b);mid.appendChild(el('small','',d.category+(d.serves?' \u00B7 Serves '+d.serves:'')));li.appendChild(mid);
        li.appendChild(SHOW_PRICES?el('span','rr-sp',money(d.price)):el('span'));
        li.appendChild(qaddBtn(d));list.appendChild(li);
      });
      if(q){all.style.display='';all.textContent='See all '+total+' in menu'}else{all.style.display='none'}
      setActive(0,false);
    }
    list.addEventListener('click',function(e){
      var li=e.target.closest('.rr-sres');if(!li)return;var d=D.get(li.dataset.id);if(!d)return;
      if(e.target.closest('.rr-qadd')){quickAdd(e.target.closest('.rr-qadd'),d);return}
      openDish(d);
    });
    list.addEventListener('mousemove',function(e){var li=e.target.closest('.rr-sres');if(li){var i=[].indexOf.call(list.children,li);if(i!==active)setActive(i,false)}});
    function seeAll(){inst.close('seeall');if(window.rrGo)window.rrGo('?page=menu#menu-page');setTimeout(function(){if(window.RR.menuSearch)window.RR.menuSearch(q)},350)}
    all.addEventListener('click',seeAll);
    inp.addEventListener('input',run);
    inp.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){e.preventDefault();setActive(active+1)}
      else if(e.key==='ArrowUp'){e.preventDefault();setActive(active-1)}
      else if(e.key==='Enter'){e.preventDefault();var d=results[active];if(d)openDish(d);else if(q)seeAll()}
    });
    if(initial)inp.value=initial;run();
    return inst;
  }

  /* header search icon + "/" and Ctrl/Cmd+K shortcuts */
  doc.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('.top-nav .outlet-pill');
    if(a){e.preventDefault();openSearch()}
  },true);
  doc.addEventListener('keydown',function(e){
    var t=e.target,typing=t&&(/^(input|textarea|select)$/i.test(t.tagName)||t.isContentEditable);
    if(((e.key==='/'&&!typing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))&&!Modal.isOpen()&&!e.altKey){e.preventDefault();openSearch()}
  });

  /* ---------- menu page: Quick Add, toolbar (search/diet/signature), animated filtering ---------- */
  var menu={ready:false};
  function initMenu(){
    var cont=doc.getElementById('rr-menu-items'),chips=doc.querySelector('#menu-page .rr-category-chips');
    if(!cont||!chips||!cont.querySelector('.rr-menu-row')||menu.ready)return;
    menu.ready=true;
    var rows=[].slice.call(cont.querySelectorAll('.rr-menu-row'));
    rows.forEach(function(row){
      var h=row.querySelector('h4');if(!h)return;var d=D.byName(h.textContent);if(!d)return;
      row.dataset.dish=d.id;
      var nm=h.textContent;h.textContent='';var ob=el('button','rr-dish-open',nm);ob.type='button';ob.setAttribute('aria-label','View details for '+nm);h.appendChild(ob);
      var lab=row.querySelector('.rr-dietary-label');
      if(SHOW_PRICES&&lab)lab.appendChild(el('span','rr-row-price',money(d.price)));
      var g=row.querySelector('.rr-menu-order-group');if(g)g.insertBefore(qaddBtn(d),g.firstChild);
    });
    cont.addEventListener('click',function(e){
      var row=e.target.closest('.rr-menu-row');if(!row||!row.dataset.dish)return;var d=D.get(row.dataset.dish);
      var qa=e.target.closest('.rr-qadd');if(qa){quickAdd(qa,d);return}
      if(e.target.closest('.rr-dish-open'))openDish(d);
    });

    /* toolbar */
    var st={q:'',diet:'all',sig:false};
    var tool=el('div','rr-mtool'),sw=el('div','rr-msearch');
    sw.insertAdjacentHTML('beforeend','<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>');
    var mi=el('input');mi.type='search';mi.placeholder='Search the menu\u2026';mi.setAttribute('aria-label','Search the menu');mi.autocomplete='off';
    var mx=el('button','','\u00D7');mx.type='button';mx.setAttribute('aria-label','Clear search');
    sw.appendChild(mi);sw.appendChild(mx);tool.appendChild(sw);
    var fw=el('div','rr-mfilters');fw.setAttribute('role','group');fw.setAttribute('aria-label','Dietary and signature filters');
    var FB={};[['all','All'],['veg','Veg'],['non-veg','Non-veg'],['egg','Egg'],['sig','Signature']].forEach(function(p){
      var b=el('button','',p[1]);b.type='button';b.dataset.f=p[0];b.setAttribute('aria-pressed',String(p[0]==='all'));FB[p[0]]=b;fw.appendChild(b)});
    tool.appendChild(fw);
    var cnt=el('div','rr-mcount');cnt.setAttribute('aria-live','polite');tool.appendChild(cnt);
    chips.parentNode.insertBefore(tool,chips);
    var empty=el('div','rr-mempty');empty.setAttribute('role','status');
    empty.appendChild(el('b','','Nothing matches that'));empty.appendChild(doc.createTextNode('Try a different word, or clear the filters.'));
    var clr=el('button','','Clear filters');clr.type='button';empty.appendChild(doc.createElement('br'));empty.appendChild(clr);
    cont.parentNode.insertBefore(empty,cont);
    var vegT=doc.getElementById('rr-veg-toggle');

    function rowsAll(){return [].slice.call(cont.querySelectorAll('.rr-menu-row'))}
    function shown(r){return !r.hidden&&!r.classList.contains('rr-fx')&&!(r.parentNode&&r.parentNode.hidden)}
    function snap(){var m=new Map(),c=cont.getBoundingClientRect().top;rowsAll().forEach(function(r){if(shown(r))m.set(r,r.getBoundingClientRect().top-c)});return m}
    function flip(before){
      if(reduce()||!before)return;
      var c=cont.getBoundingClientRect().top,vh=innerHeight,k=0;
      rowsAll().forEach(function(r){
        if(!shown(r))return;var rect=r.getBoundingClientRect();if(rect.bottom<-120||rect.top>vh+120)return;
        var was=before.get(r),top=rect.top-c;
        r.classList.add('rr-fl');var fin=function(){r.classList.remove('rr-fl')};
        var a;
        if(was===undefined){a=r.animate([{top:'14px',filter:'opacity(0)'},{top:'0px',filter:'opacity(1)'}],{duration:340,delay:Math.min(k++,12)*26,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'})}
        else if(Math.abs(was-top)>2){a=r.animate([{top:(was-top)+'px'},{top:'0px'}],{duration:340,easing:'cubic-bezier(.2,.7,.2,1)'})}
        else{fin();return}
        a.onfinish=a.oncancel=fin;
      });
    }
    function count(){
      var n=0;rowsAll().forEach(function(r){if(shown(r))n++});
      cnt.textContent=n===1?'1 dish':n+' dishes';empty.classList.toggle('on',n===0);
    }
    var raf=0;function recount(){cancelAnimationFrame(raf);raf=requestAnimationFrame(count)}
    function applyFx(){
      var set=null;if(st.q){set={};D.search(st.q).forEach(function(d){set[d.id]=1})}
      var groups=cont.querySelectorAll('.rr-menu-group');
      rowsAll().forEach(function(r){
        var d=D.get(r.dataset.dish),hide=false;
        if(d){hide=(set&&!set[d.id])||((st.diet==='non-veg'||st.diet==='egg')&&d.diet!==st.diet)||(st.sig&&!d.signature)}
        r.classList.toggle('rr-fx',!!hide);
      });
      [].forEach.call(groups,function(g){var any=[].some.call(g.querySelectorAll('.rr-menu-row'),function(r){return !r.classList.contains('rr-fx')});g.classList.toggle('rr-fx',!any)});
      count();
    }
    function setPressed(){Object.keys(FB).forEach(function(k){FB[k].setAttribute('aria-pressed',String(k==='sig'?st.sig:(k==='all'?(st.diet==='all'&&!st.sig):st.diet===k)))})}
    function change(fn){var b=snap();fn();applyFx();requestAnimationFrame(function(){flip(b)})}
    function setVegToggle(on){if(vegT&&(vegT.getAttribute('aria-pressed')==='true')!==on)vegT.click()}
    fw.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;var f=b.dataset.f;
      change(function(){
        if(f==='all'){st.diet='all';st.sig=false;setVegToggle(false)}
        else if(f==='sig'){st.sig=!st.sig}
        else if(f==='veg'){st.diet=st.diet==='veg'?'all':'veg';setVegToggle(st.diet==='veg')}
        else{st.diet=st.diet===f?'all':f;setVegToggle(false)}
        setPressed();
      });
    });
    if(vegT)new MutationObserver(function(){
      var on=vegT.getAttribute('aria-pressed')==='true';
      if(on&&st.diet!=='veg'){st.diet='veg';setPressed()}else if(!on&&st.diet==='veg'){st.diet='all';setPressed()}
      recount();
    }).observe(vegT,{attributes:true,attributeFilter:['aria-pressed']});
    var tmr;
    mi.addEventListener('input',function(){
      sw.classList.toggle('has',!!mi.value);clearTimeout(tmr);
      tmr=setTimeout(function(){change(function(){st.q=mi.value.trim()})},90);
    });
    mx.addEventListener('click',function(){mi.value='';sw.classList.remove('has');change(function(){st.q=''});mi.focus()});
    function resetAll(){
      mi.value='';sw.classList.remove('has');
      change(function(){st.q='';st.diet='all';st.sig=false;setVegToggle(false);setPressed()});
      var first=chips.querySelector('[data-menu-filter="all"]');if(first&&first.getAttribute('aria-pressed')!=='true')first.click();
    }
    clr.addEventListener('click',resetAll);
    /* category chips: animate the groups that appear */
    chips.addEventListener('click',function(e){if(!e.target.closest('.rr-chip'))return;var b=snap();requestAnimationFrame(function(){count();flip(b)})},true);
    new MutationObserver(recount).observe(cont,{attributes:true,attributeFilter:['hidden'],subtree:true});
    window.RR.menuSearch=function(v){mi.value=v||'';sw.classList.toggle('has',!!mi.value);change(function(){st.q=(v||'').trim()});mi.focus({preventScroll:true})};
    count();
  }
  (function waitMenu(){
    var cont=doc.getElementById('rr-menu-items');
    if(cont&&cont.querySelector('.rr-menu-row')){initMenu();return}
    var mo=new MutationObserver(function(){var c=doc.getElementById('rr-menu-items');if(c&&c.querySelector('.rr-menu-row')){mo.disconnect();initMenu()}});
    mo.observe(doc.documentElement,{childList:true,subtree:true});
    setTimeout(function(){mo.disconnect()},20000);
  })();

  /* ---------- Home signature cards: badge, heart, price + Quick Add, popup instead of link ---------- */
  function initCards(){
    var grid=doc.querySelector('#bestsellers .rr-grid-3');if(!grid)return false;
    var cards=grid.querySelectorAll('.rr-signature-card');if(!cards.length)return false;
    [].forEach.call(cards,function(card){
      if(card.dataset.dish)return;var h=card.querySelector('h3');if(!h)return;var d=D.byName(h.textContent);if(!d)return;
      card.dataset.dish=d.id;
      var media=card.querySelector('.rr-media'),hasImg=media&&media.querySelector('img');
      if(hasImg){media.appendChild(el('span','rr-sig-badge','Signature'));media.appendChild(heartBtn(d))}
      var copy=card.querySelector('.rr-food-copy');
      if(copy){var f=el('div','rr-sig-foot');f.appendChild(SHOW_PRICES?el('span','rr-row-price',money(d.price)):el('span'));f.appendChild(qaddBtn(d,'plus'));copy.appendChild(f)}
      card.setAttribute('aria-label',d.name+' \u2014 view details');card.setAttribute('role','button');card.removeAttribute('data-rrc');
    });
    return true;
  }
  var bs=doc.getElementById('bestsellers');
  if(bs){
    bs.addEventListener('click',function(e){
      var card=e.target.closest('.rr-signature-card[data-dish]');if(!card)return;var d=D.get(card.dataset.dish);if(!d)return;
      e.preventDefault();e.stopPropagation();
      var qa=e.target.closest('.rr-qadd');if(qa){quickAdd(qa,d);return}
      if(e.target.closest('.rr-heart'))return;
      openDish(d);
    },true);
    bs.addEventListener('keydown',function(e){
      if(e.key!=='Enter'&&e.key!==' ')return;var card=e.target.closest&&e.target.closest('.rr-signature-card[data-dish]');if(!card||e.target!==card)return;
      e.preventDefault();e.stopPropagation();openDish(D.get(card.dataset.dish));
    },true);
    initCards()||new MutationObserver(function(_,mo){if(initCards())mo.disconnect()}).observe(bs,{childList:true,subtree:true});
  }

  /* ---------- cart polish: total count-up + premium empty state ---------- */
  var shownTotal=0,tw=0;
  doc.addEventListener('rr:cart',function(e){
    var totalEl=doc.getElementById('total');
    if(totalEl){
      var to=e.detail.total,from=shownTotal;shownTotal=to;cancelAnimationFrame(tw);
      if(reduce()||Math.abs(to-from)<.01){totalEl.textContent=money(to)}
      else{totalEl.textContent=money(from);var t0=performance.now(),dur=420;
        (function step(t){var p=Math.min(1,(t-t0)/dur),v=from+(to-from)*(1-Math.pow(1-p,3));totalEl.textContent=money(v);if(p<1)tw=requestAnimationFrame(step);else{totalEl.textContent=money(to);totalEl.classList.remove('rr-tick');void totalEl.offsetWidth;totalEl.classList.add('rr-tick')}})(t0)}
    }
    if(e.detail.count===0){
      var empty=doc.querySelector('#cartItems .empty');
      if(empty&&!empty.querySelector('.rr-crown-e')){
        var c=el('span','rr-crown-e');c.innerHTML=CROWN;c.firstChild.setAttribute('width','54');c.firstChild.setAttribute('height','54');empty.insertBefore(c,empty.firstChild);
        var b=el('button','rr-browse','Browse the menu');b.type='button';
        b.addEventListener('click',function(){Cart.toggle(false);if(window.rrGo)window.rrGo('?page=menu#menu-page');else location.href='?page=menu#menu-page'});
        empty.appendChild(b);
      }
    }
  });
  Cart.render();   /* paint the empty state once */

  window.RR=window.RR||{};window.RR.openDish=openDish;window.RR.openSearch=openSearch;window.RR.favs=favs;
})();

;

(function(){'use strict';
var doc=document,D=window.RRDishes,Cart=window.RRCart,root=doc.getElementById('ordering');
if(!root||!D||!Cart||!window.rrAddToCart)return;
var $=function(i){return doc.getElementById(i)},SP=window.RR_SHOW_PRICES!==false,method=null;
function el(t,c,x){var n=doc.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
var li=[].slice.call(doc.querySelectorAll('#odSteps li'));
if(li[0])li[0].lastChild.textContent='Choose Method';if(li[1])li[1].lastChild.textContent='Pick Outlet';if(li[2])li[2].lastChild.textContent='Menu & Cart';
if(li[3])li[3].hidden=true;var h=root.querySelector('.od-steps-h');if(h)h.textContent='3 simple steps';
var h2=root.querySelector('.od-h2');var prog=el('div','rr-p3-prog');prog.setAttribute('role','progressbar');prog.setAttribute('aria-valuemin','1');prog.setAttribute('aria-valuemax','3');prog.setAttribute('aria-label','Order progress');prog.appendChild(doc.createElement('i'));
if(h2)h2.parentNode.insertBefore(prog,h2);
/* tick badges */
['odSwiggyCard','odZomatoCard','odPickupCard'].forEach(function(id){var c=$(id);if(!c)return;var t=el('span','rr-tick');t.setAttribute('aria-hidden','true');t.innerHTML='<svg viewBox="0 0 30 30"><path d="M8 15.5l5 5 9-10"/></svg>';c.appendChild(t)});
/* step 3 panel */
var p3=el('section');p3.id='rrP3';p3.setAttribute('aria-label','Menu and cart');p3.setAttribute('aria-live','polite');
var cards=$('odCards');cards.parentNode.insertBefore(p3,cards.nextSibling);
function outlet(){var s=$('rr-order-outlet');return s&&s.value}
function stepNow(){return !method?1:(method==='pickup'&&!outlet())?2:3}
function setStep(){var n=stepNow();li.slice(0,3).forEach(function(l,i){l.classList.toggle('done',i+1<n);l.classList.toggle('on',i+1===n);if(i+1===n)l.setAttribute('aria-current','step');else l.removeAttribute('aria-current')});
 prog.firstChild.style.width=(n*33.34)+'%';prog.setAttribute('aria-valuenow',n);
 var show=n===3,was=p3.classList.contains('on');p3.classList.toggle('on',show);if(show){build();if(!was)setTimeout(function(){p3.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'nearest'})},120)}}
function choose(m){method=m;[['swiggy','odSwiggyCard'],['zomato','odZomatoCard'],['pickup','odPickupCard']].forEach(function(p){$(p[1]).classList.toggle('rr-msel',p[0]===m)});
 setTimeout(setStep,0)}
$('odSwiggyCard').addEventListener('click',function(){choose('swiggy')});
$('odZomatoCard').addEventListener('click',function(){choose('zomato')});
$('odPickupCard').addEventListener('click',function(){choose('pickup')});
$('rr-order-outlet').addEventListener('change',function(){choose('pickup')});
/* build / refresh panel */
var gridDone=false;
function build(){
 var pk=method==='pickup',name=pk?'your pickup order':'a '+(method==='swiggy'?'Swiggy':'Zomato')+' order';
 p3.textContent='';p3.appendChild(el('h3','','Step 3 · Build '+name));
 p3.appendChild(el('p','p3-sub',pk?'Add dishes, then send the order to the outlet on WhatsApp.':'Shortlist dishes here. Final prices and checkout happen on '+(method==='swiggy'?'Swiggy':'Zomato')+'.'));
 var g=el('div','p3-grid');D.signature().slice(0,6).forEach(function(d){var r=el('div','p3-d'),m=el('div');m.appendChild(el('b','',d.name));if(SP)m.appendChild(el('small','',Cart.fmt(d.price)));
  var b=el('button','rr-qadd');b.type='button';b.textContent='+ Add';b.setAttribute('aria-label','Add '+d.name);b.addEventListener('click',function(){window.rrAddToCart(d.id,b,1)});r.appendChild(m);r.appendChild(b);g.appendChild(r)});p3.appendChild(g);
 var t=el('div','p3-tools'),sb=el('button','','Search all dishes');sb.type='button';sb.addEventListener('click',function(){if(window.RR&&RR.openSearch)RR.openSearch()});
 var a=el('a','','Browse full menu');a.href='?page=menu#menu-page';t.appendChild(sb);t.appendChild(a);p3.appendChild(t);
 var cart=el('div','p3-cart');cart.id='rrP3Cart';p3.appendChild(cart);
 var go=el('button','p3-go');go.type='button';go.id='rrP3Go';go.textContent=pk?'Review & send on WhatsApp':'Continue on '+(method==='swiggy'?'Swiggy':'Zomato');
 go.addEventListener('click',function(){
  if(!Cart.count()){window.rrToast('Add at least one dish first',{type:'error'});return}
  if(pk){if(!outlet()){window.rrToast('Choose an outlet first',{type:'error'});return}var r=$('odRight');if(!$('odName').value.trim()){r.scrollIntoView({behavior:'smooth',block:'nearest'});$('odName').focus({preventScroll:true});window.rrToast('Add your name, then tap Send on WhatsApp');return}$('odWA').click()}
  else{var l=$(method==='swiggy'?'odSwiggy':'odZomato');if(l)l.click()}});
 p3.appendChild(go);p3.appendChild(el('p','p3-note',pk?'Online payment is not live yet. The outlet confirms your order on WhatsApp or by phone.':'You will leave this site. Your shortlist is not transferred automatically.'));
 cartView()}
function cartView(){
 var c=$('rrP3Cart');if(!c)return;c.textContent='';var items=Cart.items();
 if(!items.length){c.appendChild(el('p','p3-sub','Your cart is empty. Add a dish above.'))}
 else{items.forEach(function(i){var r=el('div','p3-line'),n=el('span','',i.dish.name),q=el('div','p3-q'),mi=el('button','','\u2212'),o=el('output','',String(i.qty)),pl=el('button','','+');
  mi.type=pl.type='button';mi.setAttribute('aria-label','Decrease '+i.dish.name);pl.setAttribute('aria-label','Increase '+i.dish.name);
  mi.addEventListener('click',function(){Cart.setQty(i.dish.id,i.qty-1)});pl.addEventListener('click',function(){Cart.setQty(i.dish.id,i.qty+1)});
  q.appendChild(mi);q.appendChild(o);q.appendChild(pl);r.appendChild(n);r.appendChild(q);if(SP)r.appendChild(el('span','',Cart.fmt(i.dish.price*i.qty)));c.appendChild(r)});
  if(SP){var t=el('div','p3-tot');t.appendChild(el('span','','Total'));t.appendChild(el('span','',Cart.fmt(Cart.total())));c.appendChild(t)}}
 /* pickup: feed the existing WhatsApp message */
 var nt=$('odNote');if(nt&&method==='pickup'&&items.length){nt.value=items.map(function(i){return i.qty+' \u00D7 '+i.dish.name}).join(', ');nt.dispatchEvent(new Event('input',{bubbles:true}))}}
/* mobile quick bar: cart pill with running total */
var bar=root.querySelector('.od-mbar'),mb=null;
if(bar){mb=el('button','rr-mb-cart');mb.type='button';mb.setAttribute('aria-label','Cart');mb.textContent='Cart';bar.appendChild(mb);
 mb.addEventListener('click',function(){if(p3.classList.contains('on'))p3.scrollIntoView({behavior:'smooth',block:'start'});else Cart.toggle(true)})}
doc.addEventListener('rr:cart',function(e){cartView();
 if(mb){mb.textContent='Cart \u00B7 '+e.detail.count+(SP?' \u00B7 '+Cart.fmt(e.detail.total):'');mb.classList.remove('pulse');void mb.offsetWidth;mb.classList.add('pulse')}});
setStep();
})();

;

(function(){'use strict';
var doc=document,ORDER=['singhnagar','moghalrajpuram','bhavanipuram','poranki','autonagar'];
function pin(id){return doc.querySelector('#pins .pin[data-id="'+id+'"]')}
function card(id){return doc.querySelector('.brx-card[data-outlet="'+id+'"]')}
function hl(id,on){var p=pin(id),c=card(id);if(p)p.classList.toggle('rr-hl',on);if(c)c.classList.toggle('rr-hl',on)}
function orderFrom(id){
  var go=function(){var s=doc.getElementById('rr-order-outlet');if(!s)return false;var i=ORDER.indexOf(id)+1;if(i<1||!s.options[i])return false;
    s.selectedIndex=i;s.dispatchEvent(new Event('change',{bubbles:true}));return true};
  if(window.rrGo)window.rrGo('?page=order-now#ordering');else location.href='?page=order-now#ordering';
  var n=0,t=setInterval(function(){if(go()||++n>20)clearInterval(t)},150);
}
function enhance(){
  var cards=doc.querySelectorAll('.brx-card[data-outlet]');if(!cards.length)return false;
  [].forEach.call(cards,function(c){
    if(c.dataset.rrSync)return;c.dataset.rrSync='1';var id=c.dataset.outlet,act=c.querySelector('.brx-actions'),tel=c.querySelector('a[href^="tel:"]');
    if(act&&tel&&!act.querySelector('.rr-brx-call')){var a=doc.createElement('a');a.className='brx-btn-out rr-brx-call';a.href=tel.getAttribute('href');a.textContent='Call';a.setAttribute('aria-label','Call '+c.querySelector('h3').textContent+' outlet');act.appendChild(a)}
    if(act&&!act.querySelector('.rr-brx-order')){var b=doc.createElement('button');b.type='button';b.className='brx-btn-out rr-brx-order';b.textContent='Order from this outlet';b.addEventListener('click',function(e){e.stopPropagation();orderFrom(id)});act.appendChild(b)}
    c.addEventListener('mouseenter',function(){hl(id,true)});c.addEventListener('mouseleave',function(){hl(id,false)});
    c.addEventListener('focusin',function(){hl(id,true)});c.addEventListener('focusout',function(){hl(id,false)});
  });
  [].forEach.call(doc.querySelectorAll('#pins .pin[data-id]'),function(p){
    if(p.dataset.rrSync)return;p.dataset.rrSync='1';var id=p.dataset.id;
    p.addEventListener('mouseenter',function(){hl(id,true)});p.addEventListener('mouseleave',function(){hl(id,false)});
    p.addEventListener('focus',function(){hl(id,true)});p.addEventListener('blur',function(){hl(id,false)});
  });
  return true;
}
if(!enhance()){var mo=new MutationObserver(function(){if(enhance())mo.disconnect()});mo.observe(doc.documentElement,{childList:true,subtree:true});setTimeout(function(){mo.disconnect()},15000)}
})();

;

(function(){'use strict';
var doc=document,Modal=window.RRModal;if(!Modal)return;
var reduce=function(){return matchMedia('(prefers-reduced-motion:reduce)').matches};
function el(t,c,x){var n=doc.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
/* generic viewer: items [{type,src,caption}] */
function viewer(items,start,title,kind){
  var i=start,root=el('div','rr-view'),stage=el('div','rr-view-stage'),bar=el('div','rr-view-bar'),cap=el('span'),cnt=el('b'),right=el('div'),mute=null;
  var pv=el('button','rr-view-nav p','\u2039'),nx=el('button','rr-view-nav n','\u203A');
  pv.type=nx.type='button';pv.setAttribute('aria-label','Previous');nx.setAttribute('aria-label','Next');
  stage.appendChild(pv);stage.appendChild(nx);bar.appendChild(cap);right.style.cssText='display:flex;align-items:center;gap:14px';
  if(kind==='video'){mute=el('button','rr-view-mute','Sound on');mute.type='button';right.appendChild(mute)}
  right.appendChild(cnt);bar.appendChild(right);root.appendChild(stage);root.appendChild(bar);
  cap.setAttribute('aria-live','polite');var muted=true;
  function show(n){
    i=(n+items.length)%items.length;var it=items[i],old=stage.querySelector('.rr-view-media');if(old){if(old.pause)old.pause();old.remove()}
    var m;if(kind==='video'){m=doc.createElement('video');m.src=it.src;m.muted=muted;m.loop=true;m.playsInline=true;m.autoplay=true;m.setAttribute('aria-label',it.caption||'Reel');var pr=m.play();if(pr&&pr.catch)pr.catch(function(){})}
    else{m=doc.createElement('img');m.src=it.src;m.alt=it.alt||it.caption||''}
    m.className='rr-view-media';stage.insertBefore(m,pv);cap.textContent=it.caption||'';cnt.textContent=(i+1)+' / '+items.length;
  }
  if(mute)mute.addEventListener('click',function(){muted=!muted;var v=stage.querySelector('video');if(v)v.muted=muted;mute.textContent=muted?'Sound on':'Sound off'});
  pv.addEventListener('click',function(){show(i-1)});nx.addEventListener('click',function(){show(i+1)});
  var x0=null;stage.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  stage.addEventListener('touchend',function(e){if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)show(dx<0?i+1:i-1)},{passive:true});
  root.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();show(i-1)}else if(e.key==='ArrowRight'){e.preventDefault();show(i+1)}});
  show(i);
  Modal.open({title:title,content:root,size:'full',initialFocus:'.rr-view-nav.n',onClose:function(){var v=stage.querySelector('video');if(v)v.pause()}});
}
/* gallery */
var gc=[].slice.call(doc.querySelectorAll('#gallery .rr-card'));
var gitems=gc.map(function(c){var im=c.querySelector('img');return {src:im&&im.src,alt:im&&im.alt,caption:(im&&im.alt)||c.textContent.trim()}});
gc.forEach(function(c,n){if(!gitems[n].src)return;c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label','Open photo '+(n+1)+': '+gitems[n].caption);
  c.addEventListener('click',function(){viewer(gitems,n,'Gallery','img')});
  c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();viewer(gitems,n,'Gallery','img')}})});
/* reels: tap the card (not the play/pause button) */
var rl=[].slice.call(doc.querySelectorAll('#reels .rr-reel'));
var ritems=rl.map(function(r){var v=r.querySelector('video'),c=r.querySelector('.rr-reel-cap');return {src:v&&v.src,caption:c?c.textContent.trim():''}});
rl.forEach(function(r,n){var v=r.querySelector('video');if(!v)return;
  r.addEventListener('click',function(e){if(e.target.closest('.rr-reel-btn'))return;v.pause();viewer(ritems,n,'Reels','video')});});
/* Why us: cards activate one after another */
var wc=[].slice.call(doc.querySelectorAll('#why-us .rr-grid-4 .rr-card'));
if(wc.length){
  if(reduce()||!('IntersectionObserver' in window)){wc.forEach(function(c){c.classList.add('rr-why-on')})}
  else{var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();wc.forEach(function(c,k){setTimeout(function(){c.classList.add('rr-why-on')},k*420)})},{threshold:.35});io.observe(wc[0].parentNode)}
}
})();

;

(function(){'use strict';
var doc=document,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* --- story timeline --- */
var tl=doc.querySelector('#story .rr-timeline');
function initTl(){
  var arts=tl&&tl.querySelectorAll('article');if(!arts||!arts.length||tl.dataset.rrTl)return false;tl.dataset.rrTl='1';
  var fill=doc.createElement('i');fill.className='rr-tl-fill';fill.setAttribute('aria-hidden','true');tl.insertBefore(fill,tl.firstChild);
  if(reduce){[].forEach.call(arts,function(a){a.classList.add('rr-tl-on')});fill.style.height='100%';return true}
  tl.classList.add('rr-tl-js');var tick=false,vis=true;
  function sched(){if(!tick){tick=true;requestAnimationFrame(upd)}}
  try{new IntersectionObserver(function(es){vis=es[es.length-1].isIntersecting;if(vis)sched()},{rootMargin:'250px 0px'}).observe(tl)}catch(x){}
  function upd(){tick=false;if(!vis)return;var t=doc.querySelector('#story .rr-timeline');if(!t)return;var f=t.querySelector('.rr-tl-fill');
    if(!f){f=doc.createElement('i');f.className='rr-tl-fill';f.setAttribute('aria-hidden','true');t.insertBefore(f,t.firstChild)}
    t.classList.add('rr-tl-js');var r=t.getBoundingClientRect(),mid=innerHeight*.55,p=Math.max(0,Math.min(r.height,mid-r.top));f.style.height=p+'px';
    [].forEach.call(t.querySelectorAll('article'),function(a){a.classList.toggle('rr-tl-on',a.offsetTop+21<=p+4)})}
  addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched);
  new MutationObserver(sched).observe(doc.body,{attributes:true,attributeFilter:['class']});upd();return true;
}
if(tl&&!initTl()){var mo=new MutationObserver(function(){if(initTl())mo.disconnect()});mo.observe(tl,{childList:true});}
/* --- category hover preview (desktop pointer only) --- */
if(!matchMedia('(hover:hover) and (pointer:fine)').matches||!window.RRDishes)return;
var pv=doc.createElement('div');pv.className='rr-catpv';pv.setAttribute('aria-hidden','true');doc.body.appendChild(pv);var hideT;
function show(a){
  var name=a.getAttribute('data-home-filter');if(!name)return;var list=RRDishes.byCategory(name);if(!list.length)return;
  var top=list.slice().sort(function(x,y){return (y.signature?1:0)-(x.signature?1:0)}).slice(0,3);
  pv.textContent='';var h=doc.createElement('h4');h.textContent='Popular in '+name;pv.appendChild(h);
  top.forEach(function(d){var r=doc.createElement('div'),n=doc.createElement('b');n.style.fontWeight='600';n.textContent=d.name;r.appendChild(n);
    if(window.RR_SHOW_PRICES!==false&&window.RRCart){var p=doc.createElement('span');p.textContent=RRCart.fmt(d.price);r.appendChild(p)}pv.appendChild(r)});
  var em=doc.createElement('em');em.textContent='View all '+list.length+' \u2192';pv.appendChild(em);
  var b=a.getBoundingClientRect(),x=b.left+scrollX+b.width/2-135;x=Math.max(8+scrollX,Math.min(x,scrollX+doc.documentElement.clientWidth-278));
  var y=b.bottom+scrollY+8;pv.style.left=x+'px';pv.style.top=y+'px';clearTimeout(hideT);pv.classList.add('on');
}
function hide(){hideT=setTimeout(function(){pv.classList.remove('on')},60)}
doc.addEventListener('mouseover',function(e){var a=e.target.closest&&e.target.closest('#menu a.category[data-home-filter]');if(a)show(a)});
doc.addEventListener('mouseout',function(e){var a=e.target.closest&&e.target.closest('#menu a.category[data-home-filter]');if(a&&!a.contains(e.relatedTarget))hide()});
doc.addEventListener('focusin',function(e){var a=e.target.closest&&e.target.closest('#menu a.category[data-home-filter]');if(a)show(a)});
doc.addEventListener('focusout',hide);
addEventListener('scroll',function(){pv.classList.remove('on')},{passive:true});
})();

;

(function(){'use strict';
var doc=document,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,io='IntersectionObserver' in window;
function once(node,th,fn){if(!node)return;if(!io||reduce){fn();return}var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();fn()}},{threshold:th});o.observe(node)}
/* 6.1 hero photo parallax (transform-only, rAF) */
var fr=doc.querySelector('#about .rra-frame');
if(fr&&!reduce){var tk=false;addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;var r=fr.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  var p=((r.top+r.height/2)-innerHeight/2)/innerHeight;fr.style.setProperty('--rr-py',Math.max(-14,Math.min(14,p*-28)).toFixed(1)+'px')})},{passive:true})}
/* 6.2 foundation: gold underline on keywords */
var fnd=doc.querySelector('#foundation .rr-container');
if(fnd){var KW=['quality and hygiene','RR Joints','RR Durbar','honest food','consistently'];
  [].forEach.call(fnd.querySelectorAll('p.rr-copy'),function(p){KW.forEach(function(k){var w=doc.createTreeWalker(p,NodeFilter.SHOW_TEXT),n,hit=null;
    while((n=w.nextNode())){if(n.parentNode.classList&&n.parentNode.classList.contains('rr-kw'))continue;if(n.nodeValue.indexOf(k)>-1){hit=n;break}}
    if(!hit)return;var i=hit.nodeValue.indexOf(k),after=hit.splitText(i);after.splitText(k.length);var sp=doc.createElement('span');sp.className='rr-kw';sp.textContent=k;after.parentNode.replaceChild(sp,after)})});
  once(fnd,.4,function(){[].forEach.call(fnd.querySelectorAll('.rr-kw'),function(k,i){setTimeout(function(){k.classList.add('rr-kw-on')},reduce?0:500+i*350)})})}
/* 6.3 awards: text shine, one after another */
var aw=[].slice.call(doc.querySelectorAll('#social .rr-card'));
if(aw.length)once(aw[0].parentNode,.4,function(){aw.forEach(function(c,i){setTimeout(function(){c.classList.add('rr-aw-on')},reduce?0:i*450)})});
/* 6.5 vision / mission: 01-04, connector line, sequential */
var g=doc.querySelector('#purpose .rr-grid-4');
if(g){var cs=[].slice.call(g.querySelectorAll('.rr-card')),cn=doc.createElement('i');cn.className='rr-conn';cn.setAttribute('aria-hidden','true');g.insertBefore(cn,g.firstChild);
  cs.forEach(function(c,i){var n=doc.createElement('span');n.className='rr-num';n.textContent=('0'+(i+1)).slice(-2);n.setAttribute('aria-hidden','true');c.insertBefore(n,c.firstChild)});
  once(g,.3,function(){g.classList.add('rr-pu-on');cs.forEach(function(c,i){setTimeout(function(){c.classList.add('rr-pu-card')},reduce?0:300+i*380)})})}
})();

;

(function(){
  var hero=document.getElementById('home');if(!hero)return;
  var slides=[].slice.call(hero.querySelectorAll('.slide'));if(!slides.length)return;
  function sync(){
    var a=hero.querySelector('.slide.active');
    var i=a?parseInt(a.getAttribute('data-scene'),10)||0:0;
    document.body.classList.toggle('rr-nav-off',i>0);
  }
  var mo=new MutationObserver(sync);
  slides.forEach(function(s){mo.observe(s,{attributes:true,attributeFilter:['class']})});
  sync();
})();

;
(function(){
var sec=document.getElementById('awards'),grid=sec&&sec.querySelector('.rrA-grid');if(!grid)return;
var cards=[].slice.call(grid.querySelectorAll('.rrA-card'));if(cards.length<2)return;
var n=cards.length,cur=0,rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var mobile=function(){return window.innerWidth<=700};
grid.classList.add('ra37-stage');grid.setAttribute('tabindex','0');grid.setAttribute('role','group');grid.setAttribute('aria-roledescription','carousel');grid.setAttribute('aria-label','Awards photo gallery. Use the left and right arrow keys to change photo.');
var live=document.createElement('div');live.className='sr-only';live.setAttribute('aria-live','polite');live.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';sec.appendChild(live);
var bar=document.createElement('div');bar.className='ra37 ra37-bar';
var pv=document.createElement('button');pv.type='button';pv.className='ra37-ar';pv.setAttribute('aria-label','Previous photo');pv.textContent='\u2039';
var nx=document.createElement('button');nx.type='button';nx.className='ra37-ar';nx.setAttribute('aria-label','Next photo');nx.textContent='\u203A';
var ct=document.createElement('span');ct.className='ra37-ct';ct.setAttribute('aria-hidden','true');
var dots=document.createElement('div');dots.className='ra37-dots';
var dotEls=cards.map(function(c,i){var d=document.createElement('button');d.type='button';d.className='ra37-dot';d.setAttribute('aria-label','Show photo '+(i+1)+' of '+n);d.addEventListener('click',function(){stop(true);go(i)});dots.appendChild(d);return d});
var pause=document.createElement('button');pause.type='button';pause.className='ra37-pause';pause.setAttribute('aria-pressed','false');pause.textContent='Pause';
bar.appendChild(pv);bar.appendChild(dots);bar.appendChild(ct);bar.appendChild(nx);bar.appendChild(pause);
var tw=document.createElement('div');tw.className='ra37 ra37-tog-wrap';var tog=document.createElement('button');tog.type='button';tog.className='ra37-tog';tog.setAttribute('aria-pressed','false');tog.textContent='Grid view';tw.appendChild(tog);
grid.insertAdjacentElement('afterend',bar);bar.insertAdjacentElement('afterend',tw);
function pad(k){return(k<10?'0':'')+k}
function off(i){var d=i-cur;if(d>n/2)d-=n;if(d<-n/2)d+=n;return d}
function size(){var h=0;cards.forEach(function(c){h=Math.max(h,c.offsetHeight)});if(h)grid.style.setProperty('--h',(h+ (mobile()?8:30))+'px')}
function paint(){cards.forEach(function(c,i){var o=off(i),a=Math.abs(o),mob=mobile(),vis=a<=1;
 c.style.setProperty('--o',o);c.style.setProperty('--r',mob?'0deg':(o===0?'0deg':(o>0?'-7deg':'7deg')));
 c.style.setProperty('--s',o===0?1:(mob?.94:.82));c.style.setProperty('--y',o===0?(mob?'0px':'-10px'):'0px');
 c.style.setProperty('--op',o===0?1:(vis?(mob?.7:.55):0));c.style.setProperty('--z',o===0?3:(vis?2:0));
 c.style.setProperty('--pe',vis?'auto':'none');c.classList.toggle('is-active',o===0);c.classList.toggle('is-vis',vis);
 c.setAttribute('aria-hidden',o===0?'false':'true');
 dotEls[i].setAttribute('aria-current',o===0?'true':'false')});
 ct.textContent=pad(cur+1)+' / '+pad(n);
 var t=cards[cur].querySelector('figcaption strong');live.textContent='Photo '+(cur+1)+' of '+n+(t?': '+t.textContent:'');size()}
function go(i){cur=(i+n)%n;paint()}
nx.addEventListener('click',function(){stop(true);go(cur+1)});pv.addEventListener('click',function(){stop(true);go(cur-1)});
grid.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){stop(true);go(cur+1);e.preventDefault()}else if(e.key==='ArrowLeft'){stop(true);go(cur-1);e.preventDefault()}else if(e.key==='Home'){go(0)}else if(e.key==='End'){go(n-1)}});
/* side photos navigate; only the centre photo opens the enlarge view */
grid.addEventListener('click',function(e){if(!sec.classList.contains('ra37-on'))return;var c=e.target.closest('.rrA-card');if(!c)return;if(!c.classList.contains('is-active')){e.stopPropagation();e.preventDefault();stop(true);go(cards.indexOf(c))}},true);
/* drag / swipe: neighbours follow the pointer, release snaps (40px threshold) */
var x0=null,moved=false;
grid.addEventListener('pointerdown',function(e){if(!sec.classList.contains('ra37-on')||e.button>0)return;x0=e.clientX;moved=false});
grid.addEventListener('pointermove',function(e){if(x0==null)return;var dx=e.clientX-x0;if(Math.abs(dx)>6){moved=true;grid.classList.add('ra37-drag');grid.style.setProperty('--dx',dx*.6+'px');cards.forEach(function(c){c.style.setProperty('--dx',dx*.6+'px')})}});
function end(e){if(x0==null)return;var dx=(e.clientX!=null?e.clientX:x0)-x0;x0=null;grid.classList.remove('ra37-drag');cards.forEach(function(c){c.style.setProperty('--dx','0px')});if(moved&&Math.abs(dx)>40){stop(true);go(cur+(dx<0?1:-1))}else{paint()}if(moved){var kill=function(ev){ev.stopPropagation();ev.preventDefault()};grid.addEventListener('click',kill,{capture:true,once:true});setTimeout(function(){grid.removeEventListener('click',kill,true)},0)}}
grid.addEventListener('pointerup',end);grid.addEventListener('pointercancel',end);grid.addEventListener('pointerleave',function(e){if(x0!=null&&e.pointerType==='mouse')end(e)});
/* optional slow glide: desktop only, never with reduced motion, pausable (WCAG 2.2.2) */
var timer=null,userPaused=false,hov=false,vis=false,canGlide=!rm&&window.matchMedia&&matchMedia('(hover:hover)').matches;
function tick(){if(!userPaused&&!hov&&vis&&!document.hidden&&sec.classList.contains('ra37-on')&&mobile()===false){go(cur+1)}}
function start(){if(canGlide&&!timer)timer=setInterval(tick,6500)}
function stop(byUser){if(byUser){userPaused=true;pause.setAttribute('aria-pressed','true');pause.textContent='Play'}}
pause.addEventListener('click',function(){userPaused=!userPaused;pause.setAttribute('aria-pressed',userPaused?'true':'false');pause.textContent=userPaused?'Play':'Pause'});
sec.addEventListener('pointerenter',function(){hov=true});sec.addEventListener('pointerleave',function(){hov=false});
sec.addEventListener('focusin',function(){hov=true});sec.addEventListener('focusout',function(){hov=false});
if(!canGlide){pause.style.display='none'}else{start()}
if('IntersectionObserver' in window){new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe(sec)}else{vis=true}
tog.addEventListener('click',function(){var on=sec.classList.toggle('ra37-on');tog.textContent=on?'Grid view':'Gallery view';tog.setAttribute('aria-pressed',on?'false':'true');if(!on){cards.forEach(function(c){c.removeAttribute('aria-hidden')})}else{paint()}});
sec.classList.add('ra37-on');paint();
window.addEventListener('resize',function(){paint()});
window.addEventListener('load',function(){paint()});
if(window.ResizeObserver){new ResizeObserver(function(){size()}).observe(cards[0])}
})();
;
(function(){
/* ---- Wall of Honours ---- */
var s=document.getElementById('honours');
if(s){
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var src=document.querySelector('#awards .rg-f[data-i="3"] img');
var im=s.querySelector('img[data-from]');if(im&&src)im.src=src.getAttribute('src');
var INFO={swz:['Swiggy Restaurant Awards','Recognised by Swiggy for Best in Biryani, Best in Andhra Food and Best in Local Gems.','Source: Swiggy restaurant awards','<em class="sw">Swiggy</em>','Restaurant<br>Awards'],
zom:['Zomato Restaurant Awards 2023','Recognised by Zomato for Best in Biryani, Best in Chinese and Best in Street Food.','Source: Zomato restaurant awards 2023','<em class="zo">zomato</em>','Restaurant<br>Awards 2023'],
fci:['Food Connoisseurs India Awards','Best Restaurant in Andhra Pradesh. 10th Edition, South India. Also recognised at the 4th Edition India Convention.','Source: Food Connoisseurs India Awards','<em class="fc">Food<br>Connoisseurs</em>','India Awards']};
var m=document.getElementById('wh-modal'),card=m.querySelector('.wh-card'),last=null;
function open(k,b){var d=INFO[k];last=b;card.querySelector('h3').textContent=d[0];card.querySelector('p').textContent=d[1];card.querySelector('small').textContent=d[2];
card.querySelector('.wh-card-pl').innerHTML='<span class="wh-pl"><span class="wh-pl-in">'+d[3]+'<svg class="lau" viewBox="0 0 120 40"><use href="#wh-laurel"/></svg><strong>'+d[4]+'</strong></span></span>';
m.hidden=false;card.querySelector('.wh-x').focus()}
function close(){m.hidden=true;if(last)last.focus()}
s.querySelectorAll('.wh-pl[data-k]').forEach(function(b){b.addEventListener('click',function(){open(b.getAttribute('data-k'),b)})});
m.addEventListener('click',function(e){if(e.target===m||e.target.closest('.wh-x'))close()});
document.addEventListener('keydown',function(e){if(!m.hidden&&e.key==='Escape')close()});
if(!rm&&window.matchMedia&&matchMedia('(hover:hover)').matches){var c=document.getElementById('wh-case'),a=c.querySelector('.wh-arch');
c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;a.style.transform='perspective(900px) rotateY('+x*10+'deg) rotateX('+(-y*8)+'deg)'});
c.addEventListener('pointerleave',function(){a.style.transform=''})}
function count(el){var to=+el.getAttribute('data-to'),t0=null;function f(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1400,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
if('IntersectionObserver' in window&&!rm){s.classList.add('wh-js');
var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){s.classList.add('wh-in');s.querySelectorAll('[data-to]').forEach(function(el){el.textContent='0';count(el)});io.disconnect()}},{threshold:.15});io.observe(s)}
}
/* ---- Royal Gallery ---- */
var sec=document.getElementById('awards'),stage=document.getElementById('rg-stage');
if(sec&&stage){
var F=[].slice.call(stage.querySelectorAll('.rg-f')),N=F.length,cur=0,plate=sec.querySelector('.rg-plate'),dots=sec.querySelector('.rg-dots');
F.forEach(function(f,i){f.querySelector('.rrA-photo').style.setProperty('--p',f.querySelector('.rrA-photo').getAttribute('data-pos')||'center');
var d=document.createElement('button');d.type='button';d.className='rg-dot';d.setAttribute('role','tab');d.setAttribute('aria-label','Photo '+(i+1)+' of '+N);d.addEventListener('click',function(){go(i)});dots.appendChild(d)});
function lay(first){
F.forEach(function(f,i){var o=((i-cur+N+Math.floor(N/2))%N)-Math.floor(N/2),a=Math.abs(o),sg=o<0?-1:1,vis=a<=2;
var x=o===0?0:sg*(a===1?66:a===2?104:140),rot=o===0?0:-sg*(a===1?42:48),z=o===0?0:-(a*90),sc=o===0?1:(a===1?.86:.7);
f.style.transform='translateX(calc(-50% + '+x+'%)) translateZ('+z+'px) rotateY('+rot+'deg) scale('+sc+')';
f.style.opacity=vis?'1':'0';f.style.visibility=vis?'visible':'hidden';f.style.zIndex=String(10-a);f.style.pointerEvents=vis?'auto':'none';
f.classList.toggle('is-c',o===0);f.setAttribute('aria-hidden',vis?'false':'true');
if(o===0){var t=f.querySelector('figcaption strong').textContent,u=f.querySelector('figcaption span:not(.rrA-zoomhint)').textContent;
plate.classList.add('sw');setTimeout(function(){plate.querySelector('strong').textContent=t;plate.querySelector('span').textContent=u;plate.classList.remove('sw')},first?0:200);
if(!first){f.classList.remove('shine');void f.offsetWidth;setTimeout(function(){f.classList.add('shine')},350)}}});
[].forEach.call(dots.children,function(d,i){d.setAttribute('aria-selected',i===cur)})}
function go(i){cur=(i+N)%N;lay(false)}
sec.querySelector('.rg-ar.prev').addEventListener('click',function(){go(cur-1)});
sec.querySelector('.rg-ar.next').addEventListener('click',function(){go(cur+1)});
stage.addEventListener('click',function(e){var f=e.target.closest('.rg-f');if(!f||sec.classList.contains('rg-grid'))return;if(!f.classList.contains('is-c')){e.stopPropagation();go(+f.getAttribute('data-i'))}},false);
stage.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}});
var sx=null;stage.addEventListener('pointerdown',function(e){sx=e.clientX});
stage.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50&&!sec.classList.contains('rg-grid'))go(cur+(dx<0?1:-1))});
sec.querySelectorAll('.rg-tog button').forEach(function(b){b.addEventListener('click',function(){var g=b.getAttribute('data-v')==='grid';sec.classList.toggle('rg-grid',g);sec.querySelectorAll('.rg-tog button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});
if(g){F.forEach(function(f){f.style.visibility='visible'})}else lay(true)})});
lay(true);
}
})();

;
(function(){
var sec=document.getElementById('reviews'),st=document.getElementById('rv-stage');if(!sec||!st)return;
var C=[].slice.call(st.querySelectorAll('.rv-c')),N=C.length,cur=0,dots=sec.querySelector('.rv-dots'),live=sec.querySelector('.rv-live');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
C.forEach(function(c,i){var d=document.createElement('button');d.type='button';d.className='rv-dot';d.setAttribute('role','tab');d.setAttribute('aria-label','Review '+(i+1)+' of '+N);d.addEventListener('click',function(){go(i)});dots.appendChild(d)});
function lay(){var h=Math.floor(N/2);
C.forEach(function(c,i){var o=((i-cur+N+h)%N)-h,a=Math.abs(o),sg=o<0?-1:1,vis=a<=1,mob=window.innerWidth<=760;
var x=o===0?0:sg*(mob?(a===1?70:100):(a===1?74:110)),rot=o===0?0:-sg*(mob?30:36),z=o===0?0:-(a*(mob?120:140)),sc=o===0?1:(mob?.82:.8);
c.style.transform='translateX(calc(-50% + '+x+'%)) translateZ('+z+'px) rotateY('+rot+'deg) scale('+sc+')';
c.style.opacity=vis?'1':'0';c.style.visibility=vis?'visible':'hidden';c.style.zIndex=String(10-a);c.style.pointerEvents=vis?'auto':'none';
c.classList.toggle('is-c',o===0);c.setAttribute('aria-hidden',o===0?'false':'true');c.setAttribute('aria-label',(i+1)+' of '+N)});
[].forEach.call(dots.children,function(d,i){d.setAttribute('aria-selected',i===cur)})}
function go(i){cur=(i+N)%N;lay();var c=C[cur];live.textContent=c.querySelector('p').textContent+' by '+c.querySelector('.rv-by b').textContent}
sec.querySelector('.rv-ar.prev').addEventListener('click',function(){go(cur-1)});
sec.querySelector('.rv-ar.next').addEventListener('click',function(){go(cur+1)});
st.addEventListener('click',function(e){var c=e.target.closest('.rv-c');if(c&&!c.classList.contains('is-c'))go(C.indexOf(c))});
st.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}});
var sx=null;st.addEventListener('pointerdown',function(e){sx=e.clientX});
st.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1))});
window.addEventListener('resize',lay);
/* subtle parallax on lantern lights + centre card tilt */
if(!rm&&window.matchMedia&&matchMedia('(hover:hover)').matches){
 var bs=[].slice.call(sec.querySelectorAll('.rv-bg .b'));
 sec.addEventListener('pointermove',function(e){var r=sec.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;bs.forEach(function(b,i){var k=(i%3+1)*10;b.style.translate=(-x*k)+'px '+(-y*k)+'px'})});
}
lay();
if('IntersectionObserver' in window&&!rm){sec.classList.add('rv-js');var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){sec.classList.add('rv-in-view');io.disconnect()}},{threshold:.12});io.observe(sec)}
})();

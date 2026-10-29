
(function(){
var mq=matchMedia('(prefers-reduced-motion:reduce)'),reduce=function(){return mq.matches};
var EASE='cubic-bezier(.2,.7,.2,1)';
/* ---- 1. page transitions (View Transitions API) ---- */
document.addEventListener('click',function(e){
 if(!document.startViewTransition||reduce()||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||typeof window.rrGo!=='function')return;
 var a=e.target.closest&&e.target.closest('a[href]');if(!a||(a.target&&a.target!=='_self'))return;
 /* v77b: menu '+ Add' is an <a> that the menu script turns into add-to-order; never treat it as page navigation */
 if(a.closest('.m52-add,.m61-step,.m61-sheetadd'))return;
 var href=a.getAttribute('href')||'';if(/^[a-z][a-z0-9+.-]*:/i.test(href))return;
 var m=href.match(/[?&]page=([^&#]*)/);if(!m)return;
 var cur=(location.search.match(/[?&]page=([^&#]*)/)||[0,'home'])[1];if(m[1]===cur)return;
 var mp=a.closest('.mobile-nav-panel');if(mp){var cb=mp.querySelector('.mobile-nav-close');if(cb)cb.click()}
 e.preventDefault();e.stopImmediatePropagation();
 try{document.startViewTransition(function(){window.rrGo(href)})}catch(x){window.rrGo(href)}
},true);
/* ---- 2. scroll reveal engine + kinetic headings + story spotlight ---- */
if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
var RISE='#m52 .dish,.cx-card,.cx-th,.cx-why li,.cx-perfect,#catering-gallery .rr-card,#catering-occasions .rr-card,#catering-serve .rr-card,#catering-why .rr-card,#ordering .od-feat,#ordering .od-perk,#ordering .od-lg,#contact .rr-card,#story article,.rr-trust-item:not(.rr-rv),#br-locator li';
var POP='#br-locator .pin,.ot-no,.tn-ring';
var HEAD='.rr-heading:not(.rr-rv),.cx-h1,.cx-h2,.cx-h3,.od-h1,.od-h2,#m52 h1,#m52 h2,#br-locator h1,#contact h1,#contact h3,#story h3';
function kf(type){
 if(reduce())return [{opacity:0},{opacity:1}];
 if(type==='pop')return [{scale:.4,opacity:0},{scale:1.12,opacity:1,offset:.7},{scale:1,opacity:1}];
 return [{translate:'0 34px',scale:.965,filter:'blur(5px)',opacity:0},{translate:'0 0',scale:1,filter:'blur(0)',opacity:1}];
}
var io=new IntersectionObserver(function(es){
 var hit=es.filter(function(e){return e.isIntersecting}).sort(function(a,b){var x=a.target.getBoundingClientRect(),y=b.target.getBoundingClientRect();return (x.top-y.top)||(x.left-y.left)});
 hit.forEach(function(e,i){var el=e.target;io.unobserve(el);
  try{el.animate(kf(el.__v77t),{duration:reduce()?400:720,delay:Math.min(i*70,420),easing:EASE,fill:'backwards'})}catch(x){}})
},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
function words(h){
 var cs=getComputedStyle(h),bad=/flex|grid/.test(cs.display);
 [h].concat([].slice.call(h.querySelectorAll('*'))).forEach(function(e){var c=getComputedStyle(e);
  if(c.webkitTextFillColor==='rgba(0, 0, 0, 0)'||c.backgroundClip==='text'||c.webkitBackgroundClip==='text'||/^(SVG|IMG|BR|INPUT)$/i.test(e.tagName))bad=true});
 return !bad;
}
function reveal(h){if(h.__v77d)return;h.__v77d=1;
 var ws=[].slice.call(h.querySelectorAll('.v77w'));
 ws.forEach(function(w,i){try{var a=w.animate([{translate:'0 .7em',opacity:0,filter:'blur(4px)'},{translate:'0 0',opacity:1,filter:'blur(0)'}],{duration:700,delay:Math.min(i*60,600),easing:EASE,fill:'both'});
  a.onfinish=function(){w.style.opacity='';try{a.cancel()}catch(x){}}}catch(x){w.style.opacity=''}})}
var hio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;hio.unobserve(e.target);reveal(e.target)})},{threshold:.35});
/* safety sweep: headings cloned/re-rendered by other scripts keep hidden words; re-adopt them, and force-show anything stuck in view for >1.5s */
setInterval(function(){
 if(document.hidden)return;var vh=innerHeight,now=Date.now();
 document.querySelectorAll('.v77h').forEach(function(h){
  var hidden=h.querySelector('.v77w[style*="opacity: 0"]');if(!hidden){h.__v77t0=0;return}
  if(!h.__v77){h.__v77=1;h.__v77d=0;hio.observe(h)}
  var r=h.getBoundingClientRect();if(r.height&&r.bottom<0){h.querySelectorAll('.v77w').forEach(function(w){w.style.opacity=''});return}if(!r.height||r.top>vh){h.__v77t0=0;return}
  if(!h.__v77t0)h.__v77t0=now;else if(now-h.__v77t0>1500){h.__v77d=0;reveal(h);h.__v77t0=0}
 })},1000);
function prep(h){
 if(h.__v77||!h.textContent.trim()||h.closest('#home'))return;h.__v77=1;h.classList.add('v77h');
 if(reduce()||!words(h)){h.__v77t='rise';io.observe(h);return}
 var walk=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),nodes=[],n;while((n=walk.nextNode()))if(n.textContent.trim())nodes.push(n);
 nodes.forEach(function(t){var f=document.createDocumentFragment();t.textContent.split(/(\s+)/).forEach(function(p){
  if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return}
  var s=document.createElement('span');s.className='v77w';s.textContent=p;s.style.opacity='0';f.appendChild(s)});t.parentNode.replaceChild(f,t)});
 var r0=h.getBoundingClientRect();if(r0.bottom<0){h.querySelectorAll('.v77w').forEach(function(w){w.style.opacity=''});h.__v77d=1;return}
 hio.observe(h);
}
var spot=null;
function story(){var s=document.getElementById('story');if(!s||s.__v77s||reduce())return;var as=[].slice.call(s.querySelectorAll('article'));if(as.length<3)return;s.__v77s=1;s.classList.add('v77-live');
 spot=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){as.forEach(function(a){a.classList.toggle('v77-on',a===e.target)})}})},{rootMargin:'-42% 0px -42% 0px'});
 as.forEach(function(a){spot.observe(a)});as[0].classList.add('v77-on')}
function scan(){
 document.querySelectorAll(RISE).forEach(function(el){if(el.__v77)return;el.__v77=1;el.__v77t='rise';io.observe(el)});
 document.querySelectorAll(POP).forEach(function(el){if(el.__v77)return;el.__v77=1;el.__v77t='pop';io.observe(el)});
 document.querySelectorAll(HEAD).forEach(prep);story();
}
var tm;function later(){clearTimeout(tm);tm=setTimeout(scan,200)}
scan();addEventListener('load',function(){scan();setTimeout(scan,1200)});
try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(x){}
/* ---- 3. micro-interactions: heart pop, order-bar bump ---- */
document.addEventListener('click',function(e){var h=e.target.closest&&e.target.closest('.rr-heart');if(!h||reduce())return;
 try{h.animate([{scale:1},{scale:1.5,offset:.35},{scale:.9,offset:.65},{scale:1}],{duration:480,easing:'ease-out'})}catch(x){}},true);
var nb=document.getElementById('m61-n'),bar=document.getElementById('m61-bar');
if(!nb||!bar){var obs=new MutationObserver(function(){nb=document.getElementById('m61-n');bar=document.getElementById('m61-bar');if(nb&&bar){obs.disconnect();hook()}});try{obs.observe(document.body,{childList:true})}catch(x){}}else hook();
function hook(){try{new MutationObserver(function(){if(reduce())return;bar.animate([{scale:1},{scale:1.045,offset:.4},{scale:1}],{duration:380,easing:'ease-out'})}).observe(nb,{childList:true,characterData:true,subtree:true})}catch(x){}}
})();

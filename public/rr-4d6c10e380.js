(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
ready(function(){
/* 1. shared stagger: cards/blocks in About sections enter one after another */
['foundation','family','why-us','about-sig','about-go','reels','stats'].forEach(function(id){
  var s=document.getElementById(id);if(!s)return;
  var els=[].slice.call(s.querySelectorAll('[data-rrs]'));
  if(id!=='stats')els.forEach(function(e,i){e.style.setProperty('--rd',Math.min(i*80,560)+'ms')});
});
/* 2. About stats: count up once when seen */
var nums=[].slice.call(document.querySelectorAll('#stats .rr-stat strong'));
if(nums.length&&!reduce&&'IntersectionObserver' in window){
  nums.forEach(function(n){n.dataset.to=n.textContent.trim()});
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;io.unobserve(en.target);
    var el=en.target,txt=el.dataset.to,m=txt.match(/^(\D*)([\d,]+)(.*)$/);if(!m)return;
    var end=parseInt(m[2].replace(/,/g,''),10),t0=performance.now(),dur=1300;
    (function step(t){var k=Math.max(0,Math.min(1,(t-t0)/dur)),e=1-Math.pow(1-k,3);el.textContent=m[1]+Math.round(end*e).toLocaleString('en-IN')+m[3];if(k<1)requestAnimationFrame(step);else el.textContent=txt})(t0)
  })},{threshold:.6});
  nums.forEach(function(n){io.observe(n)});
}
/* 3. About reels: play when on screen, pause when off screen */
var vids=[].slice.call(document.querySelectorAll('#reels video'));
if(vids.length&&'IntersectionObserver' in window){
  vids.forEach(function(v){v.muted=true;v.playsInline=true;if(!v.hasAttribute('loop'))v.loop=true});
  var vo=new IntersectionObserver(function(es){es.forEach(function(en){var v=en.target;
    if(en.isIntersecting&&!reduce){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.35});
  vids.forEach(function(v){vo.observe(v)});
}
});
})();
;

(function(){
if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
var RISE='#foundation .rr-container>*,#purpose .rr-card,#why-us .rr-card,#about-sig .a73-sig,#about-sig .a73-more,#family .a73-kid,#family .a73-seal,#gallery .rr-card,#outlets .ot-grid>*,#locations .rr-location-card,#track-order .rr-card,#tracking .rr-card,#contact .rr-card,#promise-green .rrm-gwrap>*';
var EASE='cubic-bezier(.2,.7,.2,1)';
function rise(es){
 var hit=es.filter(function(e){return e.isIntersecting}).sort(function(a,b){return (a.target.compareDocumentPosition(b.target)&4)?-1:1});
 hit.forEach(function(e,i){var el=e.target;riseIO.unobserve(el);
  try{el.animate([{transform:'translateY(28px) scale(.97)'}],{duration:700,delay:Math.min(i*80,480),easing:EASE,fill:'backwards'})}catch(x){}});
}
var riseIO=new IntersectionObserver(rise,{threshold:.12});
var popIO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;popIO.unobserve(e.target);
 try{e.target.animate([{transform:'scale(.4)',opacity:0},{transform:'scale(1.12)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],{duration:650,easing:'ease-out',fill:'backwards'})}catch(x){}})},{threshold:.4});
var lineIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){lineIO.unobserve(e.target);e.target.classList.add('m74-in')}})},{threshold:.3});
function scan(){
 [[RISE,riseIO],['#locations .rr-location-number',popIO],['.rr-timeline',lineIO]].forEach(function(p){
  document.querySelectorAll(p[0]).forEach(function(el){if(el.__m74)return;el.__m74=1;p[1].observe(el)})})
}
var tm;function later(){clearTimeout(tm);tm=setTimeout(scan,250)}
scan();addEventListener('load',function(){scan();setTimeout(scan,1200)});
try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(x){}
})();

/* rr-motion-a: pause never-ending loops while their section is off the screen. Delete this script to revert. */
(function(){'use strict';
if(!('IntersectionObserver' in window)||!document.getAnimations||!Element.prototype.getAnimations)return;
var parked=new Map(),seen=new Map(),total=0;
function pinned(el,sec){for(var e=el;e&&e!==sec;e=e.parentElement){var p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return true}return false}
function park(sec){var list=parked.get(sec)||[];
 sec.getAnimations({subtree:true}).forEach(function(a){try{
  var t=a.effect&&a.effect.getTiming&&a.effect.getTiming();
  if(!t||t.iterations!==Infinity||a.playState!=='running')return;
  var el=a.effect.target;if(!el||pinned(el,sec))return;
  a.pause();list.push(a)}catch(e){}});
 parked.set(sec,list)}
function wake(sec){var l=parked.get(sec);if(!l)return;parked.delete(sec);
 l.forEach(function(a){try{if(a.playState==='paused')a.play()}catch(e){}})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){seen.set(e.target,e.isIntersecting);if(e.isIntersecting)wake(e.target);else park(e.target)})},{rootMargin:'200px 0px'});
function rescan(){seen.forEach(function(on,sec){if(!on)park(sec)})}
function start(){[].forEach.call(document.querySelectorAll('section[id],footer'),function(s){io.observe(s)});
 /* loops that start late (menus and cards built by script) get caught on these passes */
 addEventListener('load',function(){setTimeout(rescan,300);setTimeout(rescan,3000)});setTimeout(rescan,1500)}
window.RR_OFFSCREEN={parkedCount:function(){var n=0;parked.forEach(function(l){l.forEach(function(a){if(a.playState==='paused')n++})});return n}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
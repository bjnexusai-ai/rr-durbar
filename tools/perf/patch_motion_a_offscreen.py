#!/usr/bin/env python3
"""Motion A (offscreen only, 31 Oct): looping effects pause while their section is off the screen and play again
when it comes back (200px early, so the visitor never sees them start). Nothing is removed or restyled.
Only NEVER-ENDING loops are paused. One-time entrances, hovers, the cart, toasts and pop-ups are not touched.
Anything fixed on the screen (music button, WhatsApp/call buttons, bottom bars) is never paused.
Videos already pause offscreen (existing code) and the founder story already stops itself, so they are left alone.
Exact-match: STOP unless </body> occurs once. Idempotent. Run from the repo root. Revert: restore src/site.html.bakma"""
import pathlib, sys
p = pathlib.Path("src/site.html")
if not p.exists(): sys.exit("STOP: run from the repo root (src/site.html not found)")
s = p.read_text(encoding="utf-8")
if 'id="rr-motion-a-offscreen"' in s: print("already done (nothing to change)"); sys.exit(0)
if s.count("</body>") != 1: sys.exit("STOP: </body> found %d times (need 1)" % s.count("</body>"))
JS = r"""<script id="rr-motion-a-offscreen">/* rr-motion-a: pause never-ending loops while their section is off the screen. Delete this script to revert. */
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
})();</script>
"""
pathlib.Path("src/site.html.bakma").write_text(s, encoding="utf-8")
p.write_text(s.replace("</body>", JS + "</body>"), encoding="utf-8")
print("PATCHED: looping effects pause off screen (backup src/site.html.bakma)")

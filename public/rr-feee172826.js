/* rr-step-n: /branches/ top. Lights on once, beacons drop, labels find clear space; beacon <-> label <-> name tab <-> outlet card are linked (a tap crossfades the card). Delete with the style block to revert. */
(function(){'use strict';
var sec=document.getElementById('br-locator');if(!sec||!sec.classList.contains('brt'))return;
var RM=matchMedia('(prefers-reduced-motion:reduce)'),map=document.getElementById('brmMap'),svg=document.getElementById('brmLines');if(!map||!svg)return;
var pins=[].slice.call(sec.querySelectorAll('.brm-pin')),labs=[].slice.call(sec.querySelectorAll('.brm-lab')),cards=[].slice.call(sec.querySelectorAll('.brt-card')),tabs=[].slice.call(sec.querySelectorAll('.brt-tab')),
 PX={},sel='moghalrajpuram',GO=16;
pins.forEach(function(p){PX[p.getAttribute('data-id')]=[parseFloat(p.style.left),parseFloat(p.style.top)]});
function by(list,id){for(var i=0;i<list.length;i++)if(list[i].getAttribute('data-id')===id)return list[i]}
function hov(id,on){[by(pins,id),by(labs,id),by(cards,id),by(tabs,id)].forEach(function(e){if(e)e.classList.toggle('is-on',on)})}
function hit(a,b){return a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h}
function layout(){
 var W=map.clientWidth,H=map.clientHeight;if(!W||!H)return;
 var placed=[],dots=labs.map(function(l){var q=PX[l.getAttribute('data-id')];return {x:q[0]/100*W-15,y:q[1]/100*H-15,w:30,h:30}}),dirs=[[0,-1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[1,1],[-1,1]];
 while(svg.childNodes.length>1)svg.removeChild(svg.lastChild);
 labs.forEach(function(l){
  var id=l.getAttribute('data-id'),q=PX[id],cx=q[0]/100*W,cy=q[1]/100*H,w=l.offsetWidth,h0=l.offsetHeight,h=h0+(id===sel?0:GO),best=null;
  for(var d=34;d<=150&&!best;d+=14){for(var i=0;i<dirs.length&&!best;i++){
   var dx=dirs[i][0],dy=dirs[i][1],x=dx>0?cx+d*.7:dx<0?cx-d*.7-w:cx-w/2,y=dy<0?cy-d-h:dy>0?cy+d:cy-h/2,r={x:x,y:y,w:w,h:h};
   if(x<4||y<H*.08||x+w>W-4||y+h>H*.9)continue;
   if(placed.every(function(o){return !hit({x:r.x-6,y:r.y-6,w:r.w+12,h:r.h+12},o)})&&dots.every(function(o){return !hit(r,o)}))best=r}}
  best=best||{x:Math.max(4,Math.min(W-w-4,cx-w/2)),y:Math.max(H*.08,cy-40-h),w:w,h:h};
  placed.push(best);l.style.left=best.x+'px';l.style.top=best.y+'px';
  var ax=Math.max(best.x,Math.min(cx,best.x+best.w)),ay=Math.max(best.y,Math.min(cy,best.y+h0)),
   ln=document.createElementNS('http://www.w3.org/2000/svg','line'),c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  ln.setAttribute('x1',cx);ln.setAttribute('y1',cy);ln.setAttribute('x2',ax);ln.setAttribute('y2',ay);svg.appendChild(ln);
  c.setAttribute('cx',ax);c.setAttribute('cy',ay);c.setAttribute('r',2);svg.appendChild(c)})}
function pick(id){sel=id;
 pins.forEach(function(p){var on=p.getAttribute('data-id')===id;p.classList.toggle('is-sel',on);p.setAttribute('aria-pressed',on?'true':'false')});
 labs.forEach(function(l){l.classList.toggle('is-sel',l.getAttribute('data-id')===id)});
 cards.forEach(function(c){c.classList.toggle('is-sel',c.getAttribute('data-id')===id)});
 tabs.forEach(function(t){t.setAttribute('aria-pressed',t.getAttribute('data-id')===id?'true':'false')});
 layout()}
[pins,labs,tabs].forEach(function(list){list.forEach(function(e){var id=e.getAttribute('data-id');
 e.addEventListener('mouseenter',function(){hov(id,true)});e.addEventListener('mouseleave',function(){hov(id,false)});
 e.addEventListener('focusin',function(){hov(id,true)});e.addEventListener('focusout',function(){hov(id,false)});
 e.addEventListener('click',function(){pick(id)})})});
[].forEach.call(sec.querySelectorAll('.brm-go'),function(a){a.addEventListener('click',function(ev){ev.stopPropagation()})});
pick(sel);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
if('ResizeObserver' in window)new ResizeObserver(layout).observe(map);else addEventListener('resize',layout);
/* string lights on the bridge strip: the old observer watched the whole 960px svg, of which a phone strip shows ~12% (never "on"). Watch the strip itself. */
var strip=document.getElementById('skyline');
if(strip){var tries=0;function bulbsOn(){var sv=strip.querySelector('.rr-bulbs');if(sv){sv.classList.add('on');return}if(++tries<20)setTimeout(bulbsOn,300)}
 if('IntersectionObserver' in window){var bio=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){bio.disconnect();bulbsOn()}},{threshold:.5});bio.observe(strip)}else bulbsOn()}
/* city lights on, once, when the map first comes into view (skipped with reduced motion: the map is simply lit) */
if(RM.matches||!('IntersectionObserver' in window)){sec.classList.add('brm-lit');return}
sec.classList.add('brm-armed');
var io=new IntersectionObserver(function(es){if(!es.some(function(e){return e.isIntersecting}))return;io.disconnect();sec.classList.add('brm-lit')},{threshold:.25});
io.observe(map);
})();

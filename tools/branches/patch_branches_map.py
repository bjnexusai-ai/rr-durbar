#!/usr/bin/env python3
"""Step M (3 Nov): portrait night map in a new dark section #br-map on /branches/ (between #br-locator and #br-list).
Dry run unless --write. Every anchor must match exactly once, else STOP and nothing is written. Idempotent (2nd run: already done).
  1 section markup (map + 5 beacon buttons + 5 label cards + leader-line svg + 5 compact cards) inserted before #br-list
  2 style block rr-branches-map before rr-motion-b      3 script rr-branches-map-js before rr-whats-new
  4 pageSections.branches gets br-map                    5 cms/routes.js branches gets br-map
  6 old hero map hidden (css in 2)
  7 assets: tools/branches/img/rr-branches-map-{480,941}.webp copied to public/assets/
Revert: delete section#br-map, style#rr-branches-map, script#rr-branches-map-js and the two br-map list entries."""
import sys, pathlib, shutil
WRITE = '--write' in sys.argv
p = pathlib.Path('src/site.html'); s = p.read_text(encoding='utf-8'); r = pathlib.Path('cms/routes.js'); rs = r.read_text(encoding='utf-8')
if 'id="br-map"' in s: print('already done: section#br-map exists, nothing to do'); sys.exit(0)
bad = []; log = []
def rep(txt, a, b, label):
    n = txt.count(a)
    if n != 1: bad.append(f'{label}: found {n}, expected 1'); return txt
    log.append(f'{label}: ok'); return txt.replace(a, b)

OUT = [  # id, name, area line, tel, display phone, directions url (same as the site's own cards), beacon x%, beacon y% on the map art
 ('singhnagar', 'Singhnagar', 'Budameru Centre, Ramakrishnapuram', '+917893112999', '78931 12999', 'https://www.google.com/maps/dir/?api=1&destination=16.5332,80.6358', 46.9, 39.6),
 ('moghalrajpuram', 'Moghalrajpuram', 'Near Jammichettu Centre', '+919849982304', '98499 82304', 'https://www.google.com/maps/dir/?api=1&destination=16.5057,80.6384', 48.4, 46.8),
 ('bhavanipuram', 'Bhavanipuram', 'Crombay Road', '+917893115999', '78931 15999', 'https://www.google.com/maps/dir/?api=1&destination=16.5369,80.5898', 24.0, 51.5),
 ('autonagar', 'Autonagar', 'Ballemvari Street, Murali Nagar', '+919963551970', '99635 51970', 'https://www.google.com/maps/search/?api=1&amp;query=RR+Durbar+Autonagar,+Besides+RR+Chickens,+Ballemvari+Street,+Murali+Nagar,+Auto+Nagar,+Vijayawada,+520007', 63.8, 49.6),
 ('poranki', 'Poranki', 'Vijayawada Road, Poranki', '+917893116999', '78931 16999', 'https://www.google.com/maps/dir/?api=1&destination=16.4801,80.6922', 75.6, 53.6),
]
pins = ''.join(f'<button type="button" class="brm-pin" data-id="{i}" style="left:{x}%;top:{y}%;--i:{n}" aria-label="{nm} \u2013 show branch" aria-pressed="false"><span class="brm-ring"></span><span class="brm-core"></span></button>' for n, (i, nm, ar, tel, ph, d, x, y) in enumerate(OUT))
labs = ''.join(f'<div class="brm-lab" data-id="{i}" style="--i:{n}" aria-hidden="true"><span class="brm-k">Outlet 0{n + 1}</span><span class="brm-n">{nm}</span><a class="brm-go" href="{d}" target="_blank" rel="noopener noreferrer" tabindex="-1">Directions \u2192</a></div>' for n, (i, nm, ar, tel, ph, d, x, y) in enumerate(OUT))
cards = ''.join(f'<article class="brm-card" data-id="{i}" tabindex="-1"><h3>{nm}</h3><p class="brm-area">{ar}, Vijayawada</p><p class="brm-hrs">Open daily \u00b7 11:00 AM \u2013 11:59 PM</p><div class="brm-act"><a class="brm-b g" href="{d}" target="_blank" rel="noopener noreferrer" aria-label="Directions to {nm}">Directions</a><a class="brm-b" href="tel:{tel}" aria-label="Call {nm}">Call</a><a class="brm-b" href="https://wa.me/919849982052?text=Hi%20RR%20Durbar%20{nm},%20I%27d%20like%20to%20know%20more." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp RR Durbar about {nm}">WhatsApp</a></div></article>' for (i, nm, ar, tel, ph, d, x, y) in OUT)
SECTION = ('<section class="brm" id="br-map" data-edit-section="branches-map" aria-labelledby="brm-h"><div class="brm-in"><figure class="brm-fig"><div class="brm-map" id="brmMap" role="group" aria-label="Illustrated night map of Vijayawada with the five RR Durbar outlets">'
 '<div class="brm-art"><picture><img src="assets/rr-branches-map-941.webp" srcset="assets/rr-branches-map-480.webp 480w, assets/rr-branches-map-941.webp 941w" sizes="(min-width:900px) 480px, 100vw" width="941" height="1672" loading="lazy" decoding="async" alt=""></picture><span class="brm-dim"></span><span class="brm-sweep"></span></div>'
 + pins + '<svg class="brm-lines" id="brmLines" aria-hidden="true"><defs><linearGradient id="brmLg" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2d99b"/><stop offset="1" stop-color="#f2d99b" stop-opacity=".35"/></linearGradient></defs></svg>' + labs + '</div></figure><div class="brm-side"><p class="brm-eye">Find the Durbar</p><h2 id="brm-h">Five outlets. One city.</h2><p class="brm-sub">Tap a pin or a card to see an outlet.</p><div class="brm-cards" id="brmCards">' + cards + '</div></div></div></section>\n')

CSS = r'''<style id="rr-branches-map">
/* rr-branches-map START (Step M, 3 Nov). Map art is shown whole, never cropped. Beacons + wine/gold label cards as in the approved map-pins sample. Loops use transform/opacity only; the global section.rr-off rule pauses them offscreen. */
.brm{position:relative;background:radial-gradient(120% 70% at 25% 35%,#2b1013 0,#170b08 62%,#120805 100%);color:#f3e6cf;padding:clamp(44px,6vw,88px) 0;overflow:clip;font-family:'Manrope',Arial,sans-serif}
.brm-in{width:min(1180px,calc(100% - 32px));margin:0 auto;display:grid;gap:26px}
.brm-fig{margin:0;min-width:0}
.brm-map{position:relative;width:min(100%,480px);margin:0 auto;aspect-ratio:941/1672}
.brm-art{position:absolute;inset:0;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),linear-gradient(90deg,transparent 0,#000 14%,#000 86%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),linear-gradient(90deg,transparent 0,#000 14%,#000 86%,transparent 100%);mask-composite:intersect}
.brm-art img{display:block;width:100%;height:100%}
.brm-dim{position:absolute;inset:0;background:#0b0503;opacity:0;pointer-events:none}
.brm-sweep{position:absolute;left:0;right:0;top:0;height:28%;pointer-events:none;background:linear-gradient(180deg,rgba(255,196,110,0),rgba(255,196,110,.12),rgba(255,196,110,0));transform:translateY(-100%);animation:brmSweep 10s linear infinite}
@keyframes brmSweep{from{transform:translateY(-100%)}to{transform:translateY(360%)}}
/* leader lines: thin gold, drawn by the script from each beacon to its label */
.brm-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:2}
.brm-lines line{stroke:url(#brmLg);stroke-width:1.2}
.brm-lines circle{fill:#f2d99b}
/* beacon: gold dot with a pulse ring (44px tap area) */
.brm-pin{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;padding:0;border:0;background:none;cursor:pointer;z-index:3;-webkit-tap-highlight-color:transparent}
.brm-core{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6dc,#f2c76a 45%,#b98322);box-shadow:0 0 0 2px rgba(255,236,190,.9),0 0 14px 4px rgba(255,190,90,.55);transition:scale .25s}
.brm-ring{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:1.5px solid rgba(242,217,155,.8);opacity:0}
.brm-lit .brm-ring{animation:brmRing 2.6s ease-out infinite;animation-delay:calc(var(--i)*-.52s)}
@keyframes brmRing{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
.brm-pin:hover .brm-core,.brm-pin:focus-visible .brm-core,.brm-pin.is-on .brm-core{scale:1.2}
.brm-pin.is-sel .brm-core{scale:1.35}
.brm-pin:focus-visible{outline:none}
.brm-pin:focus-visible .brm-core{box-shadow:0 0 0 2px #fff,0 0 0 5px #e9b85c}
.brm-pin.is-on,.brm-pin.is-sel{z-index:4}
/* label card: wine glass, gold hairline; OUTLET 0N small caps over the name in gold Cormorant 700 (position set by the script) */
.brm-lab{position:absolute;z-index:4;display:flex;flex-direction:column;gap:3px;padding:7px 12px 8px;border-radius:12px;cursor:pointer;white-space:nowrap;background:linear-gradient(180deg,rgba(58,20,28,.95),rgba(28,8,13,.96));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(213,178,108,.55);box-shadow:inset 0 1px 0 rgba(255,236,190,.14),0 8px 22px rgba(0,0,0,.45);transition:border-color .25s,box-shadow .25s,transform .25s}
.brm-k{font:800 8.5px/1 'Manrope',Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,243,225,.8)}
.brm-n{font:700 clamp(16px,4.6vw,20px)/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.015em;color:#ffe4a8;text-shadow:0 0 14px rgba(233,184,92,.45),0 1px 1px rgba(0,0,0,.55)}
.brm-go{display:none;margin-top:3px;font:800 10px/1 'Manrope',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#e9b85c;text-decoration:none}
.brm-lab.is-on{border-color:#e9b85c}
.brm-lab.is-sel{border-color:#e9b85c;box-shadow:inset 0 1px 0 rgba(255,236,190,.2),0 0 0 1px rgba(233,184,92,.5),0 0 24px rgba(233,184,92,.35),0 10px 26px rgba(0,0,0,.5);transform:translateY(-1px)}
.brm-lab.is-sel .brm-go{display:block}
/* city lights on (once), then beacons drop in, then labels and leader lines fade in */
.brm-armed .brm-dim{opacity:.5}.brm-armed .brm-pin,.brm-armed .brm-lab,.brm-armed .brm-lines{opacity:0}
.brm-lit .brm-dim{animation:brmLights 1.2s ease-out both}
@keyframes brmLights{from{opacity:.5}to{opacity:0}}
.brm-lit .brm-pin{animation:brmDrop .55s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(1.2s + var(--i)*120ms)}
@keyframes brmDrop{from{opacity:0;translate:0 -12px}to{opacity:1;translate:0 0}}
.brm-lit .brm-lab{animation:brmFade .5s ease-out both;animation-delay:calc(1.5s + var(--i)*120ms)}
.brm-lit .brm-lines{animation:brmFade .5s ease-out both;animation-delay:1.9s}
@keyframes brmFade{from{opacity:0}to{opacity:1}}
.brm-side{min-width:0}
.brm-eye{margin:0 0 8px;font:800 12px/1.2 'Manrope',Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#e9b85c}
.brm h2{margin:0;font:600 clamp(34px,4.4vw,52px)/1.02 'Cormorant Garamond',Georgia,serif;color:#f2d99b;text-wrap:balance}
.brm-sub{margin:10px 0 20px;font:500 14px/1.5 'Manrope',Arial,sans-serif;color:rgba(243,230,207,.8)}
.brm-cards{display:grid;gap:14px}
.brm-card{background:rgba(36,16,19,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(213,178,108,.35);border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.45);padding:20px 22px;transition:border-color .25s,box-shadow .25s,transform .22s;outline:0}
.brm-card h3{margin:0;font:600 24px/1.1 'Cormorant Garamond',Georgia,serif;color:#f2d99b}
.brm-card p{margin:6px 0 0;font:500 14px/1.45 'Manrope',Arial,sans-serif;color:rgba(243,230,207,.8)}
.brm-act{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.brm-b{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(213,178,108,.5);color:#f2d99b;font:700 13px/1 'Manrope',Arial,sans-serif;letter-spacing:.04em;text-decoration:none;transition:background .2s,transform .2s}
.brm-b.g{background:linear-gradient(135deg,#f5d27a,#d9a640);border-color:transparent;color:#2b1412}
.brm-b:hover{transform:translateY(-1px);background:rgba(233,184,92,.14)}.brm-b.g:hover{background:linear-gradient(135deg,#f9dc98,#e0ac48)}
.brm-b:focus-visible{outline:2px solid #f6d78e;outline-offset:2px}
.brm-card.is-on,.brm-card.is-sel{border-color:#e9b85c;box-shadow:0 0 0 1px #e9b85c,0 18px 40px rgba(0,0,0,.45)}
@media(min-width:900px){
 .brm-in{grid-template-columns:minmax(440px,480px) minmax(0,1fr);gap:clamp(36px,5vw,72px);align-items:start}
 .brm-fig{position:sticky;top:124px}
 .brm-map{width:clamp(440px,calc((100svh - 150px)/1.78),480px);margin:0}
 .brm-side{padding-top:clamp(8px,3vw,40px)}
}
@media(max-width:899px){
 .brm-in{width:100%}.brm-side{padding:0 0 0 16px}
 .brm-fig{padding:0}.brm-map{width:100%;max-width:520px}
 .brm-cards{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 16px 14px 0;margin-left:-16px;padding-left:16px;scroll-padding-left:16px;scrollbar-width:none;overscroll-behavior-x:contain}
 .brm-cards::-webkit-scrollbar{display:none}
 .brm-card{flex:0 0 min(82%,320px);scroll-snap-align:start}
 .brm-side>:not(.brm-cards){padding-right:16px}
}
@media(prefers-reduced-motion:reduce){.brm-sweep,.brm-ring{display:none!important}.brm-dim{display:none}.brm-pin,.brm-lab,.brm-lines,.brm-lit .brm-pin,.brm-lit .brm-lab,.brm-lit .brm-lines{opacity:1!important;animation:none!important}.brm-card,.brm-b,.brm-core,.brm-lab{transition:none}}
/* the old landscape map is removed from the /branches/ hero (its markup stays hidden so the hero script keeps working): the page has one map */
html body #br-locator .stage{display:none!important}
@media(min-width:821px){html body #br-locator .hero-grid{grid-template-columns:minmax(280px,440px) minmax(300px,440px)!important;justify-content:center;column-gap:clamp(32px,6vw,96px)}}
html body #br-locator .olist{grid-auto-flow:row!important;grid-template-rows:none!important;grid-template-columns:1fr!important;max-width:320px}
/* rr-branches-map END */
</style>
'''

JS = r'''<script id="rr-branches-map-js">
/* rr-branches-map-js: lights on once, beacons drop, labels find clear space, beacon <-> label <-> card link. No libraries. Delete with the style block to revert. */
(function(){'use strict';
var sec=document.getElementById('br-map');if(!sec)return;
var RM=matchMedia('(prefers-reduced-motion:reduce)'),map=document.getElementById('brmMap'),svg=document.getElementById('brmLines'),
 pins=[].slice.call(sec.querySelectorAll('.brm-pin')),labs=[].slice.call(sec.querySelectorAll('.brm-lab')),cards=[].slice.call(sec.querySelectorAll('.brm-card')),row=document.getElementById('brmCards'),
 PX={},sel='',GO=16;/* GO = height of the "Directions" line, kept free under every label so a tap never shifts the layout */
pins.forEach(function(p){PX[p.getAttribute('data-id')]=[parseFloat(p.style.left),parseFloat(p.style.top)]});
function by(list,id){for(var i=0;i<list.length;i++)if(list[i].getAttribute('data-id')===id)return list[i]}
function hov(id,on){[by(pins,id),by(labs,id),by(cards,id)].forEach(function(e){if(e)e.classList.toggle('is-on',on)})}
function hit(a,b){return a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h}
/* every label goes to the nearest free spot around its beacon: never over another label, any beacon, or outside the map */
function layout(){
 var W=map.clientWidth,H=map.clientHeight;if(!W||!H)return;
 var placed=[],dots=labs.map(function(l){var q=PX[l.getAttribute('data-id')];return {x:q[0]/100*W-15,y:q[1]/100*H-15,w:30,h:30}}),
  dirs=[[0,-1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[1,1],[-1,1]];
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
function pick(id,fromMap){sel=id;
 pins.forEach(function(p){var on=p.getAttribute('data-id')===id;p.classList.toggle('is-sel',on);p.setAttribute('aria-pressed',on?'true':'false')});
 labs.forEach(function(l){l.classList.toggle('is-sel',l.getAttribute('data-id')===id)});
 cards.forEach(function(c){c.classList.toggle('is-sel',c.getAttribute('data-id')===id)});
 layout();
 var c=by(cards,id);if(fromMap&&c&&row&&row.scrollWidth>row.clientWidth+4&&getComputedStyle(row).display==='flex')row.scrollTo({left:c.offsetLeft-row.offsetLeft-16,behavior:RM.matches?'auto':'smooth'})}
[pins,labs,cards].forEach(function(list,k){list.forEach(function(e){var id=e.getAttribute('data-id');
 e.addEventListener('mouseenter',function(){hov(id,true)});e.addEventListener('mouseleave',function(){hov(id,false)});
 e.addEventListener('focusin',function(){hov(id,true)});e.addEventListener('focusout',function(){hov(id,false)});
 e.addEventListener('click',function(){pick(id,k<2)})})});
[].forEach.call(sec.querySelectorAll('.brm-go'),function(a){a.addEventListener('click',function(ev){ev.stopPropagation()})});
layout();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
if('ResizeObserver' in window)new ResizeObserver(layout).observe(map);else addEventListener('resize',layout);
/* city lights on, once, when the map first comes into view (skipped with reduced motion: the map is simply lit) */
if(RM.matches||!('IntersectionObserver' in window)){sec.classList.add('brm-lit');return}
sec.classList.add('brm-armed');
var io=new IntersectionObserver(function(es){if(!es.some(function(e){return e.isIntersecting}))return;io.disconnect();sec.classList.add('brm-lit')},{threshold:.25});
io.observe(map);
})();
</script>
'''

s = rep(s, '<section class="rr-section brx brx-list" id="br-list"', SECTION + '<section class="rr-section brx brx-list" id="br-list"', '1 section')
s = rep(s, '<style id="rr-motion-b">', CSS + '<style id="rr-motion-b">', '2 style')
s = rep(s, '<script id="rr-whats-new">', JS + '<script id="rr-whats-new">', '3 script')
s = rep(s, "branches: ['br-locator', 'br-list'],", "branches: ['br-locator', 'br-map', 'br-list'],", '4 pageSections')
rs = rep(rs, "branches: { title: 'Branches', sections: ['br-locator', 'br-list'] },", "branches: { title: 'Branches', sections: ['br-locator', 'br-map', 'br-list'] },", '5 routes.js')
for w in (480, 941):
    if not pathlib.Path(f'tools/branches/img/rr-branches-map-{w}.webp').exists(): bad.append(f'6 asset {w} missing in tools/branches/img/')
print('\n'.join(log))
if bad: print('STOP:\n' + '\n'.join(bad)); sys.exit(1)
if WRITE:
    shutil.copy2('src/site.html', 'src/site.html.bak-brmap'); shutil.copy2('cms/routes.js', 'cms/routes.js.bak-brmap')
    p.write_text(s, encoding='utf-8'); r.write_text(rs, encoding='utf-8')
    for w in (480, 941): shutil.copy2(f'tools/branches/img/rr-branches-map-{w}.webp', f'public/assets/rr-branches-map-{w}.webp')
    print('PATCHED src/site.html, cms/routes.js; assets copied to public/assets/')
else: print('dry run only, nothing written (use --write)')

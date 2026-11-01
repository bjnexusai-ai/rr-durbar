#!/usr/bin/env python3
"""Branches design B (1 Nov, owner's choice): cream page, the illustrated map on its own dark plate, the night skyline as a
full-width band under the content (whole bridge visible, no longer hidden behind the outlet card), and warm string lights along
the bridge cables that switch on one by one when the band scrolls into view, then twinkle gently.
Phones: map moves up under the heading, the skyline is framed on the bridge.
Scoped to #br-locator (Branches page top) only. Reduced motion: bulbs shown lit, no movement. The twinkle pauses off screen (motion A).
Exact-match: STOP unless </body> occurs once. Idempotent. Run from the repo root. Revert: restore src/site.html.bakbb"""
import pathlib, sys
p = pathlib.Path("src/site.html")
if not p.exists(): sys.exit("STOP: run from the repo root (src/site.html not found)")
s = p.read_text(encoding="utf-8")
if 'id="rr-branches-b"' in s: print("already done (nothing to change)"); sys.exit(0)
if s.count("</body>") != 1: sys.exit("STOP: </body> found %d times (need 1)" % s.count("</body>"))
for need in ('id="skyline"', 'id="br-locator"', 'class="stage"'):
    if need not in s: sys.exit("STOP: %s not found (branches page changed?)" % need)
CSS = """/* rr-branches-b: cream page, map on a dark plate, night skyline band with the lit bridge */
html body #br-locator{background:#f8f0e5!important}
html body #br-locator::before,html body #br-locator::after{display:none!important}
html body #br-locator .deco,html body #br-locator .leaves,html body #br-locator .candle,html body #br-locator .bowl{display:none!important}
html body #br-locator h1{color:#580c18!important}
html body #br-locator .brh-kicker{color:#8a5a12!important}
html body #br-locator .lede{color:#3a1408!important}
html body #br-locator .olist,html body #br-locator .olist button{color:#3a1408!important}
html body #br-locator .btn-ghost{color:#881929!important;border-color:rgba(136,25,41,.55)!important}
html body #br-locator .stage{background:radial-gradient(80% 70% at 50% 50%,#2a0a10 0%,#0e0306 100%);border-radius:26px;padding:12px;box-shadow:0 24px 50px rgba(58,20,8,.32),inset 0 0 0 1px rgba(209,171,86,.25)}
html body #br-locator .mapimg{filter:drop-shadow(0 0 18px rgba(240,190,90,.30))!important}
/* the night band: skyline sits on its own dark strip that fades up into the cream */
html body #br-locator .skyline{background:linear-gradient(180deg,#f8f0e5 0%,#d9b99a 8%,#6a1420 20%,#24050b 32%,#110003 42%,#0b0002 100%)!important;-webkit-mask-image:none!important;mask-image:none!important}
html body #br-locator .skyline::before,html body #br-locator .skyline::after{display:none!important}
html body #br-locator .skyline img{-webkit-mask-image:linear-gradient(180deg,transparent 0,transparent 26%,#000 46%)!important;mask-image:linear-gradient(180deg,transparent 0,transparent 26%,#000 46%)!important}
html body #br-locator .map{width:92%!important;margin:0 auto!important}
html body #br-locator .map::before{display:none!important}
html body #br-locator .sign{color:#f6d78e!important;text-shadow:0 2px 10px rgba(0,0,0,.7)}
@media(min-width:701px){
 html body section#br-locator#br-locator{padding-bottom:calc(33.33vw - 110px)!important;min-height:0!important;max-height:none!important;height:auto!important}
 html body #br-locator .sign{display:none!important}
 html body #br-locator .skyline{height:auto!important;min-height:0!important;transform:none!important}
 html body #br-locator .skyline img{width:100%!important;margin-left:0!important;transform:none!important}
}
@media(max-width:700px){
 html body #br-locator .hero-grid{display:flex!important;flex-direction:column!important}
 html body #br-locator .intro{display:contents!important}
 html body #br-locator .brh-kicker{order:1}html body #br-locator h1{order:2}html body #br-locator .lede{order:3}
 html body #br-locator .stage{order:4;margin:8px 0 6px!important;width:100%!important;max-width:none!important}
 html body #br-locator .olist{order:5}html body #br-locator .btn-ghost{order:6}
 html body #br-locator .hero-grid>*:not(.intro):not(.stage){order:7}
 html body section#br-locator#br-locator{padding-bottom:190px!important}
 html body #br-locator .sign{color:#580c18!important;text-shadow:none!important}
 html body #br-locator .skyline{height:auto!important;min-height:0!important;transform:none!important}
 html body #br-locator .skyline img{width:240%!important;margin-left:-122%!important;transform:none!important}
}
/* bridge string lights */
html body #br-locator .rr-bulbs{position:absolute;pointer-events:none;z-index:2;overflow:visible}
html body #br-locator .rr-bulbs .b{opacity:.15}
html body #br-locator .rr-bulbs .h{opacity:0}
@media(prefers-reduced-motion:no-preference){
 html body #br-locator .rr-bulbs.on .b{animation:rrBulbOn .5s cubic-bezier(.16,1,.3,1) forwards var(--d),rrBulbTw 3.4s ease-in-out infinite calc(var(--d) + .7s)}
 html body #br-locator .rr-bulbs.on .h{animation:rrHaloOn .9s ease-out forwards var(--d),rrBulbTw 3.4s ease-in-out infinite calc(var(--d) + .9s)}
}
@media(prefers-reduced-motion:reduce){html body #br-locator .rr-bulbs .b{opacity:1}html body #br-locator .rr-bulbs .h{opacity:.8}}
@keyframes rrBulbOn{to{opacity:1}}
@keyframes rrHaloOn{to{opacity:.85}}
@keyframes rrBulbTw{0%,100%{opacity:1}50%{opacity:.5}}
"""
JS = """/* rr-branches-b: warm string lights along the bridge cables in the skyline photo (coordinates are in the photo's own pixels) */
(function(){var sky=document.getElementById('skyline'),img=sky&&sky.querySelector('img');if(!img)return;
var NS='http://www.w3.org/2000/svg',W=1600,H=533;
var C=[[830,262,1020,330,1210,247],[1230,247,1350,326,1469,233],[1491,233,1545,268,1600,272]];
var sv=document.createElementNS(NS,'svg');sv.setAttribute('class','rr-bulbs');sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.setAttribute('aria-hidden','true');sv.setAttribute('preserveAspectRatio','none');
sv.innerHTML='<defs><radialGradient id="rrbG"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient><radialGradient id="rrbC"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#e09a2a"/></radialGradient></defs>';
var k=0,g=document.createElementNS(NS,'g');
C.forEach(function(c){var n=Math.round(Math.abs(c[4]-c[0])/16);for(var i=1;i<n;i++){var t=i/n,u=1-t,x=u*u*c[0]+2*u*t*c[2]+t*t*c[4],y=u*u*c[1]+2*u*t*c[3]+t*t*c[5]+2.5,d=(k++*0.035).toFixed(3)+'s';
 var h=document.createElementNS(NS,'circle');h.setAttribute('cx',x);h.setAttribute('cy',y);h.setAttribute('r',11);h.setAttribute('fill','url(#rrbG)');h.setAttribute('class','h');h.style.setProperty('--d',d);g.appendChild(h);
 var b=document.createElementNS(NS,'circle');b.setAttribute('cx',x);b.setAttribute('cy',y);b.setAttribute('r',2.6);b.setAttribute('fill','url(#rrbC)');b.setAttribute('class','b');b.style.setProperty('--d',d);g.appendChild(b)}});
sv.appendChild(g);sky.appendChild(sv);
function fit(){sv.style.left=img.offsetLeft+'px';sv.style.top=img.offsetTop+'px';sv.style.width=img.offsetWidth+'px';sv.style.height=img.offsetHeight+'px';
 var tf=getComputedStyle(img).transform;sv.style.transform=tf==='none'?'':tf;sv.style.transformOrigin=getComputedStyle(img).transformOrigin}
fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(img);img.addEventListener('load',fit);addEventListener('resize',fit);
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){sv.classList.add('on');io.disconnect()}},{threshold:.25});io.observe(sv)}else sv.classList.add('on');
})();
"""
BLOCK = '<style id="rr-branches-b">' + CSS + '</style>\n<script id="rr-branches-b-js">' + JS + '</script>\n'
pathlib.Path("src/site.html.bakbb").write_text(s, encoding="utf-8")
p.write_text(s.replace("</body>", BLOCK + "</body>"), encoding="utf-8")
print("PATCHED: branches design B + bridge string lights (backup src/site.html.bakbb)")

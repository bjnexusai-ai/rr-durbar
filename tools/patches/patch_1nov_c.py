#!/usr/bin/env python3
"""1 Nov, part C (on top of part B). Dry run unless --write. Any unexpected count = STOP, nothing written.
  24. General number 77020 77999 -> 98499 82052 everywhere (site, checkout pages, 404). Outlet staff numbers unchanged.
  25. Signature cards: plain gold + (no white circle).   26. Home outlets section: no 01-06 numbers.
  27. Home hero: cinematic image reveals.   28. About Us: new reveal.   29. Menu: 3D dish reveal.   30. Catering script text."""
import sys, re, pathlib
WRITE = '--write' in sys.argv
files = {'src/site.html': None, 'public/checkout/index.html': None, 'public/checkout/v2/index.html': None, 'public/404.html': None}
for f in files: files[f] = pathlib.Path(f).read_text(encoding='utf-8')
bad = []; log = []
s = files['src/site.html']

def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')

# 24. number change (all formats)
NUM = [('+917702077999', '+919849982052'), ('917702077999', '919849982052'), ('+91 77020 77999', '+91 98499 82052'),
       ('77020 77999', '98499 82052'), ('7702077999', '9849982052')]
def renum(t):
    n = 0
    for a, b in NUM: n += t.count(a); t = t.replace(a, b)
    return t, n
s, n = renum(s)
if n != 39: bad.append(f'24 number in site: found {n}, expected 39')
else: log.append('24 number in site: ok (39)')
for f in ['public/checkout/index.html', 'public/checkout/v2/index.html', 'public/404.html']:
    files[f], n = renum(files[f]); log.append(f'24 number in {f}: {n}')

# 25. Signature cards: plain gold + (no white circle), tap area kept 44px; 'Added' shows a gold tick, then back to +.
rep('html body #bestsellers .rr-food-card.rr-signature-card .rr-qadd{background:#fff!important;color:#5a0f18!important;border-color:#fff!important;font-weight:800!important}',
    'html body #bestsellers .rr-food-card.rr-signature-card .rr-qadd{background:transparent!important;color:#f0c86e!important;border-color:transparent!important;box-shadow:none!important;font-weight:800!important}', '25 plus no circle')
CHECK = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
rep("var old=btn.dataset.l||btn.textContent;btn.dataset.l=old;btn.classList.add('rr-done');btn.textContent='Added';",
    "var old=btn.dataset.l||btn.textContent;btn.dataset.l=old;btn.classList.add('rr-done');var sig=btn.closest&&btn.closest('.rr-signature-card');if(sig){btn.innerHTML='" + CHECK + "'}else{btn.textContent='Added'}",
    '25 added tick')
rep("btn._t=setTimeout(function(){btn.classList.remove('rr-done');btn.innerHTML=PLUS+' Add'},1300);",
    "btn._t=setTimeout(function(){btn.classList.remove('rr-done');btn.innerHTML=sig?PLUS:PLUS+' Add'},1300);", '25 restore plus')

# 30. Catering script line: the writing reveal clipped the swash of the G. Clip box now extends past the letters.
rep("color:#B7791F;clip-path:inset(0 100% 0 0);", "color:#B7791F;clip-path:inset(-30% 100% -45% -14%);", '30 script start')
rep('@keyframes cxWrite{to{clip-path:inset(0 0 0 0)}}', '@keyframes cxWrite{to{clip-path:inset(-30% -10% -45% -14%)}}', '30 script end')

# 28. About Us: replaces the side-opening 'doors' with the facade lighting up floor by floor: the photo is revealed from
#     the street up behind a rising line of gold light, while the camera eases back; then the board light passes.
rep(' html.rr-js #rraExt:not(.ext-in) .rra-frame{clip-path:inset(-15% 50% -15% 50%);animation:rrExtSafeC 0s 3.5s forwards}',
    ' html.rr-js #rraExt.ext-armed:not(.ext-in) .rra-frame{clip-path:inset(100% -15% -15% -15%);transform:scale(1.07)}', '28 closed')
rep(' html.rr-js #rraExt:not(.ext-in) .ext-dusk{opacity:1;animation:rrExtSafeO 0s 3.5s forwards}',
    ' html.rr-js #rraExt.ext-armed:not(.ext-in) .ext-dusk{opacity:1}', '28 dusk closed')
rep(' #rraExt.ext-in .rra-frame{clip-path:inset(-15% -15% -15% -15%);transition:clip-path 1.2s cubic-bezier(.16,1,.3,1)}',
    ' #rraExt.ext-in .rra-frame{clip-path:inset(-15% -15% -15% -15%);transform:none;transition:clip-path 1.7s cubic-bezier(.65,.05,.25,1),transform 2.4s cubic-bezier(.16,1,.3,1)}\n'
    ' #rraExt .ext-lift{position:absolute;inset:0;z-index:2;pointer-events:none;transform:translateY(100%);opacity:0}\n'
    ' #rraExt .ext-lift b{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#e7b85c 18%,#fff1c8 50%,#e7b85c 82%,transparent);box-shadow:0 0 14px 3px rgba(255,196,96,.55),0 0 46px 10px rgba(255,170,60,.22)}\n'
    ' #rraExt.ext-in .ext-lift{animation:rrExtLift 1.7s cubic-bezier(.65,.05,.25,1) forwards}', '28 open + light line')
rep(' #rraExt.ext-in .ext-dusk{opacity:0;transition:opacity 1.1s cubic-bezier(.16,1,.3,1) .15s}',
    ' #rraExt.ext-in .ext-dusk{opacity:0;transition:opacity 1.9s cubic-bezier(.16,1,.3,1) .2s}', '28 dusk lifts slower')
rep('animation:rrExtSweep 1.15s cubic-bezier(.3,.6,.4,1) .95s forwards', 'animation:rrExtSweep 1.15s cubic-bezier(.3,.6,.4,1) 1.7s forwards', '28 board light after')
rep('animation:rrExtGlow 1s ease-out 1.9s forwards', 'animation:rrExtGlow 1s ease-out 2.5s forwards', '28 glow after')
rep('@media(prefers-reduced-motion:reduce){#rraExt .ext-sweep::after{opacity:1}}',
    '@media(prefers-reduced-motion:reduce){#rraExt .ext-sweep::after{opacity:1}#rraExt .ext-lift{display:none}}\n'
    '@keyframes rrExtLift{0%{transform:translateY(100%);opacity:0}8%{opacity:1}85%{opacity:1}100%{transform:translateY(0);opacity:0}}\n'
    '@media(min-width:981px){#rraExt .ext-lift b{-webkit-mask-image:linear-gradient(90deg,transparent 0,transparent 8%,#000 34%);mask-image:linear-gradient(90deg,transparent 0,transparent 8%,#000 34%)}}', '28 keyframes')
rep('<i class="ext-sweep" aria-hidden="true"></i></span></figure>', '<i class="ext-sweep" aria-hidden="true"></i></span><i class="ext-lift" aria-hidden="true"><b></b></i></figure>', '28 light markup')

# 27a. Older hero layers pinned the photo's clip-path with !important, which blocks any reveal. Edited in place.
rep('.slide.active .slide-photo{animation:none!important;clip-path:inset(0)!important;transform:none!important}', '.slide.active .slide-photo{animation:none!important;transform:none!important}', '27a old clip lock 1')
rep('html body #home.hero .slide .slide-photo{animation:none!important;transition:none!important;transform:none!important;translate:none!important;filter:none!important;clip-path:none!important;',
    'html body #home.hero .slide .slide-photo{animation:none!important;transition:none!important;transform:none!important;translate:none!important;filter:none!important;', '27a old clip lock 2')

# 26. Home outlets section: no 01-06 numbers.  27/29 styles and scripts follow.
HERO_MENU_CSS = r"""
/* 26 */
#outlets .ot-no{display:none!important}
html body #bestsellers .rr-food-card.rr-signature-card .rr-qadd svg{width:28px!important;height:28px!important;filter:drop-shadow(0 1px 3px rgba(0,0,0,.55))}
html body #bestsellers .rr-food-card.rr-signature-card .rr-qadd:active{transform:scale(.9)}
/* 27. Home hero: each photo opens from its focal point like an iris, ringed by a thin band of gold light, while the
   camera settles; a warm flash at the centre; the words rise out of a mask one after another. Plays on first load
   and on every slide change. Transform/opacity/clip-path only. */
@media(prefers-reduced-motion:no-preference){
 html body #home.hero .slide.active{opacity:1!important;transition:none!important}
 html body #home.hero.hero .slide.active .slide-photo{animation:rrIris 1.35s cubic-bezier(.7,0,.2,1) both!important}
 html body #home.hero .slide.active .rr-iris-rim{animation:rrIrisRim 1.35s cubic-bezier(.7,0,.2,1) both}
 html body #home.hero .slide.active .rr-iris-glow{animation:rrIrisGlow 1.5s ease-out both}
 html body #home.hero .slide.active .hero-copy>*{animation:rrHeroRise .95s cubic-bezier(.16,1,.3,1) both!important}
 html body #home.hero .slide.active .hero-copy>.hero-eyebrow{animation-delay:.42s!important}
 html body #home.hero .slide.active .hero-copy>.rr-rule{animation-delay:.48s!important}
 html body #home.hero .slide.active .hero-copy>.hero-title{animation-delay:.55s!important}
 html body #home.hero .slide.active .hero-copy>.hero-desc{animation-delay:.7s!important}
 html body #home.hero .slide.active .hero-copy>.hero-actions{animation-delay:.82s!important}
 html body #home.hero .slide.active .hero-copy>.slide-index{animation-delay:.92s!important}
}
#home .rr-iris-rim,#home .rr-iris-glow{position:absolute;pointer-events:none;opacity:0}
#home .rr-iris-rim{background:radial-gradient(circle at var(--ix,60%) var(--iy,52%),#fff1c4 0,#f2c86a 40%,#b8862b 100%);z-index:0}
#home .rr-iris-glow{background:radial-gradient(circle at var(--ix,60%) var(--iy,52%),rgba(255,214,140,.75) 0,rgba(255,180,80,.28) 18%,transparent 46%);mix-blend-mode:screen}
#home .slide-photo,#home .rr-iris-rim,#home .rr-iris-glow{--ix:var(--fx,60%);--iy:var(--fy,52%)}
@media(max-width:700px){#home .slide-photo,#home .rr-iris-rim,#home .rr-iris-glow{--ix:50%;--iy:46%}}
@keyframes rrIris{0%{clip-path:circle(0% at var(--ix,60%) var(--iy,52%))}100%{clip-path:circle(150% at var(--ix,60%) var(--iy,52%))}}
@keyframes rrIrisRim{0%{opacity:1;clip-path:circle(.45% at var(--ix,60%) var(--iy,52%))}88%{opacity:1}100%{opacity:0;clip-path:circle(150.45% at var(--ix,60%) var(--iy,52%))}}
@keyframes rrIrisGlow{0%{opacity:0}25%{opacity:1}100%{opacity:0}}
@keyframes rrHeroRise{0%{opacity:0;transform:translateY(34px);clip-path:inset(0 0 100% 0)}60%{opacity:1}100%{opacity:1;transform:none;clip-path:inset(-30% -6% -40% -6%)}}
/* 29. Menu: dishes rise into place in 3D (tilted back, then settling flat) one after another as you scroll; the photo
   is unveiled from the bottom and zooms gently; desktop cards tilt toward the pointer with a moving gold glare. */
html.rr-js #m52.m-armed .m52-t:not(.m-in){opacity:0;transform:perspective(1000px) rotateX(22deg) translateY(70px) scale(.92)!important}
html.rr-js #m52.m-armed .m52-t:not(.m-in) img{clip-path:inset(100% 0 0 0);transform:scale(1.28)!important}
html.rr-js #m52.m-armed .m52-t:not(.m-in) :is(.nm,.m52-plus,.m52-dot){opacity:0;transform:translateY(14px)}
#m52.m-armed .m52-t{animation:none!important;transform-origin:50% 100%}
#m52.m-armed .m52-t.m-go{transition:opacity .7s ease-out var(--md,0s),transform 1.05s cubic-bezier(.16,1,.3,1) var(--md,0s)!important}
#m52.m-armed .m52-t.m-go img{transition:clip-path 1.1s cubic-bezier(.65,.05,.25,1) calc(var(--md,0s) + .12s),transform 1.6s cubic-bezier(.16,1,.3,1) calc(var(--md,0s) + .12s)!important;clip-path:inset(0 0 0 0)}
#m52.m-armed .m52-t.m-go :is(.nm,.m52-plus,.m52-dot){transition:opacity .5s ease-out calc(var(--md,0s) + .55s),transform .7s cubic-bezier(.16,1,.3,1) calc(var(--md,0s) + .55s)}
#m52 .m52-t .m-glare{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(circle at var(--gx,50%) var(--gy,30%),rgba(255,236,190,.38),transparent 55%);transition:opacity .35s ease-out}
@media(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
 html body #m52 .m52-t.m-in.m-tilt{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-6px) scale(1.02)!important;transition:transform .12s linear!important;box-shadow:0 30px 56px rgba(74,15,18,.42)!important;z-index:3}
 html body #m52 .m52-t.m-in.m-tilt .m-glare{opacity:1}
}
@media(prefers-reduced-motion:reduce){html.rr-js #m52.m-armed .m52-t:not(.m-in),html.rr-js #m52.m-armed .m52-t:not(.m-in) img,html.rr-js #m52.m-armed .m52-t:not(.m-in) :is(.nm,.m52-plus,.m52-dot){opacity:1;transform:none!important;clip-path:none}}
"""
rep('@keyframes rrExtGlow{to{opacity:1}}', '@keyframes rrExtGlow{to{opacity:1}}' + HERO_MENU_CSS, '26-29 styles')

HERO_MENU_JS = r"""<script id="rr-1nov-c-js">/* 27: gold rim + glow layers for each hero slide, sized to its photo. 29: menu 3D reveal and pointer tilt. */
(function(){
var slides=[].slice.call(document.querySelectorAll('#home .slide'));
function sync(s){var ph=s.querySelector('.slide-photo'),r=s._rr;if(!ph||!r)return;var t=ph.offsetTop+'px',l=ph.offsetLeft+'px',w=ph.offsetWidth+'px',h=ph.offsetHeight+'px';r.forEach(function(e){e.style.top=t;e.style.left=l;e.style.width=w;e.style.height=h})}
slides.forEach(function(s){var ph=s.querySelector('.slide-photo');if(!ph)return;var rim=document.createElement('i'),gl=document.createElement('i');rim.className='rr-iris-rim';gl.className='rr-iris-glow';rim.setAttribute('aria-hidden','true');gl.setAttribute('aria-hidden','true');
 var fx=s.style.getPropertyValue('--fx'),fy=s.style.getPropertyValue('--fy');if(fx){rim.style.setProperty('--fx',fx);gl.style.setProperty('--fx',fx)}if(fy){rim.style.setProperty('--fy',fy);gl.style.setProperty('--fy',fy)}
 s.insertBefore(rim,ph);ph.after(gl);s._rr=[rim,gl];sync(s)});
function all(){slides.forEach(sync)}addEventListener('resize',all);addEventListener('load',all);if(window.ResizeObserver&&slides[0])new ResizeObserver(all).observe(slides[0]);
})();
(function(){
var m=document.getElementById('m52');if(!m||!('IntersectionObserver' in window))return;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
m.classList.add('m-armed');
var io=new IntersectionObserver(function(es){var vis=es.filter(function(e){return e.isIntersecting}).map(function(e){return e.target});
 vis.sort(function(a,b){var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return (ra.top-rb.top)||(ra.left-rb.left)});
 vis.forEach(function(t,i){io.unobserve(t);t.style.setProperty('--md',Math.min(i*.09,.45)+'s');t.classList.add('m-go');requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('m-in')})});
  setTimeout(function(){t.classList.remove('m-go');t.style.removeProperty('--md')},2400)})},{threshold:.12,rootMargin:'0px 0px -4% 0px'});
function arm(t){if(t.dataset.m3)return;t.dataset.m3='1';if(!t.querySelector('.m-glare')){var g=document.createElement('i');g.className='m-glare';g.setAttribute('aria-hidden','true');t.appendChild(g)}
 if(reduce){t.classList.add('m-in');return}io.observe(t)}
function scan(){[].forEach.call(m.querySelectorAll('.m52-t'),arm)}scan();
new MutationObserver(function(){scan()}).observe(m,{childList:true,subtree:true});
if(reduce||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
m.addEventListener('pointermove',function(e){var t=e.target.closest&&e.target.closest('.m52-t.m-in');if(!t)return;var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 t.classList.add('m-tilt');t.style.setProperty('--ry',((x-.5)*12).toFixed(2)+'deg');t.style.setProperty('--rx',((.5-y)*10).toFixed(2)+'deg');t.style.setProperty('--gx',(x*100).toFixed(1)+'%');t.style.setProperty('--gy',(y*100).toFixed(1)+'%')});
m.addEventListener('pointerout',function(e){var t=e.target.closest&&e.target.closest('.m52-t');if(t&&!t.contains(e.relatedTarget)){t.classList.remove('m-tilt')}});
})();
</script>
<script id="rr-branches-b-js">/* about-us exterior reveal"""
rep('<script id="rr-branches-b-js">/* about-us exterior reveal', HERO_MENU_JS, '27-29 scripts')

print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE:
    files['src/site.html'] = s
    for f, t in files.items(): pathlib.Path(f).write_text(t, encoding='utf-8')
    print('PATCHED src/site.html + checkout pages + 404')
else: print('dry run OK (add --write)')

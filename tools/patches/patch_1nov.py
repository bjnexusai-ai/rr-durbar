#!/usr/bin/env python3
"""1 Nov fixes to src/site.html (from Alekya's phone screenshots). Dry run unless --write.
Every anchor must match exactly once, else STOP and nothing is written.
  1. Numbers: Cormorant Garamond showed old-style figures (1 looked like I, 4/9 dropped below the line).
     "lnum" on every element with !important (a plain inherited value is reset by each font: shorthand).
  2. Wall of Honours at 621-1020 px (phone in 'Desktop site' mode): trophy sat alone on the left with an empty
     right column. Trophy now centred, stats + plaques capped and centred.
  3. Signature cards: the gold hover ring stayed on after a tap on phones. Hover ring only on real hover devices.
  4. Signature cards: thin box border around the category label (e.g. SPECIAL BIRYANI) removed.
  5. Signature cards on phones: photo had its own rounded bottom corners (cream showed in the corners). Square now.
  6. Plus button missing on Chicken Fry Biryani, Chicken Dum Biryani, Chicken Lollipops, Vankay Biryani: their display
     names (task 1.3) did not match the Rista items. Linked to the items whose photo they show: Murgh Musallam Biryani,
     Murgh Mehfil Biryani, Naatu Naatu Special Wings (8 pcs), Gutti Vankaya Pulao. Chicken & Paneer Tikka has no item.
  7. Branches map on phones: the 'Vijayawada' city pill collided with the outlet labels. Hidden on phones (dome stays).
  8. Home hero on a phone in 'Desktop site' mode (about 980 px wide, very tall): the hero filled the whole tall screen,
     so the top half was empty blur. Height capped at 130vw above 760 px. Phones and normal desktops unchanged.
  9-12. Branches page: same border on every outlet card, no 01-05 numbers, outlet count 5 everywhere, clean bridge strip.
  13-14. Policies/history say five outlets; /locations/ page without numbers.
  15. Top-down map with re-placed pins.  16. About Us exterior photo with a one-time doors-open reveal.
  17. Maps without overlapping labels; pickup without 1-5.  18. Client answers: outlet call numbers, 11:59 PM closing,
      Autonagar hours, Facebook, Patamata FSSAI removed. WhatsApp chat and general call number unchanged.
  19. Google Business names on outlet cards.  20. AC + parking, pickup 30-45 min, catering from all outlets.
  Needs the new files public/assets/map-topdown.webp, rr-exterior.webp, rr-exterior-760.webp."""
import sys, pathlib
WRITE = '--write' in sys.argv
p = pathlib.Path('src/site.html'); s = p.read_text(encoding='utf-8'); bad = []; log = []

def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')

rep('''body{font-family:'Manrope',Arial,sans-serif;color:var(--t-ink);font-feature-settings:"kern","liga"}''',
    '''body{font-family:'Manrope',Arial,sans-serif;color:var(--t-ink);font-feature-settings:"kern","liga","lnum"}\n*,*::before,*::after{font-feature-settings:"kern","liga","lnum"!important}''',
    '1 lining numbers')
rep('html body #stats .rr-stats .rr-stat strong{font:600 clamp(56px,7vw,92px)/1 "Cormorant Garamond",Georgia,serif!important;',
    'html body #stats .rr-stats .rr-stat strong{font:600 clamp(56px,7vw,92px)/1 "Cormorant Garamond",Georgia,serif!important;font-feature-settings:"kern","liga","lnum"!important;',
    '1b lining numbers (About stats)')

rep('#honours .wh-right{grid-column:1/-1}#honours .wh-case{max-width:260px}#honours .wh-grid{align-items:start}}',
    '#honours .wh-right{grid-column:1/-1;width:100%;max-width:720px;justify-self:center}#honours .wh-case{max-width:260px;grid-column:1/-1;justify-self:center}#honours .wh-grid{align-items:start}}',
    '2 honours mid widths')

rep('html body #bestsellers .rr-food-card.rr-signature-card:hover{transform:none!important;box-shadow:0 24px 52px rgba(74,15,18,.4),0 0 0 2px #d9a83a!important}',
    '@media(hover:hover){html body #bestsellers .rr-food-card.rr-signature-card:hover{transform:none!important;box-shadow:0 24px 52px rgba(74,15,18,.4),0 0 0 2px #d9a83a!important}}',
    '3 hover ring only with a mouse')

rep('html body #bestsellers .rr-food-card.rr-signature-card .rr-edit-label{margin:0!important;padding:0!important;display:none!important;',
    'html body #bestsellers .rr-food-card.rr-signature-card .rr-edit-label{margin:0!important;padding:0!important;border:0!important;display:none!important;',
    '4 label box border')

rep('html body #bestsellers .sig-bento.sig-bento.sig-bento>.rr-food-card.rr-signature-card .rr-media img{height:100%!important}',
    'html body #bestsellers .sig-bento.sig-bento.sig-bento>.rr-food-card.rr-signature-card .rr-media img{height:100%!important;border-radius:0!important}',
    '5 square photo corners (phone)')

rep("var ALIAS={'butta biryani':'non veg butta biryani',",
    "var ALIAS={'chicken fry biryani':'murgh musallam biryani','chicken dum biryani':'murgh mehfil biryani','chicken lollipops':'naatu naatu special wings (8 pcs)','vankay biryani':'gutti vankaya pulao','butta biryani':'non veg butta biryani',",
    '6 plus button aliases')
# 6b. 'Naatu Naatu Wings' card is Guntur Chilli Chicken (client display names, task 1.3), not the wings that 'Chicken Lollipops' now uses.
rep("'naatu naatu wings':'naatu naatu special wings (8 pcs)',", "'naatu naatu wings':'guntur chilli chicken',", '6b naatu naatu wings card')

rep(' html body #br-locator .stage{order:4;margin:8px 0 6px!important;width:100%!important;max-width:none!important}\n',
    ' html body #br-locator .stage{order:4;margin:8px 0 6px!important;width:100%!important;max-width:none!important}\n html body #br-locator .hub span{display:none!important}\n',
    '7 map city pill (phone)')

rep('\n.hero{height:100svh!important;min-height:640px}\n',
    '\n.hero{height:min(100svh,130vw)!important;min-height:640px}\n@media(min-width:761px) and (orientation:portrait){html body #home.hero.hero .slide .slide-photo .hero-image{object-position:50% 100%!important}}\n',
    '8 hero height on tall wide screens')

# 9. Branches page: the selected outlet card had a thick gold ring, the others did not. All cards look the same now.
rep('body #br-list .brx-grid>.brx-card.is-selected,body #br-list .brx-grid>.brx-card.is-selected:hover{border-color:#d9a83a!important;box-shadow:0 0 0 3px #d9a83a,0 20px 40px rgba(110,64,8,.28)!important}',
    'body #br-list .brx-grid>.brx-card.is-selected{translate:none!important;border-color:#e3d2ac!important;box-shadow:0 10px 28px rgba(88,8,16,.14)!important}body #br-list .brx-grid>.brx-card.is-selected:hover{border-color:#e3d2ac!important;box-shadow:0 20px 42px rgba(88,8,16,.24)!important}',
    '9 selected card ring')
rep('body #br-list .brx-card.is-selected .brx-num{background:#f0c24e!important;box-shadow:0 0 0 3px rgba(217,168,58,.45)}', '', '9b selected number ring')

# 10. Outlet numbers (01 to 05) removed: branch cards and the outlet list beside the map.
rep('.brx-num{width:34px!important;height:34px!important;', '.brx-num{display:none!important;width:34px!important;height:34px!important;', '10 card numbers')
rep('#br-locator .olist .n{flex:none;', '#br-locator .olist .n{display:none!important;flex:none;', '10b list numbers')

# 11. Outlet count shown as 5 (Patamatalanka is not shown on the site). Policies/legal text and the 'grows to 6' history line are left as they are.
for a, b, n in [
    ('<i data-to="6">6</i></b><span>Outlets</span>', '<i data-to="5">5</i></b><span>Outlets</span>', 1),
    ('<strong data-count="6" data-from="0">6</strong><span class="tn-l1">Outlets</span>', '<strong data-count="5" data-from="0">5</strong><span class="tn-l1">Outlets</span>', 1),
    ('<b>Our six outlets</b>', '<b>Our five outlets</b>', 1),
    ('<div class="rr-stat"><strong>6</strong><span>Outlets across Vijayawada</span>', '<div class="rr-stat"><strong>5</strong><span>Outlets across Vijayawada</span>', 1),
    ('Six outlets. One royal table.', 'Five outlets. One royal table.', 1),
    ('<li><b>6 outlets</b><span>Across Vijayawada</span>', '<li><b>5 outlets</b><span>Across Vijayawada</span>', 1),
    ('<h3>Six outlets</h3><p>Six confirmed RR Durbar outlets across Vijayawada.', '<h3>Five outlets</h3><p>Five RR Durbar outlets across Vijayawada.', 1),
    ('Visit any of our six outlets in Vijayawada', 'Visit any of our five outlets in Vijayawada', 1),
    ('Six Outlets.<br>One Royal Experience.', 'Five Outlets.<br>One Royal Experience.', 1),
    ('<em>served across 6 outlets.</em>', '<em>served across 5 outlets.</em>', 1),
    ('served across 6 outlets in Vijayawada.', 'served across 5 outlets in Vijayawada.', 1),
    ('>6 outlets across Vijayawada</a>', '>5 outlets across Vijayawada</a>', 1),
    ('six confirmed outlets across Vijayawada.', 'five outlets across Vijayawada.', 1),
    ('<h3>Six Vijayawada outlets</h3><p>RR Durbar currently operates six confirmed outlets across the city.', '<h3>Five Vijayawada outlets</h3><p>RR Durbar currently operates five outlets across the city.', 1),
    ('runs six outlets across Vijayawada', 'runs five outlets across Vijayawada', 1),
    ('across six Vijayawada outlets', 'across five Vijayawada outlets', 3),
    ('Six outlets with addresses', 'Five outlets with addresses', 1),
    ('Our 6 Outlets in Vijayawada', 'Our 5 Outlets in Vijayawada', 1),
    ('Six outlets across Vijayawada.', 'Five outlets across Vijayawada.', 1),
    ('any of six Vijayawada outlets', 'any of five Vijayawada outlets', 1),
    ('Three of six RR Durbar outlets', 'Three of five RR Durbar outlets', 1),
    ("[outlets.length, 'Vijayawada outlets'],", "[outlets.filter(o => !/patamatalanka/i.test(o.name || '')).length, 'Vijayawada outlets'],", 1),
]:
    rep(a, b, '11 count: ' + a[:38], n)

# 12. Branches bridge: it faded in through a cream-to-black gradient and a soft mask, which read as a smudge.
#     Clean dark strip with a thin gold top line; the empty sky above the bridge is cropped instead of faded.
rep('html body #br-locator .skyline{background:linear-gradient(180deg,#f8f0e5 0%,#d9b99a 8%,#6a1420 20%,#24050b 32%,#110003 42%,#0b0002 100%)!important;-webkit-mask-image:none!important;mask-image:none!important}',
    'html body #br-locator .skyline{background:#0b0002!important;border-top:1px solid rgba(209,171,86,.55)!important;-webkit-mask-image:none!important;mask-image:none!important}',
    '12 bridge strip')
rep('html body #br-locator .skyline img{-webkit-mask-image:linear-gradient(180deg,transparent 0,transparent 26%,#000 46%)!important;mask-image:linear-gradient(180deg,transparent 0,transparent 26%,#000 46%)!important}',
    'html body #br-locator .skyline img{-webkit-mask-image:none!important;mask-image:none!important;margin-top:-9%!important}',
    '12b bridge photo')
rep(' html body section#br-locator#br-locator{padding-bottom:190px!important}', ' html body section#br-locator#br-locator{padding-bottom:49vw!important}', '12c bridge space (phone)')
rep(' html body #br-locator .skyline img{width:240%!important;margin-left:-122%!important;transform:none!important}',
    ' html body #br-locator .skyline img{width:240%!important;margin-left:-122%!important;margin-top:-31%!important;transform:none!important}',
    '12d bridge crop (phone)')

# 13. Remaining 'six outlets': Policies wording and the About Us history step. FSSAI numbers are left as they are.
rep('from six outlets in Vijayawada. Each outlet', 'from five outlets in Vijayawada. Each outlet', '13 policies wording')
rep('from six outlets. This website is operated by', 'from five outlets. This website is operated by', '13b policies wording')
rep('"detail": "Grows to 6 outlets across Vijayawada"', '"detail": "Grows to 5 outlets across Vijayawada"', '13c history step')

# 14. /locations/ page: 01-05 numbers removed, text takes the full card width, no gold ring on the selected card.
rep('.rr-location-card{grid-template-columns:52px minmax(0,1fr)!important;', '.rr-location-card{grid-template-columns:minmax(0,1fr)!important;', '14 locations grid')
rep('.rr-location-card>.rr-location-number{width:48px;height:48px;font-size:18px}', '.rr-location-card>.rr-location-number{display:none!important}', '14b locations numbers')
rep('.rr-location-card>div:not(.rr-outlet-actions){grid-column:2;min-width:0}', '.rr-location-card>div:not(.rr-outlet-actions){grid-column:1;min-width:0}', '14c locations text column')
rep('body .rr-location-card.is-selected{border-color:#d9a83a;box-shadow:0 0 0 2px #d9a83a,0 14px 30px rgba(110,64,8,.22)}', '', '14d locations selected ring')

# 15. New top-down map (assets/map-topdown.webp, same 1220x890 frame). Pins re-placed on the new map; the pickup
#     map now uses the same positions as the branches map (they did not match before).
rep('assets/54dfd81795.webp', 'assets/map-topdown.webp', '15 map image', 2)
rep('const MW=1220,MH=890,HUB=[790, 300],PX={"singhnagar": [545, 223], "moghalrajpuram": [563, 388], "bhavanipuram": [223, 201], "poranki": [939, 542], "patamatalanka": [682, 475], "autonagar": [760, 700]};',
    'const MW=1220,MH=890,HUB=[785, 354],PX={"singhnagar": [565, 263], "moghalrajpuram": [588, 471], "bhavanipuram": [318, 258], "poranki": [907, 630], "patamatalanka": [695, 569], "autonagar": [763, 817]};',
    '15b branches pins')
for a, b in [('[395, 240]', '[565, 263]'), ('[630, 195]', '[588, 471]'), ('[300, 350]', '[318, 258]'), ('[530, 600]', '[907, 630]'), ('[760, 700]', '[763, 817]')]:
    rep('"pos": ' + a, '"pos": ' + b, '15c pickup pin ' + a)

# 16. About Us landing photo: the Egyptian-facade building (assets/rr-exterior*.webp) with a one-time
#     'temple doors' reveal: frame opens from the centre, a dusk layer lifts, one gold light passes along the signboard,
#     then a soft glow stays. Visible by default (hidden state only with html.rr-js, failsafe after 3.5 s);
#     reduced motion = no movement, board already lit. Also fixes the phone layout (photo was a 207 px box on the left).
rep('<figure class="rra-photo"><span class="rra-frame"><img alt="The RR Durbar dining hall in Vijayawada" src="assets/36250155b7.jpg" width="1400" height="933" loading="lazy" decoding="async"/></span></figure>',
    '<figure class="rra-photo rra-ext" id="rraExt" data-rrs="1"><span class="rra-frame"><img alt="RR Durbar\'s Egyptian-themed building in Vijayawada, with a golden pharaoh facade above the RR Joints and RR Durbar signboards" src="assets/rr-exterior.webp" srcset="assets/rr-exterior-760.webp 760w, assets/rr-exterior.webp 1314w" sizes="(max-width:980px) 100vw, 66vw" width="1314" height="1197" decoding="async" fetchpriority="high"/><i class="ext-dusk" aria-hidden="true"></i><i class="ext-sweep" aria-hidden="true"></i></span></figure>',
    '16 about photo')
rep('<script id="rr-poster-js">addEventListener("load"', '<script id="rr-poster-js">document.documentElement.classList.add("rr-js");addEventListener("load"', '16b js flag')
rep('html body #about .rra-photo{width:66%!important}', '@media(min-width:981px){html body #about .rra-photo{width:66%!important}}', '16c photo width desktop only')
rep(' html body #about .rra-photo{height:300px!important;width:auto!important}', ' html body #about .rra-photo{height:auto!important;aspect-ratio:1314/1197;width:auto!important}', '16d phone photo full width')
rep('#about .rra-frame::after{background:linear-gradient(180deg,#580810,rgba(88,8,16,.15) 45%,transparent)}', '#about .rra-frame::after{background:linear-gradient(180deg,rgba(88,8,16,.7),transparent 18%)}', '16e phone top fade lighter')
EXT_CSS = """
#rraExt .ext-dusk,#rraExt .ext-sweep{position:absolute;pointer-events:none;z-index:1}
#rraExt .ext-dusk{inset:0;background:linear-gradient(180deg,rgba(16,3,12,.74),rgba(38,6,14,.58));opacity:0}
#rraExt .ext-sweep{left:var(--bx,9%);top:var(--by,63%);width:var(--bw,80%);height:var(--bh,7%);overflow:hidden;mix-blend-mode:screen}
#rraExt .ext-sweep::before{content:"";position:absolute;top:0;bottom:0;left:0;width:38%;background:linear-gradient(100deg,transparent,rgba(255,222,150,.8) 50%,transparent);transform:translateX(-110%)}
#rraExt .ext-sweep::after{content:"";position:absolute;inset:-35% -2%;background:radial-gradient(55% 85% at 74% 50%,rgba(255,196,100,.3),transparent 70%);opacity:0}
@media(prefers-reduced-motion:no-preference){
 html.rr-js #rraExt:not(.ext-in) .rra-frame{clip-path:inset(0 50% 0 50%);animation:rrExtSafeC 0s 3.5s forwards}
 html.rr-js #rraExt:not(.ext-in) .ext-dusk{opacity:1;animation:rrExtSafeO 0s 3.5s forwards}
 #rraExt.ext-in .rra-frame{clip-path:inset(0 0 0 0);transition:clip-path 1.2s cubic-bezier(.16,1,.3,1)}
 #rraExt.ext-in .ext-dusk{opacity:0;transition:opacity 1.1s cubic-bezier(.16,1,.3,1) .15s}
 #rraExt.ext-in .ext-sweep::before{animation:rrExtSweep 1.15s cubic-bezier(.3,.6,.4,1) .95s forwards}
 #rraExt.ext-in .ext-sweep::after{animation:rrExtGlow 1s ease-out 1.9s forwards}
}
@media(prefers-reduced-motion:reduce){#rraExt .ext-sweep::after{opacity:1}}
@keyframes rrExtSafeC{to{clip-path:inset(0 0 0 0)}}
@keyframes rrExtSafeO{to{opacity:0}}
@keyframes rrExtSweep{to{transform:translateX(330%)}}
@keyframes rrExtGlow{to{opacity:1}}
/* 17. maps: no overlapping labels. Vijayawada pill hidden at all sizes (dome stays); desktop shows only the selected or hovered outlet name; pickup map and list without 1-5 numbers */
#br-locator .hub span{display:none!important}
@media(min-width:621px){#br-locator .pin:not(.on):not(:hover):not(.is-hover) .pin-lab{display:none}}
#pickup .pk-pin b,#pickup .pk-no{display:none!important}
"""
rep('@keyframes rrBulbTw{0%,100%{opacity:1}50%{opacity:.5}}\n</style>', '@keyframes rrBulbTw{0%,100%{opacity:1}50%{opacity:.5}}' + EXT_CSS + '</style>', '16f reveal styles')
EXT_JS = """<script id="rr-branches-b-js">/* about-us exterior reveal: places the gold light on the signboard (board = 115..1174 x 754..841 in the 1314x1197 photo), opens once in view */
(function(){var f=document.getElementById('rraExt');if(!f)return;var img=f.querySelector('img'),sw=f.querySelector('.ext-sweep'),fr=f.querySelector('.rra-frame');if(!img||!sw||!fr)return;
var B=[115/1314,754/1197,1059/1314,87/1197];
function pc(v){if(!v)return .5;if(v.indexOf('%')>0)return parseFloat(v)/100;return v==='left'||v==='top'?0:v==='right'||v==='bottom'?1:.5}
function place(){var r=fr.getBoundingClientRect(),ir=img.getBoundingClientRect();if(!ir.width||!ir.height)return;var nw=img.naturalWidth||1314,nh=img.naturalHeight||1197,s=Math.max(ir.width/nw,ir.height/nh),w=nw*s,h=nh*s,op=getComputedStyle(img).objectPosition.split(' '),ox=ir.left-r.left+(ir.width-w)*pc(op[0]),oy=ir.top-r.top+(ir.height-h)*pc(op[1]);
 sw.style.setProperty('--bx',(ox+B[0]*w).toFixed(1)+'px');sw.style.setProperty('--by',(oy+B[1]*h).toFixed(1)+'px');sw.style.setProperty('--bw',(B[2]*w).toFixed(1)+'px');sw.style.setProperty('--bh',(B[3]*h).toFixed(1)+'px')}
place();img.addEventListener('load',place);addEventListener('resize',place);if(window.ResizeObserver)new ResizeObserver(place).observe(fr);
function go(){place();f.classList.add('ext-in');setTimeout(place,1000)}
if(!('IntersectionObserver' in window)){go();return}
var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();(img.decode?img.decode():Promise.resolve()).then(go,go)}},{threshold:.3});io.observe(f);
})();
"""
rep('<script id="rr-branches-b-js">', EXT_JS, '16g reveal script')

# 18. Client answers (call sheet v3, 1 Nov). Central WhatsApp chat (919849982052) and the general 'Call us' number
#     (77020 77999: contact, policies, footer, help text) stay as they are. Each outlet's own card/pin/listing calls that
#     outlet: MR 98499 82304, SN 78931 12999, BH 78931 15999, PO 78931 16999, AT 99635 51970.
import re
OUTNUM = {'moghalrajpuram': '9849982304', 'singhnagar': '7893112999', 'bhavanipuram': '7893115999', 'poranki': '7893116999', 'autonagar': '9963551970'}
def fmt(n, form):
    sp = n[:5] + ' ' + n[5:]
    return {'+91x': '+91' + n, '+91 x': '+91 ' + sp, 'x': n, 'x x': sp}[form]
OUTS = list(OUTNUM) + ['patamatalanka']
pat = re.compile(r'\+917702077999|\+91 77020 77999|7702077999|77020 77999')
parts = []; pos = 0; nout = 0
for m in pat.finditer(s):
    i = m.start(); pre = s[max(0, i - 1500):i]
    b = max(pre.rfind('<article'), pre.rfind('{"'), pre.rfind('{\n'))
    seg = pre[b:].lower() if b >= 0 else ''
    hit = [(seg.rfind(o), o) for o in OUTS if o in seg]
    o = max(hit)[1] if hit else None
    if o in OUTNUM:
        g = m.group(0); form = '+91x' if g.startswith('+917') else '+91 x' if g.startswith('+91 ') else 'x x' if ' ' in g else 'x'
        parts.append(s[pos:i]); parts.append(fmt(OUTNUM[o], form)); pos = m.end(); nout += 1
parts.append(s[pos:])
if nout != 60: bad.append(f'18 outlet numbers: found {nout}, expected 60')
else: s = ''.join(parts); log.append('18 outlet numbers: ok (60)')

# 18b. Closing time 11:59 PM at all branches (opening 11:00 AM unchanged).
rep('11:30 PM', '11:59 PM', '18b closing time text', 24)
rep('"openingHours": "Mo-Su 11:00-23:30"', '"openingHours": "Mo-Su 11:00-23:59"', '18b google hours', 4)
rep('"hours": "11:00-23:30"', '"hours": "11:00-23:59"', '18b data hours', 5)
rep('id="odOHrs">11:00 – 23:30<', 'id="odOHrs">11:00 – 23:59<', '18b order page hours')
rep('op=m>=660&&m<1410;', 'op=m>=660&&m<1440;', '18b open-now check')
# 18c. Autonagar: was 'Call for hours'
rep('520007</p><p>Call for hours</p>', '520007</p><p>Open daily 11:00 AM – 11:59 PM</p>', '18c autonagar locations card')
rep('<i class="brx-dot brx-dot-off"></i>Call for hours</p>', '<i class="brx-dot"></i>11:00 AM – 11:59 PM &middot; Daily</p>', '18c autonagar branch card')
rep('Vijayawada, 520007", "hours": "Call for hours"', 'Vijayawada, 520007", "hours": "Open daily 11:00 AM – 11:59 PM"', '18c autonagar data', 3)
# 18d. Facebook page
rep('"sameAs": ["https://www.instagram.com/rr_durbar/"]', '"sameAs": ["https://www.instagram.com/rr_durbar/", "https://www.facebook.com/RRDurbar"]', '18d facebook in google data', 6)
FB = '<a href="https://www.facebook.com/RRDurbar" target="_blank" rel="noopener noreferrer" aria-label="Follow RR Durbar on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3z"/></svg></a>'
rep('<a href="tel:+917702077999" aria-label="Call RR Durbar">', FB + '<a href="tel:+917702077999" aria-label="Call RR Durbar">', '18d facebook in footer')
# 18e. Patamata removed: FSSAI line in footer and policies tables
rep(' &middot; Patamatalanka 20126132000896', '', '18e footer fssai')
rep('<tr><td>Patamatalanka</td><td>20126132000896</td></tr>', '', '18e policies fssai', 2)

# 18f. Patamata removed from the outlet lists built from the data (old /locations/ page, home grid, order dropdown);
#      Autonagar hours filled in the data.
rep('const outlets = Array.isArray(data.outlets) ? data.outlets : [];', "const outlets = (Array.isArray(data.outlets) ? data.outlets : []).filter(o => !/patamatalanka/i.test(o.name || ''));", '18f hide patamata in lists')
rep('"phone": "9963551970",\n      "hours": null,', '"phone": "9963551970",\n      "hours": "11:00-23:59",', '18f autonagar data hours')

# 18g. Order page outlet facts: closing 23:59, Autonagar hours filled (was blank = no open/closed status).
rep("h:'11:00 – 23:30'}", "h:'11:00 – 23:59'}", '18g order page hours', 4)
rep("Vijayawada, 520007',h:''}", "Vijayawada, 520007',h:'11:00 – 23:59'}", '18g order page autonagar')
rep('Autonagar hours are unconfirmed. */', 'All outlets 11:00 to 23:59 (client, 1 Nov). */', '18g comment')

# 19. Outlet names as on Google Business (call sheet v3). The area name stays as the big heading so guests can tell
#     outlets apart; the Google name sits above it as a small gold line (branch cards, map card, pickup list) and is the
#     exact name in Google's data on the page.
BRAND = {'singhnagar': "RR's Joints Veg and Non-Veg Restaurant", 'moghalrajpuram': 'RR Durbar', 'bhavanipuram': 'RR Durbar',
         'poranki': 'RR Durbar, Poranki', 'autonagar': "RR's Joints (Take Away)"}
import json as _json
rep('<script id="rr-poster-js">document.documentElement.classList.add("rr-js");',
    '<script id="rr-poster-js">document.documentElement.classList.add("rr-js");window.RR_BRAND=' + _json.dumps(BRAND) + ';', '19 brand names list')
for area, name in [('Singhnagar', BRAND['singhnagar']), ('Moghalrajpuram', 'RR Durbar'), ('Bhavanipuram', 'RR Durbar'), ('Poranki', 'RR Durbar, Poranki'), ('Autonagar', BRAND['autonagar'])]:
    rep(f'<div class="brx-body"><h3>{area}</h3>', f'<div class="brx-body"><p class="brx-brand">{name.replace(chr(39), "&#39;")}</p><h3>{area}</h3>', f'19 branch card {area}')
    rep(f'"@type": "Restaurant", "name": "RR Durbar {area}"', f'"@type": "Restaurant", "name": {_json.dumps(name)}', f'19 google data {area}')
rep("$('#pName').textContent=o.name;", "$('#pName').textContent=o.name;$('#pName').dataset.brand=(window.RR_BRAND||{})[o.id]||'';", '19 map card name')
rep("top.appendChild(e('h3','pk-name',o.name));", "var hn=e('h3','pk-name',o.name);hn.dataset.brand=(window.RR_BRAND||{})[o.id]||'';top.appendChild(hn);", '19 pickup name')

# 20. Missing sheet items: AC + parking on branch cards, pickup ready time, catering from every outlet.
rep('</div><p class="brx-line brx-i-ph">', '</div><p class="brx-line brx-am">AC &middot; Parking available</p><p class="brx-line brx-i-ph">', '20 AC and parking', 5)
rep('Your location is used only to show distance and is never stored.', 'Orders are usually ready in 30&ndash;45 minutes. Your location is used only to show distance and is never stored.', '20 pickup ready time')
rep('Tell us about your event and the RR Durbar team will get back to you.', 'Tell us about your event and the RR Durbar team will get back to you. All five outlets take catering orders.', '20 catering intro')
rep('<h3>Five outlets</h3><p>Five RR Durbar outlets across Vijayawada.', '<h3>Five outlets</h3><p>Catering orders from any of our five outlets across Vijayawada.', '20 catering card')
BR_CSS = """
/* 19-20: Google name line above the area name; AC + parking line */
#br-list .brx-brand,#br-locator #pName[data-brand]:not([data-brand=""])::before,#pickup .pk-name[data-brand]:not([data-brand=""])::before{display:block;margin:0 0 4px;font:800 10.5px/1.3 'Manrope',Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#a8781f}
#br-locator #pName[data-brand]:not([data-brand=""])::before{content:attr(data-brand);color:#e7b85c}
#pickup .pk-name[data-brand]:not([data-brand=""])::before{content:attr(data-brand)}
#br-list .brx-body .brx-am{margin:0 0 6px!important;padding:0 0 0 20px!important;font:500 13.5px/1.4 'Manrope',Arial,sans-serif!important;color:#5a4a3a!important}
#br-list .brx-body .brx-am::before,#br-list .brx-body .brx-am::after{content:none!important;display:none!important}
"""
rep('#pickup .pk-pin b,#pickup .pk-no{display:none!important}\n', '#pickup .pk-pin b,#pickup .pk-no{display:none!important}\n' + BR_CSS, '19 styles')

print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE: p.write_text(s, encoding='utf-8'); print('PATCHED src/site.html')
else: print('dry run OK (add --write)')

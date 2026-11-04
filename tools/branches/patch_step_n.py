#!/usr/bin/env python3
"""Step N (3 Nov evening owner changes). Run AFTER patch_phase1c.py and patch_1c_wording.py ("apply after 1C").
 1. Footer: "Developed by BJNEXUS AI" (links to https://bjnexusai.com) at the very bottom, every page.
 2. Dock #rrw always visible: the scroll-away behaviour (rr-away: CSS + JS) and the hero-v6 "hidden at the top of home" rule are removed.
    Phone: launcher 44px, and while the home hero is on screen the dock sits above the hero buttons (clear of the glass nav).
 3. /branches/ top section replaced (like map-pins.html): heading, then the night map in a gold frame on cream (never cropped), the cream outlet card beside it
    (all 5 cards stacked, a pin / label / name tab tap crossfades to that outlet), then the river-bridge strip with the string lights. The old hero section and the
    separate dark #br-map section are removed (one map). The lower "Choose Your Outlet" photo cards (#br-list) stay. The new section keeps id br-locator so every
    #br-locator link and the phone tab highlight keep working.
 4. Home order: #loyalty moves to right after #menu (DOM, pageSections.home and cms/routes.js together).
Exact-match: STOPS unless each anchor is found the expected number of times. Idempotent. Backups: src/site.html.bakN, cms/routes.js.bakN. Run from the repo root, then rebuild."""
import json, pathlib, re, sys

SITE = pathlib.Path("src/site.html"); ROUTES = pathlib.Path("cms/routes.js")
for f in (SITE, ROUTES):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root)" % f)
s = SITE.read_text(encoding="utf-8"); r = ROUTES.read_text(encoding="utf-8")
if 'id="rr-step-n"' in s:
    print("already done (nothing to change)"); sys.exit(0)
if 'id="rr-catering-1c"' not in s or "Plan your event" not in s:
    sys.exit("STOP: apply patch_phase1c.py and patch_1c_wording.py first (Step N goes after 1C)")

def need(name, hay, a, n=1):
    c = hay.count(a)
    if c != n: sys.exit("STOP: %s found %d times (need %d)" % (name, c, n))

def block(start, end_tag="</section>", name=""):
    """(i, j) of the element that starts with `start` and ends at the first end_tag after it."""
    need("block " + (name or start[:40]), s, start)
    i = s.index(start); j = s.index(end_tag, i) + len(end_tag)
    return i, j

# ---------------------------------------------------------------- 1. footer credit
FOOT_OLD = '<span>DINE LIKE A KING &middot; SINCE 1991</span></div></div><div class="rrm-strip" aria-hidden="true"></div>'
FOOT_NEW = ('<span>DINE LIKE A KING &middot; SINCE 1991</span></div>'
            '<p class="rrf-credit">Developed by <a href="https://bjnexusai.com" target="_blank" rel="noopener">BJNEXUS AI</a></p></div><div class="rrm-strip" aria-hidden="true"></div>')
need("footer bottom", s, FOOT_OLD)

# ---------------------------------------------------------------- 2. dock
AWAY_CSS = ".rrw.rr-away:not(.open){transform:translateY(140%);opacity:0;pointer-events:none}\n"
AWAY_JS = ("/* contact dock: hide while scrolling down, return on scroll up */\nconst dock=document.querySelector('.rrw');let y=window.scrollY;\n"
           "if(dock)addEventListener('scroll',()=>{const c=window.scrollY,d=c-y;if(Math.abs(d)<8)return;dock.classList.toggle('rr-away',d>0&&c>240);y=c},{passive:true});\n")
HEROVIS = "html.rr-hero-vis #rrw{opacity:0;transform:translateY(12px);pointer-events:none}\n"
for name, a in (("rr-away css", AWAY_CSS), ("rr-away js", AWAY_JS), ("hero-vis dock rule", HEROVIS)): need(name, s, a)

# ---------------------------------------------------------------- 3. branches
HERO_I, HERO_J = block('<section class="brh" id="br-locator"', name="old branches hero")
MAP_I, MAP_J = block('<section class="brm" id="br-map"', name="old #br-map section")
need("old map figure", s[MAP_I:MAP_J], '<figure class="brm-fig">')
need("old map figure end", s[MAP_I:MAP_J], '</figure>')
fi = s.index('<figure class="brm-fig">', MAP_I); fj = s.index('</figure>', fi) + len('</figure>')
FIG = s[fi:fj]
need("map has 5 pins", FIG, 'class="brm-pin"', 5); need("map has 5 labels", FIG, 'class="brm-lab"', 5)
JS_I, JS_J = block('<script id="rr-branches-map-js">', "</script>", "old map script")
OLDHERO_GUARD = "const root=document.getElementById('br-locator');if(!root)return;"
need("old hero script guard", s, OLDHERO_GUARD)
need("old hero script data", s, "const OUTLETS = [")
k = s.index("const OUTLETS = [") + len("const OUTLETS = ")
OUT, _ = json.JSONDecoder().raw_decode(s[k:])
ORDER = ["singhnagar", "moghalrajpuram", "bhavanipuram", "autonagar", "poranki"]
O = {o["id"]: o for o in OUT}
if any(i not in O for i in ORDER): sys.exit("STOP: outlet data changed (%s)" % sorted(O))
BLOCK1C = re.search(r"/\* /branches/ phone: the heading comes above the map\..*?\n\}\n", s, re.S)
if not BLOCK1C or BLOCK1C.group(0).count("#br-map") < 4: sys.exit("STOP: 1C branches-heading CSS block not found as expected")
PS_B_OLD = "branches: ['br-locator', 'br-map', 'br-list'],"; PS_B_NEW = "branches: ['br-locator', 'br-list'],"
need("pageSections branches", s, PS_B_OLD)
need("routes branches", r, "sections: ['br-locator', 'br-map', 'br-list']")

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;")
cards, tabs = [], []
for n, i in enumerate(ORDER):
    o = O[i]; sel = i == "moghalrajpuram"
    hrs = esc(o["hours"]).replace("Open daily ", "Open daily · ")
    wa = "https://wa.me/919849982052?text=Hi%%20RR%%20Durbar%%20%s,%%20I%%27d%%20like%%20to%%20know%%20more." % o["name"]
    cards.append('<article class="brt-card%s" data-id="%s" aria-label="%s outlet"><p class="brt-ce">&#9819; RR Durbar</p><h2>%s</h2><p class="brt-ad">%s</p><p class="brt-hr">%s</p>'
                 '<div class="brt-btns"><a class="g" href="%s" target="_blank" rel="noopener noreferrer" aria-label="Directions to %s">Directions</a>'
                 '<a href="tel:%s" aria-label="Call %s">Call</a><a href="%s" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp RR Durbar about %s">WhatsApp</a></div></article>'
                 % (" is-sel" if sel else "", i, o["name"], o["name"], esc(o["address"]), hrs, o["directions"].replace("&", "&amp;"), o["name"], o["tel"], o["name"], wa, o["name"]))
    tabs.append('<button type="button" class="brt-tab" data-id="%s" aria-pressed="%s">%s</button>' % (i, "true" if sel else "false", o["name"]))

NEW_TOP = ('<section class="brt" id="br-locator" data-edit-section="branches-hero" aria-labelledby="h-find"><div class="brt-wrap">'
           '<div class="brt-head"><p class="brt-eye">Find the Durbar</p><h1 id="h-find">Five outlets. One city.</h1><p class="brt-sub">Tap a pin or a name to see an outlet.</p></div>'
           + FIG +
           '<div class="brt-side"><div class="brt-cards" id="brtCards" aria-live="polite">' + "".join(cards) + '</div>'
           '<div class="brt-tabs" role="group" aria-label="Choose an outlet">' + "".join(tabs) + '</div></div></div>'
           '<div class="brt-bridge"><span class="brt-crown" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#brh-i-crown"/></svg></span>'
           '<div class="brt-strip" id="skyline" aria-hidden="true"><img loading="lazy" src="assets/cc66e1edc5.webp" width="1600" height="533" alt="" decoding="async"></div></div></section>')

# ---------------------------------------------------------------- 4. home order
need("loyalty section", s, 'id="loyalty"')
li = s.rfind("<section", 0, s.index('id="loyalty"'))
if s.count("<section", li, s.index("</section>", li)) != 1: sys.exit("STOP: loyalty section contains another section (shape changed)")
lj = s.index("</section>", li) + len("</section>")
if s[lj] == "\n": lj += 1
TRUST_TAG = re.search(r'<section\b[^>]*\bid="trust"', s)
if not TRUST_TAG: sys.exit("STOP: #trust section not found")
MENU_ID = re.search(r'<section\b[^>]*\bid="menu"', s); need("menu section id", s, 'id="menu"')
if not (MENU_ID.start() < TRUST_TAG.start() < li): sys.exit("STOP: home order is not menu, trust ... loyalty any more")
HOME_PS_OLD = "home: ['home', 'hero-next', 'whats-new', 'home-catering', 'bestsellers', 'menu', 'trust', 'honours', 'reviews', 'gallery', 'loyalty', 'outlets', 'cta'],"
HOME_PS_NEW = "home: ['home', 'hero-next', 'whats-new', 'home-catering', 'honours', 'menu', 'loyalty', 'trust', 'reviews', 'gallery', 'outlets', 'bestsellers', 'cta'],"
RT_HOME_OLD = "home: { title: 'Home', sections: ['home', 'whats-new', 'home-catering', 'bestsellers', 'menu', 'trust', 'honours', 'reviews', 'loyalty', 'outlets'] },"
RT_HOME_NEW = "home: { title: 'Home', sections: ['home', 'whats-new', 'home-catering', 'honours', 'menu', 'loyalty', 'trust', 'reviews', 'outlets', 'bestsellers'] },"
need("pageSections home", s, HOME_PS_OLD); need("routes home", r, RT_HOME_OLD)

# ---------------------------------------------------------------- styles + script
CSS = r"""
/* rr-step-n START: footer credit, dock always visible, /branches/ cream top section. Revert: restore src/site.html.bakN */
.rrf-credit{margin:14px 0 0;padding:0 16px;text-align:center;font:500 12px/1.4 'Manrope',Arial,sans-serif;color:rgba(255,243,225,.6)}
.rrf-credit a{color:#e9b85c;text-decoration:none;font-weight:700}.rrf-credit a:hover,.rrf-credit a:focus-visible{text-decoration:underline}
/* dock: always visible. Phone: 44px launcher; over the home hero it sits above the hero buttons and clear of the glass nav */
@media(max-width:1050px){html #rrw .rrw-launch{width:44px!important;height:44px!important}html.rr-tabs.rr-hero-vis #rrw{bottom:calc(max(156px,24svh) + env(safe-area-inset-bottom))!important}}
/* /branches/ top: cream page, framed night map, cream outlet card, bridge strip */
html body section#br-locator#br-locator{--sh:clamp(96px,10vw,200px);--mh:clamp(500px,calc(100svh - 96px - var(--sh) - 56px),820px);position:relative;display:block;height:auto!important;min-height:0!important;max-height:none!important;padding:0!important;overflow:hidden;
 background:radial-gradient(120% 90% at 30% 15%,#fff8ef,#f3e6d0)!important;color:#2b1412}
.brt-wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;justify-items:center;width:min(1180px,100%);margin:0 auto;padding:22px 20px 34px;box-sizing:border-box}
.brt-head{text-align:center;display:block;max-width:460px}
.brt-eye{margin:0 0 8px;font:800 11px/1 'Manrope',Arial,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#9a6a14}
html body section#br-locator#br-locator .brt-head h1{margin:0;font:600 clamp(34px,9vw,52px)/1.02 'Cormorant Garamond',Georgia,serif;color:#4c0813!important;text-shadow:none!important;text-wrap:balance;order:0}
.brt-sub{margin:10px 0 0;font:600 13px/1.6 'Manrope',Arial,sans-serif;color:#6b4a43}
html body #br-locator .brt .brm-fig,html body #br-locator .brm-fig{position:static;margin:0;padding:0;width:100%;display:flex;justify-content:center}
html body #br-locator .brm-map{width:min(100%,420px);max-width:420px;margin:0;border-radius:24px;box-shadow:0 0 0 1px #d5b26c,0 0 0 7px #fffaf2,0 0 0 8px rgba(213,178,108,.6),0 30px 70px rgba(76,8,19,.3)}
html body #br-locator .brm-art{border-radius:24px;-webkit-mask-image:none;mask-image:none;background:#14040a}
.brt-side{width:100%;max-width:420px;min-width:0}
.brt-cards{display:grid}
.brt-card{grid-area:1/1;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:24px 24px 22px;border-radius:18px;background:#fffaf2;border:1px solid rgba(213,178,108,.7);box-shadow:0 18px 44px rgba(76,8,19,.12);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility 0s linear .28s,border-color .25s,box-shadow .25s}
.brt-card.is-sel{opacity:1;visibility:visible;transition:opacity .28s ease,visibility 0s}
.brt-card.is-on{border-color:#e9b85c}
.brt-ce{margin:0;font:800 11px/1 'Manrope',Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#9a6a14}
.brt-card h2{margin:0;font:600 32px/1.05 'Cormorant Garamond',Georgia,serif;color:#4c0813}
.brt-card p{margin:0}
.brt-ad,.brt-hr{font:600 14px/1.6 'Manrope',Arial,sans-serif;color:#5a3a33}
.brt-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.brt-btns a{display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:999px;font:800 13px/1 'Manrope',Arial,sans-serif;text-decoration:none;color:#4c0813;border:1px solid rgba(76,8,19,.25)}
.brt-btns a.g{background:linear-gradient(135deg,#f5d27a,#d9a640);border-color:transparent;color:#2b1412}
.brt-btns a:focus-visible,.brt-tab:focus-visible{outline:2px solid #9a6a14;outline-offset:2px}
.brt-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.brt-tab{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(76,8,19,.25);background:transparent;color:#4c0813;font:700 13px/1 'Manrope',Arial,sans-serif;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.brt-tab:hover,.brt-tab.is-on{border-color:#9a6a14}
.brt-tab[aria-pressed="true"]{background:#4c0813;border-color:#4c0813;color:#f6dfa6}
/* bridge strip: the lit bridge over the river, cropped by the strip (the string-lights script follows the photo) */
.brt-bridge{position:relative}
.brt-crown{position:absolute;left:50%;top:0;z-index:2;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;transform:translate(-50%,-50%);background:#4c0813;border:1px solid #d5b26c;color:#e9b85c;box-shadow:0 6px 16px rgba(76,8,19,.35)}
.brt-crown svg{width:20px;height:20px}
.brt-strip{position:relative;height:var(--sh);overflow:hidden;background:#0b0002;border-top:1px solid rgba(209,171,86,.55)}
.brt-strip img{position:absolute;right:0;top:calc(var(--sh)*-1.33);width:calc(var(--sh)*10);max-width:none;height:auto;display:block}
@media(min-width:900px){
 html body section#br-locator#br-locator{--sh:clamp(80px,11vh,130px);--pt:46px;--pb:24px;--mh:clamp(380px,calc(100svh - 96px - var(--pt) - var(--pb) - var(--sh)),820px)}
 .brt-wrap{grid-template-columns:auto minmax(0,500px);grid-template-areas:"fig head" "fig side";column-gap:clamp(36px,5vw,72px);row-gap:20px;justify-content:center;align-content:center;justify-items:stretch;padding:var(--pt) 28px var(--pb)}
 .brt-head{grid-area:head;text-align:left;align-self:end;max-width:none}
 .brt-wrap>.brm-fig{grid-area:fig;width:auto;align-self:center}
 .brt-side{grid-area:side;align-self:start;max-width:none}
 html body #br-locator .brm-map{width:auto;max-width:none;height:var(--mh);aspect-ratio:941/1672}
 html body section#br-locator#br-locator .brt-head h1{font-size:clamp(38px,3.6vw,52px)}
}
@media(prefers-reduced-motion:reduce){.brt-card,.brt-card.is-sel,.brt-tab{transition:none}}
/* rr-step-n END */
"""
JS = r"""/* rr-step-n: /branches/ top. Lights on once, beacons drop, labels find clear space; beacon <-> label <-> name tab <-> outlet card are linked (a tap crossfades the card). Delete with the style block to revert. */
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
"""
STYLE_SCRIPT = '<style id="rr-step-n">' + CSS + '</style>\n<script id="rr-step-n-js">' + JS + '</script>\n'

# ---------------------------------------------------------------- apply (highest offsets first for the cuts)
t = s
# home order: cut loyalty (it lies after trust), paste before trust
loy = t[li:lj]
t = t[:li] + t[lj:]
t = t[:TRUST_TAG.start()] + loy + t[TRUST_TAG.start():]
# branches: the old br-map section and its script go; the old hero becomes the new top
def cut(t, start, end_tag):
    i = t.index(start); j = t.index(end_tag, i) + len(end_tag)
    if j < len(t) and t[j] == "\n": j += 1
    return t[:i] + t[j:], i
t, _ = cut(t, '<script id="rr-branches-map-js">', "</script>")
t, _ = cut(t, '<section class="brm" id="br-map"', "</section>")
t, pos = cut(t, '<section class="brh" id="br-locator"', "</section>")
t = t[:pos] + NEW_TOP + "\n" + t[pos:]
t = t.replace(BLOCK1C.group(0), "", 1)
t = t.replace(OLDHERO_GUARD, "const root=document.getElementById('br-locator');if(!root||!root.querySelector('#olist'))return;", 1)  # old hero script sleeps: its markup is gone
t = t.replace(PS_B_OLD, PS_B_NEW, 1).replace(HOME_PS_OLD, HOME_PS_NEW, 1)
t = t.replace(FOOT_OLD, FOOT_NEW, 1).replace(AWAY_CSS, "", 1).replace(HEROVIS, "", 1)
t = t.replace(AWAY_JS, "/* contact dock: always visible (Step N removed the hide-on-scroll-down) */\n", 1)
t = t.replace("</body>", STYLE_SCRIPT + "</body>", 1)
r2 = r.replace("sections: ['br-locator', 'br-map', 'br-list']", "sections: ['br-locator', 'br-list']", 1).replace(RT_HOME_OLD, RT_HOME_NEW, 1)

pathlib.Path("src/site.html.bakN").write_text(s, encoding="utf-8"); pathlib.Path("cms/routes.js.bakN").write_text(r, encoding="utf-8")
SITE.write_text(t, encoding="utf-8"); ROUTES.write_text(r2, encoding="utf-8")
print("PATCHED: footer credit, dock always visible, /branches/ cream top (map + card + bridge strip), loyalty after menu (backups src/site.html.bakN, cms/routes.js.bakN)")

#!/usr/bin/env python3
"""Step 1B: /catering/ becomes a landing page (3 Nov).
 1. The lit stages picture moves from its own #catering-occasions section INTO the #catering hero, directly under the heading.
 2. Hero copy: eyebrow "Catering & Events", one short line, two same-height buttons: PLAN MY EVENT (scrolls to #catering-form)
    and WHATSAPP US (919849982052, catering message). The old hero photo and the "Royal Taste" badge are removed (the picture replaces them).
 3. The trust strip moves below the picture. #catering-occasions is removed; its hidden event list, scrim and detail card move with the picture
    (new wrapper #rrs-wrap; the stages script now looks for #rrs-wrap instead of #catering-occasions).
 4. Page title -> "Catering & Events | RR Durbar Vijayawada" (the pageSeo entry for /catering/). cms/routes.js: 'catering-occasions' removed.
 5. Phone glass nav: highlights "Catering" on /catering/ (its sync() only read ?page=, so clean URLs showed Home). One scoped clause by pathname.
 6. Sticky "Plan my event" pill (only on /catering/): shows once the picture's bottom edge is on screen or above, hides while the form is in view.
 7. Wire overlay: one inline SVG per picture, paths from tools/catering/wires.json, INVISIBLE (opacity 0). Add class rrs-showwires on #rrs (or html) to see it.
Exact-match: STOPS unless each anchor is found the expected number of times. Idempotent. Backups: src/site.html.bak1b, cms/routes.js.bak1b.
Run from the repo root. Only src/site.html and cms/routes.js are changed (then rebuild)."""
import json, pathlib, re, sys

SITE = pathlib.Path("src/site.html"); ROUTES = pathlib.Path("cms/routes.js"); WIRES = pathlib.Path("tools/catering/wires.json")
for f in (SITE, ROUTES, WIRES):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root; wires.json comes from rr-1A.zip)" % f)
s = SITE.read_text(encoding="utf-8"); r = ROUTES.read_text(encoding="utf-8")
if 'id="rr-catering-1b"' in s:
    print("already done (nothing to change in src/site.html)")
    if "'catering-occasions'" in r: sys.exit("STOP: site.html is patched but cms/routes.js still lists catering-occasions")
    sys.exit(0)

def need(name, hay, a, n=1):
    c = hay.count(a)
    if c != n: sys.exit("STOP: %s found %d times (need %d)" % (name, c, n))

# ---------------------------------------------------------------- anchors
OCC_OPEN = ('<section class="rr-section rr-dark" id="catering-occasions" data-edit-section="catering-occasions"><div class="rr-container">'
            '<p class="rr-eyebrow">Occasions we cater</p><h2 class="rr-heading">Every gathering, served the Durbar way.</h2>')
OCC_CLOSE = '</div></section>'
HERO_OPEN = '<div class="cx-hero"><div class="cx-hero-copy"><p class="cx-eyebrow">Catering</p>'
HERO_END = '</div></div><div class="cx-card"><span class="cx-sheen"></span>'
OLD_LEAD = ('<p class="cx-lead">Planning a celebration, office lunch or family gathering? Tell us about your event and the RR Durbar team will get back to you. '
            'All five outlets take catering orders.</p>')
RRS_UL = '</div><ul class="rrs-sr">'
JS_SEC = "var sec=document.getElementById('catering-occasions')"
CSS_OCC = ("html body #catering-occasions{background:radial-gradient(120% 90% at 50% 38%,#2a0508 0%,#16030a 55%,#0a0002 100%)!important;overflow:hidden}\n")
TITLE_OLD = '"catering": {"title": "Catering in Vijayawada | RR Durbar"'
TITLE_NEW = '"catering": {"title": "Catering &amp; Events | RR Durbar Vijayawada"'
TITLE_NEW = TITLE_NEW.replace("&amp;", "&")  # JSON text; split_pages html-escapes it
TAB_OLD = "else if(/page=catering/.test(q))cur='Catering';"
TAB_NEW = "else if(/page=catering/.test(q)||/^\\/catering\\/?$/.test(location.pathname))cur='Catering';"
for name, a in (("tabbar sync catering clause", TAB_OLD), ("occasions section open", OCC_OPEN), ("hero open", HERO_OPEN), ("hero end", HERO_END), ("old lead", OLD_LEAD),
                ("rrs-sr list", RRS_UL), ("stages script sec line", JS_SEC), ("occasions css rule", CSS_OCC),
                ("pageSeo catering title", TITLE_OLD), ("</body>", "</body>")):
    need(name, s, a)
need("routes.js catering line", r, "'catering', 'catering-occasions', 'catering-why', 'catering-cta'")

# ---------------------------------------------------------------- 1. take the picture out of the occasions section
oi = s.index(OCC_OPEN); oe = s.index(OCC_CLOSE, oi)
if s.count(OCC_CLOSE, oi, oe + len(OCC_CLOSE)) != 1: sys.exit("STOP: occasions section shape changed")
payload = s[oi + len(OCC_OPEN): oe]
if not payload.startswith('<div class="rrs" id="rrs">') or not payload.endswith('</div>') or payload.count('<section') or payload.count('class="rrs-card"') != 1:
    sys.exit("STOP: occasions payload is not the stages block we expect (page changed?)")
need("rrs-sr list inside payload", payload, RRS_UL)
need("catering-form id", s, 'id="catering-form"')
sec_end = oe + len(OCC_CLOSE)
if s[sec_end:sec_end + 1] == "\n": sec_end += 1
s = s[:oi] + s[sec_end:]

# ---------------------------------------------------------------- wire overlay (invisible)
W = json.loads(WIRES.read_text(encoding="utf-8"))
if len(W["laptop"]["wires"]) != 4 or len(W["phone"]["wires"]) != 6: sys.exit("STOP: wires.json must have 4 laptop and 6 phone wires")
def svg(kind, cls):
    d = W[kind]; a = ['<svg class="rrs-wires %s" viewBox="%s" aria-hidden="true" focusable="false"' % (cls, d["viewBox"])]
    if "handi" in d: a.append(' data-handi="%d %d"' % (d["handi"]["x"], d["handi"]["y"]))
    a.append(">")
    for w in d["wires"]:
        a.append('<path data-to="%s"%s%s d="%s"/>' % (w["to"], (' data-from="%s"' % w["from"]) if "from" in w else "",
                 (' data-bridge="%s"' % w["bridge"]) if "bridge" in w else "", w["d"]))
    a.append("</svg>"); return "".join(a)
payload = payload.replace(RRS_UL, svg("laptop", "rrs-wl") + svg("phone", "rrs-wp") + RRS_UL, 1)
WRAP = '<div class="rrs-wrap" id="rrs-wrap">' + payload + '</div>'

# ---------------------------------------------------------------- 2. rebuild the hero
hi = s.index(HERO_OPEN); he = s.index(HERO_END, hi) + len("</div></div>")
hero = s[hi:he]
h1 = re.findall(r'<h1 class="cx-h1">.*?</h1>', hero, re.S); sparks = re.findall(r'<i class="cx-spark"[^>]*></i>', hero)
trust = re.findall(r'<ul class="cx-trust">.*?</ul>', hero, re.S)
if len(h1) != 1 or len(sparks) != 6 or len(trust) != 1 or hero.count('class="cx-hero-photo"') != 1 or hero.count('class="cx-badge"') != 1:
    sys.exit("STOP: hero shape changed (h1 %d, sparks %d, trust %d)" % (len(h1), len(sparks), len(trust)))
LEAD = '<p class="cx-lead">Weddings, office lunches and family gatherings. All five outlets take catering orders.</p>'
WA = "https://wa.me/919849982052?text=Hi%20RR%20Durbar%2C%20I%27d%20like%20to%20plan%20a%20catering%20event."
BTNS = ('<div class="rrh-btns"><a class="rrh-b rrh-gold rrh-plan" href="#catering-form">Plan my event</a>'
        '<a class="rrh-b rrh-out rrh-wa" href="%s" target="_blank" rel="noopener noreferrer">WhatsApp us</a></div>' % WA)
new_hero = ('<div class="cx-hero"><div class="cx-hero-copy"><p class="cx-eyebrow">Catering &amp; Events</p>' + h1[0] + LEAD + BTNS + '</div>'
            + "".join(sparks) + WRAP + trust[0] + '</div>')
s = s[:hi] + new_hero + s[he:]

# ---------------------------------------------------------------- 3. stages script + css follow the move; title
s = s.replace(JS_SEC, "var sec=document.getElementById('rrs-wrap')", 1).replace(CSS_OCC, "", 1).replace(TITLE_OLD, TITLE_NEW, 1).replace(TAB_OLD, TAB_NEW, 1)

CSS = r"""/* rr-catering-1b: /catering/ hero with the stages picture, two buttons, sticky pill, invisible wire overlay. Revert: restore src/site.html.bak1b */
html body #catering .cx-hero{display:block;padding:26px 0 6px}
html body #catering .cx-hero-copy{max-width:none;padding-left:5.6%}
html body #catering .cx-lead{max-width:560px}
html body #catering .rrh-btns{display:flex;flex-wrap:wrap;gap:12px;margin:0;animation:cxUp .8s .42s both}
html body #catering .rrh-b{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:52px;min-width:190px;padding:0 26px;border:1.5px solid #E7B85C;border-radius:999px;font:800 13.5px/1 'Manrope',Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s,box-shadow .2s,background .2s}
html body #catering .rrh-gold{background:linear-gradient(180deg,#F0C56E,#C58A2A);color:#3a0b14;box-shadow:0 8px 20px rgba(0,0,0,.35)}
html body #catering .rrh-out{background:transparent;color:#F4DFB3}
html body #catering .rrh-b:hover{transform:translateY(-2px)}
html body #catering .rrh-gold:hover{box-shadow:0 12px 26px rgba(0,0,0,.45)}
html body #catering .rrh-out:hover{background:rgba(231,184,92,.16)}
html body #catering .rrh-b:focus-visible{outline:2px solid #F2D99B;outline-offset:3px}
html body #catering .rrs-wrap{position:relative;width:100%;max-width:1280px;margin:8px auto 0}
html body #catering .rrs-wrap::before{content:"";position:absolute;inset:-4% -3%;pointer-events:none;background:radial-gradient(closest-side,rgba(14,1,5,.78),rgba(14,1,5,0))}
html body #catering .rrs-wrap .rrs{margin:0 auto}
html body #catering .cx-trust{margin:20px 0 0;padding-left:5.6%}
.rrs-wires{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;opacity:0}
.rrs-wires path{fill:none;stroke:#F2D99B;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rrs-wp{display:none}
.rrs-showwires .rrs-wires{opacity:1}
.rrs-showwires .rrs-wires path{stroke:#00ffff;stroke-width:4}
@media(max-width:899px){.rrs-wl{display:none}.rrs-wp{display:block}}
.rrp{position:fixed;left:50%;bottom:24px;z-index:880;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:52px;padding:0 30px;border:1.5px solid #E7B85C;border-radius:999px;background:linear-gradient(180deg,#F0C56E,#C58A2A);color:#3a0b14;font:800 13.5px/1 'Manrope',Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;white-space:nowrap;box-shadow:0 10px 26px rgba(0,0,0,.45);-webkit-tap-highlight-color:transparent;opacity:0;visibility:hidden;transform:translate(-50%,16px);transition:opacity .25s,transform .25s,visibility 0s .25s}
.rrp.on{opacity:1;visibility:visible;transform:translate(-50%,0);transition:opacity .25s,transform .25s,visibility 0s}
.rrp:focus-visible{outline:2px solid #F2D99B;outline-offset:3px}
@media(max-width:1050px) and (min-height:500px){.rrp{bottom:calc(88px + env(safe-area-inset-bottom,0px));height:48px}}
@media(max-width:760px){
 html body #catering .cx-hero{padding:22px 0 0}
 html body #catering .cx-hero-copy{padding-left:0}
 html body #catering .rrh-btns{gap:10px}
 html body #catering .rrh-b{flex:1 1 0;min-width:0;height:48px;padding:0 10px;font-size:12.5px;letter-spacing:.1em}
 html body #catering .rrs-wrap::before{display:none}
 html body #catering .cx-trust{padding-left:0;margin-top:16px}
}
@media(prefers-reduced-motion:reduce){html body #catering .rrh-btns{animation:none}.rrp,.rrp.on{transition:none}}
"""
JS = r"""/* rr-catering-1b: Plan my event buttons scroll to the form; sticky pill (only on /catering/) */
(function(){var rrs=document.getElementById('rrs'),form=document.getElementById('catering-form');if(!rrs||!form)return;
var rmq=matchMedia('(prefers-reduced-motion:reduce)');
function go(e){e.preventDefault();form.scrollIntoView({behavior:rmq.matches?'auto':'smooth',block:'center'})}
var plan=document.querySelector('#catering .rrh-plan');if(plan)plan.addEventListener('click',go);
var pill=document.createElement('a');pill.className='rrp';pill.id='rrp';pill.href='#catering-form';pill.textContent='Plan my event';
pill.addEventListener('click',go);document.body.appendChild(pill);
var tick=false;
function upd(){tick=false;var vh=innerHeight,r=rrs.getBoundingClientRect(),f=form.getBoundingClientRect();
 var past=r.bottom<vh-8,vis=Math.min(f.bottom,vh)-Math.max(f.top,0),inForm=vis>=Math.min(f.height*.35,vh*.35);
 pill.classList.toggle('on',past&&!inForm)}
function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);upd();
})();
"""
BLOCK = '<style id="rr-catering-1b">' + CSS + '</style>\n<script id="rr-catering-1b-js">' + JS + '</script>\n'
s = s.replace("</body>", BLOCK + "</body>", 1)

# ---------------------------------------------------------------- 4. cms/routes.js
r2 = r.replace("'catering', 'catering-occasions', 'catering-why', 'catering-cta'", "'catering', 'catering-why', 'catering-cta'", 1)
pathlib.Path("src/site.html.bak1b").write_text(SITE.read_text(encoding="utf-8"), encoding="utf-8")
pathlib.Path("cms/routes.js.bak1b").write_text(r, encoding="utf-8")
SITE.write_text(s, encoding="utf-8"); ROUTES.write_text(r2, encoding="utf-8")
print("PATCHED: catering hero + stages picture + pill + invisible wire overlay (backups src/site.html.bak1b, cms/routes.js.bak1b)")

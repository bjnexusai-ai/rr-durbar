#!/usr/bin/env python3
"""Step 1C: catering links on the other pages (3 Nov). The /catering/ page itself is NOT touched.
 1. Home: a catering teaser band right after "What's new" (phone: ~200px card, art cropped to the handi; laptop: 320px band, text left, image right;
    one gold sweep when it enters view; 4px hover lift). New section id "home-catering" (registered in pageSections/sectionPages and cms/routes.js).
 2. Laptop top nav: a thin gold outline pill on "Catering" (1051px and up; below that the phone glass nav is used).
 3. Menu page: a card after the biryani group, "Hosting a crowd? Get a catering quote ->" (inside the menu script, so the prerender picks it up).
 4. Branches page (end of #br-list) and Locations page (end of #locations): "Planning an event? See catering ->".
 5. Footer: a "Catering & Events" link next to "Contact us".
 6. Track-order page line "Planning an event? We cater too ->"; and the order-confirmation screens in public/checkout/index.html and public/checkout/v2/index.html.
 7. Phone glass nav: on clean URLs (/about-us/, /menu/, /order-now/, /pickup/, /branches/, /contact/ ...) the right tab is highlighted (it only read ?page= before, so
    every clean URL showed Home). Pages with no tab (loyalty, track-order, policies) highlight nothing.
    /branches/ phone: the "Find the Durbar / Five outlets. One city." heading now sits ABOVE the map (CSS only).
All links are relative: /catering/.
Exact-match: STOPS unless each anchor is found the expected number of times. Idempotent. Backups: src/site.html.bak1c, cms/routes.js.bak1c,
public/checkout/index.html.bak1c, public/checkout/v2/index.html.bak1c. Run from the repo root, then rebuild (see APPLY.md)."""
import pathlib, sys

SITE = pathlib.Path("src/site.html"); ROUTES = pathlib.Path("cms/routes.js")
CK1 = pathlib.Path("public/checkout/index.html"); CK2 = pathlib.Path("public/checkout/v2/index.html")
for f in (SITE, ROUTES, CK1, CK2):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root, on the latest main)" % f)
s = SITE.read_text(encoding="utf-8"); r = ROUTES.read_text(encoding="utf-8")
c1 = CK1.read_text(encoding="utf-8"); c2 = CK2.read_text(encoding="utf-8")

MARK = 'id="rr-catering-1c"'
done = [MARK in s, "'home-catering'" in r, "We cater too" in c1, "We cater too" in c2]
if all(done):
    print("already done (nothing to change)"); sys.exit(0)
if any(done): sys.exit("STOP: the patch is half applied (site=%s routes=%s checkout=%s v2=%s). Restore the .bak1c files or git checkout, then run again." % tuple(done))

def need(name, hay, a, n=1):
    c = hay.count(a)
    if c != n: sys.exit("STOP: %s found %d times (need %d)" % (name, c, n))

# ------------------------------------------------------------------ anchors
PS_OLD = "home: ['home', 'hero-next', 'whats-new', 'bestsellers',"
PS_NEW = "home: ['home', 'hero-next', 'whats-new', 'home-catering', 'bestsellers',"
SP_OLD = "'whats-new': 'home',"
SP_NEW = "'whats-new': 'home', 'home-catering': 'home',"
HON_OLD = '</section>\n<section class="rr-section wh" id="honours"'
MENU_OLD = '.join("")+"</section>"});'
MENU_NEW = ('.join("")+"</section>"+(g.id==="biryani"?\'<a class="m52-cat" href="/catering/"><span class="m52-cat-t"><small>Catering &amp; Events</small>'
            '<b>Hosting a crowd? Get a catering quote</b></span><span class="m52-cat-go" aria-hidden="true">&rarr;</span></a>\':"")});')
FOOT_OLD = '<p class="rrf-contact" style="text-align:center;margin:10px 0"><a href="?page=contact#contact">Contact us</a></p>'
FOOT_NEW = ('<p class="rrf-contact" style="text-align:center;margin:10px 0"><a href="?page=contact#contact">Contact us</a>'
            ' &nbsp;&middot;&nbsp; <a class="rrf-catering" href="/catering/">Catering &amp; Events</a></p>')
TAB_OLD = "function sync(){var q=location.search+location.hash,cur='Home';"
TAB_NEW = ("function sync(){var q=location.search+location.hash,cur='Home';"
           "var PM={'about-us':'About','menu':'Menu','order-now':'Order','pickup':'Order','pickup-menu':'Order','branches':'Branches','locations':'Branches','catering':'Catering','contact':'Contact',"
           "'loyalty':'','rewards':'','track-order':'','policies':'','privacy-policy':'','terms-of-service':'','refund-cancellation':''},"
           "pk=PM[location.pathname.replace(/^\\/+|\\/+$/g,'')];if(pk!==undefined)cur=pk;")
for name, a, n in (("pageSections home", PS_OLD, 1), ("sectionPages whats-new", SP_OLD, 1), ("honours anchor", HON_OLD, 1), ("menu group end", MENU_OLD, 1),
                   ("footer contact line", FOOT_OLD, 1), ("tabbar sync", TAB_OLD, 1), ("</body>", "</body>", 1)):
    need(name, s, a, n)
RT_OLD = "sections: ['home', 'whats-new', 'bestsellers',"
RT_NEW = "sections: ['home', 'whats-new', 'home-catering', 'bestsellers',"
need("routes.js home line", r, RT_OLD)

def end_of(sec_open, tail='</div></section>'):
    """Index just before the container's closing </div> of the section that starts with sec_open (the section must end with </div></section>, optionally after a newline)."""
    need("section " + sec_open, s, sec_open)
    i = s.index(sec_open); e = s.index("</section>", i)
    j = e
    while s[j - 1] == "\n": j -= 1
    if s[j - 6:j] != "</div>": sys.exit("STOP: section %s does not end with </div></section>" % sec_open)
    return j - 6

LINE_BR = '<p class="rrc-line"><a href="/catering/">Planning an event? See catering &rarr;</a></p>'
LINE_TR = '<p class="rrc-line"><a href="/catering/">Planning an event? We cater too &rarr;</a></p>'
ins = sorted([(end_of('id="br-list" data-edit-section="branches-list"'), LINE_BR),
              (end_of('id="locations" data-edit-section="locations-outlets"'), LINE_BR),
              (end_of('id="track-order" data-edit-section="order-tracking"'), LINE_TR)], reverse=True)

# checkout confirmation screens (edited directly, exact-match)
C1_OLD = "'<a href=\"/?page=track-order\"><button class=\"pri\">Track this order</button></a></div>'},"
C1_NEW = ("'<a href=\"/?page=track-order\"><button class=\"pri\">Track this order</button></a></div>'"
          "+'<p class=\"cat-line\" style=\"text-align:center;margin:6px 0 0\"><a href=\"/catering/\" style=\"display:inline-block;padding:12px 8px;color:var(--m);font-weight:700\">Planning an event? We cater too &rarr;</a></p>'},")
need("checkout v1 done screen", c1, C1_OLD)
C2_OLD = ("'<p class=\"muted\">Keep this page or note your order number. For help call <a href=\"tel:' + CFG.CALL + '\">+91 98499 82052</a>.</p>"
          "<a class=\"btn btn-pri\" href=\"/?page=pickup-menu\">Order more</a>")
C2_NEW = ("'<p class=\"muted\">Keep this page or note your order number. For help call <a href=\"tel:' + CFG.CALL + '\">+91 98499 82052</a>.</p>"
          "<p class=\"cat-line\" style=\"margin:10px 0\"><a href=\"/catering/\" style=\"display:inline-block;padding:10px 0;color:var(--m,#4a0e1a);font-weight:700\">Planning an event? We cater too &rarr;</a></p>"
          "<a class=\"btn btn-pri\" href=\"/?page=pickup-menu\">Order more</a>")
need("checkout v2 done screen", c2, C2_OLD)

# ------------------------------------------------------------------ 1. home band
BAND = ('<section class="rr-section rrc-band" id="home-catering" aria-labelledby="rrc-h">'
        '<a class="rrc-card" href="/catering/">'
        '<span class="rrc-img" aria-hidden="true"><img src="assets/rr-stages-l-1280.webp" width="1280" height="720" alt="" loading="lazy" decoding="async"></span>'
        '<span class="rrc-copy"><small class="rrc-eye">Catering &amp; Events</small>'
        '<h2 class="rrc-h" id="rrc-h">Catering for every occasion</h2>'
        '<span class="rrc-lead">Weddings, office lunches and family gatherings, cooked fresh by RR Durbar.</span>'
        '<b class="rrc-cta">PLAN YOUR EVENT &rarr;</b></span>'
        '<i class="rrc-sweep" aria-hidden="true"></i></a></section>\n')

CSS = r"""
/* rr-catering-1c START: catering links. Revert: restore src/site.html.bak1c */
/* home teaser band */
.rrc-band{padding:clamp(20px,3vw,40px) 0;background:linear-gradient(180deg,#120805,#1a0b0a)}
.rrc-card{position:relative;display:block;width:min(1180px,calc(100% - 32px));height:200px;margin:0 auto;border-radius:20px;overflow:hidden;isolation:isolate;text-decoration:none;color:#f3e6cf;background:#16030a;border:1px solid rgba(213,178,108,.5);box-shadow:0 18px 40px rgba(0,0,0,.45);transition:transform .25s ease,box-shadow .25s ease}
.rrc-img{position:absolute;inset:0;z-index:-1}
.rrc-img img{position:absolute;display:block;width:185%;max-width:none;height:auto;left:72%;top:50%;transform:translate(-53.5%,-71.4%)}
.rrc-card::before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(18,5,8,.95) 0,rgba(18,5,8,.84) 40%,rgba(18,5,8,.12) 78%)}
.rrc-copy{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:6px;height:100%;max-width:64%;padding:0 18px;box-sizing:border-box}
.rrc-eye{font:800 10.5px/1.2 'Manrope',Arial,sans-serif;letter-spacing:.14em;white-space:nowrap;text-transform:uppercase;color:#e9b85c}
.rrc-h{margin:0;font:600 clamp(26px,7.4vw,32px)/1.05 'Cormorant Garamond',Georgia,serif;color:#f6dfa6;text-wrap:balance}
.rrc-lead{display:none}
.rrc-cta{display:inline-flex;align-items:center;min-height:44px;margin-top:4px;padding:0 18px;border-radius:999px;background:linear-gradient(135deg,#f5d27a,#d9a640);color:#2b1412;font:800 12.5px/1 'Manrope',Arial,sans-serif;letter-spacing:.1em}
.rrc-sweep{position:absolute;top:0;bottom:0;left:0;width:38%;z-index:2;pointer-events:none;opacity:0;background:linear-gradient(100deg,rgba(255,214,130,0),rgba(255,214,130,.32),rgba(255,214,130,0));transform:translateX(-130%) skewX(-14deg)}
.rrc-in .rrc-sweep{animation:rrcSweep 1.5s ease-out 1 both}
@keyframes rrcSweep{0%{opacity:0;transform:translateX(-130%) skewX(-14deg)}15%{opacity:1}100%{opacity:0;transform:translateX(330%) skewX(-14deg)}}
.rrc-card:focus-visible{outline:3px solid #f6d78e;outline-offset:3px}
@media(hover:hover){.rrc-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.5),0 0 0 1px rgba(233,184,92,.6)}}
@media(min-width:900px){
 .rrc-card{height:320px}
 .rrc-img{left:auto;right:0;width:62%;z-index:-1;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 26%);mask-image:linear-gradient(90deg,transparent 0,#000 26%)}
 .rrc-img img{position:static;width:100%;height:100%;transform:none;object-fit:cover;object-position:53.5% 71.4%}
 .rrc-card::before{background:linear-gradient(90deg,rgba(18,5,8,.96) 0,rgba(18,5,8,.5) 44%,rgba(18,5,8,0) 70%)}
 .rrc-copy{max-width:46%;padding:0 clamp(32px,5vw,64px);gap:12px}
 .rrc-h{font-size:clamp(38px,3.6vw,50px)}
 .rrc-lead{display:block;max-width:34ch;font:500 15px/1.55 'Manrope',Arial,sans-serif;color:rgba(243,230,207,.86)}
 .rrc-cta{min-height:48px;padding:0 24px;font-size:13px}
}
/* laptop nav: thin gold outline pill on Catering (the phone uses the glass tab bar below 1051px) */
@media(min-width:1051px){html body .nav-links a[href*="catering"]{border:1px solid rgba(233,184,92,.75);border-radius:999px;box-shadow:inset 0 0 0 1px rgba(233,184,92,.12)}html body .nav-links a[href*="catering"]:hover{border-color:#f2d99b;background:rgba(233,184,92,.12)}}
/* menu card after the biryani group */
#m52 .m52-cat{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 28px;padding:18px 22px;min-height:72px;border-radius:16px;text-decoration:none;background:linear-gradient(135deg,#3a141c,#1c080d);border:1px solid rgba(213,178,108,.6);box-shadow:0 10px 26px rgba(43,20,18,.25);transition:transform .22s ease,box-shadow .22s ease}
#m52 .m52-cat-t{display:flex;flex-direction:column;gap:4px;min-width:0}
#m52 .m52-cat small{font:800 10.5px/1.2 Poppins,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9b85c}
#m52 .m52-cat b{font:600 clamp(20px,5vw,26px)/1.15 'Cormorant Garamond',Georgia,serif;color:#f6dfa6}
#m52 .m52-cat-go{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f5d27a,#d9a640);color:#2b1412;font-size:20px;font-weight:800}
#m52 .m52-cat:focus-visible{outline:3px solid #c58a1b;outline-offset:3px}
@media(hover:hover){#m52 .m52-cat:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(43,20,18,.32)}}
/* one-line links (branches, locations, track order) */
.rrc-line{margin:22px 0 0;text-align:center;font:600 15px/1.5 'Manrope',Arial,sans-serif;color:inherit}
.rrc-line a{display:inline-flex;align-items:center;min-height:44px;padding:0 6px;color:inherit;font-weight:800;text-decoration:underline;text-decoration-color:#e9b85c;text-decoration-thickness:2px;text-underline-offset:5px}
.rrc-line a:focus-visible{outline:2px solid #e9b85c;outline-offset:2px}
.rrf-catering{color:inherit}
/* /branches/ phone: the heading comes above the map. The side column dissolves so its parts can be ordered around the map. */
@media(max-width:899px){
 html body #br-map .brm-in{display:flex;flex-direction:column;gap:0}
 html body #br-map .brm-side{display:contents}
 html body #br-map .brm-eye{order:1;margin:0 16px 8px}
 html body #br-map .brm-side h2{order:2;margin:0 16px}
 html body #br-map .brm-sub{order:3;margin:10px 16px 18px}
 html body #br-map .brm-fig{order:4}
 html body #br-map .brm-cards{order:5;margin-top:22px}
}
@media(prefers-reduced-motion:reduce){.rrc-card,#m52 .m52-cat{transition:none}.rrc-sweep{display:none}.rrc-card:hover,#m52 .m52-cat:hover{transform:none}}
/* rr-catering-1c END */
"""
JS = r"""/* rr-catering-1c: one gold sweep when the home band enters view */
(function(){var c=document.querySelector('#home-catering .rrc-card');if(!c)return;
function go(){c.classList.add('rrc-in')}
if(!('IntersectionObserver' in window)){go();return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){go();io.disconnect()}})},{threshold:.4});io.observe(c);
})();
"""
BLOCK = '<style id="rr-catering-1c">' + CSS + '</style>\n<script id="rr-catering-1c-js">' + JS + '</script>\n'

# ------------------------------------------------------------------ apply to site.html
for pos, line in ins:                      # highest position first, so the earlier offsets stay valid
    s = s[:pos] + line + s[pos:]
s = s.replace(PS_OLD, PS_NEW, 1).replace(SP_OLD, SP_NEW, 1).replace(HON_OLD, "</section>\n" + BAND + '<section class="rr-section wh" id="honours"', 1)
s = s.replace(MENU_OLD, MENU_NEW, 1).replace(FOOT_OLD, FOOT_NEW, 1).replace(TAB_OLD, TAB_NEW, 1)
s = s.replace("</body>", BLOCK + "</body>", 1)
r2 = r.replace(RT_OLD, RT_NEW, 1)
c1n = c1.replace(C1_OLD, C1_NEW, 1); c2n = c2.replace(C2_OLD, C2_NEW, 1)

for src, f in ((s, SITE), (r, ROUTES), (c1, CK1), (c2, CK2)):
    pathlib.Path(str(f) + ".bak1c").write_text({SITE: open(SITE, encoding="utf-8").read(), ROUTES: r, CK1: c1, CK2: c2}[f], encoding="utf-8")
SITE.write_text(s, encoding="utf-8"); ROUTES.write_text(r2, encoding="utf-8"); CK1.write_text(c1n, encoding="utf-8"); CK2.write_text(c2n, encoding="utf-8")
print("PATCHED: home band, nav pill, menu card, branches/locations/track lines, footer link, checkout lines, phone nav tabs, branches heading above map")
print("backups: src/site.html.bak1c cms/routes.js.bak1c public/checkout/index.html.bak1c public/checkout/v2/index.html.bak1c")

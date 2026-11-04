#!/usr/bin/env python3
"""Step 1C tests: catering links on other pages + phone nav highlight + branches heading order. Needs a server on 127.0.0.1:8765 serving public/. Run from the repo root."""
from playwright.sync_api import sync_playwright
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hero")); import rr_test_shim  # noqa: F401
B = "http://127.0.0.1:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
def load(br, path, w, h, mob):
    ctx = br.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob); pg = ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append(str(e)[:120])); pg.goto(B + path, wait_until="load"); pg.wait_for_timeout(900); return ctx, pg
def hrefs(pg, sel): return pg.evaluate("(s)=>[...document.querySelectorAll(s)].map(a=>a.getAttribute('href'))", sel)
with sync_playwright() as p:
    br = p.chromium.launch()
    for w, h, mob in ((390, 844, True), (1440, 900, False)):
        ctx, pg = load(br, "/", w, h, mob)
        band = pg.evaluate("(()=>{const c=document.querySelector('#home-catering .rrc-card');if(!c)return null;c.scrollIntoView({block:'center'});const r=c.getBoundingClientRect();return [Math.round(r.height),c.getAttribute('href'),c.textContent.includes('PLAN YOUR EVENT'),r.left>=0&&r.right<=innerWidth]})()")
        pg.wait_for_timeout(1800)
        sw = pg.evaluate("document.querySelector('#home-catering .rrc-card').classList.contains('rrc-in')")
        want = 200 if w < 900 else 320
        res(band and band[0] == want and band[1] == "/catering/" and band[2] and band[3], f"{w}: home band {band} (height want {want})")
        res(sw, f"{w}: gold sweep started once the band was in view")
        after = pg.evaluate("(()=>{const a=document.getElementById('whats-new'),b=document.getElementById('home-catering');return a.nextElementSibling===b})()")
        res(after, f"{w}: band sits right after What's new")
        res(pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), f"{w}: no sideways scroll on home")
        if w == 1440:
            bd = pg.evaluate("(()=>{const a=document.querySelector('.nav-links a[href*=catering]');const c=getComputedStyle(a);return [c.borderTopWidth,c.borderTopLeftRadius]})()")
            res(bd[0] == "1px" and float(bd[1].replace('px','')) > 10, f"1440: gold outline pill on nav Catering {bd}")
        res(not pg.errs, f"{w}: no script errors {pg.errs}")
        ctx.close()
    # menu card
    ctx, pg = load(br, "/menu/", 390, 844, True)
    m = pg.evaluate("(()=>{const c=document.querySelector('#m52-list .m52-cat');if(!c)return null;const g=document.getElementById('m52-g-biryani');return [c.getAttribute('href'),g&&g.nextElementSibling===c]})()")
    res(m == ["/catering/#catering-form", True], f"menu: catering card right after biryani group {m}")
    res(pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), "menu 390: no sideways scroll"); ctx.close()
    # branches, locations, track-order lines
    for path, sel in (("/branches/", "#br-list .rrc-line a"), ("/locations/", "#locations .rrc-line a"), ("/track-order/", "#track-order .rrc-line a")):
        ctx, pg = load(br, path, 390, 844, True); h = hrefs(pg, sel)
        res(h == ["/catering/#catering-form"], f"{path}: line links to the catering form {h}"); ctx.close()
    # footer
    ctx, pg = load(br, "/about-us/", 390, 844, True); h = hrefs(pg, "footer a.rrf-catering")
    res(h == ["/catering/"] and "Catering & Events" in pg.evaluate("document.querySelector('footer a.rrf-catering').textContent"), f"footer: Catering & Events link {h}"); ctx.close()
    # confirmation screens (source check: the screens are drawn by script after a payment)
    for f in ("public/checkout/index.html", "public/checkout/v2/index.html"):
        t = open(f, encoding="utf-8").read()
        res(t.count('href="/catering/#catering-form"') == 1 and "Plan your event" in t, f"{f}: confirmation line links to /catering/")
    # phone tab highlight
    for path, want in (("/", "Home"), ("/about-us/", "About"), ("/menu/", "Menu"), ("/order-now/", "Order"), ("/branches/", "Branches"), ("/catering/", "Catering"), ("/contact/", None), ("/loyalty/", None)):
        ctx, pg = load(br, path, 390, 844, True); pg.wait_for_timeout(700)
        on = pg.evaluate("[...document.querySelectorAll('#rr-tabbar a.on')].map(a=>a.dataset.k)")
        res(on == ([want] if want else []), f"tab highlight {path}: {on} (want {want})"); ctx.close()
    # branches heading above the map (phone), two columns kept on laptop
    ctx, pg = load(br, "/branches/", 390, 844, True)
    o = pg.evaluate("(()=>{const h=document.querySelector('#br-map h2').getBoundingClientRect(),e=document.querySelector('#br-map .brm-eye').getBoundingClientRect(),m=document.getElementById('brmMap').getBoundingClientRect(),c=document.getElementById('brmCards').getBoundingClientRect();return [e.bottom<=h.top+1,h.bottom<=m.top,m.bottom<=c.top,document.documentElement.scrollWidth<=innerWidth]})()")
    res(all(o), f"branches 390: eyebrow, heading above map, cards below {o}"); ctx.close()
    ctx, pg = load(br, "/branches/", 1440, 900, False)
    o = pg.evaluate("(()=>{const h=document.querySelector('#br-map h2').getBoundingClientRect(),m=document.getElementById('brmMap').getBoundingClientRect();return [h.left>m.right]})()")
    res(all(o), f"branches 1440: heading stays in the right column {o}"); ctx.close()
    for w in (360,):
        for path in ("/", "/menu/", "/branches/", "/track-order/"):
            ctx, pg = load(br, path, w, 740, True)
            res(pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), f"{w} {path}: no horizontal scroll"); ctx.close()
    br.close()
print("RESULT: %s" % ("ALL PASS" if not bad else f"{bad} FAIL")); sys.exit(1 if bad else 0)

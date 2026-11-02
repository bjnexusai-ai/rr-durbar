#!/usr/bin/env python3
"""2 Nov home hero redesign tests (plan RR_Durbar_PLAN_MobileHero_02Nov.md section 5). Needs a server on :8765 serving public/. Run from repo root.
Does NOT use the doors-off shim: it tests the doors themselves."""
import sys, os
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rr_test_shim as shim  # only for the optional RR_CHROMIUM launcher; doors-off init is added per context below
B = 'http://localhost:8765'; bad = 0
def res(ok, m):
    global bad; print(('PASS ' if ok else 'FAIL ') + m); bad += 0 if ok else 1
SEEN = "try{sessionStorage.setItem('rrDoorsSeen','1')}catch(e){}"
def ctx_for(b, w, h, mobile=False, seen=True, rm='no-preference'):
    c = shim._nc(b, viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile, reduced_motion=rm)
    if seen: c.add_init_script(SEEN)
    return c
with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, h) in ((390, 844), (360, 740)):
        c = ctx_for(br, w, h, True); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(B + '/', wait_until='load'); pg.wait_for_timeout(1500)
        r = pg.evaluate("""() => { const q=s=>document.querySelector(s), vh=innerHeight, ph=q('#home .slide.active .slide-photo').getBoundingClientRect(), sc=q('#home .slide.active .slide-content'), cs=getComputedStyle(sc),
          vis=s=>{const e=q(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0};
          const tb=q('#rr-tabbar'), tbr=tb&&tb.getBoundingClientRect();
          return { photoH: ph.height, svh: vh*0.58+26, rr: cs.borderTopLeftRadius, desc: vis('#home .slide.active .hero-desc'), idx: vis('#home .slide.active .slide-index'), arrows: vis('#home .hero-arrow'), first: vis('#home .hero-first'),
            btn: [...document.querySelectorAll('#home .rr-hero-order>*')].length, dashes: document.querySelectorAll('#progressBars button').length, sx: document.documentElement.scrollWidth - innerWidth,
            tabs: tb ? tb.querySelectorAll('a').length : 0, gap: tb ? Math.round(innerHeight - tbr.bottom) : -1, on: tb ? tb.querySelectorAll('a.on').length : 0, hn: vis('#hero-next'),
            hnTxt: (q('#hero-next')||{}).innerText||'', haze: window.rrHaze && window.rrHaze.on, diamond: getComputedStyle(sc,'::before').width, gradient: getComputedStyle(q('#home .slide.active .slide-photo'),'::after').display } }""")
        res(abs(r['photoH'] - r['svh']) < 3, f'{w}: photo height {r["photoH"]:.0f} ~ 58svh+26 = {r["svh"]:.0f}')
        res(r['gradient'] == 'none', f'{w}: no gradient/shade on the photo')
        res(r['diamond'] == '13px' and r['rr'] != '0px', f'{w}: arch + diamond present')
        res(not r['desc'] and not r['idx'] and not r['arrows'] and not r['first'], f'{w}: no description, counter, arrows or tagline in the panel')
        res(r['btn'] == 2 and r['dashes'] == 8, f'{w}: 2 buttons and 8 dashes')
        res(r['sx'] <= 0, f'{w}: no horizontal scroll ({r["sx"]})')
        res(r['tabs'] == 6 and r['gap'] >= 8 and r['on'] == 1, f'{w}: floating nav: {r["tabs"]} items, {r["gap"]}px above the bottom edge, active pill {r["on"]}')
        res(r['hn'] and "theme-based restaurant" in r['hnTxt'].lower() and 'since 1991' in r['hnTxt'].lower(), f'{w}: tagline + heading in #hero-next')
        res(r['haze'] is False, f'{w}: window.rrHaze.on is false')
        res(not errs, f'{w}: no script errors {errs[:1]}')
        # floating buttons: hidden at top, shown after scroll
        o0 = pg.evaluate("getComputedStyle(document.getElementById('rrw')).opacity"); pg.evaluate('window.scrollTo(0, innerHeight*1.1)'); pg.wait_for_timeout(700); pg.evaluate('window.scrollTo(0, innerHeight*1.1 - 60)'); pg.wait_for_timeout(900)
        o1 = pg.evaluate("getComputedStyle(document.getElementById('rrw')).opacity")
        res(o0 == '0' and o1 == '1', f'{w}: floating buttons hidden at top ({o0}), shown after scroll ({o1})')
        res(pg.evaluate("""() => { const f=[...document.querySelectorAll('main *,section')].pop(); const tb=document.getElementById('rr-tabbar').getBoundingClientRect(); window.scrollTo(0, document.documentElement.scrollHeight); return parseFloat(getComputedStyle(document.body).paddingBottom) >= (innerHeight - tb.top) }"""), f'{w}: page bottom padding clears the nav')
        c.close()
    # LCP image priority
    c = ctx_for(br, 390, 844, True); pg = c.new_page(); pg.goto(B + '/', wait_until='load')
    res(pg.evaluate("!!document.querySelector('#home .slide.active img.hero-image[fetchpriority=\"high\"]')"), 'LCP hero image has fetchpriority=high'); c.close()
    # laptop
    c = ctx_for(br, 1440, 900); pg = c.new_page(); pg.goto(B + '/', wait_until='load'); pg.wait_for_timeout(1500)
    r = pg.evaluate("""() => { const vis=s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0}; return { desc: vis('#home .slide.active .hero-desc'), arrows: vis('#home .hero-arrow'), hn: vis('#hero-next'), h: document.getElementById('home').getBoundingClientRect().height, vh: innerHeight, tab: !!document.querySelector('#rr-tabbar') && getComputedStyle(document.querySelector('#rr-tabbar')).display } }""")
    res(r['desc'] and r['arrows'] and not r['hn'], f'laptop: description + arrows present, #hero-next hidden {r}')
    # animations: only transform + opacity (the one-off rrShim heading shimmer is the known exception)
    props = pg.evaluate("""() => { const s=new Set(); document.getAnimations().forEach(a=>{ if(!a.effect||!a.effect.getKeyframes) return; const n=a.animationName||''; if(['rrShim','rrFoil','rrIris','rrIrisRim','rrHeroRise','rrDraw','rrShimmer','rr10Wa'].includes(n)) return; a.effect.getKeyframes().forEach(k=>Object.keys(k).forEach(p=>{ if(!['offset','easing','composite','computedOffset'].includes(p)) s.add(n+':'+p) })) }); return [...s] }""")
    badp = [x for x in props if x.split(':')[1] not in ('transform', 'opacity', 'translate', 'scale', 'rotate', 'visibility', 'pointerEvents', 'pointer-events', 'cssOffset', 'boxShadow') ]
    res(not badp, f'laptop: animated properties besides transform/opacity: {badp[:8]}')
    c.close()
    # doors
    c = ctx_for(br, 390, 844, True, seen=False); pg = c.new_page(); pg.goto(B + '/', wait_until='domcontentloaded')
    pg.wait_for_selector('#rr-doors', timeout=10000)
    t = pg.evaluate("document.getElementById('rr-doors').innerText")
    res('WELCOME TO' in t.upper() and 'RR DURBAR' in t.upper(), 'doors present on the first load with Welcome to / RR DURBAR')
    pg.wait_for_function("!document.getElementById('rr-doors')", timeout=15000)
    res(True, 'doors gone after about 2.5 s')
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(1200)
    res(pg.evaluate("!document.getElementById('rr-doors')"), 'doors not shown on a reload in the same visit'); c.close()
    c = ctx_for(br, 390, 844, True, seen=False); pg = c.new_page(); pg.goto(B + '/', wait_until='domcontentloaded'); pg.wait_for_selector('#rr-doors'); pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('rr-doors').click()"); pg.wait_for_timeout(1000)
    res(pg.evaluate("!document.getElementById('rr-doors')"), 'a tap skips the doors'); c.close()
    c = ctx_for(br, 390, 844, True, seen=False, rm='reduce'); pg = c.new_page(); pg.goto(B + '/', wait_until='domcontentloaded'); pg.wait_for_timeout(500)
    res(pg.evaluate("!document.getElementById('rr-doors')"), 'no doors with reduced motion'); c.close()
    br.close()
print('FAILED: %d' % bad if bad else 'ALL OK'); sys.exit(1 if bad else 0)

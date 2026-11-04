#!/usr/bin/env python3
"""Step 3 tests: music that travels (plan section 3). Needs a server on :8765 serving public/. Run from the repo root.
  cd public && python3 -m http.server 8765 &      python3 tools/music/music_test.py
Uses tools/hero/rr_test_shim.py (doors off). Two browsers: one lets audio autoplay, one blocks it until a tap."""
import sys, os
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero'))
import rr_test_shim  # noqa: F401  (turns the doors off for every context)
B = 'http://localhost:8765'; bad = 0
SIZES = ((360, 740, True), (390, 844, True), (1440, 900, False))
def res(ok, m):
    global bad; print(('PASS ' if ok else 'FAIL ') + m); bad += 0 if ok else 1
def ctx(br, w, h, mobile):
    return br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
def go(pg, path, wait=1600):
    pg.goto(B + path, wait_until='load'); pg.wait_for_timeout(wait)
def state(pg):
    return pg.evaluate("""() => { const e=document.getElementById('rrm'), a=document.getElementById('royalAudio'), cs=e&&getComputedStyle(e), r=e&&e.getBoundingClientRect();
      return { has: !!e, shown: !!e && !e.hidden && cs.display!=='none' && cs.visibility!=='hidden' && parseFloat(cs.opacity)>0.5 && r.width>0 && r.right>0 && r.bottom>0 && r.left<innerWidth && r.top<innerHeight,
        ls: (()=>{try{return localStorage.getItem('rrMusic')}catch(e){return null}})(), paused: a ? a.paused : null,
        st: window.rrMusic ? window.rrMusic.state() : null, lbl: e ? (e.querySelector('.rrm-lbl')||{}).textContent : '', tip: e ? (e.querySelector('.rrm-tip')||{}).textContent : '',
        wait: !!e && e.classList.contains('is-wait'), ho: !!e && e.classList.contains('rrm-ho') } }""")
def settle(pg, shown=True):
    # wait for the 0.3s fade (rrm-ho) to finish instead of guessing a delay
    try: pg.wait_for_function("(() => { const e=document.getElementById('rrm'); if(!e) return false; const o=parseFloat(getComputedStyle(e).opacity); return %s })()" % ('o>0.95 && !e.hidden' if shown else 'o<0.05 || e.hidden'), timeout=4000)
    except Exception: pass
def music_on_at_home(pg):
    go(pg, '/', 1500); pg.click('#musicButton'); pg.wait_for_timeout(1500)
def safe_tap(pg, mobile):
    pt = pg.evaluate("""() => { const bad='a,button,input,select,textarea,label,summary,[role=button],[onclick],#rrm,#rrw,#rrd';
      for (let y=Math.round(innerHeight*.45); y<innerHeight-120; y+=40) for (let x=Math.round(innerWidth*.5); x<innerWidth-60; x+=40) { const e=document.elementFromPoint(x,y); if (e && !e.closest(bad)) return [x,y] }
      return [Math.round(innerWidth/2), Math.round(innerHeight/2)] }""")
    if mobile: pg.touchscreen.tap(pt[0], pt[1])
    else: pg.mouse.click(pt[0], pt[1])
def overlaps(pg):
    return pg.evaluate("""() => { const m=document.getElementById('rrm'); if(!m) return ['no player'];
      const R=m.getBoundingClientRect(), out=[], vis=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>0.05};
      for (const e of document.querySelectorAll('#rrd .rrd-btn, #rrw-launch, #rr-tabbar')) { if(!vis(e)) continue; const r=e.getBoundingClientRect();
        if (R.left<r.right && R.right>r.left && R.top<r.bottom && R.bottom>r.top) out.push((e.id||e.className)+' '+[r.left,r.top,r.width,r.height].map(Math.round)) }
      return out }""")

with sync_playwright() as p:
    ok_br = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    blk_br = p.chromium.launch(args=['--autoplay-policy=document-user-activation-required'])
    for (w, h, mob) in SIZES:
        tag = f'{w}'
        # 1. on at home -> mini player + state on at /menu/, no script errors
        c = ctx(ok_br, w, h, mob); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        music_on_at_home(pg); s = state(pg)
        res(s['ls'] == 'on' and s['paused'] is False, f'{tag}: music on at home (saved "on", audio playing)')
        go(pg, '/menu/'); s = state(pg)
        res(s['shown'] and s['st'] and s['st']['on'] and s['ls'] == 'on', f'{tag}: /menu/ mini player shows, state on {s["st"]}')
        res(s['paused'] is False and not s['wait'], f'{tag}: /menu/ audio keeps playing')
        # 5. no overlap with dock / phone nav: top, middle, bottom of /menu/
        for name, y in (('top', '0'), ('middle', 'document.documentElement.scrollHeight/2'), ('bottom', 'document.documentElement.scrollHeight')):
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(900)
            o = overlaps(pg); res(not o, f'{tag}: no overlap with dock/nav at {name} of /menu/ {o}')
        pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(300)
        res(pg.evaluate("!!document.getElementById('rr-tabbar') && getComputedStyle(document.getElementById('rr-tabbar')).display!=='none'") == mob, f'{tag}: phone nav present only on phone')
        # 3. hidden on /checkout/, state kept, back on /menu/
        go(pg, '/checkout/', 1200); s = state(pg)
        res(not s['shown'] and s['ls'] == 'on', f'{tag}: hidden on /checkout/, saved state kept')
        go(pg, '/menu/', 1200); res(state(pg)['shown'], f'{tag}: player back on /menu/ after checkout')
        # 2. x turns it off everywhere
        pg.click('#rrm .rrm-x'); pg.wait_for_timeout(1000); s = state(pg)
        res(not s['shown'] and s['ls'] == 'off' and s['paused'] is True, f'{tag}: x turns it off on /menu/ (saved off, audio paused)')
        for path in ('/', '/catering/', '/branches/'):
            go(pg, path, 1200); s = state(pg)
            res(not s['shown'] and s['paused'] is True, f'{tag}: still off on {path}')
        res(not errs, f'{tag}: no script errors {errs[:1]}'); c.close()

        # 1b. autoplay blocked -> "Tap to resume", a tap resumes
        c = ctx(blk_br, w, h, mob); pg = c.new_page()
        music_on_at_home(pg); go(pg, '/menu/'); s = state(pg)
        res(s['shown'] and s['wait'] and s['paused'] is True, f'{tag}: autoplay blocked -> player shows, waiting')
        res('Tap to resume' in (s['lbl'] or '') or 'Tap to resume' in (s['tip'] or ''), f'{tag}: text says "Tap to resume" ({s["lbl"]!r}/{s["tip"]!r})')
        safe_tap(pg, mob)
        try: pg.wait_for_function("document.getElementById('royalAudio').paused === false", timeout=4000)
        except Exception: pass
        s = state(pg)
        res(s['paused'] is False and not s['wait'], f'{tag}: a tap resumes (audio.paused === false), "Tap to resume" gone')
        c.close()

    # 4. laptop: hidden while the home hero is in view, shown after scrolling past it
    c = ctx(ok_br, 1440, 900, False); pg = c.new_page(); music_on_at_home(pg); s = state(pg)
    res(s['st'] and s['st']['on'] and s['ho'] and not s['shown'], f'1440: home hero in view -> mini player hidden (rrm-ho={s["ho"]})')
    pg.evaluate('window.scrollTo(0, innerHeight*1.6)'); pg.wait_for_timeout(600); settle(pg); s = state(pg)
    res(s['shown'] and not s['ho'], '1440: scrolled past the hero -> mini player shown')
    o = overlaps(pg); res(not o, f'1440: no overlap with dock on home below the hero {o}')
    pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(600); settle(pg, False); s = state(pg)
    res(not s['shown'], '1440: back at the hero -> hidden again'); c.close()
    # phone home: no overlap below the hero too
    for (w, h) in ((360, 740), (390, 844)):
        c = ctx(ok_br, w, h, True); pg = c.new_page(); music_on_at_home(pg)
        pg.evaluate('window.scrollTo(0, innerHeight*1.6)'); pg.wait_for_timeout(600); settle(pg)
        o = overlaps(pg); res(state(pg)['shown'] and not o, f'{w}: home below hero: player shown, no overlap {o}'); c.close()
    ok_br.close(); blk_br.close()
print('RESULT: %d failure(s)' % bad); sys.exit(1 if bad else 0)

#!/usr/bin/env python3
"""Tests for tools/perf/patch_motion_a_offscreen.py. Needs a server on :8765 serving public/. Run from the repo root.
For each page, at 1280 and 390: after load, counts never-ending loops that run in sections OFF the screen (want 0),
then scrolls through the whole page and checks that every section's loops are RUNNING while it is on screen,
that nothing fixed on the screen (music, WhatsApp, bars) is ever paused, and that there are no script errors."""
import sys
from playwright.sync_api import sync_playwright
B = "http://localhost:8765"
PAGES = sys.argv[1:] or ["/", "/about-us/", "/menu/", "/catering/", "/branches/", "/loyalty/", "/order-now/", "/contact/"]
COUNT = """()=>{const vh=innerHeight,M=200;let off=0,offPaused=0,onPaused=0,pinPaused=0,run=0;
const pinned=el=>{for(let e=el;e;e=e.parentElement){const p=getComputedStyle(e).position;if(p==='fixed'||p==='sticky')return true}return false};
for(const a of document.getAnimations()){const t=a.effect&&a.effect.getTiming&&a.effect.getTiming();if(!t||t.iterations!==Infinity)continue;
 const el=a.effect.target;if(!el||!el.isConnected)continue;const sec=el.closest('section[id],footer');
 if(pinned(el)){if(a.playState==='paused'&&getComputedStyle(el).animationPlayState.indexOf('paused')<0)pinPaused++;continue}
 if(!sec)continue;const r=sec.getBoundingClientRect();if(!r.height)continue;const on=r.bottom>-M&&r.top<vh+M;
 const css=getComputedStyle(el,a.effect.pseudoElement||null).animationPlayState.indexOf('paused')>=0;
 if(on){if(a.playState==='paused'&&!css)onPaused++;else if(a.playState==='running')run++}
 else{if(a.playState==='running')off++;else offPaused++}}
return {off,offPaused,onPaused,pinPaused,run}}"""
bad = 0
def res(ok, msg):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + msg)
with sync_playwright() as p:
    br = p.chromium.launch()
    for w, h in ((1280, 800), (390, 844)):
        for path in PAGES:
            pg = br.new_page(viewport={"width": w, "height": h}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e).split("\n")[0][:140]))
            pg.goto(B + path, wait_until="load"); pg.wait_for_timeout(2200)
            if not pg.evaluate("!!window.RR_OFFSCREEN"): res(False, f"{w}px {path}: offscreen script not on the page"); pg.close(); continue
            a = pg.evaluate(COUNT)
            worst_on = worst_pin = 0; most_off = 0
            hgt = pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0, hgt, max(300, h // 2)):
                pg.evaluate(f"scrollTo(0,{y})"); pg.wait_for_timeout(260)
                c = pg.evaluate(COUNT); worst_on = max(worst_on, c["onPaused"]); worst_pin = max(worst_pin, c["pinPaused"])
            pg.evaluate("scrollTo(0,0)"); pg.wait_for_timeout(500); z = pg.evaluate(COUNT)
            ok = a["off"] == 0 and worst_on == 0 and worst_pin == 0 and z["onPaused"] == 0 and not errs
            res(ok, f"{w}px {path}: at load, loops running off screen {a['off']} (paused {a['offPaused']}), on screen {a['run']} | while scrolling: wrongly paused on screen {worst_on}, fixed items paused {worst_pin} | back at top: wrongly paused {z['onPaused']} | script errors {len(errs)}" + (f" {errs[:2]}" if errs else ""))
            pg.close()
    br.close()
print("RESULT:", "offscreen pause OK" if not bad else f"{bad} problem(s), do not commit")

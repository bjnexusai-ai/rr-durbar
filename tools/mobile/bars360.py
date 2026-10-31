#!/usr/bin/env python3
"""Floating bars vs the bottom tab bar at 360px and at tablet widths 1024 and 1099 (the tab bar is shown up to 1099px). Forces the hidden/visible states: #m61-bar and #m61-toast get class 'on' and must end ABOVE the tab bar; hidden ones must be opacity 0 and not clickable. Needs a server on :8765."""
from playwright.sync_api import sync_playwright
JS = """(force)=>{const q=s=>document.querySelector(s),r=e=>{if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {top:Math.round(b.top),bottom:Math.round(b.bottom),op:s.opacity,pe:s.pointerEvents,disp:s.display}};
if(force){['#m61-bar','#m61-toast'].forEach(s=>{const e=q(s);if(e)e.classList.add('on')})}
return {tab:r(q('#rr-tabbar')),m61:r(q('#m61-bar')),toast:r(q('#m61-toast')),od:r(q('#ordering .od-mbar'))}}"""
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for path, vw, vh in (("/menu/", 360, 780), ("/menu/", 1024, 900), ("/menu/", 1099, 900), ("/order-now/", 360, 780), ("/order-now/", 1024, 900), ("/pickup-menu/", 360, 780), ("/", 360, 780)):
        pg = b.new_page(viewport={"width": vw, "height": vh}); pg.goto("http://localhost:8765" + path, wait_until="load"); pg.wait_for_timeout(1500)
        h = pg.evaluate("document.body.scrollHeight")
        for y in range(0, h, 500): pg.evaluate("window.scrollTo(0,%d)" % y); pg.wait_for_timeout(40)
        pg.wait_for_timeout(500); hid = pg.evaluate(JS, False); pg.wait_for_timeout(700); on = pg.evaluate(JS, True); pg.wait_for_timeout(700); on = pg.evaluate(JS, True)
        tt = on["tab"]["top"] if on["tab"] else None
        print("==", path, "at", vw, "px | tab bar top", tt)
        for k in ("m61", "toast", "od"):
            h0, o = hid[k], on[k]
            if not o: print("  ", k, "not on page"); continue
            state_hidden = "hidden: opacity %s, clicks %s" % (h0["op"], h0["pe"]) if k != "od" else "always shown"
            ok = tt is None or o["bottom"] <= tt
            if k != "od" and not (h0["op"] == "0" and h0["pe"] == "none"): ok = False
            bad += (not ok)
            print("  ", k, "| %s | when shown: bottom %s (%s tab bar) | %s" % (state_hidden, o["bottom"], "clears" if ok else "OVERLAPS", "OK" if ok else "PROBLEM"))
        pg.close()
    b.close()
print("RESULT:", "no bar overlaps the tab bar" if not bad else f"{bad} problem(s)")

#!/usr/bin/env python3
"""Tests for tools/perf/patch_branches_b.py. Needs a server on :8765 serving public/. Run from the repo root.
  1 at 360/390/1024/1280/1440: the dark skyline band starts below all the text/buttons (nothing unreadable on dark)
  2 the bulbs layer sits exactly on the skyline photo, switches on when scrolled into view, about 40 bulbs
  3 reduced motion: bulbs shown lit, no animation
  4 map on its dark plate and not cut off; no script errors on the Branches and Home pages"""
from playwright.sync_api import sync_playwright
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero')); import rr_test_shim  # doors off: sessionStorage.rrDoorsSeen
B = "http://localhost:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
GEO = """()=>{const r=s=>{const e=document.querySelector(s);if(!e||e.offsetParent===null&&getComputedStyle(e).position!=='fixed')return null;const b=e.getBoundingClientRect();return b.height?[b.top+scrollY,b.bottom+scrollY,b.left,b.width,b.height]:null};
const sky=r('#skyline'),img=r('#skyline img'),sv=r('#br-locator .rr-bulbs'),sec=r('#br-locator'),map=r('#map'),st=document.querySelector('#br-locator .stage');
const txt=['#br-locator .btn-ghost','#br-locator .olist','#br-locator .sign','#br-locator .brh-panel','#br-locator .lede'].map(r).filter(Boolean);
return {sky,img,sv,sec,map,content:Math.max(...txt.map(t=>t[1])),plate:getComputedStyle(st).backgroundImage.slice(0,15)}}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for w, h, mob in ((360, 780, True), (390, 844, True), (1024, 768, False), (1280, 800, False), (1440, 900, False)):
        pg = br.new_page(viewport={"width": w, "height": h}, is_mobile=mob); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
        pg.goto(B + "/branches/", wait_until="load"); pg.wait_for_timeout(1500)
        g = pg.evaluate(GEO)
        dark_from = g["sky"][0] + 0.2 * g["sky"][4] if g["sky"] else 0
        res(g["sky"] is not None and g["content"] <= dark_from, f"{w}px: last text/button ends {round(g['content'])}, dark band starts about {round(dark_from)}")
        al = g["sv"] and g["img"] and all(abs(a - b) <= 1.5 for a, b in zip(g["sv"], g["img"]))
        pg.evaluate("document.getElementById('skyline').scrollIntoView({block:'center'})"); pg.wait_for_timeout(2600)
        on = pg.evaluate("(()=>{const s=document.querySelector('#br-locator .rr-bulbs');if(!s)return [false,0,0];const b=[...s.querySelectorAll('.b')];return [s.classList.contains('on'),b.length,Math.min(...b.slice(0,10).map(x=>+getComputedStyle(x).opacity))]})()")
        res(al and on[0] and on[1] >= 35 and on[2] > 0.4, f"{w}px: bulbs on the photo {bool(al)}, switched on {on[0]}, {on[1]} bulbs, lowest opacity {round(on[2],2)}")
        res(g["plate"].startswith("radial") and g["map"] and g["map"][1] <= g["sec"][1] and not errs, f"{w}px: map on dark plate {g['plate'].startswith('radial')}, map not cut {g['map'] and g['map'][1] <= g['sec'][1]}, script errors {len(errs)}")
        pg.close()
    ctx = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); pg = ctx.new_page()
    pg.goto(B + "/branches/", wait_until="load"); pg.wait_for_timeout(1200)
    pg.evaluate("document.getElementById('skyline').scrollIntoView()"); pg.wait_for_timeout(800)
    rm = pg.evaluate("(()=>{const b=document.querySelector('#br-locator .rr-bulbs .b');const c=getComputedStyle(b);return [c.opacity,c.animationName]})()")
    res(rm[0] == "1" and rm[1] == "none", f"reduced motion: bulb opacity {rm[0]}, animation {rm[1]}"); ctx.close()
    pg = br.new_page(viewport={"width": 1280, "height": 800}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120])); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1500)
    res(not errs, f"home page script errors {len(errs)}"); pg.close()
    br.close()
print("RESULT:", "branches B OK" if not bad else f"{bad} problem(s), do not commit")

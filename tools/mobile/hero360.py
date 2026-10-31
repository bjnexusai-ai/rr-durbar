#!/usr/bin/env python3
"""Home hero at 360px: geometry + colours of all 8 slides, screenshots into tmp-shots/. Needs a server on :8765 serving public/. Run from repo root."""
import pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
pathlib.Path("tmp-shots").mkdir(exist_ok=True)
JS = """(n)=>{const sl=[...document.querySelectorAll('#home .slide')];sl.forEach((e,i)=>e.classList.toggle('active',i===n));
const a=sl[n],q=s=>a.querySelector(s),r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)]},c=(e,p)=>e?getComputedStyle(e)[p]:null;
return {n:sl.length,panel:r(q('.slide-content')),photo:r(q('.slide-photo')),eye:r(q('.hero-eyebrow')),eyec:c(q('.hero-eyebrow'),'color'),title:r(q('.hero-title')),desc:r(q('.hero-desc')),descc:c(q('.hero-desc'),'color'),idx:r(q('.slide-index')),music:r(document.querySelector('.music-box')),pos:c(q('.hero-image'),'objectPosition')}}"""
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 360, "height": 780})
    pg.goto("http://localhost:8765/", wait_until="load"); pg.wait_for_timeout(2000); shots = []
    for n in range(8):
        d = pg.evaluate(JS, n); pg.wait_for_timeout(900); d = pg.evaluate(JS, n)
        ib = d["idx"][1] + d["idx"][3]; mt = d["music"][1] if d["music"] else 9999
        ok = d["panel"][0] == 0 and d["panel"][2] == 360 and d["eyec"] == "rgb(136, 25, 41)" and d["descc"] == "rgb(58, 20, 8)" and ib <= mt - 4
        bad += (not ok)
        print(f"slide {n+1}: panel x{d['panel'][0]} w{d['panel'][2]} | photo h{d['photo'][3]} | eyebrow h{d['eye'][3]} {d['eyec']} | desc h{d['desc'][3]} {d['descc']} | counter bottom {ib} vs music top {mt} | {'OK' if ok else 'PROBLEM'}")
        f = f"tmp-shots/m360-{n+1}.png"; pg.screenshot(path=f); shots.append(f)
    for name, grp in (("A", shots[:4]), ("B", shots[4:])):
        im = [Image.open(f) for f in grp]; sheet = Image.new("RGB", (sum(i.width for i in im), im[0].height)); x = 0
        for i in im: sheet.paste(i, (x, 0)); x += i.width
        sheet.save(f"tmp-shots/m360-sheet{name}.png")
    for w, h in ((390, 844), (768, 1024)):
        q = b.new_page(viewport={"width": w, "height": h}); q.goto("http://localhost:8765/", wait_until="load"); q.wait_for_timeout(2000); q.screenshot(path=f"tmp-shots/m{w}-1.png"); q.close()
    b.close()
print("RESULT:", "all 8 slides OK" if not bad else f"{bad} slide(s) with a problem")

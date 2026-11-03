#!/usr/bin/env python3
"""Tests for tools/branches/patch_branches_map.py (Step M). Needs a server on :8765 serving public/. Run from the repo root.
 laptop: map + cards side by side, whole map visible (not cropped), 5 pins one per outlet, pins sit inside the map
 phone (360, 390): map full width, cards below it, no horizontal scroll
 beacons are gold dots with pulse rings (no teardrops); labels auto-placed, no overlaps; tap = beacon grows, label glows, Directions shows; card hover lights beacon; Directions links go to Google Maps
 reduced motion: map lit, pins visible, no loops; offscreen: loops paused; no script errors on /branches/ and /"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero')); import rr_test_shim
from playwright.sync_api import sync_playwright
B = "http://localhost:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
IDS = ['singhnagar', 'moghalrajpuram', 'bhavanipuram', 'autonagar', 'poranki']
def go(pg, scroll=True):
    pg.goto(B + "/branches/", wait_until="load"); pg.wait_for_timeout(1200)
    if scroll: pg.evaluate("document.getElementById('br-map').scrollIntoView()"); pg.wait_for_timeout(3600)
OV = """()=>{const m=document.getElementById('brmMap').getBoundingClientRect(),it=[];
document.querySelectorAll('.brm-pin').forEach(p=>{const id=p.dataset.id,a=p.querySelector('.brm-core').getBoundingClientRect(),l=document.querySelector('.brm-lab[data-id="'+id+'"]').getBoundingClientRect();it.push([id+' beacon',a.left,a.top,a.right,a.bottom]);it.push([id+' label',l.left,l.top,l.right,l.bottom])});
const bad=[];for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const a=it[i],b=it[j];if(a[1]<b[3]&&b[1]<a[3]&&a[2]<b[4]&&b[2]<a[4])bad.push(a[0]+' x '+b[0])}
const out=it.filter(a=>a[1]<m.left-1||a[3]>m.right+1).map(a=>a[0]);return {bad,out}}"""
G = """()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {l:b.left,t:b.top,w:b.width,h:b.height,r:b.right,b:b.bottom}};
const map=r('#brmMap'),img=r('.brm-art img'),cards=r('#brmCards'),pins=[...document.querySelectorAll('.brm-pin')].map(p=>p.getBoundingClientRect());
return {map,img,cards,pins:pins.map(b=>[b.left+b.width/2,b.top+b.height/2]),ids:[...document.querySelectorAll('.brm-pin')].map(p=>p.dataset.id),sw:document.documentElement.scrollWidth,vw:innerWidth}}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={"width": 1440, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:100])); go(pg)
    g = pg.evaluate(G)
    res(g["map"]["w"] >= 439 and g["map"]["w"] <= 481 and g["cards"]["l"] > g["map"]["r"], f"laptop: map {round(g['map']['w'])}px wide, cards to its right")
    res(abs(g["img"]["h"] / g["img"]["w"] - 1672 / 941) < 0.01 and abs(g["img"]["w"] - g["map"]["w"]) < 1, f"laptop: whole map shown, ratio {g['img']['h']/g['img']['w']:.3f} (1.777 = uncropped)")
    inside = all(g["map"]["l"] < x < g["map"]["r"] and g["map"]["t"] < y < g["map"]["b"] for x, y in g["pins"])
    res(g["ids"] == IDS and inside, f"laptop: 5 pins {g['ids']} all inside the map {inside}")
    res(pg.evaluate("getComputedStyle(document.querySelector('.brm-fig')).position") == "sticky", "laptop: map column is sticky")
    pg.click('.brm-pin[data-id="poranki"]'); pg.wait_for_timeout(300)
    sel = pg.evaluate("[...document.querySelectorAll('.brm-card.is-sel')].map(c=>c.dataset.id)")
    res(sel == ['poranki'], f"pin click highlights its card: {sel}")
    bc = pg.evaluate("getComputedStyle(document.querySelector('.brm-card.is-sel')).borderTopColor")
    res(bc == 'rgb(233, 184, 92)', f"selected card has the gold border {bc}")
    pg.hover('.brm-card[data-id="autonagar"]'); pg.wait_for_timeout(350)
    res(pg.evaluate("document.querySelector('.brm-pin[data-id=\"autonagar\"]').classList.contains('is-on')") and pg.evaluate("getComputedStyle(document.querySelector('.brm-pin[data-id=\"autonagar\"] .brm-core')).scale") == '1.2', "card hover lights its beacon (scale 1.2) and its label border")
    hrefs = pg.evaluate("[...document.querySelectorAll('.brm-b.g')].map(a=>a.href)")
    res(len(hrefs) == 5 and all('google.com/maps' in h for h in hrefs), f"{len(hrefs)} Directions links open Google Maps")
    anim = pg.evaluate("[...document.getAnimations()].filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#br-map')&&a.effect.getTiming().iterations===Infinity).length")
    res(anim >= 5, f"loops running while on screen: {anim}")
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(900)
    paused = pg.evaluate("[...document.getAnimations()].filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#br-map')&&a.effect.getTiming().iterations===Infinity&&a.playState==='running').length")
    res(paused == 0, f"loops paused offscreen (still running: {paused})")
    o = pg.evaluate(OV); res(not o["bad"] and not o["out"], f"1440px: no pin or label overlaps another {o['bad']}, none outside the map {o['out']}")
    st = pg.evaluate("(()=>{const l=document.querySelector('.brm-lab'),c=getComputedStyle(l),n=getComputedStyle(l.querySelector('.brm-n')),k=getComputedStyle(l.querySelector('.brm-k'));return [c.borderTopColor,n.color,n.fontWeight,n.fontFamily.slice(0,17),k.textTransform,l.querySelector('.brm-k').textContent,c.backgroundImage.slice(0,15)]})()")
    res(st[0] == 'rgba(213, 178, 108, 0.55)' and st[1] == 'rgb(255, 228, 168)' and st[2] == '700' and 'Cormorant' in st[3] and st[4] == 'uppercase' and st[5] == 'Outlet 01' and st[6] == 'linear-gradient', f"label: wine glass, gold border, OUTLET 0N small caps over bright-gold Cormorant 700 name {st}")
    d = pg.evaluate("(()=>{const c=getComputedStyle(document.querySelector('.brm-pin .brm-core')),r=getComputedStyle(document.querySelector('.brm-pin .brm-ring'));return [c.borderRadius,r.animationName,document.querySelectorAll('.brm-lines line').length,document.querySelector('.brm-pin svg')===null]})()")
    res(d[0] == '50%' and d[1] == 'brmRing' and d[2] == 5 and d[3], f"beacon dot + pulse ring (no teardrop svg), 5 leader lines {d}")
    pg.click('.brm-pin[data-id="singhnagar"]'); pg.wait_for_timeout(400)
    ss = pg.evaluate("(()=>{const l=document.querySelector('.brm-lab.is-sel'),c=getComputedStyle(l),g=l.querySelector('.brm-go');return [c.borderTopColor,c.boxShadow!=='none',getComputedStyle(g).display,g.textContent,getComputedStyle(document.querySelector('.brm-pin.is-sel .brm-core')).scale,g.href]})()")
    res(ss[0] == 'rgb(233, 184, 92)' and ss[1] and ss[2] == 'block' and 'Directions' in ss[3] and ss[4] == '1.35' and 'google.com/maps' in ss[5], f"tap: beacon grows 1.35, label glows, Directions link shows {ss}")
    LP = "[...document.querySelectorAll('.brm-lab')].map(l=>[l.dataset.id,parseFloat(l.style.left),parseFloat(l.style.top)])"
    pos = pg.evaluate(LP); pg.click('.brm-pin[data-id="poranki"]'); pg.wait_for_timeout(300); pos2 = pg.evaluate(LP)
    moved = [a[0] for a, b in zip(pos, pos2) if abs(a[2] - b[2]) > 0.5 or (a[0] not in ('singhnagar', 'poranki') and abs(a[1] - b[1]) > 0.5)]
    res(not moved, f"tapping a beacon never moves another label (only the tapped label re-centres by a few px for its Directions line) {moved}")
    res(pg.evaluate("getComputedStyle(document.querySelector('#br-locator .stage')).display") == 'none', "old landscape map is gone from the /branches/ hero (one map on the page)")
    res(not errs, f"script errors on /branches/: {len(errs)}"); pg.close()
    for w, h in ((360, 780), (390, 844)):
        pg = br.new_page(viewport={"width": w, "height": h}, is_mobile=True); go(pg); g = pg.evaluate(G)
        res(g["map"]["w"] >= w - 2 and g["cards"]["t"] > g["map"]["b"] - 40 and g["sw"] <= g["vw"], f"{w}px: map full width {round(g['map']['w'])}, cards below, scrollWidth {g['sw']} <= {g['vw']}")
        res(abs(g["img"]["h"] / g["img"]["w"] - 1672 / 941) < 0.01, f"{w}px: map not cropped")
        o = pg.evaluate(OV); res(not o["bad"] and not o["out"], f"{w}px: no pin or label overlaps another {o['bad']}, none outside the map {o['out']}")
        fs = pg.evaluate("getComputedStyle(document.querySelector('.brm-n')).fontSize"); res(16 <= float(fs[:-2]) <= 20, f"{w}px: label font {fs}")
        pg.click('.brm-pin[data-id="autonagar"]'); pg.wait_for_timeout(900)
        vis = pg.evaluate("(()=>{const r=document.getElementById('brmCards').getBoundingClientRect(),c=document.querySelector('.brm-card[data-id=autonagar]').getBoundingClientRect();return [c.left>=r.left-2&&c.right<=r.right+2,document.querySelector('.brm-card.is-sel').dataset.id]})()")
        res(vis[0] and vis[1] == 'autonagar', f"{w}px: pin tap scrolls the card row to its card {vis}"); pg.close()
    ctx = br.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce"); pg = ctx.new_page(); go(pg)
    rm = pg.evaluate("(()=>{const q=s=>getComputedStyle(document.querySelector(s));return [q('.brm-dim').display,q('.brm-pin').opacity,q('.brm-pin').animationName,q('.brm-sweep').display,q('.brm-ring').display,q('.brm-lab').opacity]})()")
    res(rm[0] == 'none' and rm[1] == '1' and rm[2] == 'none' and rm[3] == 'none' and rm[4] == 'none' and rm[5] == '1', f"reduced motion: lit map, pins shown, no loops {rm}")
    pg.click('.brm-lab[data-id="bhavanipuram"]'); res(pg.evaluate("document.querySelector('.brm-card.is-sel').dataset.id") == 'bhavanipuram', "reduced motion: label tap highlights its card"); ctx.close()
    pg = br.new_page(viewport={"width": 1280, "height": 800}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:100])); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1500)
    res(not errs, f"home page script errors {len(errs)}"); pg.close(); br.close()
print("RESULT:", "branches map OK" if not bad else f"{bad} problem(s), do not commit")

#!/usr/bin/env python3
"""Tests for the /branches/ night map (Step M pins + Step N cream top section, tools/branches/patch_step_n.py). Needs a server on :8765 serving public/. Run from the repo root.
 laptop (1440x900, 1366x768): map frame fully below the fixed header, map + ONE outlet card + bridge strip fit one screen, whole map visible (not cropped), 5 pins one per outlet, pins inside the map
 phone (360, 390): heading, then the map, then the card, then the bridge strip; no horizontal scroll
 one card at a time: a pin, label or name-tab tap crossfades to that outlet; every card has Directions / Call / WhatsApp
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
    pg.wait_for_timeout(3600)
OV = """()=>{const m=document.getElementById('brmMap').getBoundingClientRect(),it=[];
document.querySelectorAll('.brm-pin').forEach(p=>{const id=p.dataset.id,a=p.querySelector('.brm-core').getBoundingClientRect(),l=document.querySelector('.brm-lab[data-id="'+id+'"]').getBoundingClientRect();it.push([id+' beacon',a.left,a.top,a.right,a.bottom]);it.push([id+' label',l.left,l.top,l.right,l.bottom])});
const bad=[];for(let i=0;i<it.length;i++)for(let j=i+1;j<it.length;j++){const a=it[i],b=it[j];if(a[1]<b[3]&&b[1]<a[3]&&a[2]<b[4]&&b[2]<a[4])bad.push(a[0]+' x '+b[0])}
const out=it.filter(a=>a[1]<m.left-1||a[3]>m.right+1).map(a=>a[0]);return {bad,out}}"""
G = """()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {l:b.left,t:b.top,w:b.width,h:b.height,r:b.right,b:b.bottom}};
const map=r('#brmMap'),img=r('.brm-art img'),cards=r('#brtCards'),head=r('.brt-head'),strip=r('.brt-strip'),sec=r('#br-locator'),nav=[...document.querySelectorAll('nav')].filter(e=>getComputedStyle(e).position==='fixed').map(e=>e.getBoundingClientRect().bottom)[0]||0,pins=[...document.querySelectorAll('.brm-pin')].map(p=>p.getBoundingClientRect());
return {map,img,cards,head,strip,sec,nav,ih:innerHeight,pins:pins.map(b=>[b.left+b.width/2,b.top+b.height/2]),ids:[...document.querySelectorAll('.brm-pin')].map(p=>p.dataset.id),sw:document.documentElement.scrollWidth,vw:innerWidth}}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={"width": 1440, "height": 900}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:100])); go(pg)
    g = pg.evaluate(G)
    res(g["cards"]["l"] > g["map"]["r"], f"laptop: map {round(g['map']['w'])}px wide, the outlet card to its right")
    res(g["map"]["t"] - 8 >= g["nav"] + 4, f"laptop 1440: whole frame below the fixed header: map top {round(g['map']['t'])}, frame ring starts {round(g['map']['t']-8)}, header bottom {round(g['nav'])}")
    res(g["strip"]["b"] <= g["ih"] + 1 and g["strip"]["t"] >= g["map"]["b"], f"laptop 1440x900: map + card + bridge strip fit one screen: strip ends {round(g['strip']['b'])} of {g['ih']}")
    res(abs(g["img"]["h"] / g["img"]["w"] - 1672 / 941) < 0.01 and abs(g["img"]["w"] - g["map"]["w"]) < 1, f"laptop: whole map shown, ratio {g['img']['h']/g['img']['w']:.3f} (1.777 = uncropped)")
    inside = all(g["map"]["l"] < x < g["map"]["r"] and g["map"]["t"] < y < g["map"]["b"] for x, y in g["pins"])
    res(g["ids"] == IDS and inside, f"laptop: 5 pins {g['ids']} all inside the map {inside}")
    pg2 = br.new_page(viewport={"width": 1366, "height": 768}); go(pg2); g2 = pg2.evaluate(G)
    res(g2["map"]["t"] - 8 >= g2["nav"] + 4 and g2["strip"]["b"] <= g2["ih"] + 1 and abs(g2["img"]["h"] / g2["img"]["w"] - 1672 / 941) < 0.01, f"laptop 1366x768: frame below header (top {round(g2['map']['t'])}, header {round(g2['nav'])}), strip ends {round(g2['strip']['b'])} of {g2['ih']}, map uncropped"); pg2.close()
    res(pg.evaluate("getComputedStyle(document.getElementById('br-locator')).backgroundImage.includes('radial-gradient')") and pg.evaluate("getComputedStyle(document.getElementById('brmMap')).borderRadius") == '24px', "cream section with the 24px framed night map")
    pg.click('.brm-pin[data-id="poranki"]'); pg.wait_for_timeout(300)
    VIS = "[...document.querySelectorAll('.brt-card')].filter(c=>getComputedStyle(c).visibility==='visible'&&getComputedStyle(c).opacity==='1').map(c=>c.dataset.id)"
    sel = pg.evaluate("[...document.querySelectorAll('.brt-card.is-sel')].map(c=>c.dataset.id)")
    res(sel == ['poranki'] and pg.evaluate(VIS) == ['poranki'], f"pin click shows ONE card, poranki: {sel} {pg.evaluate(VIS)}")
    pg.click('.brt-tab[data-id="bhavanipuram"]'); pg.wait_for_timeout(450)
    res(pg.evaluate(VIS) == ['bhavanipuram'] and pg.evaluate("document.querySelector('.brt-tab[data-id=bhavanipuram]').getAttribute('aria-pressed')") == 'true', f"name tab switches the card: {pg.evaluate(VIS)}")
    pg.hover('.brt-tab[data-id="autonagar"]'); pg.wait_for_timeout(350)
    res(pg.evaluate("document.querySelector('.brm-pin[data-id=\"autonagar\"]').classList.contains('is-on')") and pg.evaluate("getComputedStyle(document.querySelector('.brm-pin[data-id=\"autonagar\"] .brm-core')).scale") == '1.2', "name-tab hover lights its beacon (scale 1.2) and its label border")
    hrefs = pg.evaluate("[...document.querySelectorAll('.brt-btns a.g')].map(a=>a.href)")
    res(len(hrefs) == 5 and all('google.com/maps' in h for h in hrefs), f"{len(hrefs)} Directions links open Google Maps")
    cb = pg.evaluate("[...document.querySelectorAll('.brt-card')].map(c=>[...c.querySelectorAll('.brt-btns a')].map(a=>a.textContent.trim()).join('/'))")
    res(len(cb) == 5 and all(x == 'Directions/Call/WhatsApp' for x in cb), f"every outlet card has Directions / Call / WhatsApp {set(cb)}")
    anim = pg.evaluate("[...document.getAnimations()].filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#br-locator')&&a.effect.getTiming().iterations===Infinity).length")
    res(anim >= 5, f"loops running while on screen: {anim}")
    pg.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(900)
    paused = pg.evaluate("[...document.getAnimations()].filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#br-locator')&&a.effect.getTiming().iterations===Infinity&&a.playState==='running').length")
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
    res(pg.evaluate("[document.querySelector('#br-locator .stage'),document.getElementById('br-map')].every(e=>e===null)") and pg.evaluate("document.querySelectorAll('.brm-map').length") == 1, "old landscape map and the separate dark #br-map are gone (one map on the page)")
    res(not errs, f"script errors on /branches/: {len(errs)}"); pg.close()
    for w, h in ((360, 780), (390, 844)):
        pg = br.new_page(viewport={"width": w, "height": h}, is_mobile=True); go(pg); g = pg.evaluate(G)
        res(g["map"]["w"] >= w - 48 and g["head"]["b"] <= g["map"]["t"] and g["cards"]["t"] >= g["map"]["b"] - 1 and g["strip"]["t"] >= g["cards"]["b"] and g["sw"] <= g["vw"], f"{w}px: heading, map ({round(g['map']['w'])} wide), card, bridge strip in that order, scrollWidth {g['sw']} <= {g['vw']}")
        res(abs(g["img"]["h"] / g["img"]["w"] - 1672 / 941) < 0.01, f"{w}px: map not cropped")
        o = pg.evaluate(OV); res(not o["bad"] and not o["out"], f"{w}px: no pin or label overlaps another {o['bad']}, none outside the map {o['out']}")
        fs = pg.evaluate("getComputedStyle(document.querySelector('.brm-n')).fontSize"); res(16 <= float(fs[:-2]) <= 20, f"{w}px: label font {fs}")
        pg.click('.brm-pin[data-id="autonagar"]'); pg.wait_for_timeout(900)
        vis = pg.evaluate("(()=>{const r=document.getElementById('brtCards').getBoundingClientRect(),c=document.querySelector('.brt-card.is-sel');const b=c.getBoundingClientRect();return [b.left>=r.left-2&&b.right<=r.right+2&&b.width>200,c.dataset.id]})()")
        res(vis[0] and vis[1] == 'autonagar', f"{w}px: pin tap switches the card, fully inside the column {vis}"); pg.close()
    ctx = br.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce"); pg = ctx.new_page(); go(pg)
    rm = pg.evaluate("(()=>{const q=s=>getComputedStyle(document.querySelector(s));return [q('.brm-dim').display,q('.brm-pin').opacity,q('.brm-pin').animationName,q('.brm-sweep').display,q('.brm-ring').display,q('.brm-lab').opacity]})()")
    res(rm[0] == 'none' and rm[1] == '1' and rm[2] == 'none' and rm[3] == 'none' and rm[4] == 'none' and rm[5] == '1', f"reduced motion: lit map, pins shown, no loops {rm}")
    pg.click('.brm-lab[data-id="bhavanipuram"]'); res(pg.evaluate("document.querySelector('.brt-card.is-sel').dataset.id") == 'bhavanipuram', "reduced motion: label tap highlights its card"); ctx.close()
    pg = br.new_page(viewport={"width": 1280, "height": 800}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:100])); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1500)
    res(not errs, f"home page script errors {len(errs)}"); pg.close(); br.close()
print("RESULT:", "branches map OK" if not bad else f"{bad} problem(s), do not commit")

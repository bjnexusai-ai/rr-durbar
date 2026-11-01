#!/usr/bin/env python3
"""Tests for tools/perf/patch_mobile_v5.py. Needs a server on :8765 serving public/. Run from the repo root.
  1 phone heights 640/692/780: music chip sits on the photo, above the cream panel, and clear of the text
  2 phone 360/390: every signature card has its text BELOW the photo (no overlap)
  3 upright screens (980x1730 desktop-site mode, 820x1180 tablet) get the tall photo; landscape 1280 keeps the wide one
  4 desktop 1280/1440: nothing else changed (removes the new rules and compares every element)"""
from playwright.sync_api import sync_playwright
B = "http://localhost:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
R = "(s)=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom)]}"
with sync_playwright() as p:
    br = p.chromium.launch()
    for h in (640, 692, 780):
        pg = br.new_page(viewport={"width": 360, "height": h}, is_mobile=True, has_touch=True); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1800)
        g = lambda s: pg.evaluate(R, s)
        m, c, ix = g("#musicBox"), g("#home .slide.active .slide-content"), g("#home .slide.active .slide-index")
        chip = pg.evaluate("document.getElementById('musicBox').classList.contains('rr-mb-chip')")
        res(chip and m and c and m[1] <= c[0] and m[0] > 60, f"360x{h}: music chip {m} ends above the panel top {c[0] if c else None}, counter {ix}")
        pg.close()
    for w in (360, 390):
        pg = br.new_page(viewport={"width": w, "height": 760}, is_mobile=True); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1200)
        pg.evaluate("document.querySelector('#bestsellers').scrollIntoView()"); pg.wait_for_timeout(1500)
        o = pg.evaluate("[...document.querySelectorAll('#bestsellers .rr-signature-card')].map(c=>{const m=c.querySelector('.rr-media').getBoundingClientRect(),k=c.querySelector('.rr-food-copy').getBoundingClientRect();return Math.round(k.top-m.bottom)+'/'+(c.scrollHeight-c.clientHeight)})")
        res(len(o) > 0 and all(int(x.split('/')[0]) >= 0 and int(x.split('/')[1]) <= 1 for x in o), f"{w}px: {len(o)} signature cards, text below photo and nothing cut off (gap/overflow): {sorted(set(o))}")
        pg.close()
    pg = br.new_page(viewport={"width": 390, "height": 844}, is_mobile=True); pg.goto(B + "/branches/", wait_until="load"); pg.wait_for_timeout(1500)
    m = pg.evaluate("(()=>{const s=document.getElementById('br-locator').getBoundingClientRect(),m=document.getElementById('map').getBoundingClientRect(),l=document.querySelector('#br-locator .leaves');return [Math.round(m.bottom-s.bottom),l?getComputedStyle(l).display:'none']})()")
    res(m[0] <= 0 and m[1] == "none", f"390px branches: map bottom vs section bottom {m[0]} (want <= 0, i.e. not cut off), leaf decoration {m[1]}"); pg.close()
    for w, h, want in ((980, 1730, "hero-m-"), (820, 1180, "hero-m-"), (1280, 800, "NOT hero-m-"), (1440, 900, "NOT hero-m-")):
        pg = br.new_page(viewport={"width": w, "height": h}); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1500)
        src = pg.evaluate("document.querySelector('#home .slide.active img').currentSrc.split('/').pop()")
        ok = ("hero-m-" in src) == (want == "hero-m-")
        res(ok, f"{w}x{h}: hero photo {src} (want {want})"); pg.close()
    LEAK = """()=>{const st=document.createElement('style');st.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.appendChild(st);
const P=['display','position','color','backgroundColor','width','height','top','left','fontSize','opacity'];const sig=()=>[...document.querySelectorAll('body *')].map(e=>{const s=getComputedStyle(e);return P.map(k=>s[k]).join('|')});
const a=sig();let n=0;for(const sh of document.styleSheets){let r;try{r=sh.cssRules}catch(e){continue}for(let k=r.length-1;k>=0;k--){const t=r[k].cssText;if(/rr-mb-chip|sig-bento\\.sig-bento\\.sig-bento/.test(t)){sh.deleteRule(k);n++}}}
const b=sig();let c=0,s=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i]){c++;if(s.length<2)s.push([a[i],b[i]])}return {n,c,s,t:a.length}}"""
    for w, h in ((1280, 800), (1440, 900)):
        for path in ("/", "/menu/"):
            pg = br.new_page(viewport={"width": w, "height": h}); pg.goto(B + path, wait_until="load"); pg.wait_for_timeout(1300)
            r = pg.evaluate(LEAK); par = pg.evaluate("(document.getElementById('musicBox')||{parentNode:{className:'none'}}).parentNode.className")
            res(r["c"] == 0 and (path != "/" or par == "bottom-inner"), f"{path} {w}px: removed {r['n']} new rule group(s), elements changed {r['c']} of {r['t']}, music button in its desktop place: {par}" + (f" {r['s']}" if r['c'] else ""))
            pg.close()
    br.close()
print("RESULT:", "mobile v5 OK" if not bad else f"{bad} problem(s), do not commit")

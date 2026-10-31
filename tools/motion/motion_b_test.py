#!/usr/bin/env python3
"""Tests for tools/perf/patch_motion_b.py. Needs a server on :8765 serving public/. Run from the repo root.
  1 page transition really happens on a real page load (/ -> /menu/), and NOT with reduced motion
  2 signature photos: covered + zoomed before they scroll in, uncovered + normal after
  3 add-to-cart: the flying piece shows the dish photo, does not spin, and the cart count goes up by 1
  4 nothing else changed: computed styles of every element outside the signature photos and the tab bar, with and without the new rules (1280, 1440, 360)
  5 no script errors from the new code"""
from playwright.sync_api import sync_playwright
B = "http://localhost:8765"
bad = 0
def res(ok, msg):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + msg)
def covered(m):  # the cover's scaleY (4th matrix number) is about 1 = photo still covered
    try: return abs(float(m.split("(")[1].split(",")[3]) - 1) < 0.01
    except Exception: return False
VT = "addEventListener('pagereveal',e=>{window.__vt=!!e.viewTransition})"
LEAK = """()=>{const st=document.createElement('style');st.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.appendChild(st);
const skip=e=>e.closest('#bestsellers .rr-media')||e.closest('#rr-tabbar');
const P=['display','position','color','backgroundColor','width','height','top','bottom','left','transform','scale','opacity','fontSize','marginTop','viewTransitionName'];
const sig=()=>[...document.querySelectorAll('body *')].filter(e=>!skip(e)).map(e=>{const s=getComputedStyle(e);return P.map(k=>s[k]).join('|')});
const a=sig();let n=0;for(const sh of document.styleSheets){let r;try{r=sh.cssRules}catch(e){continue}
for(let k=r.length-1;k>=0;k--){if(/navigation: auto|rr-tabbar;|sig-armed[^{]*rr-media/.test(r[k].cssText)&&/rr-tabbar|sig-armed|navigation/.test(r[k].cssText)&&r[k].cssText.length<4000){sh.deleteRule(k);n++}}}
const b=sig();let c=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])c.push([a[i],b[i]]);return {n,total:a.length,changed:c.length,sample:c.slice(0,2)}}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    # 1 page transition
    for rm in ("no-preference", "reduce"):
        ctx = br.new_context(viewport={"width": 390, "height": 844}, reduced_motion=rm); ctx.add_init_script(VT)
        pg = ctx.new_page(); pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(600)
        pg.evaluate("location.href='/menu/'"); pg.wait_for_url("**/menu/**"); pg.wait_for_load_state("load"); pg.wait_for_timeout(600)
        vt = pg.evaluate("window.__vt"); tn = pg.evaluate("(()=>{const t=document.querySelector('#rr-tabbar');return t?getComputedStyle(t).viewTransitionName:'no tab bar'})()")
        res((vt is True) if rm == "no-preference" else (vt is not True), f"page transition / -> /menu/ with motion={rm}: transition {'ran' if vt else 'did not run'}, tab bar name {tn}")
        ctx.close()
    # 2 + 3 signature reveal and flight
    for w, h in ((1280, 800), (390, 844)):
        ctx = br.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e).split("\n")[0][:160]))
        pg.goto(B + "/", wait_until="load"); pg.wait_for_timeout(1200)
        armed = pg.evaluate("!!document.querySelector('#bestsellers .sig-armed')")
        pre = pg.evaluate("(()=>{const c=[...document.querySelectorAll('#bestsellers .rr-signature-card')].filter(c=>!c.classList.contains('sig-in'));if(!c.length)return null;const i=c[0].querySelector('.rr-media img');return {scale:i?getComputedStyle(i).scale:'no img',cover:getComputedStyle(c[0].querySelector('.rr-media'),'::after').transform}})()")
        res(armed and pre is not None and pre["scale"] not in ("none", "no img") and float(pre["scale"]) > 1.1 and covered(pre["cover"]), f"{w}px signature photos before scrolling in: {pre}")
        pg.evaluate("document.querySelector('#bestsellers').scrollIntoView({block:'start'})"); pg.wait_for_timeout(300)
        n = pg.evaluate("document.querySelectorAll('#bestsellers .rr-signature-card').length")
        for k in range(n):
            pg.evaluate(f"document.querySelectorAll('#bestsellers .rr-signature-card')[{k}].scrollIntoView({{block:'center'}})"); pg.wait_for_timeout(150)
        pg.wait_for_timeout(2600)
        post = pg.evaluate("[...document.querySelectorAll('#bestsellers .rr-signature-card')].map(c=>{const i=c.querySelector('.rr-media img');return (i?getComputedStyle(i).scale:'-')+' / '+getComputedStyle(c.querySelector('.rr-media'),'::after').transform})")
        res(n > 0 and all(x.startswith(("1 /", "- /")) and x.endswith("matrix(1, 0, 0, 0, 0, 0)") for x in post), f"{w}px after scrolling in, all {n} photos uncovered at normal size: {sorted(set(post))}")
        # 3 flight
        btn = pg.evaluate("(()=>{const b=[...document.querySelectorAll('#bestsellers .rr-qadd')].find(b=>{const c=b.closest('.rr-food-card');return c&&c.querySelector('.rr-media img')});if(!b)return null;b.scrollIntoView({block:'center'});b.setAttribute('data-t','1');return true})()")
        if not btn: res(False, f"{w}px no + button with a photo in the signature cards"); ctx.close(); continue
        pg.wait_for_timeout(400)
        c0 = pg.evaluate("(document.querySelector('.rr-cart-count')||{}).textContent||'0'")
        want = pg.evaluate("document.querySelector('[data-t]').closest('.rr-food-card').querySelector('.rr-media img').currentSrc")
        pg.click("[data-t]"); pg.wait_for_timeout(260)
        fly = pg.evaluate("(()=>{const f=document.querySelector('.rr-fly');if(!f)return null;const m=getComputedStyle(f).transform.match(/matrix\\(([^)]+)\\)/),v=m?m[1].split(',').map(Number):[1,0,0,1];return {bg:getComputedStyle(f).backgroundImage,spin:Math.abs(v[1])+Math.abs(v[2])}})()")
        pg.wait_for_timeout(1200)
        c1 = pg.evaluate("(document.querySelector('.rr-cart-count')||{}).textContent||'0'")
        left = pg.evaluate("document.querySelectorAll('.rr-fly').length")
        ok = fly is not None and want and want in fly["bg"] and fly["spin"] < 0.01 and int(c1) == int(c0) + 1 and left == 0
        res(ok, f"{w}px + Add: flying photo {'yes' if fly and want and want in fly['bg'] else 'NO'}, spin {fly and round(fly['spin'],3)}, cart {c0} -> {c1}, leftovers {left}")
        mine = [e for e in errs if any(t in e for t in ("rrC", "rrI", "rrR", "rrFly", "rr-motion"))]
        res(not mine, f"{w}px script errors from the new code: {len(mine)} (all page errors: {len(errs)}{' ' + str(errs[:2]) if errs else ''})")
        ctx.close()
    # 4 nothing else changed
    for path in ("/", "/menu/", "/about-us/", "/order-now/"):
        for w, h in ((1280, 800), (1440, 900), (360, 780)):
            pg = br.new_page(viewport={"width": w, "height": h}); pg.goto(B + path, wait_until="load"); pg.wait_for_timeout(1300)
            r = pg.evaluate(LEAK)
            res(r["changed"] == 0, f"{path} {w}px: removed {r['n']} new rule group(s), other elements changed {r['changed']} of {r['total']}" + (f" {r['sample']}" if r["changed"] else ""))
            pg.close()
    br.close()
print("RESULT:", "motion B OK" if not bad else f"{bad} problem(s), do not commit")

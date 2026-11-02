#!/usr/bin/env python3
"""Tests for tools/catering/patch_catering_stages.py. Needs a server on 127.0.0.1:8765 serving public/. Run from the repo root.
  1 laptop 1440: landscape picture loaded, portrait not; 5 labels, each inside its plate (+-2%); phone buttons hidden
  2 phone 390: portrait loaded, landscape not; 6 labels inside their plates
  3 click a stage: dialog opens, focus moves in, Esc closes and focus returns; Enquire preselects the form option and scrolls to the form
  4 reduced motion: nothing animating, labels visible; offscreen: the steam loops are paused
  5 no sideways scroll at 360; old cards gone; hidden list; Baby shower option; no script errors"""
from playwright.sync_api import sync_playwright
B = "http://127.0.0.1:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
def load(br, w, h, mob, **kw):
    ctx = br.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob, **kw); pg = ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append(str(e)[:120])); pg.goto(B + "/catering/", wait_until="load"); pg.wait_for_timeout(600); return ctx, pg
def see(pg):
    pg.evaluate("document.getElementById('rrs').scrollIntoView({block:'center'})"); pg.wait_for_timeout(3600)
FIT = """(sel)=>{const root=document.getElementById('rrs').getBoundingClientRect();return [...document.querySelectorAll(sel)].map(b=>{const p=b.getBoundingClientRect(),t=b.querySelector('.rrs-t').getBoundingClientRect(),tx=root.width*.02,ty=root.height*.02;
 return {k:b.dataset.k,ok:t.left>=p.left-tx&&t.right<=p.right+tx&&t.top>=p.top-ty&&t.bottom<=p.bottom+ty,vis:p.width>0&&getComputedStyle(b.querySelector('.rrs-t')).opacity=='1'}})}"""
LOADED = "()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('rr-stages-')).map(n=>n.split('/').pop())"
with sync_playwright() as p:
    br = p.chromium.launch()
    ctx, pg = load(br, 1440, 900, False); see(pg)
    ld = pg.evaluate(LOADED); fit = pg.evaluate(FIT, ".rrs-l .rrs-b")
    res(ld and all("-l-" in n for n in ld), f"1440: loaded {ld}")
    res(len(fit) == 5 and all(f["ok"] and f["vis"] for f in fit), f"1440: 5 labels inside plates {[(f['k'], f['ok']) for f in fit]}")
    res(pg.evaluate("getComputedStyle(document.querySelector('.rrs-p')).display") == "none", "1440: phone buttons hidden")
    pg.click(".rrs-l .rrs-b[data-k=weddings]"); pg.wait_for_timeout(500)
    dlg = pg.evaluate("(()=>{const c=document.querySelector('.rrs-card');return [!c.hidden,c.contains(document.activeElement),c.getAttribute('role'),document.querySelector('.rrs-card h3').textContent]})()")
    res(dlg == [True, True, "dialog", "Weddings"], f"click Weddings: dialog open, focus inside {dlg}")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
    back = pg.evaluate("[document.querySelector('.rrs-card').hidden,document.activeElement.dataset.k]")
    res(back == [True, "weddings"], f"Esc closes, focus back on the plate {back}")
    for k, opt in (("weddings", "Wedding"), ("royal", "Other"), ("outdoor", "Large gathering"), ("celebrations", "Private party"), ("corporate", "Corporate event")):
        pg.evaluate("document.getElementById('rrs').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
        pg.click(f".rrs-l .rrs-b[data-k={k}]"); pg.wait_for_timeout(400); pg.click(".rrs-enq"); pg.wait_for_timeout(1500)
        v = pg.evaluate("[document.getElementById('c-type').value,Math.round(document.getElementById('catering-form').getBoundingClientRect().top)]")
        res(v[0] == opt and -50 < v[1] < 900, f"Enquire from {k}: form option '{v[0]}' (want '{opt}'), form top {v[1]}")
    pg.evaluate("document.getElementById('rrs').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
    pg.click(".rrs-l .rrs-b[data-k=royal]"); pg.wait_for_timeout(400); pg.mouse.click(5, 300); pg.wait_for_timeout(600)
    res(pg.evaluate("document.querySelector('.rrs-card').hidden"), "tap outside closes the card")
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(1500)
    par = pg.evaluate("[...document.querySelectorAll('.rrs-steam i')].flatMap(i=>i.getAnimations()).filter(a=>a.effect.getTiming().iterations===Infinity).map(a=>a.playState)")
    res(par and all(s == "paused" for s in par), f"offscreen: steam loops {par}")
    res(not pg.errs, f"1440: script errors {pg.errs}"); ctx.close()
    ctx, pg = load(br, 390, 844, True); see(pg)
    ld = pg.evaluate(LOADED); fit = pg.evaluate(FIT, ".rrs-p .rrs-b")
    res(ld and all("-p-" in n for n in ld), f"390: loaded {ld}")
    res(len(fit) == 6 and all(f["ok"] and f["vis"] for f in fit), f"390: 6 labels inside plates {[(f['k'], f['ok']) for f in fit]}")
    pg.tap(".rrs-p .rrs-b[data-k=baby]"); pg.wait_for_timeout(600)
    box = pg.evaluate("(()=>{const r=document.querySelector('.rrs-card').getBoundingClientRect();return [Math.round(r.bottom),innerHeight,Math.round(r.width),innerWidth]})()")
    res(box[0] == box[1] and box[2] == box[3], f"390: card is a bottom sheet {box}")
    pg.click(".rrs-enq"); pg.wait_for_timeout(1500)
    v = pg.evaluate("document.getElementById('c-type').value"); res(v == "Baby shower", f"390: Baby Showers preselects '{v}'")
    res(not pg.errs, f"390: script errors {pg.errs}"); ctx.close()
    ctx, pg = load(br, 360, 780, True)
    sw = pg.evaluate("[document.documentElement.scrollWidth,innerWidth]"); res(sw[0] <= sw[1], f"360: no sideways scroll {sw}")
    old = pg.evaluate("document.querySelectorAll('#catering-occasions .rr-card, #catering-occasions .rr-grid').length")
    sr = pg.evaluate("[...document.querySelectorAll('.rrs-sr li')].map(l=>l.textContent)")
    opts = pg.evaluate("[...document.querySelectorAll('#c-type option')].map(o=>o.text)")
    res(old == 0 and len(sr) == 6 and "Baby shower" in opts, f"old cards {old}, hidden list {len(sr)}, options {opts}"); ctx.close()
    ctx, pg = load(br, 1440, 900, False, reduced_motion="reduce"); see(pg)
    run = pg.evaluate("document.getElementById('catering-occasions').getAnimations({subtree:true}).filter(a=>a.playState==='running').length")
    st = pg.evaluate("[getComputedStyle(document.querySelector('.rrs-dim')).opacity,getComputedStyle(document.querySelector('.rrs-t')).opacity,getComputedStyle(document.querySelector('.rrs-steam')).display]")
    res(run == 0 and st == ["0", "1", "none"], f"reduced motion: {run} running, dim/label/steam {st}"); ctx.close()
    br.close()
print("RESULT:", "catering stages OK" if not bad else f"{bad} problem(s), do not commit")

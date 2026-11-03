#!/usr/bin/env python3
"""Tests for the /catering/ page: tools/catering/patch_catering_stages.py + tools/catering/patch_phase1b.py (hero, pill, wire overlay). Needs a server on 127.0.0.1:8765 serving public/. Run from the repo root.
  1 laptop 1440: landscape picture loaded, portrait not; 5 labels, each inside its plate (+-2%); phone buttons hidden
  2 phone 390: portrait loaded, landscape not; 6 labels inside their plates
  3 click a stage: dialog opens, focus moves in, Esc closes and focus returns; Enquire preselects the form option and scrolls to the form
  4 reduced motion: nothing animating, labels visible; offscreen: the steam loops are paused
  5 no sideways scroll at 360; old cards gone; hidden list; Baby shower option; no script errors
  Step 1B: hero, picture, buttons, sticky pill (hides as soon as the form's top edge enters the viewport), wire overlay
  Step 2: the sequence ends fully lit (1440, 390), the arrival burst keeps off the label text, idle current runs onscreen and pauses offscreen,
          spotlight (hover / tap), reduced motion = everything lit, no sparks, no particles, no idle current"""
from playwright.sync_api import sync_playwright
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hero")); import rr_test_shim  # noqa: F401 (doors off)
B = "http://127.0.0.1:8765"; bad = 0
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
def load(br, w, h, mob, init=None, **kw):
    ctx = br.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob, **kw)
    if init: ctx.add_init_script(init)
    pg = ctx.new_page(); pg.errs = []
    pg.on("pageerror", lambda e: pg.errs.append(str(e)[:120])); pg.goto(B + "/catering/", wait_until="load"); pg.wait_for_timeout(600); return ctx, pg
CENTRE = "document.getElementById('rrs').scrollIntoView({block:'center'})"
ROWKEYS = ("royal", "weddings", "corporate", "celebrations", "outdoor", "baby")
def see(pg):
    """Bring the picture into view and wait until it is lit. Phone: the chain lights row by row, so scroll each row into view and wait for it to light."""
    pg.evaluate(CENTRE)
    if pg.evaluate("innerWidth") < 900:
        for k in ROWKEYS:
            sel = f".rrs-p .rrs-b[data-k={k}]"
            pg.evaluate("(s)=>document.querySelector(s).scrollIntoView({block:'center'})", sel)
            pg.wait_for_function("(s)=>document.querySelector(s).classList.contains('lit')", arg=sel, timeout=10000)
    pg.wait_for_function("document.getElementById('rrs').classList.contains('rrs-done')", timeout=15000)
    pg.evaluate(CENTRE); pg.wait_for_timeout(500)
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
    pg.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(1500)
    par = pg.evaluate("[...document.querySelectorAll('.rrs-steam i')].flatMap(i=>i.getAnimations()).filter(a=>a.effect.getTiming().iterations===Infinity).map(a=>a.playState)")
    res(par and all(s == "paused" for s in par), f"offscreen: steam loops {par}")
    res(not pg.errs, f"1440: script errors {pg.errs}"); ctx.close()
    ctx, pg = load(br, 390, 844, True); see(pg)
    ld = pg.evaluate(LOADED); fit = pg.evaluate(FIT, ".rrs-p .rrs-b")
    res(ld and all("-p-" in n for n in ld), f"390: loaded {ld}")
    res(len(fit) == 6 and all(f["ok"] and f["vis"] for f in fit), f"390: 6 labels inside plates {[(f['k'], f['ok']) for f in fit]}")
    pg.tap(".rrs-p .rrs-b[data-k=baby]"); pg.wait_for_timeout(1100)  # phone tap: spotlight lag 380 ms, then the sheet slides up
    box = pg.evaluate("(()=>{const r=document.querySelector('.rrs-card').getBoundingClientRect();return [Math.round(r.bottom),innerHeight,Math.round(r.width),innerWidth]})()")
    res(box[0] == box[1] and box[2] == box[3], f"390: card is a bottom sheet {box}")
    pg.click(".rrs-enq"); pg.wait_for_timeout(1500)
    v = pg.evaluate("document.getElementById('c-type').value"); res(v == "Baby shower", f"390: Baby Showers preselects '{v}'")
    res(not pg.errs, f"390: script errors {pg.errs}"); ctx.close()
    ctx, pg = load(br, 360, 780, True)
    sw = pg.evaluate("[document.documentElement.scrollWidth,innerWidth]"); res(sw[0] <= sw[1], f"360: no sideways scroll {sw}")
    old = pg.evaluate("document.querySelectorAll('#catering-occasions').length")
    sr = pg.evaluate("[...document.querySelectorAll('.rrs-sr li')].map(l=>l.textContent)")
    opts = pg.evaluate("[...document.querySelectorAll('#c-type option')].map(o=>o.text)")
    res(old == 0 and len(sr) == 6 and "Baby shower" in opts, f"old cards {old}, hidden list {len(sr)}, options {opts}"); ctx.close()
    ctx, pg = load(br, 1440, 900, False, reduced_motion="reduce"); see(pg)
    run = pg.evaluate("document.getElementById('rrs-wrap').getAnimations({subtree:true}).filter(a=>a.playState==='running').length")
    st = pg.evaluate("[getComputedStyle(document.querySelector('.rrs-dim')).opacity,getComputedStyle(document.querySelector('.rrs-t')).opacity,getComputedStyle(document.querySelector('.rrs-steam')).display]")
    res(run == 0 and st == ["0", "1", "none"], f"reduced motion: {run} running, dim/label/steam {st}"); ctx.close()
    # ---------------- Step 1B: hero + picture + buttons + pill + wire overlay ----------------
    VIS = "(e)=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}"
    def rect(pg, sel):
        return pg.evaluate("(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}}", sel)
    def hit(a, b, pad=2):
        return a and b and a["l"] < b["r"] + pad and a["r"] > b["l"] - pad and a["t"] < b["b"] + pad and a["b"] > b["t"] - pad
    FLOATS = "['.rrd','#rrw','#rr-tabbar','.rrw-launch','.rrd-btn']"
    def floats_hit(pg):
        return pg.evaluate("""(sel)=>{const p=document.querySelector('#rrp').getBoundingClientRect();const out=[];
          for(const s of %s){for(const e of document.querySelectorAll(s)){const cs=getComputedStyle(e),r=e.getBoundingClientRect();
            if(cs.display==='none'||cs.visibility==='hidden'||r.width<2||r.height<2)continue;
            if(r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top)out.push(s+' '+Math.round(r.left)+','+Math.round(r.top))}}return out}""" % FLOATS, None)
    for w, h, mob, tag in ((1440, 900, False, "1440"), (390, 844, True, "390"), (360, 780, True, "360")):
        ctx, pg = load(br, w, h, mob); pg.wait_for_timeout(800)
        top = pg.evaluate("""()=>{const q=s=>document.querySelector(s);return {title:document.title,eyebrow:q('#catering .cx-eyebrow').textContent.trim(),
          occ:document.querySelectorAll('#catering-occasions').length,inHero:!!q('#catering .cx-hero #rrs'),oldPhoto:!!q('#catering .cx-hero-photo'),
          sr:[...document.querySelectorAll('#rrs-wrap .rrs-sr li')].map(l=>l.textContent)}}""")
        res(top["title"] == "Catering & Events | RR Durbar Vijayawada", f"{tag}: title '{top['title']}'")
        res(top["eyebrow"] == "Catering & Events", f"{tag}: eyebrow '{top['eyebrow']}'")
        res(top["occ"] == 0 and top["inHero"] and not top["oldPhoto"], f"{tag}: no #catering-occasions, picture inside the hero {top['occ']} {top['inHero']}")
        res(len(top["sr"]) == 6, f"{tag}: hidden list names {len(top['sr'])} events {top['sr']}")
        art, form, trust = rect(pg, "#rrs"), rect(pg, "#catering-form"), rect(pg, ".cx-trust")
        res(art["b"] <= form["t"] + 1 and art["b"] <= trust["t"] + 1 and trust["b"] <= form["t"] + 1, f"{tag}: picture, then trust strip, then form (picture bottom {art['b']:.0f}, trust {trust['t']:.0f}-{trust['b']:.0f}, form top {form['t']:.0f})")
        res(w >= 900 and art["w"] <= 1281 and art["w"] >= 1200 or w < 900 and art["w"] >= w - 1, f"{tag}: picture width {art['w']:.0f}")
        head = rect(pg, "#catering .cx-h1"); res(head["b"] <= art["t"] + 1, f"{tag}: picture is directly under the heading block (h1 bottom {head['b']:.0f}, picture top {art['t']:.0f})")
        b1, b2 = rect(pg, ".rrh-plan"), rect(pg, ".rrh-wa")
        res(abs(b1["h"] - b2["h"]) < 0.5 and b1["h"] in (48.0, 52.0), f"{tag}: both buttons same height {b1['h']} / {b2['h']}")
        res(b2["l"] >= b1["r"] - 1 or b2["t"] >= b1["b"] - 1, f"{tag}: buttons do not overlap")
        wa = pg.evaluate("document.querySelector('.rrh-wa').getAttribute('href')")
        res(wa.startswith("https://wa.me/919849982052?text=") and "catering" in wa.lower(), f"{tag}: WhatsApp us -> {wa[:60]}")
        sv = pg.evaluate("""()=>[...document.querySelectorAll('.rrs-wires')].map(s=>({c:s.getAttribute('class'),n:s.querySelectorAll('path').length,o:getComputedStyle(s).opacity,d:getComputedStyle(s).display,vb:s.getAttribute('viewBox')}))""")
        want = "rrs-wl" if w >= 900 else "rrs-wp"
        shown = [s for s in sv if s["d"] != "none"]
        res(len(sv) == 2 and len(shown) == 1 and want in shown[0]["c"], f"{tag}: one wire SVG shown ({want}) {[(s['c'], s['n'], s['d']) for s in sv]}")
        res(all(s["o"] == "0" for s in sv), f"{tag}: wire overlay invisible {[s['o'] for s in sv]}")
        res(sorted(s["n"] for s in sv) == [4, 6] and {s["vb"] for s in sv} == {"0 0 1672 941", "0 0 941 1672"}, f"{tag}: 4 laptop + 6 phone paths, viewBoxes ok")
        pg.evaluate("document.getElementById('rrs').classList.add('rrs-showwires')"); pg.wait_for_timeout(100)
        res(pg.evaluate("getComputedStyle(document.querySelector('.rrs-wires:not([style*=none])')).opacity") != "x" and
            pg.evaluate("[...document.querySelectorAll('.rrs-wires')].filter(s=>getComputedStyle(s).display!=='none').every(s=>getComputedStyle(s).opacity==='1')"), f"{tag}: rrs-showwires shows the overlay")
        pg.evaluate("document.getElementById('rrs').classList.remove('rrs-showwires')")
        # sticky pill: hidden at the top, on after the picture, off at the form
        pill = lambda: pg.evaluate("(()=>{const p=document.getElementById('rrp');if(!p)return null;const s=getComputedStyle(p);return {on:p.classList.contains('on'),vis:s.visibility,op:s.opacity,h:Math.round(p.getBoundingClientRect().height)}})()")
        pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(500); p0 = pill()
        res(p0 and not p0["on"] and p0["vis"] == "hidden", f"{tag}: pill hidden at the top {p0}")
        pg.evaluate("(()=>{const r=document.getElementById('rrs').getBoundingClientRect();window.scrollTo(0,scrollY+r.bottom-innerHeight+40)})()"); pg.wait_for_timeout(700); p1 = pill()
        res(p1 and p1["on"] and p1["vis"] == "visible" and p1["h"] == (52 if w >= 1051 else 48), f"{tag}: pill shows after the picture {p1}")
        res(not floats_hit(pg), f"{tag}: pill does not overlap dock / widget / nav {floats_hit(pg)}")
        pr = rect(pg, "#rrp"); res(abs((pr["l"] + pr["r"]) / 2 - w / 2) < 2, f"{tag}: pill centred ({(pr['l'] + pr['r']) / 2:.0f} vs {w / 2:.0f})")
        tb = rect(pg, "#rr-tabbar")
        if tb and pg.evaluate("getComputedStyle(document.querySelector('#rr-tabbar')).display") != "none": res(pr["b"] <= tb["t"] - 4, f"{tag}: pill sits above the glass nav ({pr['b']:.0f} <= {tb['t']:.0f})")
        for gap, want in ((30, True), (-30, False)):  # form top 30 px below the viewport bottom: pill on; 30 px inside: pill already off
            pg.evaluate("(g)=>{const f=document.getElementById('catering-form').getBoundingClientRect();window.scrollTo(0,scrollY+f.top-innerHeight-g)}", gap); pg.wait_for_timeout(600)
            res(pill()["on"] == want, f"{tag}: form top {'30px below' if gap > 0 else '30px inside'} the viewport -> pill {'on' if want else 'off'}")
        pg.evaluate("(()=>{const r=document.getElementById('rrs').getBoundingClientRect();window.scrollTo(0,scrollY+r.bottom-innerHeight+40)})()"); pg.wait_for_timeout(600)
        pg.click("#rrp"); pg.wait_for_timeout(1800); p2 = pill(); ft = rect(pg, "#catering-form")
        res(p2 and not p2["on"] and -20 < ft["t"] < h * 0.6, f"{tag}: tap scrolls to the form, pill hides at the form {p2} form top {ft['t']:.0f}")
        pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(500)
        pg.click(".rrh-plan"); pg.wait_for_timeout(1800); ft = rect(pg, "#catering-form"); res(-20 < ft["t"] < h * 0.6, f"{tag}: PLAN MY EVENT scrolls to the form (top {ft['t']:.0f})")
        sw = pg.evaluate("[document.documentElement.scrollWidth,innerWidth]"); res(sw[0] <= sw[1], f"{tag}: no sideways scroll {sw}")
        res(not pg.errs, f"{tag}: script errors {pg.errs}")
        if w == 390:
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(1700)
            on = pg.evaluate("[...document.querySelectorAll('#rr-tabbar a.on')].map(a=>a.dataset.k)")
            res(on == ["Catering"], f"390: phone glass nav highlights {on}")
        ctx.close()
    ctx, pg = load(br, 1440, 900, False, reduced_motion="reduce"); pg.wait_for_timeout(500)
    pg.evaluate("(()=>{const r=document.getElementById('rrs').getBoundingClientRect();window.scrollTo(0,scrollY+r.bottom-innerHeight+40)})()"); pg.wait_for_timeout(500)
    res(pg.evaluate("document.getElementById('rrp').classList.contains('on')") and pg.evaluate("(()=>{const s=getComputedStyle(document.getElementById('rrp'));return s.transitionProperty==='none'||parseFloat(s.transitionDuration)<0.001})()"), "reduced motion: pill shows with no transition")
    ctx.close()
    ctx, pg = load(br, 1440, 900, False); pg.goto(B + "/menu/", wait_until="load"); pg.wait_for_timeout(800)
    res(pg.evaluate("!document.getElementById('rrp') && !document.getElementById('rrs')"), "/menu/: no pill, no stages picture")
    ctx.close()
    # ---------------- Step 2: Lighting the Durbar ----------------
    SPY = "(()=>{window.__idle=0;const o=Element.prototype.animate;Element.prototype.animate=function(){if(this.classList&&this.classList.contains('rrs-lw'))window.__idle++;return o.apply(this,arguments)}})()"
    LITSTATE = """()=>{const bs=[...document.querySelectorAll('#rrs .rrs-b')].filter(b=>b.getBoundingClientRect().width>0);
      const dim=document.querySelector('.rrs-dim');return {n:bs.length,lit:bs.filter(b=>b.classList.contains('lit')).length,
      lab:bs.filter(b=>getComputedStyle(b.querySelector('.rrs-t')).opacity==='1').length,
      dim:dim?(getComputedStyle(dim).display==='none'||parseFloat(getComputedStyle(dim).opacity)===0):true,
      done:document.getElementById('rrs').classList.contains('rrs-done'),
      sparks:[...document.querySelectorAll('.rrs-fx .rrs-sp')].filter(s=>parseFloat(s.style.opacity||0)>0).length,
      burst:document.querySelectorAll('.rrs-pb').length}}"""
    # burst vs label: while the sequence runs, no burst particle may touch any label text
    TRACK = """()=>{window.__hit=0;window.__seen=0;const L=document.getElementById('rrs');(function f(){
      const ts=[...L.querySelectorAll('.rrs-b')].filter(b=>b.getBoundingClientRect().width>0).map(b=>b.querySelector('.rrs-t').getBoundingClientRect());
      L.querySelectorAll('.rrs-pb i').forEach(i=>{const r=i.getBoundingClientRect();if(+getComputedStyle(i).opacity<.05)return;window.__seen++;
        if(ts.some(t=>r.left<t.right&&r.right>t.left&&r.top<t.bottom-1&&r.bottom>t.top+1))window.__hit++});requestAnimationFrame(f)})()}"""
    for w, h, mob, tag in ((1440, 900, False, "1440"), (390, 844, True, "390")):
        ctx, pg = load(br, w, h, mob, init=SPY)
        pg.evaluate(TRACK)
        pg.evaluate(CENTRE); pg.wait_for_timeout(1200)
        mid = pg.evaluate(LITSTATE)
        res(not mid["done"] and mid["lit"] < mid["n"], f"{tag}: sequence starts dark, not lit yet ({mid['lit']}/{mid['n']} lit)")
        see(pg); st = pg.evaluate(LITSTATE)
        res(st["done"] and st["lit"] == st["n"] == (5 if w >= 900 else 6) and st["lab"] == st["n"] and st["dim"] and st["sparks"] == 0 and st["burst"] == 0, f"{tag}: sequence ends fully lit {st}")
        tr = pg.evaluate("[window.__seen,window.__hit]")
        res(tr[0] > 0 and tr[1] == 0, f"{tag}: arrival burst seen ({tr[0]} samples) and never touches label text ({tr[1]} hits)")
        res(not pg.errs, f"{tag}: script errors {pg.errs}")
        if w >= 900:
            # idle current: runs onscreen every 6-8 s, pauses offscreen
            pg.evaluate("window.__idle=0"); pg.evaluate("window.scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(9500)
            off = pg.evaluate("window.__idle"); res(off == 0, f"1440: idle current paused offscreen ({off} pulses in 9.5 s)")
            pg.evaluate(CENTRE); pg.wait_for_timeout(9500)
            on = pg.evaluate("window.__idle"); res(on >= 1, f"1440: idle current runs onscreen ({on} pulses in 9.5 s)")
            # spotlight: hover lights that stage's wire, dims the others; leaving clears it
            LITW = "[...document.querySelectorAll('svg.rrs-fx.rrs-wl .rrs-lw')].filter(g=>+getComputedStyle(g).opacity>.8).length"
            pg.hover(".rrs-l .rrs-b[data-k=weddings]"); pg.wait_for_timeout(600)
            sp = pg.evaluate("[document.querySelector('.rrs-dim2').classList.contains('on'),%s]" % LITW)
            res(sp == [True, 1], f"1440: hover Weddings -> its wire glows, the other stages dim {sp}")
            pg.mouse.move(5, 5); pg.wait_for_timeout(600)
            sp = pg.evaluate("[document.querySelector('.rrs-dim2').classList.contains('on'),%s]" % LITW)
            res(sp == [False, 0], f"1440: leaving clears the spotlight {sp}")
            pg.hover(".rrs-l .rrs-b[data-k=royal]"); pg.wait_for_timeout(600)
            sp = pg.evaluate(LITW); res(sp == 4, f"1440: hover Royal Catering -> all 4 wires glow ({sp})"); pg.mouse.move(5, 5)
        else:
            LITW = "[...document.querySelectorAll('svg.rrs-fx.rrs-wp .rrs-lw')].filter(g=>+getComputedStyle(g).opacity>.8).length"
            pg.tap(".rrs-p .rrs-b[data-k=celebrations]"); pg.wait_for_timeout(900)
            sp = pg.evaluate("[document.querySelector('.rrs-dim2').classList.contains('on'),%s,!document.querySelector('.rrs-card').hidden]" % LITW)
            res(sp[0] and sp[1] >= 1 and sp[2], f"390: tap Celebrations -> its wires glow, others dim, then the card opens {sp}")
        ctx.close()
    # reduced motion: everything lit at once, no sparks, no particles, no idle current
    for w, h, mob, tag in ((1440, 900, False, "1440"), (390, 844, True, "390")):
        ctx, pg = load(br, w, h, mob, init=SPY, reduced_motion="reduce"); pg.evaluate(CENTRE); pg.wait_for_timeout(700)
        st = pg.evaluate(LITSTATE)
        res(st["done"] and st["lit"] == st["n"] == (5 if w >= 900 else 6) and st["lab"] == st["n"] and st["dim"] and st["sparks"] == 0 and st["burst"] == 0, f"{tag} reduced motion: all lit at once, no sparks, no particles {st}")
        if w >= 900:
            pg.wait_for_timeout(9500); n = pg.evaluate("[window.__idle,document.querySelectorAll('.rrs-pb').length,document.querySelectorAll('.rrs-fx').length]")
            res(n == [0, 0, 0], f"{tag} reduced motion: no idle current, no particles, no spark layer after 9.5 s {n}")
        ctx.close()
    br.close()
print("RESULT:", "catering page + Step 2 OK" if not bad else f"{bad} problem(s), do not commit")

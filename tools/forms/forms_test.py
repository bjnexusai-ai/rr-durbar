#!/usr/bin/env python3
"""Tests for tools/forms/patch_forms.py (catering + contact forms -> Web3Forms). The Web3Forms request is MOCKED (route interception): no email is ever sent.
Needs a server on 127.0.0.1:8765 serving public/. Run from the repo root.
  1 catering: stage-card Enquire preselect -> submit: no reload, button disabled while sending, one POST JSON to api.web3forms.com/submit,
    human-readable payload names (Name, Phone, Email, Event type, Event date '5 Dec 2026', Number of guests, Venue / location, Requirements),
    Call (tel:) + WhatsApp (wa.me/91..) built from the phone, Submitted from, replyto, subject '[RR Durbar] Catering enquiry – {event} – {date}',
    from_name, botcheck false, success text, form reset
  1b subject fallbacks ('Enquiry' / 'date not given'), phone with +91 and spaces, empty optional fields left out
  2 catering error (HTTP 500, and success:false): error text with the WhatsApp 919849982052 link, button back on, no success text
  3 honeypot checked: no request is sent
  4 contact: subject '[RR Durbar] Contact – {name}', success, error + WhatsApp link, honeypot
  5 no sideways scroll at 360 / 390 / 1440 on /catering/ and /contact/ (also with the status message showing)"""
from playwright.sync_api import sync_playwright
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hero")); import rr_test_shim  # noqa: F401 (doors off)
B = "http://127.0.0.1:8765"; bad = 0
OK_MSG = "Thank you! We'll call you within a day."
URL = "https://api.web3forms.com/submit"
def res(ok, m):
    global bad; bad += (not ok); print(("PASS  " if ok else "FAIL  ") + m)
def load(br, path, w=1440, h=900, mob=False):
    ctx = br.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob)
    pg = ctx.new_page(); pg.errs = []; pg.reqs = []; pg.pending = []
    pg.on("pageerror", lambda e: pg.errs.append(str(e)[:120]))
    pg.goto(B + path, wait_until="load"); pg.wait_for_timeout(600); return ctx, pg
def mock(pg, mode):
    """mode: 'hold' (collect, fulfil later) | 'ok' | '500' | 'fail' (200 but success:false)"""
    def h(route):
        pg.reqs.append(route.request)
        if mode == "hold": pg.pending.append(route); return
        if mode == "ok": route.fulfill(status=200, content_type="application/json", body='{"success":true,"message":"ok"}')
        elif mode == "500": route.fulfill(status=500, content_type="application/json", body='{"success":false}')
        else: route.fulfill(status=200, content_type="application/json", body='{"success":false,"message":"bad key"}')
    pg.route("**/api.web3forms.com/**", h)
def fill_cat(pg, event="Wedding"):
    pg.fill("#c-name", "Test Person"); pg.fill("#c-phone", "9849982052"); pg.fill("#c-email", "t@example.com")
    if event: pg.select_option("#c-type", event)
    pg.fill("#c-date", "2026-12-05"); pg.fill("#c-guests", "150"); pg.fill("#c-loc", "Benz Circle"); pg.fill("#c-msg", "Veg and non-veg")
def fill_con(pg):
    pg.fill("#k-name", "Asha"); pg.fill("#k-phone", "9849982052"); pg.fill("#k-email", "a@example.com"); pg.fill("#k-sub", "Opening hours"); pg.fill("#k-msg", "Are you open on Sunday?")
STATUS = "(f)=>{const p=document.querySelector(f+' .rr-form-status');return [p.hidden,p.textContent,p.dataset.tone,[...p.querySelectorAll('a')].map(a=>a.href)]}"
def btn_disabled(pg, f): return pg.evaluate("(f)=>document.querySelector(f+' [data-rr-submit]').disabled", f)
def body(pg): return json.loads(pg.reqs[-1].post_data)
with sync_playwright() as p:
    br = p.chromium.launch()
    # 1 catering success, starting from a stage card (preselect must still work)
    ctx, pg = load(br, "/catering/"); mock(pg, "hold")
    pg.evaluate("document.getElementById('rrs').scrollIntoView({block:'center'})"); pg.wait_for_timeout(2500)
    pg.click(".rrs-l .rrs-b[data-k=weddings]"); pg.wait_for_timeout(400); pg.click(".rrs-enq"); pg.wait_for_timeout(1200)
    res(pg.evaluate("document.getElementById('c-type').value") == "Wedding", "stage card Enquire still preselects 'Wedding'")
    fill_cat(pg, None); pg.evaluate("window.__noreload=1")
    pg.click("#catering-form [data-rr-submit]"); pg.wait_for_timeout(500)
    res(len(pg.reqs) == 1 and pg.pending, "one request sent, held (mock)")
    dis = pg.evaluate("(()=>{const b=document.querySelector('#catering-form [data-rr-submit]');return [b.disabled,b.textContent]})()")
    res(dis[0] is True and "Sending" in dis[1], f"button disabled while sending {dis}")
    r = pg.reqs[0]; b = json.loads(r.post_data)
    res(r.method == "POST" and r.url == URL and "application/json" in r.headers.get("content-type", ""), f"POST JSON to {r.url}")
    res(b.get("access_key") == "__WEB3FORMS_KEY__" or len(b.get("access_key", "")) >= 8, f"access_key present in payload ({'placeholder' if b.get('access_key')=='__WEB3FORMS_KEY__' else 'real key'})")
    exp = {"Name": "Test Person", "Phone": "9849982052", "Email": "t@example.com", "replyto": "t@example.com", "Event type": "Wedding", "Event date": "5 Dec 2026", "Number of guests": "150",
           "Venue / location": "Benz Circle", "Requirements": "Veg and non-veg", "Call": "tel:+919849982052", "WhatsApp": "https://wa.me/919849982052", "from_name": "RR Durbar website", "botcheck": False}
    res(all(b.get(k) == v for k, v in exp.items()), f"payload fields {sorted(set(exp) - {k for k in exp if b.get(k) == exp[k]}) or 'all match'}")
    res(b.get("Submitted from", "").startswith(B + "/catering/"), f"Submitted from {b.get('Submitted from')!r}")
    old = [k for k in ("name", "phone", "email", "event_type", "date", "guests", "location", "message", "topic") if k in b]
    res(not old, f"old machine-style keys gone {old}")
    res(b.get("subject") == "[RR Durbar] Catering enquiry \u2013 Wedding \u2013 5 Dec 2026", f"subject {b.get('subject')!r}")
    pg.pending[0].fulfill(status=200, content_type="application/json", body='{"success":true}'); pg.wait_for_timeout(500)
    st = pg.evaluate(STATUS, "#catering-form"); en = btn_disabled(pg, "#catering-form")
    res(st[0] is False and st[1] == OK_MSG and st[2] == "success", f"success message {st[1]!r}")
    res(en is False and pg.evaluate("window.__noreload") == 1, "button enabled again, page not reloaded")
    res(pg.evaluate("document.getElementById('c-name').value") == "", "form reset after success")
    res(not pg.errs, f"no script errors {pg.errs}"); ctx.close()
    # 1b fallbacks: blank event + date (required removed only so the form can submit), phone with +91 and spaces, no email, no requirements
    ctx, pg = load(br, "/catering/"); mock(pg, "ok"); fill_cat(pg, None)
    pg.fill("#c-phone", "+91 98499 82052"); pg.fill("#c-email", ""); pg.fill("#c-msg", ""); pg.fill("#c-date", "")
    pg.evaluate("['c-type','c-date'].forEach(i=>document.getElementById(i).required=false)")
    pg.click("#catering-form [data-rr-submit]"); pg.wait_for_timeout(700)
    b = body(pg) if pg.reqs else {}
    res(b.get("subject") == "[RR Durbar] Catering enquiry \u2013 Enquiry \u2013 date not given", f"fallback subject {b.get('subject')!r}")
    res(b.get("Call") == "tel:+919849982052" and b.get("WhatsApp") == "https://wa.me/919849982052" and b.get("Phone") == "+91 98499 82052", f"+91 phone: Call/WhatsApp {b.get('Call')} {b.get('WhatsApp')}")
    res(not any(k in b for k in ("Email", "replyto", "Requirements", "Event type", "Event date")), f"empty fields left out {sorted(k for k in b if k in ('Email','replyto','Requirements','Event type','Event date'))}"); ctx.close()
    # 2 catering errors
    for mode in ("500", "fail"):
        ctx, pg = load(br, "/catering/"); mock(pg, mode); fill_cat(pg); pg.click("#catering-form [data-rr-submit]"); pg.wait_for_timeout(700)
        st = pg.evaluate(STATUS, "#catering-form")
        res(st[0] is False and st[2] == "error" and OK_MSG not in st[1] and any("wa.me/919849982052" in h for h in st[3]), f"catering error ({mode}): tone={st[2]} link={st[3]}")
        res(btn_disabled(pg, "#catering-form") is False and pg.evaluate("document.getElementById('c-name').value") == "Test Person", f"error ({mode}): button back on, typed data kept")
        ctx.close()
    # 3 catering honeypot
    ctx, pg = load(br, "/catering/"); mock(pg, "ok"); fill_cat(pg)
    pg.evaluate("document.querySelector('#catering-form input[name=botcheck]').checked=true")
    res(pg.evaluate("getComputedStyle(document.querySelector('#catering-form input[name=botcheck]')).display") == "none", "honeypot is hidden")
    pg.click("#catering-form [data-rr-submit]"); pg.wait_for_timeout(800)
    res(len(pg.reqs) == 0, f"honeypot filled: no request sent ({len(pg.reqs)})"); ctx.close()
    # 4 contact
    ctx, pg = load(br, "/contact/"); mock(pg, "ok"); fill_con(pg); pg.click("[data-rr-form=contact] [data-rr-submit]"); pg.wait_for_timeout(700)
    b = body(pg) if pg.reqs else {}
    res(b.get("subject") == "[RR Durbar] Contact \u2013 Asha", f"contact subject {b.get('subject')!r}")
    res(all(b.get(k) == v for k, v in {"Name": "Asha", "Phone": "9849982052", "Email": "a@example.com", "replyto": "a@example.com", "Message": "Are you open on Sunday?", "Topic": "Opening hours",
        "Call": "tel:+919849982052", "WhatsApp": "https://wa.me/919849982052", "from_name": "RR Durbar website", "botcheck": False}.items()) and b.get("Submitted from", "").startswith(B + "/contact/"), "contact payload fields")
    st = pg.evaluate(STATUS, "[data-rr-form=contact]"); res(st[1] == OK_MSG and st[2] == "success", f"contact success {st[1]!r}"); ctx.close()
    ctx, pg = load(br, "/contact/"); mock(pg, "500"); fill_con(pg); pg.click("[data-rr-form=contact] [data-rr-submit]"); pg.wait_for_timeout(700)
    st = pg.evaluate(STATUS, "[data-rr-form=contact]"); res(st[2] == "error" and any("wa.me/919849982052" in h for h in st[3]), f"contact error + WhatsApp link {st[3]}"); ctx.close()
    ctx, pg = load(br, "/contact/"); mock(pg, "ok"); fill_con(pg); pg.evaluate("document.querySelector('[data-rr-form=contact] input[name=botcheck]').checked=true")
    pg.click("[data-rr-form=contact] [data-rr-submit]"); pg.wait_for_timeout(700); res(len(pg.reqs) == 0, "contact honeypot: no request sent"); ctx.close()
    # 5 no sideways scroll
    for path, f in (("/catering/", "#catering-form"), ("/contact/", "[data-rr-form=contact]")):
        for w, h, mob in ((360, 740, True), (390, 844, True), (1440, 900, False)):
            ctx, pg = load(br, path, w, h, mob); mock(pg, "500")
            (fill_cat if path == "/catering/" else fill_con)(pg); pg.click(f + " [data-rr-submit]"); pg.wait_for_timeout(700)
            sw = pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
            res(sw[0] <= sw[1], f"{path} {w}px: no sideways scroll with the error message showing {sw}"); ctx.close()
    br.close()
print(f"RESULT: {bad} failed"); sys.exit(1 if bad else 0)

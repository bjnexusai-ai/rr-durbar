#!/usr/bin/env python3
"""Browser checks for public/checkout/v2/index.html (plan tasks 6.10, 6.13). Read-only: never touches the live site or API.
Run from the website repo root:  python3 tools/checkout-v2/uitest.py            (needs Python Playwright with Chromium)
Screenshots go to /tmp/checkout-v2-shots/.  Exit code 1 if any check fails.
Part 1 = demo mode (layout at 390x844, 1280x720, 1366x768 and the whole flow).
Part 2 = live mode against a STRICT fake API that rejects anything outside contract v1.1 (the page is served with LIVE switched on
in memory only; the file on disk is not changed)."""
import http.server, json, os, re, socketserver, sys, threading, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / 'public' / 'checkout' / 'v2' / 'index.html'
SHOTS = Path('/tmp/checkout-v2-shots'); SHOTS.mkdir(exist_ok=True)
API = 'https://rr-durbar-api.ramana-peravali.workers.dev/api'
SRC = PAGE.read_text(encoding='utf-8')
LIVE_SRC = SRC.replace('LIVE: false,', 'LIVE: true,', 1)
assert LIVE_SRC != SRC, 'could not switch LIVE on in memory'

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        p = self.path.split('?')[0]
        if p in ('/checkout/v2/', '/checkout/v2/index.html', '/live/checkout/v2/'):
            body = (LIVE_SRC if p.startswith('/live/') else SRC).encode()
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers(); self.wfile.write(body); return
        self.send_response(404); self.end_headers()

srv = socketserver.TCPServer(('127.0.0.1', 0), H); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'
ok = bad = 0
def check(name, cond, info=''):
    global ok, bad
    if cond: ok += 1; print('PASS ', name)
    else: bad += 1; print('FAIL ', name, ('-> ' + str(info)) if info else '')

SAMPLE = json.dumps({'items': [{'id': 'r1', 'name': 'Chicken Dum Biryani (Regular)', 'qty': 1, 'p': 349}, {'id': 'r2', 'name': 'Chicken Lollipops', 'qty': 1, 'p': 299}], 'outlet': ''})
BIG = json.dumps({'items': [{'id': 'r1', 'name': 'Chicken Dum Biryani (Family)', 'qty': 2, 'p': 699}], 'outlet': ''})

def open_page(b, w, h, cart=SAMPLE, url='/checkout/v2/'):
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=w < 600, has_touch=w < 600)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    pg.goto(BASE + '/checkout/v2/'); pg.evaluate("c => localStorage.setItem('rr_cart_v2', c)", cart)
    pg.goto(BASE + url); pg.wait_for_selector('#ck-outlet', timeout=8000)
    return ctx, pg, errs

def pickup(pg):
    pg.select_option('#ck-outlet', 'moghalrajpuram'); pg.wait_for_selector('#ck-slot', timeout=8000)
    pg.select_option('#ck-slot', index=2); pg.wait_for_selector('#ck-total', timeout=8000)

def login(pg, phone='9999900001', code='123456'):
    pg.check('#ck-terms'); pg.fill('#ck-ph', phone); pg.wait_for_selector('#ck-otpbox:not(.hidden)', timeout=8000)
    for i, d in enumerate(code): pg.fill(f'#ck-o{i}', d)
    pg.wait_for_function("document.querySelector('.rw').dataset.state === 'open'", timeout=8000)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- Part 1: demo mode ----------
    for (w, h) in [(1280, 720), (1366, 768)]:
        ctx, pg, errs = open_page(b, w, h); pickup(pg); login(pg)
        pg.wait_for_function("/pts/.test(document.querySelector('#rw-n').textContent)", timeout=8000)
        m = pg.evaluate("""() => { const d = document.scrollingElement; const g = document.querySelector('.ck-gap').getBoundingClientRect();
          return { sh: d.scrollHeight, ih: innerHeight, sw: d.scrollWidth, iw: innerWidth, gap: g.width, two: !!document.querySelector('#ck.two'),
                   payBottom: document.querySelector('[data-act=place]').getBoundingClientRect().bottom } }""")
        check(f'{w}x{h}: one screen, no page scroll', m['sh'] <= m['ih'] + 1, m)
        check(f'{w}x{h}: no sideways scroll', m['sw'] <= m['iw'], m)
        check(f'{w}x{h}: centre gap visible (about 56 px)', 40 <= m['gap'] <= 70, m['gap'])
        pg.screenshot(path=str(SHOTS / f'd{w}x{h}-verified.png'))
        check(f'{w}x{h}: no JS errors', not errs, errs[:2]); ctx.close()

    ctx, pg, errs = open_page(b, 390, 844)
    m = pg.evaluate("() => ({ sw: document.scrollingElement.scrollWidth, bar: getComputedStyle(document.querySelector('.ck-bar')).position, barTop: document.querySelector('.ck-bar').getBoundingClientRect().bottom })")
    check('390: no sideways scroll', m['sw'] <= 390, m); check('390: sticky Pay bar fixed at the bottom', m['bar'] == 'fixed' and m['barTop'] <= 845, m)
    pg.screenshot(path=str(SHOTS / 'm390-1-start.png'), full_page=True)
    check('before verify: points hidden', pg.text_content('#rw-n').strip() == '')
    check('before verify: rewards section is inert', pg.get_attribute('#s-offers', 'inert') is not None)
    check('card: RR piggy bank art and gold coin are on the card', pg.locator('.rw svg.rw-pig').count() == 1 and pg.locator('.rw-knob svg').count() == 1)
    check('card: pig is greyed and the label says swipe while locked', pg.get_attribute('.rw', 'data-state') == 'locked' and 'Swipe to unlock' in pg.text_content('#rw-lbl'))
    pg.locator('.rw-trk').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
    kb = pg.locator('.rw-knob').bounding_box(); tb = pg.locator('.rw-trk').bounding_box()
    pg.mouse.move(kb['x'] + 28, kb['y'] + 28); pg.mouse.down(); pg.mouse.move(tb['x'] + tb['width'] - 20, kb['y'] + 28, steps=8); pg.mouse.up()
    check('card: dragging the coin does not unlock, it takes you to the mobile field', pg.get_attribute('.rw', 'data-state') == 'locked' and pg.evaluate("document.activeElement && document.activeElement.id") == 'ck-ph')
    pickup(pg)
    sl = pg.eval_on_selector_all('#ck-slot option', 'os => os.map(o => [o.value, o.textContent])')
    ids = [v for v, _ in sl if v]; steps = {(int(__import__('datetime').datetime.fromisoformat(b.replace('Z', '+00:00')).timestamp()) - int(__import__('datetime').datetime.fromisoformat(a.replace('Z', '+00:00')).timestamp())) // 60 for a, b in zip(ids, ids[1:])}
    check('pickup time is ONE dropdown of half-hour windows (no time buttons)', pg.locator('.ck-chip[data-time]').count() == 0 and sl[0][1] == 'Choose a pickup time' and len(ids) >= 8 and steps == {30} and all(re.match(r'^\d{1,2}:(00|30)( am| pm)? \u2013 \d{1,2}:(00|30) (am|pm)$', t) for v, t in sl if v), sl[:3])
    pg.click('[data-act=next]'); check('after choosing: "Ready for pickup: <window>" and the label reads "Pickup today"', 'Ready for pickup: ' in pg.text_content('#ck-pickbody'))
    pg.click('[data-act=change]'); check('label reads "Pickup today"', pg.text_content('label[for=ck-slot]') == 'Pickup today')
    pg.fill('#ck-ph', '9999900001')
    check('no code before the terms tick, with a clear message', 'Tick the box above' in pg.text_content('#ck-formerr') and 'hidden' in pg.get_attribute('#ck-otpbox', 'class'))
    pg.check('#ck-terms'); pg.wait_for_selector('#ck-otpbox:not(.hidden)', timeout=8000)
    check('code sends by itself once the box is ticked', pg.get_attribute('.rw', 'data-state') == 'otp')
    check('resend is locked with a timer', pg.is_disabled('#ck-rs') and 'Resend in' in pg.text_content('#ck-rs'))
    for i, d in enumerate('111111'): pg.fill(f'#ck-o{i}', d)
    pg.wait_for_function("/tries left/.test(document.querySelector('#ck-otpmsg').textContent)", timeout=8000)
    check('wrong code is refused with tries left', '4 tries left' in pg.text_content('#ck-otpmsg'))
    check('swipe card stays locked after a wrong code', pg.get_attribute('.rw', 'data-state') in ('err', 'otp'))
    check('pay stays disabled before verify', pg.is_disabled('[data-act=barplace]'))
    pg.click('#ck-o0'); pg.evaluate("""() => { const dt = new DataTransfer(); dt.setData('text', '123456'); document.querySelector('#ck-o0').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }""")
    pg.wait_for_function("document.querySelector('.rw').dataset.state === 'open'", timeout=8000)
    check('pasting the code fills the boxes and submits by itself', True)
    pg.wait_for_function("/240 pts/.test(document.querySelector('#rw-n').textContent)", timeout=8000)
    check('member sees the balance only after the code (240)', '240' in pg.text_content('#rw-n'))
    check('card: tier progress shows the next level (260 more to Silver)', '260 more points to reach Silver' in pg.text_content('#rw-t') and pg.get_attribute('.rw', 'data-fill') == '0')
    check('rewards section unlocks after verify', pg.get_attribute('#s-offers', 'inert') is None)
    # ---- v2.1: tip, coupons, points (demo money model: discount -> GST on the rest -> tip, not taxed) ----
    tot = lambda: pg.text_content('#ck-total')
    def wait_tot(v): pg.wait_for_function(f"document.querySelector('#ck-total') && document.querySelector('#ck-total').textContent === '{v}'", timeout=8000)
    on = pg.locator('.ck-chip.tip[aria-pressed=true]')
    wait_tot('Rs 680.40'); check('tip: NOTHING preselected, total without tip Rs 680.40 (CCPA: no charge added by default)', on.count() == 0 and pg.locator('#ck-tipsum').count() == 0)
    pg.click('[data-tip="5"]'); wait_tot('Rs 712.80'); check('tip: 5% of Rs 648 = Rs 32.40, GST not charged on the tip (total Rs 712.80)', pg.text_content('#ck-tipsum') == 'Rs 32.40' and pg.text_content('#ck-gst') == 'Rs 32.40')
    pg.click('[data-tip="5"]'); wait_tot('Rs 680.40'); check('tip: tapping 5% again removes it (Rs 680.40)', pg.locator('#ck-tipsum').count() == 0)
    pg.click('[data-tip=other]'); pg.fill('#ck-tipamt', '50'); wait_tot('Rs 730.40'); check('tip: Other Rs 50 is added (Rs 730.40)', True)
    pg.click('[data-tip="10"]'); wait_tot('Rs 745.20'); check('tip: 10% = Rs 64.80 (Rs 745.20)', pg.text_content('#ck-tipsum') == 'Rs 64.80')
    pg.click('[data-act=coupons]'); pg.wait_for_selector('#ck-dlg .cp', timeout=8000)
    dl = pg.text_content('#ck-dlg')
    check('coupons: list opens with savings and reasons', pg.locator('#ck-dlg .cp').count() == 4 and 'You save Rs 64.80' in dl and 'more to use this' in dl and 'expired' in dl)
    pg.screenshot(path=str(SHOTS / 'm390-2b-coupons.png'))
    pg.fill('#ck-cpin', 'feast20'); pg.click('[data-act=cpcode]')
    check('coupons: a code that does not qualify is refused in the dialog', 'more to use this' in pg.text_content('#ck-cperr'))
    pg.click('[data-act=cpapply][data-code=RR10]'); wait_tot('Rs 677.16')
    check('coupons: RR10 gives Rs 64.80 off, GST on Rs 583.20 = Rs 29.16 (Rs 677.16)', pg.text_content('#ck-gst') == 'Rs 29.16' and 'RR10 applied' in pg.text_content('.cptag'))
    rl = pg.text_content('.rwlist')
    check('rewards: the 5 Royal Club rewards from the home page are listed', pg.locator('.rwi').count() == 5 and all(x in rl for x in ['1 FREE drink', '75 off entire purchase', '150 off entire purchase', '1 FREE starter or dessert', '500 off entire purchase']))
    check('rewards: 240 points is 260 short of the free drink, nothing can be used yet', '260 more points' in rl and pg.locator('[data-act=reward]').count() == 0)
    check('pay at pickup offered at Rs 677.16 (under Rs 1000, tip included)', pg.locator('input[name=ck-pm][value=cod]').count() == 1)
    pg.screenshot(path=str(SHOTS / 'm390-2-verified.png'), full_page=True)
    pg.check('input[name=ck-pm][value=payu]'); check('pay enabled after choosing a method', pg.is_enabled('[data-act=barplace]'))
    pg.click('[data-act=barplace]'); pg.wait_for_selector('[data-act=mp]', timeout=8000)
    pg.click('[data-act=mp][data-ok="0"]'); pg.wait_for_selector('[data-act=retry]', timeout=8000)
    check('a failed payment shows Try again', 'not completed' in pg.text_content('#ck'))
    pg.click('[data-act=retry]'); pg.wait_for_selector('#ck-total', timeout=8000)
    pg.check('input[name=ck-pm][value=payu]'); pg.click('[data-act=barplace]'); pg.wait_for_selector('[data-act=mp]', timeout=8000)
    pg.click('[data-act=mp][data-ok="1"]'); pg.wait_for_selector('#h-id', timeout=8000)
    check('a successful payment shows the order number', re.match(r'RR-\d+', pg.text_content('#h-id')) is not None)
    dn = pg.text_content('#ck')
    check('confirmed page: tip, coupon, items and points earned (Rs 1 = 1 point: 583)', 'Order confirmed' in dn and 'Rs 64.80' in dn and '583' in dn and '1 x Chicken Lollipops' in dn and 'Rs 677.16' in dn)
    pg.screenshot(path=str(SHOTS / 'm390-3-done.png'), full_page=True)
    check('390: no JS errors in the whole flow', not errs, errs[:2]); ctx.close()

    ctx, pg, errs = open_page(b, 390, 844, cart=BIG); pickup(pg); login(pg, phone='9876543210')
    check('big order (over Rs 1000, no tip): pay at pickup NOT offered', pg.locator('input[name=ck-pm][value=cod]').count() == 0 and 'up to Rs 1000' in pg.text_content('#ck-pm'))
    check('new number: verified with 0 points, not blocked', pg.get_attribute('#s-offers', 'inert') is None)
    ctx.close()
    ctx, pg, errs = open_page(b, 390, 844); pickup(pg); login(pg, phone='9999900003')
    pg.wait_for_selector('#ck-codmsg', timeout=8000)
    check('pay at pickup running total: Rs 600 already open + Rs 680.40 order > Rs 1000 -> only online, with the reason (Rs 400.00 left)', pg.locator('input[name=ck-pm][value=cod]').count() == 0 and 'Rs 400.00 left' in pg.text_content('#ck-codmsg') and pg.locator('input[name=ck-pm][value=payu]').count() == 1)
    ctx.close()
    ctx, pg, errs = open_page(b, 390, 844, cart=json.dumps({'items': [{'id': 'r9', 'name': 'Masala Tea', 'qty': 2, 'p': 150}], 'outlet': ''})); pickup(pg); login(pg, phone='9999900003')
    pg.wait_for_selector('input[name=ck-pm][value=cod]', timeout=8000)
    check('pay at pickup running total: Rs 600 open + Rs 315 order = Rs 915 -> pay at pickup still offered', pg.locator('input[name=ck-pm][value=cod]').count() == 1)
    ctx.close()
    ctx, pg, errs = open_page(b, 390, 844); pickup(pg); login(pg, phone='9999900002')
    pg.wait_for_function("/2450 pts/.test(document.querySelector('#rw-n').textContent)", timeout=8000)
    check('card: a Gold member (2450) gets coin piles and the next level', pg.get_attribute('.rw', 'data-fill') == '2' and '2550 more points to reach Royal Durbar' in pg.text_content('#rw-t'))
    pg.wait_for_selector('.rwlist [data-act=reward]', timeout=8000)
    check('rewards: Gold (2450) can use the drink, Rs 75 off and Rs 150 off; 3000 and 5000 still locked', pg.locator('[data-act=reward]').count() == 3 and '550 more points' in pg.text_content('.rwlist') and '2550 more points' in pg.text_content('.rwlist'))
    pg.click('[data-act=reward][data-id=off2000]'); pg.wait_for_function("document.querySelector('#ck-total').textContent === 'Rs 522.90'", timeout=8000)
    check('rewards: Rs 150 off (2000 points) on Rs 648, GST on Rs 498 = Rs 24.90, total Rs 522.90', '150 off, 2000 points' in pg.text_content('#ck-sum') and pg.text_content('#ck-gst') == 'Rs 24.90')
    pg.click('[data-act=reward][data-id=drink500]'); pg.wait_for_function("document.querySelector('#ck-total').textContent === 'Rs 680.40'", timeout=8000)
    check('rewards: the free drink (500 points) is collected at pickup, no money off, one reward per order', 'Free at pickup' in pg.text_content('#ck-sum') and 'counter adds your drink' in pg.text_content('#s-offers') and pg.locator('.rwi.on').count() == 1)
    ctx.close()
    ctx, pg, errs = open_page(b, 390, 844, cart=json.dumps({'items': [{'id': 'r9', 'name': 'Masala Tea', 'qty': 1, 'p': 120}], 'outlet': ''})); pickup(pg); login(pg, phone='9999900002')
    pg.wait_for_selector('.rwlist [data-act=reward]', timeout=8000)
    rl = pg.text_content('.rwlist')
    check('rewards: never a Rs 0 bill: on a Rs 120 order Rs 150 off is not offered ("Add Rs 31.00 more"); Rs 75 off still is', pg.locator('[data-act=reward][data-id=off2000]').count() == 0 and 'Add Rs 31.00 more' in rl and pg.locator('[data-act=reward][data-id=off1000]').count() == 1)
    check('card: no JS errors for a Gold member', not errs, errs[:2]); ctx.close()

    ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page(); pg.goto(BASE + '/checkout/v2/')
    pg.evaluate("localStorage.removeItem('rr_cart_v2')"); pg.goto(BASE + '/checkout/v2/'); pg.wait_for_selector('.big', timeout=8000)
    check('empty cart shows Choose dishes, not a broken page', 'cart is empty' in pg.text_content('#ck')); ctx.close()

    # ---------- Part 2: live mode against a strict fake API ----------
    log, violations = [], []
    def api(route):
        r = route.request; u = r.url; path = u.split('/api', 1)[1].split('?')[0]; h = {k.lower(): v for k, v in r.headers.items()}
        body = json.loads(r.post_data) if r.post_data else None
        log.append((r.method, path, u, h, body))
        def send(obj, status=200): route.fulfill(status=status, content_type='application/json', body=json.dumps(obj), headers={'access-control-allow-origin': '*'})
        if r.method == 'OPTIONS': return route.fulfill(status=204, headers={'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
        if path == '/config' and r.method == 'GET': return send({'orderingOpen': True, 'termsVersion': 'tv-9', 'codMaxPaise': 100000, 'branches': [{'code': 'moghalrajpuram', 'name': 'Moghalrajpuram', 'open': True, 'codAllowed': True}, {'code': 'singhnagar', 'name': 'Singhnagar', 'open': False, 'codAllowed': True}]})
        if path == '/checkout/limits':
            if r.method != 'GET' or not h.get('authorization', '').startswith('Bearer '): violations.append('limits must be GET with Bearer')
            return send({'codMaxPaise': 100000, 'codOpenPaise': 0, 'codRemainingPaise': 100000})
        if path == '/slots':
            if r.method != 'GET' or 'branch=moghalrajpuram' not in u: violations.append('slots must be GET with ?branch=')
            return send({'slots': [{'id': '2026-10-26T09:30:00.000Z', 'endsAt': '2026-10-26T09:45:00.000Z', 'label': '3:00 pm'}, {'id': '2026-10-26T10:00:00.000Z', 'endsAt': '2026-10-26T10:15:00.000Z', 'label': '3:30 pm'}]})
        if path == '/quote':
            if set(body.keys()) != {'branch', 'items'} or any(set(i.keys()) != {'id', 'qty'} for i in body['items']): violations.append('quote body must be only branch and {id,qty} items')
            return send({'items': [{'id': i['id'], 'name': 'Dish ' + i['id'], 'qty': i['qty'], 'unitPaise': 34900, 'linePaise': 34900 * i['qty']} for i in body['items']], 'subtotalPaise': 69800, 'taxPaise': 3490, 'totalPaise': 73290, 'earnPoints': 698})
        if path == '/otp/send':
            if 'authorization' in h or body.get('purpose') != 'checkout' or 'turnstileToken' not in body: violations.append('otp/send shape')
            return send({'sent': True, 'resendAfterSeconds': 30})
        if path == '/otp/verify':
            return send({'token': 'tok-123'}) if body.get('code') == '654321' else send({'error': {'code': 'otp_wrong', 'message': 'That code is not right.'}}, 400)
        if path == '/loyalty/lookup':
            if h.get('authorization') != 'Bearer tok-123' or 'phone' in body: violations.append('lookup needs Bearer and no phone in the body')
            return send({'available': True, 'member': True, 'balance': 50})
        if path == '/checkout/start':
            if h.get('authorization') != 'Bearer tok-123': violations.append('start needs Bearer')
            if not re.match(r'^[0-9a-f-]{36}$', h.get('idempotency-key', '')): violations.append('start needs a UUID Idempotency-Key')
            if 'phone' in json.dumps(body) or 'token' in body: violations.append('no phone or token in the start body')
            if body.get('consent', {}).get('version') != 'tv-9' or body['consent'].get('terms') is not True: violations.append('consent must carry terms and the server terms version')
            if body.get('expectedTotalPaise') != 73290 or body.get('slotId') != '2026-10-26T10:00:00.000Z': violations.append('start must send slotId and expectedTotalPaise')
            act = 'https://evil.example/_payment' if 'hostile' in log[0][2] or os.environ.get('HOSTILE') else 'https://test.payu.in/_payment'
            return send({'orderId': 'RR-100234', 'statusToken': 'st-1', 'state': 'PAYMENT_PENDING', 'totalPaise': 73290, 'payment': {'type': 'payu', 'action': act, 'method': 'POST', 'fields': {'key': 'k', 'txnid': 'RR-100234', 'amount': '732.90', 'hash': 'h'}}})
        if path == '/order/status':
            if 'id=RR-100234' not in u or 't=st-1' not in u: violations.append('status needs id and t')
            return send({'orderId': 'RR-100234', 'state': 'CONFIRMED', 'method': 'payu', 'totalPaise': 73290, 'branchName': 'Moghalrajpuram', 'slotLabel': '3:30 pm', 'earnPoints': 698})
        violations.append('unexpected call ' + r.method + ' ' + path); return send({'error': {'code': 'not_found'}}, 404)

    def live_ctx():
        ctx = b.new_context(viewport={'width': 1280, 'height': 720}); ctx.route(API + '/**', api)
        posted = []
        ctx.route('https://test.payu.in/**', lambda r: (posted.append(r.request.post_data or ''), r.fulfill(status=200, content_type='text/html', body='<p>PayU test page</p>')))
        ctx.route('https://evil.example/**', lambda r: (posted.append('EVIL'), r.fulfill(status=200, body='evil')))
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE + '/live/checkout/v2/'); pg.evaluate("c => localStorage.setItem('rr_cart_v2', c)", SAMPLE); pg.goto(BASE + '/live/checkout/v2/')
        pg.wait_for_selector('#ck-outlet', timeout=8000); return ctx, pg, errs, posted

    ctx, pg, errs, posted = live_ctx()
    check('live: outlet list comes from /config (closed outlet hidden)', pg.locator('#ck-outlet option').count() == 2)
    pickup(pg)
    check('live: window end comes from the API (endsAt), so a 15-minute setting shows "3:30 – 3:45 pm"', '3:30 – 3:45 pm' in pg.eval_on_selector_all('#ck-slot option', 'os => os.map(o => o.textContent)'))
    pg.check('#ck-terms'); pg.fill('#ck-ph', '9876543210'); pg.wait_for_selector('#ck-otpbox:not(.hidden)', timeout=8000)
    for i, d in enumerate('654321'): pg.fill(f'#ck-o{i}', d)
    pg.wait_for_function("document.querySelector('.rw').dataset.state === 'open'", timeout=8000)
    pg.wait_for_function("/50 pts/.test(document.querySelector('#rw-n').textContent)", timeout=8000)
    check('live: rewards balance from /loyalty/lookup after the code', '50' in pg.text_content('#rw-n'))
    check('live v1.1: no tip, coupon or points controls until /config announces them', pg.locator('[data-tip],[data-act=coupons],#ck-usepts:not([disabled])').count() == 0)
    pg.check('input[name=ck-pm][value=payu]'); pg.click('[data-act=place]')
    pg.wait_for_function("document.body.innerText.includes('PayU test page')", timeout=8000)
    check('live: PayU gets a POSTed form with txnid and amount', posted and 'txnid=RR-100234' in posted[0] and 'amount=732.90' in posted[0], posted[:1])
    check('live: every request matched contract v1.1', not violations, violations); ctx.close()

    log.clear(); violations.clear(); os.environ['HOSTILE'] = '1'
    ctx, pg, errs, posted = live_ctx(); pickup(pg); pg.check('#ck-terms'); pg.fill('#ck-ph', '9876543210'); pg.wait_for_selector('#ck-otpbox:not(.hidden)')
    for i, d in enumerate('654321'): pg.fill(f'#ck-o{i}', d)
    pg.wait_for_function("document.querySelector('.rw').dataset.state === 'open'"); pg.check('input[name=ck-pm][value=payu]'); pg.click('[data-act=place]')
    pg.wait_for_function("/could not be started/.test(document.querySelector('#ck-payerr').textContent)", timeout=8000)
    check('live: a payment address that is not PayU is refused, nothing is sent', 'EVIL' not in posted); ctx.close(); del os.environ['HOSTILE']

    log.clear(); violations.clear()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); ctx.route(API + '/**', api); pg = ctx.new_page()
    pg.goto(BASE + '/live/checkout/v2/?order=RR-100234&t=st-1'); pg.wait_for_selector('#h-id', timeout=8000)
    check('live: return from PayU polls status and shows the order', pg.text_content('#h-id') == 'RR-100234')
    check('live: the status token is removed from the address bar', 't=' not in pg.url, pg.url)
    check('live: return path calls matched the contract', not violations, violations); ctx.close()
    b.close()
srv.shutdown()
print(f'\nRESULT: {ok} passed, {bad} failed. Screenshots: {SHOTS}')
sys.exit(1 if bad else 0)

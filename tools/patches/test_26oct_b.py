#!/usr/bin/env python3
"""Browser test for tools/patches/apply_26oct_b.py. Read-only on the repo: works on COPIES in a temp folder.
Run from the website repo root (needs Python Playwright + Chromium):  python3 tools/patches/test_26oct_b.py
It serves the unpatched and the patched copy side by side, fakes the API (menu, prices, quote), and checks:
 - switch OFF: the pickup menu cart works and looks the same as before (no new button, same lines, no new JS errors)
 - switch ON: "Checkout and pay online" appears, saves rr_cart_v2 and opens /checkout/v2/ with the same dishes
 - the Google data still parses and every outlet now has image and sameAs; the existing skip link is untouched."""
import http.server, json, re, shutil, socketserver, subprocess, sys, tempfile, threading, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO = Path.cwd()
SRC = REPO / 'public' / 'index.html'
V2 = REPO / 'public' / 'checkout' / 'v2' / 'index.html'
tmp = Path(tempfile.mkdtemp())
for name in ('before', 'after'):
    (tmp / name / 'public' / 'checkout' / 'v2').mkdir(parents=True)
    shutil.copy(SRC, tmp / name / 'public' / 'index.html')
    if V2.exists(): shutil.copy(V2, tmp / name / 'public' / 'checkout' / 'v2' / 'index.html')
r = subprocess.run([sys.executable, str(REPO / 'tools' / 'patches' / 'apply_26oct_b.py')], cwd=tmp / 'after', capture_output=True, text=True)
print(r.stdout.strip())
if r.returncode: print(r.stderr); sys.exit(1)

def serve(root):
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    h.log_message = lambda *a: None
    s = socketserver.TCPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s
SB, SA = serve(tmp / 'before' / 'public'), serve(tmp / 'after' / 'public')

MENU = {'categories': [{'name': 'Biryani', 'items': [{'id': 'd1', 'name': 'Chicken Dum Biryani', 'veg': False, 'soldOut': False, 'orderable': True, 'variants': [{'id': 'v1', 'label': 'Regular', 'soldOut': False, 'orderable': True}]},
                                                     {'id': 'd2', 'name': 'Veg Butta Biryani', 'veg': True, 'soldOut': False, 'orderable': True}]}] * 1}
MENU['categories'][0]['items'] += [{'id': f'x{i}', 'name': f'Dish {i}', 'veg': True, 'soldOut': False, 'orderable': True} for i in range(30)]
PRICES = {'prices': {'v1': 349, 'd2': 279, **{f'x{i}': 199 for i in range(30)}}}
def api(route):
    u = route.request.url
    if '/api/menu' in u: body = MENU
    elif '/api/prices' in u: body = PRICES
    elif '/api/quote' in u:
        items = json.loads(route.request.post_data)['items']
        lines = [{'id': i['id'], 'ok': True, 'qty': i['qty'], 'lineTotal': PRICES['prices'].get(i['id'], 0) * i['qty']} for i in items]
        sub = sum(l['lineTotal'] for l in lines); tax = round(sub * 0.05, 2)
        body = {'lines': lines, 'subtotal': sub, 'tax': tax, 'total': round(sub + tax, 2), 'allOk': True}
    else: body = {}
    route.fulfill(status=200, content_type='application/json', body=json.dumps(body), headers={'access-control-allow-origin': '*'})

ok = bad = 0
def check(name, cond, info=''):
    global ok, bad
    if cond: ok += 1; print('PASS ', name)
    else: bad += 1; print('FAIL ', name, ('-> ' + str(info))[:300] if info else '')

def run(b, server, flag):
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); ctx.route('https://rr-durbar-api.ramana-peravali.workers.dev/**', api)
    if flag: ctx.add_init_script('window.RR_CHECKOUT_V2 = true;')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    port = server.server_address[1]
    pg.goto(f'http://127.0.0.1:{port}/?page=pickup-menu&outlet=moghalrajpuram', wait_until='domcontentloaded')
    pg.wait_for_selector('.lv-add:not([disabled])', timeout=20000)
    pg.locator('.lv-add:not([disabled])').first.click()
    pg.wait_for_function("document.body.innerText.includes('Total')", timeout=15000)
    pg.wait_for_timeout(600)
    res = {'lines': pg.locator('.p3-line').count(), 'btn': pg.locator('.rr-cv2').count(), 'errs': list(errs)}
    return ctx, pg, res

with sync_playwright() as p:
    b = p.chromium.launch()
    c0, p0, before = run(b, SB, False); c0.close()
    c1, p1, off = run(b, SA, False)
    check('switch OFF: no new button', off['btn'] == 0, off)
    check('switch OFF: same cart lines as before', off['lines'] == before['lines'] and off['lines'] >= 1, (before, off))
    check('switch OFF: no new JS errors', len(off['errs']) <= len(before['errs']), (before['errs'][:2], off['errs'][:2]))
    # Google data and skip link (same page)
    data = p1.evaluate("""() => [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent)""")
    try:
        nodes = [n for d in data for n in (json.loads(d).get('@graph') or [json.loads(d)])]
        rest = [n for n in nodes if n.get('@type') == 'Restaurant']
        check('Google data parses; 6 outlets have image and Instagram sameAs', len(rest) == 6 and all(n.get('image') and n.get('sameAs') for n in rest), len(rest))
    except Exception as e:
        check('Google data parses', False, e)
    check('existing skip link untouched (exactly one #rr-skip-btn)', p1.locator('#rr-skip-btn').count() == 1)
    c1.close()
    c2, p2, on = run(b, SA, True)
    check('switch ON: Checkout and pay online appears', on['btn'] == 1, on)
    p2.click('.rr-cv2'); p2.wait_for_url('**/checkout/v2/**', timeout=10000)
    saved = json.loads(p2.evaluate("localStorage.getItem('rr_cart_v2')") or '{}')
    check('switch ON: cart saved for checkout with name, qty, price and outlet', saved.get('outlet') == 'moghalrajpuram' and saved['items'] and saved['items'][0]['qty'] == 1 and saved['items'][0]['name'] and saved['items'][0]['p'] > 0, saved)
    if V2.exists():
        p2.wait_for_selector('#ck-outlet', timeout=10000)
        check('switch ON: checkout v2 opens with the same outlet chosen', p2.input_value('#ck-outlet') == 'moghalrajpuram')
    check('switch ON: no new JS errors', len(on['errs']) <= len(before['errs']), on['errs'][:2])
    c2.close(); b.close()
SB.shutdown(); SA.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
print(f'\nRESULT: {ok} passed, {bad} failed'); sys.exit(1 if bad else 0)

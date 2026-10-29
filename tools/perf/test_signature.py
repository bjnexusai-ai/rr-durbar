#!/usr/bin/env python3
"""Home signature cards: no 01/02/03, + button only, 44px+, aria-label. Usage: test_signature.py [dir]"""
import sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
d = sys.argv[1] if len(sys.argv) > 1 else 'public'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=d)); srv.allow_reuse_address = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = """() => {const bs=[...document.querySelectorAll('#bestsellers .rr-sig-foot .rr-qadd')];
const c=document.querySelector('#bestsellers .rr-signature-card .rr-media');
return {n:bs.length, texts:bs.map(b=>b.textContent.trim()).join('|'),
minw:Math.min(...bs.map(b=>b.getBoundingClientRect().width)), minh:Math.min(...bs.map(b=>b.getBoundingClientRect().height)),
before:c?getComputedStyle(c,'::before').content:'nocard', aria:bs.every(b=>/^Add /.test(b.getAttribute('aria-label')||''))}}"""
bad = 0
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page()
    for w, h in [(375, 800), (768, 900), (1280, 800)]:
        pg.set_viewport_size({'width': w, 'height': h}); pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/')
        pg.wait_for_selector('#bestsellers .rr-sig-foot .rr-qadd', state='attached', timeout=15000); pg.wait_for_timeout(500)
        r = pg.evaluate(JS)
        ok = r['n'] > 0 and r['texts'].replace('|', '') == '' and r['minw'] >= 44 and r['minh'] >= 44 and r['before'] in ('none', 'normal') and r['aria']
        bad += not ok; print(('PASS ' if ok else 'FAIL ') + f'{w}px', r)
    b.close()
srv.shutdown(); print('RESULT:', 'all ok' if not bad else f'{bad} failed'); sys.exit(1 if bad else 0)

#!/usr/bin/env python3
"""Old ?page=X links land on /X/. Usage: test_forward.py [dir]  (default public)"""
import sys, threading, functools, http.server, socketserver
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
d = sys.argv[1] if len(sys.argv) > 1 else 'public'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=d)); srv.allow_reuse_address = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{srv.server_address[1]}'
CASES = [('/?page=menu', '/menu/'), ('/?page=loyalty#loyalty', '/loyalty/#loyalty'),
         ('/?page=our-story', '/about-us/'), ('/?page=pickup-menu&outlet=x', '/pickup-menu/?outlet=x'),
         ('/?page=bogus', '/?page=bogus'), ('/', '/')]
bad = 0
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page()
    for src, want in CASES:
        pg.goto(base + src); pg.wait_for_timeout(700)
        u = urlparse(pg.url); got = u.path + ('?' + u.query if u.query else '') + ('#' + u.fragment if u.fragment else '')
        ok = got == want; bad += not ok
        print(('PASS ' if ok else 'FAIL ') + f'{src} -> {got}' + ('' if ok else f'  (wanted {want})'))
    b.close()
srv.shutdown(); print('RESULT:', 'all ok' if not bad else f'{bad} failed'); sys.exit(1 if bad else 0)

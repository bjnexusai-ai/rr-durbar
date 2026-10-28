#!/usr/bin/env python3
"""Fix menu CLS: render /menu/ in Chromium, copy the built #m52-sub/#m52-ch/#m52-pics/#m52-list HTML into the generated page.
Run after split_pages.py, BEFORE slim_pages.py. Dry run unless --write. Skips if already filled."""
import re, sys, threading, functools, http.server, socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright
WRITE = '--write' in sys.argv
f = Path('public/menu/index.html'); s = f.read_text(encoding='utf-8')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory='public')); srv.allow_reuse_address = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/menu/'); pg.wait_for_selector('#m52-list .dish', timeout=15000); pg.wait_for_timeout(800)
    got = {i: pg.inner_html('#' + i) for i in ('m52-sub', 'm52-ch', 'm52-pics', 'm52-list')}
    b.close()
srv.shutdown()
done = 0
for i, html in got.items():
    pat = re.compile(r'(<(p|div)\b[^>]*\bid="%s"[^>]*>)(\s*)(</\2>)' % i)
    if len(pat.findall(s)) != 1: print(f'skip {i}: not an empty element (already filled?)'); continue
    s = pat.sub(lambda m: m.group(1) + html.replace('\\', '\\\\') + m.group(4), s, count=1) if False else (lambda m: s[:m.start()] + m.group(1) + html + m.group(4) + s[m.end():])(pat.search(s))
    done += 1; print(f'filled {i}: {len(html)//1024} KB')
if WRITE and done: f.write_text(s, encoding='utf-8')
print(f'{done} of 4 filled  ({"WRITTEN" if WRITE else "dry run"})')

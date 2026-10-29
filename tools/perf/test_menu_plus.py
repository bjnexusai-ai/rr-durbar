#!/usr/bin/env python3
"""Menu photo tiles: each has a visible round + (36px, + glyph, contrasting colour). Usage: test_menu_plus.py [dir]"""
import sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
d = sys.argv[1] if len(sys.argv) > 1 else 'public'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=d)); srv.allow_reuse_address = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = """() => {const ts=[...document.querySelectorAll('.m52-t')]; const ps=ts.map(t=>t.querySelector('.m52-plus'));
const ok=ps.filter(p=>p).map(p=>{const s=getComputedStyle(p),r=p.getBoundingClientRect();return {t:p.textContent.trim(),w:r.width,h:r.height,c:s.color,bg:s.backgroundColor,v:s.visibility,o:s.opacity}});
return {tiles:ts.length, withPlus:ok.length, first:ok[0]||null, allGood:ok.length===ts.length && ok.every(x=>x.t==='+'&&x.w>=32&&x.h>=32&&x.c!==x.bg&&x.v==='visible'&&x.o==='1')}}"""
bad = 0
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page()
    for w, h in [(390, 844), (1280, 800)]:
        pg.set_viewport_size({'width': w, 'height': h}); pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/menu/')
        pg.wait_for_selector('.m52-t', timeout=15000); pg.wait_for_timeout(700)
        r = pg.evaluate(JS); ok = r['tiles'] > 0 and r['allGood']; bad += not ok
        print(('PASS ' if ok else 'FAIL ') + f'{w}px', r)
    b.close()
srv.shutdown(); print('RESULT:', 'all ok' if not bad else f'{bad} failed'); sys.exit(1 if bad else 0)

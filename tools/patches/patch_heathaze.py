#!/usr/bin/env python3
"""Home hero heat-haze transition (WebGL). Dry run unless --write. Any unexpected count = STOP, nothing written.
Adds: CSS (30) before the menu reveal block, script rr-heathaze-js before rr-branches-b-js. Iris stays as fallback."""
import sys, pathlib
WRITE = '--write' in sys.argv
root = pathlib.Path(__file__).resolve().parent
site = pathlib.Path('src/site.html'); s = site.read_text(encoding='utf-8')
css = (root / 'heathaze' / 'heathaze.css').read_text(encoding='utf-8')
js = (root / 'heathaze' / 'heathaze.js').read_text(encoding='utf-8')
bad = []; log = []
def rep(a, b, label, expect=1):
    global s
    n = s.count(a)
    if n != expect: bad.append(f'{label}: found {n}, expected {expect}'); return
    s = s.replace(a, b); log.append(f'{label}: ok')
if 'rr-heathaze-js' in s: bad.append('already applied (rr-heathaze-js present)')
A1 = '/* 29. Menu: dishes rise into place in 3D'
rep(A1, css + A1, '30 css')
A2 = '<script id="rr-branches-b-js">/* about-us exterior reveal'
rep(A2, js + A2, '30 script')
print('\n'.join(log))
if bad: print('STOP, nothing written:\n  ' + '\n  '.join(bad)); sys.exit(1)
if WRITE: site.write_text(s, encoding='utf-8'); print('PATCHED src/site.html')
else: print('dry run OK (add --write)')

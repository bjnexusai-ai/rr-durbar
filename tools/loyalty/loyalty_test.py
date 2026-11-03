#!/usr/bin/env python3
"""Step L test. Server first: cd public && python3 -m http.server 8765 &   Run: timeout 280 python3 tools/loyalty/loyalty_test.py > /tmp/l.txt; grep -E "PASS|FAIL|RESULT" /tmp/l.txt"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'hero'))
from playwright.sync_api import sync_playwright
import rr_test_shim  # doors off
BASE = 'http://localhost:8765'
fails = 0
def chk(name, ok, extra=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + name + (' | ' + extra if extra and not ok else '')); fails += 0 if ok else 1
JS_OVER = """() => { const sec = document.getElementById('loyalty'); const bad = [];
 sec.querySelectorAll('.lc-card h3,.lc-card .lc-tag,.lc-card li b,.lc-card li span').forEach(e => { e.scrollIntoView({block:'center',behavior:'instant'}); const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
  for (const [fx, fy] of [[.5,.5],[.1,.5],[.9,.5]]) { const x = r.left + r.width*fx, y = r.top + r.height*fy; const t = document.elementFromPoint(x, y); if (t && t.closest && [...(function*(n){while(n){yield n;n=n.parentElement}})(t)].some(n => getComputedStyle(n).position === 'fixed')) continue; if (!t || !(e.contains(t) || t.contains(e))) bad.push((t && (t.className.baseVal ?? t.className) || 'none') + ' over ' + e.textContent.slice(0, 20)); } });
 const pse = [...sec.querySelectorAll('.lc-card')].filter(c => ['::before','::after'].some(p => getComputedStyle(c, p).content !== 'none')).length;
 return { bad, pse, txt: sec.innerText, hs: document.documentElement.scrollWidth > innerWidth + 1, art: sec.querySelector('.lc-art svg').getAttribute('preserveAspectRatio') }; }"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 844), (1440, 900)):
        for path in ('/loyalty/', '/'):
            pg = b.new_page(viewport={'width': w, 'height': h}); pg.goto(BASE + path); pg.wait_for_timeout(600)
            pg.evaluate("document.getElementById('loyalty').scrollIntoView({block:'start'})"); pg.wait_for_timeout(1800)
            r = pg.evaluate(JS_OVER); t = r['txt']; tag = f'{path} @{w}'
            chk(f'{tag} nothing sits over card text', not r['bad'], str(r['bad'][:3]))
            chk(f'{tag} no ::before/::after on cards', r['pse'] == 0)
            chk(f'{tag} numbers present (5%, 200, 150, 50%)', all(x in t for x in ('5%', '200', '150', '50%')))
            chk(f'{tag} Coins wording + 1 Coin = ₹1', 'Coins' in t and '1 Coin' in t)
            chk(f'{tag} no tier / points words', not any(x in t.lower() for x in ('silver', 'royal durbar', 'royal club', ' pts', 'points', 'badge')), t[:80])
            chk(f'{tag} no horizontal scroll', not r['hs'])
            chk(f'{tag} piggy art not cropped (meet)', r['art'] == 'xMidYMid meet')
            if path == '/loyalty/': pg.screenshot(path=f'/tmp/loy_{w}.png', full_page=False)
            pg.close()
    pg = b.new_page(viewport={'width': 1440, 'height': 900}); pg.goto(BASE + '/loyalty/')
    d = pg.evaluate("document.querySelector('meta[name=description]').content")
    chk('meta description uses Coins', 'Coins' in d and 'points' not in d.lower() and 'Royal Club' not in d, d)
    b.close()
print('RESULT:', 'ALL PASS' if not fails else f'{fails} FAIL')
sys.exit(1 if fails else 0)

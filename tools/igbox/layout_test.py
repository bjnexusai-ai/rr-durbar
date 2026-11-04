#!/usr/bin/env python3
"""Step 4B: floating layout. The dock, music disc/pill, Instagram box, phone glass nav and the catering "Plan my event" pill must never overlap
at 360, 390 and 1440 in every combination (music on/off, box open/collapsed). Needs a server on :8765 serving public/. Run from the repo root.
  cd public && python3 -m http.server 8765 &      python3 tools/igbox/layout_test.py"""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero'))
import rr_test_shim  # noqa: F401
B = 'http://localhost:8765'; bad = 0
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
def res(ok, m):
    global bad; print(('PASS ' if ok else 'FAIL ') + m, flush=True); bad += 0 if ok else 1
def item(i, cap, offer=False, reel=False):
    return {'kind': 'reel' if reel else 'photo', 'offer': offer, 'caption': cap, 'image': 'https://cdn.example.test/p%d.jpg' % i,
            'video': ('https://cdn.example.test/v%d.mp4' % i) if reel else None, 'permalink': 'https://www.instagram.com/p/X%d/' % i}
PAY = {'announcements': [], 'instagram': {'live': True, 'fetchedAt': '2026-11-04T05:00:00Z', 'items': [
    item(1, 'Fresh dum biryani #rrdurbar', reel=True), item(2, 'Weekend feast, flat 20% off!\nCode: RRFEST20 #rroffer', offer=True),
    item(3, 'Wedding spread #rrcatering', reel=True), item(4, 'Corporate lunch boxes #RRCatering'), item(5, 'Dessert time')]}}
JS = """() => { const vis=e=>{if(!e)return false;const c=getComputedStyle(e),r=e.getBoundingClientRect();return !e.hidden&&r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>.1};
  const out={}, add=(n,e)=>{ if(vis(e)){const r=e.getBoundingClientRect(); out[n]=[r.left,r.top,r.right,r.bottom,r.width,r.height].map(x=>Math.round(x*10)/10)} };
  const a=document.getElementById('rrig'); if(a) add('box', a.getAttribute('data-m')==='disc'?a.querySelector('.rrig-disc'):a.querySelector('.rrig-card'));
  add('music', document.getElementById('rrm')); add('dock', document.getElementById('rrw'));
  document.querySelectorAll('#rrd .rrd-btn, #rrw-launch').forEach((e,i)=>add('dockbtn'+i,e));
  add('nav', document.getElementById('rr-tabbar'));
  const p=document.getElementById('rrp'); if(p&&p.classList.contains('on')) add('pill',p);
  out._hs = document.documentElement.scrollWidth>innerWidth+1; out._mode = a?a.getAttribute('data-m'):null; return out }"""
def inter(a, b): return a[0] < b[2] - .5 and a[2] > b[0] + .5 and a[1] < b[3] - .5 and a[3] > b[1] + .5
SIZES = ((360, 740, True), (390, 844, True), (1440, 900, False))
PAGES = ('/menu/', '/about-us/', '/catering/', '/')
seen_box = {}; seen_pill = 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, h, mob) in SIZES:
        for music in (False, True):
            for collapsed in (False, True):
                c = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob)
                c.route('https://cdn.example.test/**', lambda r: r.fulfill(status=200, content_type='image/png', body=PNG))
                c.route('**/api/whats-new*', lambda r: r.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin': '*'}, body=json.dumps(PAY)))
                init = "try{%s%s}catch(e){}" % ("localStorage.setItem('rrMusic','on');localStorage.setItem('rrMusicP','1');" if music else "localStorage.setItem('rrMusic','off');",
                                                 "sessionStorage.setItem('rrIgC','1');" if collapsed else "")
                c.add_init_script(init)
                for path in PAGES:
                    pg = c.new_page(); pg.goto(B + path, wait_until='load'); pg.wait_for_timeout(2600)
                    for sy in (0.9, 2.2):
                        pg.evaluate("f=>window.scrollTo(0,Math.round(innerHeight*f))", sy); pg.wait_for_timeout(1300)
                        r = pg.evaluate(JS); names = sorted(k for k in r if not k.startswith('_'))
                        tag = '%d %s music=%s box=%s scroll=%.1f' % (w, path, 'on' if music else 'off', 'collapsed' if collapsed else 'open', sy)
                        if 'box' in r: seen_box[(w, path)] = True
                        if 'pill' in r: seen_pill += 1
                        hit = [(x, y) for i, x in enumerate(names) for y in names[i + 1:] if inter(r[x], r[y]) and not (x.startswith('dock') and y.startswith('dock'))]
                        res(not hit and not r['_hs'], '%s [%s]%s' % (tag, ','.join(names), (' OVERLAP ' + str(hit) + ' ' + str({k: r[k][:4] for k in set(sum(map(list, hit), []))})) if hit else ''))
                    pg.close()
                c.close()
    for w, _, _ in SIZES:
        res(seen_box.get((w, '/menu/')), '%d: box was actually on screen on /menu/ (test is not vacuous)' % w)
        res(seen_box.get((w, '/catering/')), '%d: box was actually on screen on /catering/ (#rrcatering posts)' % w)
    res(seen_pill > 0, 'catering "Plan my event" pill was on screen in some run (%d)' % seen_pill)
print('RESULT: ' + ('ALL PASS' if not bad else '%d FAIL' % bad)); sys.exit(1 if bad else 0)

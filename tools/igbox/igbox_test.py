#!/usr/bin/env python3
"""Step 4A + 4B tests: floating Instagram box (plan section 4: core, pop-up on every page, #rrcatering on /catering/). Needs a server on :8765 serving public/. Run from the repo root.
  cd public && python3 -m http.server 8765 &      python3 tools/igbox/igbox_test.py
Uses tools/hero/rr_test_shim.py (doors off). /api/whats-new is mocked; Instagram images are mocked too (no network needed)."""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero'))
import rr_test_shim  # noqa: F401
B = 'http://localhost:8765'; bad = 0
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
def res(ok, m):
    global bad; print(('PASS ' if ok else 'FAIL ') + m); bad += 0 if ok else 1
def item(i, cap, offer=False, reel=False):
    return {'kind': 'reel' if reel else 'photo', 'offer': offer, 'caption': cap, 'image': 'https://cdn.example.test/p%d.jpg' % i,
            'video': ('https://cdn.example.test/v%d.mp4' % i) if reel else None, 'permalink': 'https://www.instagram.com/p/X%d/' % i}
LIVE = {'announcements': [], 'instagram': {'live': True, 'fetchedAt': '2026-11-04T05:00:00Z', 'items': [
    item(1, 'Fresh dum biryani again #rrdurbar @rr_durbar', reel=True),
    item(2, 'Weekend feast, flat 20% off!\nCode: RRFEST20 #rroffer', offer=True),
    item(3, 'Kebab night'), item(4, '#tag only line\nSecond real line here', reel=True), item(5, 'Dessert time'),
    item(6, 'Family pack offer #rroffer', offer=True), item(7, 'Chef special'), item(8, 'Late night bites'), item(9, 'Royal ambience')]}}
CAT = {'announcements': [], 'instagram': {'live': True, 'fetchedAt': '2026-11-04T05:00:00Z', 'items': [
    item(1, 'Fresh dum biryani again #rrdurbar', reel=True), item(2, 'Wedding spread for 300 guests #RRCatering #events', reel=True),
    item(3, 'Weekend feast, flat 20% off!\nCode: RRFEST20 #rroffer', offer=True), item(4, 'Corporate lunch boxes delivered\n#rrcatering'), item(5, 'Dessert time #rrcateringx')]}}
OFFLINE = {'announcements': [], 'instagram': {'live': False, 'items': []}}
class Ctx:
    def __init__(s, br, w, h, mobile, payload, music=False, status=200):
        s.c = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
        s.hits = 0; s.payload = payload; s.status = status
        s.c.route('https://cdn.example.test/**', lambda r: r.fulfill(status=200, content_type='image/png', body=PNG))
        s.c.route('**/api/whats-new*', s.api)
        if music: s.c.add_init_script("try{localStorage.setItem('rrMusic','on');localStorage.setItem('rrMusicP','1')}catch(e){}")
        s.c.grant_permissions(['clipboard-read', 'clipboard-write'], origin=B) if False else None
    def api(s, route):
        s.hits += 1
        if s.status != 200: route.fulfill(status=s.status, body='err'); return
        route.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin': '*'}, body=json.dumps(s.payload))
    def page(s): return s.c.new_page()
def go(pg, path, wait=2600):
    pg.goto(B + path, wait_until='load'); pg.wait_for_timeout(wait)
def scroll_down(pg, f=.9):
    pg.evaluate("f=>window.scrollTo(0,Math.round(innerHeight*f))", f); pg.wait_for_timeout(900)
def st(pg):
    return pg.evaluate("""() => { const a=document.getElementById('rrig'); if(!a) return {has:false};
      const cs=getComputedStyle(a), card=a.querySelector('.rrig-card'), d=a.querySelector('.rrig-disc'), r=(a.getAttribute('data-m')==='disc'?d:card).getBoundingClientRect(), q=s=>{const e=a.querySelector(s);return e?e.textContent:''};
      return {has:true, shown:!a.hidden&&cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)>.5&&r.width>0, mode:a.getAttribute('data-m'), lb:q('.rrig-lb'), tx:q('.rrig-tx'),
        code:q('.rrig-cv'), codeVis:!a.querySelector('.rrig-cd').hidden, ct:!a.querySelector('.rrig-ct').hidden, n:q('.rrig-disc i'), h:Math.round(r.height), w:Math.round(r.width),
        fit:card.scrollHeight<=card.clientHeight+1, hs:document.documentElement.scrollWidth>innerWidth+1, rect:[r.left,r.top,r.right,r.bottom].map(Math.round)} }""")
def overlaps(pg):
    return pg.evaluate("""() => { const a=document.getElementById('rrig'); if(!a||a.hidden) return ['no box'];
      const b=(a.getAttribute('data-m')==='disc'?a.querySelector('.rrig-disc'):a.querySelector('.rrig-card')).getBoundingClientRect(), out=[];
      const vis=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&parseFloat(c.opacity)>.1};
      for (const e of document.querySelectorAll('#rrd .rrd-btn, #rrw-launch, #rr-tabbar, #rrm, #rrw')) { if(!vis(e)) continue; const r=e.getBoundingClientRect();
        if (b.left<r.right && b.right>r.left && b.top<r.bottom && b.bottom>r.top) out.push((e.id||e.className)+' '+[r.left,r.top,r.width,r.height].map(Math.round)) }
      return out }""")
SIZES = ((360, 740, True), (390, 844, True), (1440, 900, False))
with sync_playwright() as p:
    br = p.chromium.launch()
    # 1. live data: order, labels, cleaning, code chip, coupon text, copy, one request
    x = Ctx(br, 1440, 900, False, LIVE); pg = x.page(); go(pg, '/menu/'); scroll_down(pg)
    s = st(pg)
    res(s['has'] and s['shown'] and s['mode'] == 'full', 'live: box shows on /menu/ after scrolling (%s)' % {k: s.get(k) for k in ('mode', 'w', 'h')})
    res(s['lb'] == 'OFFER' and 'Weekend feast' in s['tx'], 'live: #rroffer post goes first, label OFFER, first caption line (%r / %r)' % (s['lb'], s['tx']))
    res(s['codeVis'] and s['code'] == 'RRFEST20' and s['ct'], 'live: code chip RRFEST20 + coupon text shown')
    res(pg.inner_text('.rrig-ct').strip() == 'Show this code at the counter or mention it on WhatsApp', 'live: coupon text is exactly the agreed wording')
    res(s['w'] == 340 and s['h'] == 104 and s['fit'], 'laptop: card 340x104 and content fits (%dx%d fit=%s)' % (s['w'], s['h'], s['fit']))
    try:
        x.c.grant_permissions(['clipboard-read', 'clipboard-write'], origin=B); pg.click('.rrig-cp'); pg.wait_for_timeout(300)
        res(pg.evaluate("navigator.clipboard.readText()") == 'RRFEST20' and 'Copied' in pg.inner_text('.rrig-cp'), 'copy: clipboard holds RRFEST20 and button says Copied')
    except Exception as e: res(False, 'copy: %s' % str(e)[:90])
    pg.mouse.move(700, 300); pg.wait_for_timeout(7200); s2 = st(pg)
    res(s2['lb'] != s['lb'] or s2['tx'] != s['tx'], 'rotation: moved to the next item after ~6s (%r -> %r)' % (s['tx'], s2['tx']))
    seen = []
    for _ in range(7):
        seen.append(pg.evaluate("window.rrIgBox.state().idx")); pg.wait_for_timeout(6300)
    res(max(seen) <= 5 and pg.evaluate("window.rrIgBox.state().n") == 6, 'live: at most 6 items rotate (idx max %d, n=%d)' % (max(seen), pg.evaluate("window.rrIgBox.state().n")))
    res(pg.evaluate("[...document.querySelectorAll('.rrig-lb')].length") == 1, 'live: one label element (labels cycle OFFER/REEL/NEW)')
    res(x.hits == 1, 'one /api/whats-new request on /menu/ (%d)' % x.hits)
    # collapse remembered
    pg.click('.rrig-x'); pg.wait_for_timeout(400); res(st(pg)['mode'] == 'disc', 'x collapses to the disc')
    d = st(pg); res(d['w'] == 44 and d['n'] == '6', 'disc is 44px with count badge 6 (%dpx, %r)' % (d['w'], d['n']))
    go(pg, '/about-us/'); scroll_down(pg)
    res(st(pg).get('mode') == 'disc', 'collapse is remembered on the next page'); pg.close(); x.c.close()
    # 2. fallback
    x = Ctx(br, 1440, 900, False, OFFLINE); pg = x.page(); go(pg, '/menu/'); scroll_down(pg); s = st(pg)
    res(s['shown'] and s['lb'] == '\u25B6 REEL' and 'Make it right' in s['tx'] and not s['codeVis'], 'fallback (live=false): site reels show first (%r)' % s['tx'])
    pg.evaluate("window.rrIgBox.state()"); labs = []
    for _ in range(5):
        labs.append(pg.inner_text('.rrig-lb')); pg.wait_for_timeout(6300)
    res('FOLLOW' in labs and labs.count('\u25B6 REEL') >= 3, 'fallback: 4 reels + a Follow card rotate (%s)' % labs)
    pg.screenshot(path='/tmp/ig_fallback_1440.png', clip={'x': 0, 'y': 700, 'width': 520, 'height': 200}); pg.close(); x.c.close()
    # 3. API error / hidden pages / home rule
    x = Ctx(br, 1440, 900, False, LIVE, status=500); pg = x.page(); go(pg, '/menu/'); scroll_down(pg); pg.wait_for_timeout(6500)
    res(not st(pg)['has'], 'API error: nothing shown, no box in the page'); pg.close(); x.c.close()
    x = Ctx(br, 1440, 900, False, LIVE); pg = x.page()
    for path in ('/checkout/', '/pickup/', '/privacy-policy/', '/refund-cancellation/', '/policies/'):
        go(pg, path, 2500); scroll_down(pg); pg.wait_for_timeout(5000)
        res(not st(pg)['has'], 'hidden on %s' % path)
    go(pg, '/', 2500); s = st(pg); res(not s['has'] or not s['shown'], 'home: not shown at the top')
    pg.evaluate("document.getElementById('whats-new').scrollIntoView()"); pg.wait_for_timeout(1200); s = st(pg)
    res(not s['has'] or not s['shown'], 'home: not shown while What\'s new is on screen')
    pg.evaluate("window.scrollTo(0, document.getElementById('whats-new').getBoundingClientRect().bottom + scrollY + 200)"); pg.wait_for_timeout(1200)
    res(st(pg)['shown'], 'home: shown after scrolling past What\'s new')
    pg.close(); x.c.close()
    # 4. home: one request, tap opens the reel pop-up
    x = Ctx(br, 1440, 900, False, LIVE); pg = x.page(); go(pg, '/', 2500)
    pg.evaluate("document.getElementById('whats-new').scrollIntoView()"); pg.wait_for_timeout(2500)
    pg.evaluate("window.scrollTo(0, document.getElementById('whats-new').getBoundingClientRect().bottom + scrollY + 200)"); pg.wait_for_timeout(1200)
    res(x.hits == 1, 'home: one /api/whats-new request shared by What\'s new and the box (%d)' % x.hits)
    pg.click('.rrig-th'); pg.wait_for_timeout(700)
    res(pg.evaluate("!!document.querySelector('.rr-wn-modal.is-open, .rr-wn-modal[aria-hidden=false]')") or pg.evaluate("document.documentElement.classList.contains('rr-wn-lock')"), 'home: tap opens the What\'s new pop-up'); pg.close(); x.c.close()
    # 4B-1. tap opens the pop-up player on any page (not only home); Watch on Instagram = the post permalink
    for (w, h, mob) in SIZES:
        for path in ('/menu/', '/branches/'):
            x = Ctx(br, w, h, mob, LIVE); pg = x.page(); go(pg, path); scroll_down(pg); s = st(pg)
            if not s['shown']: res(False, '%d %s: box shown before tap' % (w, path)); pg.close(); x.c.close(); continue
            tag = '%d %s' % (w, path)
            pg.evaluate("window.__pops=0;const o=window.open;window.open=function(){window.__pops++;return null}"); pg.wait_for_timeout(50); pg.evaluate("window.__pops=0")
            lab = s['lb']
            pg.click('.rrig-th'); pg.wait_for_timeout(700)
            m = pg.evaluate("""() => { const m=document.querySelector('.rr-wn-modal.is-open'); if(!m) return null; const v=m.querySelector('video'), a=m.querySelector('.rr-wn-btn2'), cs=getComputedStyle(m);
              return {video:!!v, img:!!m.querySelector('.rr-wn-media img'), href:a&&a.href, vis:cs.visibility==='visible'&&parseFloat(cs.opacity)>.9, lock:document.documentElement.classList.contains('rr-wn-lock'), pops:window.__pops, boxHidden:getComputedStyle(document.getElementById('rrig')).visibility==='hidden'} }""")
            res(bool(m) and m['vis'] and m['lock'] and m['pops'] == 0, '%s: tap opens the pop-up (no new tab) %s' % (tag, m))
            res(bool(m) and m['href'] == 'https://www.instagram.com/p/X2/', '%s: Watch on Instagram uses the permalink (%s)' % (tag, m and m['href']))
            res(bool(m) and m['boxHidden'], '%s: box hides while the pop-up is open' % tag)
            pg.keyboard.press('Escape'); pg.wait_for_timeout(600)
            c = pg.evaluate("() => ({open:!!document.querySelector('.rr-wn-modal.is-open'), lock:document.documentElement.classList.contains('rr-wn-lock'), vid:!!document.querySelector('.rr-wn-modal video')})")
            res(not c['open'] and not c['lock'] and not c['vid'], '%s: Escape closes, unlocks, drops the video %s' % (tag, c))
            pg.click('.rrig-tx'); pg.wait_for_timeout(500)
            res(pg.evaluate("!!document.querySelector('.rr-wn-modal.is-open')"), '%s: caption tap opens it too' % tag)
            pg.click('.rr-wn-x'); pg.wait_for_timeout(500)
            res(not pg.evaluate("!!document.querySelector('.rr-wn-modal.is-open')"), '%s: close button closes it' % tag)
            pg.close(); x.c.close()
    # 4B-1b. a reel opens a video player, a photo opens the picture
    x = Ctx(br, 1440, 900, False, LIVE); pg = x.page(); go(pg, '/menu/'); scroll_down(pg); pg.evaluate("window.open=()=>null")
    pg.evaluate("document.querySelector('.rrig-th').click()"); pg.wait_for_timeout(500)
    res(pg.evaluate("!!document.querySelector('.rr-wn-modal.is-open')"), 'reel/photo: pop-up opens'); pg.close(); x.c.close()
    # 4B-2. /catering/: only #rrcatering posts, otherwise hidden
    x = Ctx(br, 1440, 900, False, CAT); pg = x.page(); go(pg, '/catering/', 2500); scroll_down(pg); pg.wait_for_timeout(1500); s = st(pg)
    res(s['has'] and s['shown'], 'catering: box shows when posts carry #rrcatering (%s)' % {k: s.get(k) for k in ('has', 'shown', 'mode')})
    res(s['n'] == '2' or s['mode'] == 'full', 'catering: only the 2 tagged posts (badge/mode: %s/%s)' % (s['n'], s['mode']))
    pg.click('.rrig-x'); pg.wait_for_timeout(400); s = st(pg)
    res(s['n'] == '2', 'catering: exactly 2 posts (#rrcatering in any case, "#rrcateringx" and untagged ones excluded) n=%s' % s['n'])
    pg.click('.rrig-disc'); pg.wait_for_timeout(400); pg.mouse.move(700, 300)
    seen = []
    for k in range(3):
        seen.append(pg.evaluate("document.querySelector('.rrig-tx').textContent")); pg.wait_for_timeout(6400)
    res(not any('Fresh dum' in t or 'Dessert' in t or 'Weekend feast' in t for t in seen), 'catering: rotation never shows untagged posts (%s)' % seen)
    res(any('Wedding' in t for t in seen) and any('Corporate' in t for t in seen), 'catering: shows the tagged posts (%s)' % seen)
    pg.evaluate("window.open=()=>null"); pg.click('.rrig-th'); pg.wait_for_timeout(500)
    res(pg.evaluate("!!document.querySelector('.rr-wn-modal.is-open')"), 'catering: tap opens the pop-up'); pg.close(); x.c.close()
    x = Ctx(br, 1440, 900, False, LIVE); pg = x.page(); go(pg, '/catering/', 2500); scroll_down(pg); pg.wait_for_timeout(7000)
    res(not st(pg)['has'], 'catering: live posts but none tagged -> hidden, no box'); pg.close(); x.c.close()
    x = Ctx(br, 1440, 900, False, OFFLINE); pg = x.page(); go(pg, '/catering/', 2500); scroll_down(pg); pg.wait_for_timeout(7000)
    res(not st(pg)['has'], 'catering: not live yet (fallback reels) -> hidden, no box'); pg.close(); x.c.close()
    x = Ctx(br, 1440, 900, False, CAT, status=500); pg = x.page(); go(pg, '/catering/', 2500); scroll_down(pg); pg.wait_for_timeout(7000)
    res(not st(pg)['has'], 'catering: API error -> hidden'); pg.close(); x.c.close()
    x = Ctx(br, 1440, 900, False, CAT); pg = x.page(); go(pg, '/menu/'); scroll_down(pg); s = st(pg)
    res(s['shown'] and s['tx'].startswith('Weekend feast'), 'other pages: tagged posts do not filter the box (%r)' % s['tx']); pg.close(); x.c.close()
    # 5. layouts: size, fit, overlaps (box full + disc, music on), no horizontal scroll
    for (w, h, mob) in SIZES:
        for payload, tag in ((LIVE, 'live'), (OFFLINE, 'fallback')):
            x = Ctx(br, w, h, mob, payload, music=True); pg = x.page(); go(pg, '/menu/'); scroll_down(pg); s = st(pg)
            res(s['shown'] and s['mode'] == 'full', '%d %s: box shown' % (w, tag))
            if mob: res(s['h'] == 72 and s['fit'], '%d %s: phone card is 72px and the content fits (h=%d fit=%s)' % (w, tag, s['h'], s['fit']))
            else: res(s['h'] == 104 and s['fit'], '%d %s: laptop card is 104px and the content fits' % (w, tag))
            o = overlaps(pg); res(o == [], '%d %s: no overlap with dock/nav/music (full) %s' % (w, tag, o))
            rm = pg.evaluate("(()=>{const m=document.getElementById('rrm');if(!m)return null;const r=m.getBoundingClientRect();return [r.top,r.bottom]})()")
            res(rm is not None, '%d %s: music player is on screen too' % (w, tag))
            res(not s['hs'], '%d %s: no horizontal scroll' % (w, tag))
            if tag == 'live' and mob:
                pg.screenshot(path='/tmp/ig_live_%d.png' % w, clip={'x': 0, 'y': h - 260, 'width': w, 'height': 260})
            pg.click('.rrig-x'); pg.wait_for_timeout(500); o = overlaps(pg); res(o == [], '%d %s: no overlap (disc) %s' % (w, tag, o))
            res(not st(pg)['hs'], '%d %s: no horizontal scroll (disc)' % (w, tag)); pg.close(); x.c.close()
    # 6. phone auto-collapse after 10s, disc re-opens on tap
    x = Ctx(br, 390, 844, True, LIVE); pg = x.page(); go(pg, '/menu/'); scroll_down(pg)
    res(st(pg)['mode'] == 'full', 'phone: expanded first'); pg.wait_for_timeout(10800)
    res(st(pg)['mode'] == 'disc', 'phone: collapses itself after 10s')
    pg.tap('.rrig-disc'); pg.wait_for_timeout(400); res(st(pg)['mode'] == 'full', 'phone: tap on the disc re-opens it'); pg.close(); x.c.close()
    # 7. reduced motion: no auto-rotation
    c = br.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce'); c.route('https://cdn.example.test/**', lambda r: r.fulfill(status=200, content_type='image/png', body=PNG))
    c.route('**/api/whats-new*', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(LIVE)))
    pg = c.new_page(); go(pg, '/menu/'); scroll_down(pg); a = pg.inner_text('.rrig-tx'); pg.wait_for_timeout(7000)
    res(pg.inner_text('.rrig-tx') == a, 'reduced motion: no auto-rotation'); c.close()
    br.close()
print('RESULT: %s' % ('ALL PASS' if not bad else '%d FAIL' % bad)); sys.exit(1 if bad else 0)

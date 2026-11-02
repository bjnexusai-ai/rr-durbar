#!/usr/bin/env python3
"""RR Durbar: tests for the home "What's new" section. Needs the site served on http://127.0.0.1:8765 (same as the other tools/*) and Playwright.
  python3 tools/whatsnew/whatsnew_test.py                       functional checks (API mocked by route interception)
  python3 tools/whatsnew/whatsnew_test.py --snapshot before.json   desktop-leak: record styles of everything OUTSIDE the new section (run on the OLD build)
  python3 tools/whatsnew/whatsnew_test.py --compare before.json    ...then on the NEW build: nothing else may change
Env: BASE (default http://127.0.0.1:8765)
"""
import json, os, sys
from playwright.sync_api import sync_playwright
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hero')); import rr_test_shim  # doors off: sessionStorage.rrDoorsSeen

BASE = os.environ.get('BASE', 'http://127.0.0.1:8765')
FAILS = []


def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ') + name + (f'  {extra}' if (extra and not cond) else ''))
    if not cond: FAILS.append(name)


def payload(n_ann=2, live=True):
    ann = [
        {'line': 'Family combo today', 'link': '/order-now/', 'startsAt': '2026-10-30T00:00:00Z', 'endsAt': '2099-01-01T00:00:00Z',
         'img': 'https://cdn.sanity.io/images/m8b62ufn/production/a.jpg', 'img2': None, 'alt': 'Biryani', 'alt2': ''},
        {'line': '', 'link': '/order-now/', 'startsAt': '2026-10-30T00:00:00Z', 'endsAt': '2099-01-01T00:00:00Z',
         'img': 'https://cdn.sanity.io/images/m8b62ufn/production/b.jpg', 'img2': 'https://cdn.sanity.io/images/m8b62ufn/production/c.jpg', 'alt': 'Poster', 'alt2': 'Poster 2'},
    ][:n_ann]
    items = [{'id': f'i{i}', 'kind': 'reel' if 1 < i < 5 else 'photo', 'offer': i < 2, 'caption': f'Post {i}', 'permalink': f'https://www.instagram.com/p/X{i}/',
              'image': f'https://scontent.cdninstagram.com/{i}.jpg', 'video': f'https://scontent.cdninstagram.com/{i}.mp4' if 1 < i < 5 else None} for i in range(9)]
    return {'announcements': ann, 'instagram': {'items': items if live else [], 'fetchedAt': 'x' if live else None, 'live': live}}


PNG = bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082')


def mock(page, body=None, down=False):
    def handler(route):
        if down: return route.abort()
        route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(body))
    page.route('**/api/whats-new', handler)
    page.route('https://cdn.sanity.io/**', lambda r: r.fulfill(status=200, content_type='image/png', body=PNG))
    page.route('https://scontent.cdninstagram.com/**', lambda r: r.fulfill(status=200, content_type='image/png', body=PNG))


def open_home(browser, w=1280, h=900, body=None, down=False, reduced=False):
    ctx = browser.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if reduced else 'no-preference')
    page = ctx.new_page(); mock(page, body, down)
    page.goto(BASE + '/', wait_until='load')
    page.evaluate("document.getElementById('whats-new').scrollIntoView({block:'center'})")
    page.wait_for_timeout(1500)
    return ctx, page


def tx(page):
    return page.evaluate("getComputedStyle(document.querySelector('#whats-new .rr-wn-track')).transform")


def functional(b):
    # 1 placement: only on home, directly under the hero, before Wall of Honours
    ctx, page = open_home(b, body=payload())
    r = page.evaluate("""() => { const q = (s) => document.querySelector(s), top = (e) => e ? e.getBoundingClientRect().top + scrollY : null, bot = (e) => e ? e.getBoundingClientRect().bottom + scrollY : null;
      const wn = q('#whats-new'); return { wnTop: top(wn), heroBot: bot(q('#home')), honoursTop: top(q('#honours')), bestTop: top(q('#bestsellers')) } }""")
    check('laptop: section is directly under the hero', r['wnTop'] is not None and abs(r['wnTop'] - r['heroBot']) < 4, r)
    check('laptop: #hero-next is hidden', page.evaluate("getComputedStyle(document.getElementById('hero-next')).display") == 'none')
    ctx.close()
    # phone: hero, then #hero-next, then #whats-new
    ctx, page = open_home(b, w=390, h=844, body=payload())
    r2 = page.evaluate("""() => { const q = (s) => document.querySelector(s), top = (e) => e ? e.getBoundingClientRect().top + scrollY : null, bot = (e) => e ? e.getBoundingClientRect().bottom + scrollY : null;
      return { heroBot: bot(q('#home')), hnTop: top(q('#hero-next')), hnBot: bot(q('#hero-next')), wnTop: top(q('#whats-new')) } }""")
    check('phone: #hero-next sits directly under the hero', r2['hnTop'] is not None and abs(r2['hnTop'] - r2['heroBot']) < 4, r2)
    check('phone: #whats-new sits directly under #hero-next', r2['hnBot'] is not None and abs(r2['wnTop'] - r2['hnBot']) < 4, r2)
    ctx.close(); ctx, page = open_home(b, body=payload())
    check('section is before Wall of Honours', r['honoursTop'] is None or r['wnTop'] < r['honoursTop'], r)
    # 2 content from the mocked API
    cards = page.locator('#whats-new .rr-wn-ann .rr-wn-ac'); check('2 announcement cards', cards.count() == 2)
    check('card 1 = line + Order now', cards.nth(0).locator('.rr-wn-line').count() == 1 and cards.nth(0).locator('.rr-wn-btn').count() == 1)
    check('card 2 = second image, no button', cards.nth(1).locator('.rr-wn-ph').count() == 2 and cards.nth(1).locator('.rr-wn-btn').count() == 0)
    check('gold OFFER label on announcements', page.locator('#whats-new .rr-wn-ac .rr-wn-offer').count() == 2)
    real = page.locator('#whats-new .rr-wn-card:not(.is-clone)'); check('9 stream items', real.count() == 9)
    check('#rroffer posts first with OFFER badge', real.nth(0).locator('.rr-wn-badge').count() == 1 and real.nth(1).locator('.rr-wn-badge').count() == 1 and real.nth(2).locator('.rr-wn-badge').count() == 0)
    check('reels have the play mark', real.nth(2).locator('.rr-wn-play').count() == 1)
    check('live label shown', 'Live from Instagram' in page.locator('#whats-new .rr-wn-livetx').inner_text())
    # 3 the stream moves, and stops on hover / pause button
    a = tx(page); page.wait_for_timeout(1000); b2 = tx(page); check('stream moves (transform changes over 1 s)', a != b2, (a, b2))
    page.hover('#whats-new .rr-wn-stream'); page.wait_for_timeout(300); a = tx(page); page.wait_for_timeout(1000); b2 = tx(page)
    check('stream stops on hover', a == b2, (a, b2)); page.mouse.move(5, 5); page.wait_for_timeout(300)
    page.click('#whats-new .rr-wn-pause'); page.mouse.move(5, 5); page.wait_for_timeout(300); a = tx(page); page.wait_for_timeout(1000); b2 = tx(page)
    check('stream stops with the Pause button', a == b2, (a, b2)); check('Pause button state', page.get_attribute('#whats-new .rr-wn-pause', 'aria-pressed') == 'true')
    page.click('#whats-new .rr-wn-pause'); page.mouse.move(5, 5); page.wait_for_timeout(300); a = tx(page); page.wait_for_timeout(800); check('Play stream resumes', a != tx(page))
    # 4 pop-up
    page.eval_on_selector('#whats-new .rr-wn-card:not(.is-clone):nth-child(3) .rr-wn-reel', 'e => e.click()'); page.wait_for_timeout(500)
    check('pop-up opens', page.locator('.rr-wn-modal.is-open').count() == 1)
    check('pop-up has Order Now and Watch on Instagram', page.locator('.rr-wn-modal .rr-wn-btn').count() == 2)
    check('stream held while a reel is open', 'is-held' in (page.get_attribute('#whats-new .rr-wn-stream', 'class') or ''))
    page.keyboard.press('Escape'); page.wait_for_timeout(500); check('Esc closes the pop-up', page.locator('.rr-wn-modal.is-open').count() == 0)
    ctx.close()
    # 5 no announcements -> row hidden
    ctx, page = open_home(b, body=payload(n_ann=0)); check('no announcements: row 1 hidden', page.locator('#whats-new .rr-wn-ann').is_hidden()); ctx.close()
    # 6 API down / feed off -> the 4 own reels + Follow card
    for label, kw in (('API down', dict(down=True)), ('feed off', dict(body=payload(n_ann=0, live=False)))):
        ctx, page = open_home(b, **kw)
        check(f'{label}: 4 reels + Follow card', page.locator('#whats-new .rr-wn-card:not(.is-clone)').count() == 5 and page.locator('#whats-new .rr-wn-follow').count() >= 1)
        check(f'{label}: row 1 hidden', page.locator('#whats-new .rr-wn-ann').is_hidden()); ctx.close()
    # 7 reduced motion = static swipe row
    ctx, page = open_home(b, body=payload(), reduced=True)
    check('reduced motion: no animation, no copies', page.evaluate("getComputedStyle(document.querySelector('#whats-new .rr-wn-track')).animationName") == 'none' and page.locator('#whats-new .rr-wn-card.is-clone').count() == 0)
    check('reduced motion: row scrolls sideways', page.evaluate("getComputedStyle(document.querySelector('#whats-new .rr-wn-stream')).overflowX") == 'auto'); ctx.close()
    # 8 not on other pages
    for path in ('/menu/', '/about-us/'):
        ctx = b.new_context(viewport={'width': 1280, 'height': 900}); page = ctx.new_page(); mock(page, payload()); page.goto(BASE + path, wait_until='load'); page.wait_for_timeout(800)
        check(f'section absent on {path}', page.evaluate("(() => { const s = document.getElementById('whats-new'); return !s || getComputedStyle(s).display === 'none' || s.offsetHeight === 0 })()")); ctx.close()
    # 9 no sideways page scroll
    for w, h in ((360, 780), (390, 844), (820, 1180), (980, 1730), (1280, 800), (1440, 900)):
        ctx, page = open_home(b, w=w, h=h, body=payload())
        sw = page.evaluate("[document.documentElement.scrollWidth, innerWidth]"); check(f'no horizontal scroll at {w}x{h}', sw[0] <= sw[1] + 1, sw)
        ctx.close()


SNAP_JS = """() => { const keep = ['display','position','width','font-size','font-weight','font-family','color','background-color','margin-left','margin-right','padding-left','padding-right','border-top-width','opacity','visibility'];
  const out = {}; const all = [...document.body.querySelectorAll('*')].filter(e => !e.closest('#whats-new') && !e.classList.contains('rr-wn-modal') && !['SCRIPT','STYLE','MAIN'].includes(e.tagName));
  all.forEach((e, i) => { const cs = getComputedStyle(e); const id = (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + '@' + i; out[id] = keep.map(k => cs.getPropertyValue(k)).join('|') });
  return out }"""


def snapshot(b):
    res = {}
    for path in ('/', '/menu/', '/about-us/'):
        for w in (1280, 1440):
            ctx = b.new_context(viewport={'width': w, 'height': 900}, reduced_motion='reduce'); page = ctx.new_page(); mock(page, payload())
            page.goto(BASE + path, wait_until='load'); page.wait_for_timeout(1500); res[f'{path}@{w}'] = page.evaluate(SNAP_JS); ctx.close()
    return res


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        if '--snapshot' in sys.argv:
            out = sys.argv[sys.argv.index('--snapshot') + 1]; json.dump(snapshot(b), open(out, 'w')); print('snapshot written', out); b.close(); return
        if '--compare' in sys.argv:
            base = json.load(open(sys.argv[sys.argv.index('--compare') + 1])); now = snapshot(b)
            for k, was in base.items():
                cur = now.get(k, {}); diffs = [e for e in was if cur.get(e) != was[e]]
                # elements are matched by index; the new section sits inside <main> (skipped), so only index shifts after it are expected: compare by id/tag order instead
                vals_was = list(was.values()); vals_now = list(cur.values()); changed = sum(1 for x, y in zip(vals_was, vals_now) if x != y) if len(vals_was) == len(vals_now) else -1
                check(f'desktop unchanged outside the new section {k}', changed == 0, f'{changed} elements differ' if changed >= 0 else 'element count differs')
        else:
            functional(b)
        b.close()
    print('\nFAILED: ' + ', '.join(FAILS) if FAILS else '\nALL PASSED'); sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()

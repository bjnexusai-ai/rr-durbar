#!/usr/bin/env python3
"""Tests for tools/verify/routecheck.py (task 3.7). Run from the website repo root: python3 tools/verify/test_routecheck.py
Builds a perfect split site in a temp folder from cms/routes.js, then breaks it one way at a time."""
import shutil, sys, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import routecheck as rc

REPO = Path(__file__).resolve().parents[2]
ROUTES, NOINDEX = rc.load_routes(REPO)

def page(r, secs, title=None, extra_head='', body_extra='', h1=1, canon=None):
    can = canon if canon is not None else (f'{rc.SITE}/' if r == 'home' else f'{rc.SITE}/{r}/')
    robots = '<meta name="robots" content="noindex">' if r in NOINDEX else ''
    return (f'<!doctype html><html><head><title>{title or "RR Durbar " + r}</title><meta name="description" content="About {r} at RR Durbar">'
            f'<link rel="canonical" href="{can}">{robots}<meta property="og:title" content="x"><meta property="og:description" content="x">'
            f'<meta property="og:image" content="x">{extra_head}</head><body>' + '<h1>Page</h1>' * h1 + ''.join(f'<section id="{s}"></section>' for s in secs) + body_extra + '</body></html>')

def site(tmp, override=None):
    pub = Path(tmp) / 'public'
    if pub.exists(): shutil.rmtree(pub)
    for r, secs in ROUTES.items():
        f = pub / 'index.html' if r == 'home' else pub / r / 'index.html'
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text((override or {}).get(r, page(r, secs)), encoding='utf-8')
    return pub

results = []
def case(name, cond):
    results.append(cond); print(('PASS  ' if cond else 'FAIL  ') + name)

with tempfile.TemporaryDirectory() as tmp:
    run = lambda ov=None: rc.check(site(tmp, ov), REPO)
    e, w = run(); case('a perfect split site passes with no errors', e == [] and w == [])
    e, _ = run({'menu': page('menu', ROUTES['menu'], title='RR Durbar home')}); case('duplicate title is an error', any('share the same title' in x for x in e))
    e, _ = run({'about-us': page('about-us', ROUTES['about-us'], h1=2)}); case('two h1 tags is an error', any('2 <h1>' in x for x in e))
    e, _ = run({'catering': page('catering', ROUTES['catering'], canon=f'{rc.SITE}/')}); case('wrong canonical is an error', any('catering: canonical' in x for x in e))
    e, _ = run({'menu': page('menu', ROUTES['menu'] + ['catering-cta'])}); case('a section from another page is an error', any('#catering-cta' in x for x in e))
    e, _ = run({'home': page('home', ROUTES['home'][:-1])}); case('a missing section is an error', any('#outlets is missing' in x for x in e))
    e, _ = run({'track-order': page('track-order', ROUTES['track-order']).replace('<meta name="robots" content="noindex">', '')}); case('order page without noindex is an error', any('track-order: order page' in x for x in e))
    e, _ = run({'contact': page('contact', ROUTES['contact'], extra_head='<meta name="robots" content="noindex">')}); case('Google page with noindex is an error', any('contact: Google page carries noindex' in x for x in e))
    e, _ = run({'contact': page('contact', ROUTES['contact'], body_extra='<a href="/?page=menu">m</a>')}); case('old ?page= link is an error', any('?page=' in x for x in e))
    pub = site(tmp); shutil.rmtree(pub / 'loyalty'); (pub / 'catering' / 'index.html').unlink()
    e, w = rc.check(pub, REPO); case('missing page is an error, missing loyalty (planned, 9.4) only a warning', any(x.startswith('catering: page file') for x in e) and any(x.startswith('loyalty: page file') for x in w) and not any(x.startswith('loyalty') for x in e))
    e, _ = run({'home': page('home', ROUTES['home']).replace('<section id="loyalty"></section>', '<section id="loyalty"></section>')}); case('a section shared by two pages (loyalty) is allowed on both', not any('loyalty' in x for x in e))

print(f'RESULT: {sum(results)} passed, {len(results) - sum(results)} failed')
sys.exit(0 if all(results) else 1)

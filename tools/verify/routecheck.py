#!/usr/bin/env python3
"""Task 3.7: check the SPLIT pages, one HTML file per page, the way Google reads them (raw HTML, no JavaScript).
Run from the website repo root:  python3 tools/verify/routecheck.py public      (exit 0 = all good, 1 = something to fix)
Page list and sections come from cms/routes.js (the same list the CMS uses). home -> public/index.html, others -> public/<route>/index.html.
For every page:
  ERROR  file missing (the new loyalty page is only a WARN until task 9.4)
  ERROR  not exactly one <title>, empty title, or the same title as another page
  ERROR  canonical missing or not https://rrdurbar.com/<route>/ (home: https://rrdurbar.com/)
  ERROR  not exactly one <h1> (order pages: WARN, they are not in Google)
  (links inside <script> are handled by the page router at run time; empty hidden section stubs are not content)
  ERROR  order pages (order-now, pickup, pickup-menu, track-order) without noindex; any other page WITH noindex
  ERROR  a section of this page missing, or a section that belongs only to another page present (the old one-page leftovers)
  ERROR  links of the old ?page= kind
  ERROR  Google pages without a description, or two pages with the same description
  WARN   no og:title / og:description / og:image on a Google page; description over 170 or title over 65 characters
our-story is a redirect to /about-us/ (plan 3.1), so it is not a page and is not checked."""
import html, json, re, subprocess, sys
from pathlib import Path

SITE = 'https://rrdurbar.com'
PLANNED = {'loyalty'}            # pages that may not exist yet

def load_routes(repo):
    js = "import(process.argv[1]).then(m=>console.log(JSON.stringify({r:m.ROUTES,n:m.NOINDEX_ROUTES})))"
    out = subprocess.run(['node', '-e', js, (repo / 'cms' / 'routes.js').resolve().as_uri()], capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    return {k: v['sections'] for k, v in d['r'].items()}, set(d['n'])

def attr(tag, name):
    m = re.search(r'\b%s\s*=\s*("([^"]*)"|\'([^\']*)\')' % name, tag, re.I)
    return html.unescape(m.group(2) if m.group(2) is not None else m.group(3)) if m else None

def metas(src):
    out = {}
    for t in re.findall(r'<meta\b[^>]*>', src, re.I):
        k = (attr(t, 'name') or attr(t, 'property') or '').lower()
        if k: out.setdefault(k, []).append(attr(t, 'content') or '')
    return out

def check(public, repo=None):
    public = Path(public); repo = Path(repo) if repo else public.parent
    routes, noindex = load_routes(repo)
    owner = {}
    for r, secs in routes.items():
        for s in secs: owner.setdefault(s, set()).add(r)
    errors, warns, titles, descs = [], [], {}, {}
    for r, secs in routes.items():
        f = public / 'index.html' if r == 'home' else public / r / 'index.html'
        E = lambda m: errors.append(f'{r}: {m}')
        if not f.exists():
            (warns if r in PLANNED else errors).append(f'{r}: page file {f.relative_to(public)} is missing')
            continue
        src = f.read_text(encoding='utf-8', errors='replace')
        head = src.split('</head>', 1)[0]
        t = re.findall(r'<title[^>]*>(.*?)</title>', head, re.S | re.I)
        if len(t) != 1: E(f'{len(t)} <title> tags (need 1)')
        title = html.unescape(re.sub(r'\s+', ' ', t[0])).strip() if t else ''
        if t and not title: E('empty <title>')
        if title: titles.setdefault(title, []).append(r)
        can = [attr(l, 'href') for l in re.findall(r'<link\b[^>]*>', head, re.I) if (attr(l, 'rel') or '').lower() == 'canonical']
        want = f'{SITE}/' if r == 'home' else f'{SITE}/{r}/'
        if can != [want]: E(f'canonical is {can or "missing"}, should be {want}')
        nojs = re.sub(r'<script\b.*?</script>', '', src, flags=re.S | re.I)
        # an EMPTY hidden stub (<section id=x ... hidden></section>) carries no content: the split keeps them for the site's CSS and scripts
        content = re.sub(r'<section\b[^>]*\bhidden\b[^>]*>\s*</section>', '', nojs, flags=re.I)
        h1 = re.findall(r'<h1\b', content, re.I)
        if len(h1) != 1: (warns.append(f'{r}: {len(h1)} <h1> tags (order page, not in Google)') if r in noindex else E(f'{len(h1)} <h1> tags (need 1)'))
        m = metas(head)
        robots = ' '.join(m.get('robots', [])).lower()
        if r in noindex and 'noindex' not in robots: E('order page without <meta name="robots" content="noindex">')
        if r not in noindex and 'noindex' in robots: E('Google page carries noindex')
        ids = set(re.findall(r'\bid\s*=\s*["\']([^"\']+)["\']', content))
        for s in secs:
            if s not in ids: E(f'section #{s} is missing')
        foreign = sorted(s for s in ids if s in owner and r not in owner[s])
        if foreign: E('sections from other pages are still inside: ' + ', '.join('#' + s for s in foreign))
        if re.search(r'href\s*=\s*["\'][^"\']*\?page=', nojs, re.I): E('old ?page= links are still there')
        if r not in noindex:
            d = (m.get('description') or [''])[0].strip()
            if not d: E('no meta description')
            else:
                descs.setdefault(d, []).append(r)
                if len(d) > 170: warns.append(f'{r}: description is {len(d)} characters (Google shows about 160)')
            if len(title) > 65: warns.append(f'{r}: title is {len(title)} characters (Google shows about 60)')
            for k in ('og:title', 'og:description', 'og:image'):
                if not m.get(k): warns.append(f'{r}: no {k}')
    for v, rs in list(titles.items()) + list(descs.items()):
        if len(rs) > 1: errors.append(f'{", ".join(rs)}: share the same {"title" if v in titles else "description"} "{v[:60]}"')
    return errors, warns

def main():
    if len(sys.argv) < 2: sys.exit('usage: python3 tools/verify/routecheck.py public')
    errors, warns = check(sys.argv[1])
    for w in warns: print('WARN  ' + w)
    for e in errors: print('ERROR ' + e)
    print(f'RESULT: {len(errors)} error(s), {len(warns)} warning(s)' + (' - split pages are ready for Google' if not errors else ''))
    sys.exit(1 if errors else 0)

if __name__ == '__main__':
    main()

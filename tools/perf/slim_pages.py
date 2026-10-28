#!/usr/bin/env python3
"""Move shared inline CSS/JS of the GENERATED pages into hashed files at public/rr-<hash>.css|js.
Order-safe: only a contiguous run of inline blocks is replaced, by ONE <link>/<script src> at the same spot.
Files sit at the site root so url(assets/...) keeps resolving (base href is "/").
Dry run unless --write. Never run on src/site.html. Run after split_pages.py (and prerender_menu.py)."""
import re, sys, hashlib
from pathlib import Path
WRITE = '--write' in sys.argv
PUB = Path('public')
pages = [p for p in sorted(PUB.rglob('index.html')) if 'checkout' not in p.parts]
pat = re.compile(r'<(style|script)\b([^>]*)>(.*?)</\1>', re.S | re.I)
def mergeable(t, a):
    if t.lower() == 'style': return 'media=' not in a
    return 'src=' not in a and 'ld+json' not in a and not ('type=' in a and 'javascript' not in a and 'module' not in a) and 'type="module"' not in a and 'async' not in a and 'defer' not in a
info = []
for p in pages:
    s = p.read_text(encoding='utf-8')
    blocks = [(m.start(), m.end(), m.group(1).lower(), m.group(2), m.group(3)) for m in pat.finditer(s)]
    info.append((p, s, blocks))
cnt = {}
for p, s, bl in info:
    for b in bl:
        if mergeable(b[2], b[3]): cnt[hashlib.md5((b[2] + b[4]).encode()).hexdigest()] = cnt.get(hashlib.md5((b[2] + b[4]).encode()).hexdigest(), 0) + 1
n = len(pages); files = {}; saved = 0
for old in PUB.glob('rr-*.css'): 
    if WRITE: old.unlink()
for old in PUB.glob('rr-*.js'):
    if WRITE: old.unlink()
for p, s, bl in info:
    shared = [b for b in bl if mergeable(b[2], b[3]) and cnt[hashlib.md5((b[2] + b[4]).encode()).hexdigest()] >= max(2, n // 2)]
    runs = []; cur = []
    for i, b in enumerate(shared):
        if cur and cur[-1][2] == b[2] and s[cur[-1][1]:b[0]].strip() == '': cur.append(b)
        else:
            if cur: runs.append(cur)
            cur = [b]
    if cur: runs.append(cur)
    out = s
    for run in reversed(runs):
        kind = run[0][2]
        body = '\n'.join(b[4] for b in run) if kind == 'style' else '\n;\n'.join(b[4] for b in run)
        if kind == 'style' and any(b[3].strip() for b in run): pass
        h = hashlib.md5(body.encode()).hexdigest()[:10]
        name = f'rr-{h}.{"css" if kind == "style" else "js"}'
        files[name] = body
        tag = f'<link rel="stylesheet" href="{name}">' if kind == 'style' else f'<script src="{name}"></script>'
        out = out[:run[0][0]] + tag + out[run[-1][1]:]
        saved += (run[-1][1] - run[0][0]) - len(tag)
    if WRITE and out != s: p.write_text(out, encoding='utf-8')
if WRITE:
    for name, body in files.items(): (PUB / name).write_text(body, encoding='utf-8')
tot = sum(len(b) for b in files.values())
print(f'{n} pages, {len(files)} shared files ({tot//1024} KB on disk once), inline bytes removed across pages: {saved//1024} KB  ({"WRITTEN" if WRITE else "dry run"})')

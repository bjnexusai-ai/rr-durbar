#!/usr/bin/env python3
"""In GENERATED pages only: point assets/<x>.jpg|png at <x>.webp when that .webp exists. Skips og/twitter/icon tags. Dry run unless --write."""
import re, sys
from pathlib import Path
WRITE = '--write' in sys.argv
pat = re.compile(r'(assets/[A-Za-z0-9_./-]+?)\.(jpe?g|png)\b', re.I)
SKIP = re.compile(r'og:image|twitter:image|apple-touch|rel="(shortcut )?icon"|manifest', re.I)
tot = 0
for p in sorted(Path('public').rglob('index.html')):
    if 'checkout' in p.parts: continue
    s = p.read_text(encoding='utf-8'); c = 0
    def sub(m):
        global c
        if not Path('public', m.group(1) + '.webp').exists() or SKIP.search(s[max(0, m.start() - 140):m.start()]): return m.group(0)
        c += 1; return m.group(1) + '.webp'
    out = pat.sub(sub, s); tot += c
    if c: print(f'{c:4d}  {p}')
    if WRITE and out != s: p.write_text(out, encoding='utf-8')
print(f'{tot} references ({"WRITTEN" if WRITE else "dry run"})')

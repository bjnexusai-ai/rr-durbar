#!/usr/bin/env python3
"""Read-only: how much inline CSS/JS is identical across generated pages."""
import re, hashlib
from pathlib import Path
from collections import defaultdict
pages = [p for p in sorted(Path('public').rglob('index.html')) if 'checkout' not in str(p)]
pat = re.compile(r'<(style|script)\b([^>]*)>(.*?)</\1>', re.S | re.I)
seen = defaultdict(set); size = {}; kind = {}
for p in pages:
    for m in pat.finditer(p.read_text(encoding='utf-8')):
        t, attrs, body = m.groups()
        if 'src=' in attrs or 'ld+json' in attrs or ('type=' in attrs and 'javascript' not in attrs and 'module' not in attrs):
            continue
        h = hashlib.md5(body.encode()).hexdigest()[:8]
        seen[h].add(str(p)); size[h] = len(body); kind[h] = t
n = len(pages)
allp = [h for h in seen if len(seen[h]) == n]
some = [h for h in seen if 1 < len(seen[h]) < n]
one = [h for h in seen if len(seen[h]) == 1]
for lab, hs in (('IN ALL PAGES', allp), ('IN SOME PAGES', some), ('IN ONE PAGE', one)):
    print(f'{lab:14s} blocks {len(hs):4d}  css {sum(size[h] for h in hs if kind[h]=="style")//1024} KB  js {sum(size[h] for h in hs if kind[h]=="script")//1024} KB')
print('pages:', n)

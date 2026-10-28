#!/usr/bin/env python3
"""Every local assets/ or images/ file a generated page mentions must exist. Usage: check_refs.py [dir]"""
import re, sys
from pathlib import Path
d = Path(sys.argv[1] if len(sys.argv) > 1 else 'public')
pat = re.compile(r'(?<![A-Za-z0-9_])((?:assets|images)/[A-Za-z0-9_./-]+\.(?:webp|jpe?g|png|svg|gif|woff2?|mp4|webm|css|js))')
miss = {}
for p in sorted(d.rglob('index.html')):
    if 'checkout' in p.parts: continue
    for m in pat.finditer(p.read_text(encoding='utf-8')):
        if '-N.' in m.group(1): continue
        if not (d / m.group(1)).exists(): miss.setdefault(m.group(1), set()).add(p.parent.name or 'home')
for k, v in sorted(miss.items()): print('MISSING', k, '<-', ','.join(sorted(v)))
print('RESULT:', 'all referenced files exist' if not miss else f'{len(miss)} missing')
sys.exit(1 if miss else 0)

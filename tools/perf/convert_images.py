#!/usr/bin/env python3
"""JPG/PNG -> .webp beside the original (kept only if 15%+ smaller). Dry run unless --write."""
import sys, io
from pathlib import Path
from PIL import Image
RULES = [(Path('public/assets'), 1200, 72), (Path('public/images/menu/m'), 700, 72)]
WRITE = '--write' in sys.argv
o_t = n_t = k = 0
for d, maxw, q in RULES:
    for p in sorted(d.rglob('*')):
        if p.suffix.lower() not in ('.jpg', '.jpeg', '.png') or p.stat().st_size < 60 * 1024: continue
        out = p.with_suffix('.webp')
        if out.exists(): continue
        im = Image.open(p); im.load()
        if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA' if 'transparency' in im.info else 'RGB')
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
        o, w = p.stat().st_size, buf.tell()
        if w > o * 0.85: continue
        o_t += o; n_t += w; k += 1
        if WRITE: out.write_bytes(buf.getvalue())
print(f'{k} files {o_t//1024} KB -> {n_t//1024} KB ({"WRITTEN" if WRITE else "dry run"})')

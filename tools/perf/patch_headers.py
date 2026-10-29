#!/usr/bin/env python3
"""Add immutable cache for hashed rr-*.css|js to public/_headers (keeps everything else)."""
from pathlib import Path
p = Path('public/_headers'); t = p.read_text(encoding='utf-8')
if '/rr-*' not in t:
    t = t.replace('/images/*', '/rr-*\n  Cache-Control: public, max-age=31536000, immutable\n/images/*', 1); p.write_text(t, encoding='utf-8'); print('added /rr-* immutable')
else: print('already there')

#!/usr/bin/env python3
"""RR Durbar task 3.11 (site gate L5): make sure public/_headers sends the basic security headers on every page.
Run from the website repo root:  python3 tools/patches/add_headers.py --check     (shows what is missing, writes nothing)
                                 python3 tools/patches/add_headers.py             (adds ONLY the missing ones)
It never edits or removes an existing line (the X-Robots-Tag noindex line stays until the domain move, task 3.8).
Missing headers are added in a NEW "/*" block at the end; Cloudflare combines blocks that match the same path.
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000   (no includeSubDomains/preload: those are decided at the domain move)
After writing: ./ship.sh preview, then check the headers with curl -sI on the preview address."""
import sys
from pathlib import Path

F = Path('public/_headers')
WANT = [('X-Content-Type-Options', 'nosniff'), ('Referrer-Policy', 'strict-origin-when-cross-origin'), ('Strict-Transport-Security', 'max-age=31536000')]
if not F.exists(): print('STOP: public/_headers not found. Nothing written. Paste this line to the builder.'); sys.exit(1)
s = F.read_text(encoding='utf-8')
have = {line.split(':', 1)[0].strip().lower() for line in s.splitlines() if ':' in line and line[:1] in (' ', '\t')}
missing = [(k, v) for k, v in WANT if k.lower() not in have]
for k, v in WANT: print(('have    ' if (k, v) not in missing else 'MISSING ') + k)
if not missing: print('Nothing to add.'); sys.exit(0)
if '--check' in sys.argv: print(f'CHECK ONLY: would add {len(missing)} header(s). Nothing written.'); sys.exit(0)
block = ('' if s.endswith('\n') else '\n') + '\n# Added 26 Oct 2026 (task 3.11): basic security headers\n/*\n' + ''.join(f'  {k}: {v}\n' for k, v in missing)
F.write_text(s + block, encoding='utf-8')
print(f'WRITTEN: added {len(missing)} header(s) to public/_headers. Preview first, then commit by explicit path.')

#!/usr/bin/env python3
"""Step N fix: on wide laptops the river-bridge photo in the /branches/ strip stopped at ~990px, leaving a plain dark band on the left.
Make the photo at least the full screen width (same vertical band). The bulbs overlay follows the photo box, so it stays aligned.
Run AFTER patch_step_n.py. Exact-match, idempotent, backup src/site.html.bakNs."""
import sys, pathlib
p=pathlib.Path('src/site.html'); s=p.read_text(encoding='utf-8')
a='.brt-strip img{position:absolute;right:0;top:calc(var(--sh)*-1.33);width:calc(var(--sh)*10);max-width:none;height:auto;display:block'
b='.brt-strip img{position:absolute;right:0;top:calc(max(100vw,var(--sh)*10)*-0.133);width:max(100vw,calc(var(--sh)*10));max-width:none;height:auto;display:block'
if b in s: print('already done'); sys.exit(0)
if s.count(a)!=1: print('STOP: anchor found',s.count(a),'times (apply patch_step_n.py first)'); sys.exit(1)
pathlib.Path('src/site.html.bakNs').write_text(s,encoding='utf-8'); p.write_text(s.replace(a,b),encoding='utf-8')
print('PATCHED: bridge strip photo fills the full width')

#!/usr/bin/env python3
"""Mobile v4: the floating bars (#m61-bar, #m61-toast, .od-mbar) must also clear the bottom tab bar on tablets. The tab bar is shown up to 1099px, my v1 rule stopped at 900px.
Exact-match edit inside the rr-mobile-v1 block. STOP (nothing written) unless the anchor occurs exactly once. Idempotent: a second run says 'already done'."""
import pathlib, sys
p = pathlib.Path("src/site.html"); s = p.read_text(encoding="utf-8")
i = s.find('<style id="rr-mobile-v1">'); j = s.find("</style>", i)
if i < 0 or j < 0: sys.exit("STOP: rr-mobile-v1 block not found")
blk = s[i:j]
OLD = "@media(max-width:900px){\n#m61-bar{"; NEW = "@media(max-width:1099px){\n#m61-bar{"
if NEW in blk and OLD not in blk: print("already done (nothing to change)"); sys.exit(0)
if blk.count(OLD) != 1: sys.exit("STOP: anchor found %d times in the block (need 1)" % blk.count(OLD))
pathlib.Path("src/site.html.bakm4").write_text(s, encoding="utf-8")
p.write_text(s[:i] + blk.replace(OLD, NEW) + s[j:], encoding="utf-8"); print("PATCHED: bar lift now applies up to 1099px (backup src/site.html.bakm4)")

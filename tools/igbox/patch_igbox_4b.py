#!/usr/bin/env python3
"""Step 4B: Instagram box on every page + #rrcatering rule + catering pill clearance. Run from the repo root (after patch_igbox.py), then rebuild.
Replaces the contents of <style id="rr-igbox-css"> and <script id="rr-igbox-js"> in src/site.html with the 4B igbox_css.txt / igbox_js.txt.
Exact-match: STOPS unless both blocks are found exactly once. Idempotent (2nd run: "already done"). Backup: src/site.html.bak4b."""
import pathlib, re, shutil, sys
HERE = pathlib.Path(__file__).resolve().parent
SITE = pathlib.Path("src/site.html")
for f in (SITE, HERE / "igbox_css.txt", HERE / "igbox_js.txt"):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root)" % f)
s = SITE.read_text(encoding="utf-8")
css = (HERE / "igbox_css.txt").read_text(encoding="utf-8").rstrip("\n")
js = (HERE / "igbox_js.txt").read_text(encoding="utf-8").rstrip("\n")
if 'id="rr-igbox-js"' not in s: sys.exit("STOP: run tools/igbox/patch_igbox.py (4A) first")
pc = re.compile(r'(<style id="rr-igbox-css">\n)(.*?)(\n</style>)', re.S)
pj = re.compile(r'(<script id="rr-igbox-js">)(.*?)(\n</script>)', re.S)
for name, p in (("rr-igbox-css", pc), ("rr-igbox-js", pj)):
    n = len(p.findall(s))
    if n != 1: sys.exit("STOP: %s block found %d times (need 1)" % (name, n))
cur_css, cur_js = pc.search(s).group(2), pj.search(s).group(2)
if cur_css == css and cur_js == js:
    print("already done (nothing to change in src/site.html)"); sys.exit(0)
shutil.copyfile(SITE, "src/site.html.bak4b")
s = pc.sub(lambda m: m.group(1) + css + m.group(3), s, count=1)
s = pj.sub(lambda m: m.group(1) + js + m.group(3), s, count=1)
SITE.write_text(s, encoding="utf-8")
print("PATCHED: Instagram box 4B (pop-up on every page, #rrcatering on /catering/, pill clearance) (backup src/site.html.bak4b)")

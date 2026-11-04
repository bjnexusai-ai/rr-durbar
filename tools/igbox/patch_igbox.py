#!/usr/bin/env python3
"""Step 4A: floating "Latest from Instagram" box (plan section 4, core). Run from the repo root, then rebuild.
 - NEW  <style id="rr-igbox-css"> + <script id="rr-igbox-js"> (igbox_css.txt / igbox_js.txt), placed right before <script id="lv-listings"> (after the music player).
 - EDIT the home What's new script, 2 exact spots: its fetch now goes through window.rrWNFetch (one /api/whats-new request per page, shared with the box),
        and window.RR_WHATSNEW gets open:openModal (a tap on the box opens the existing reel pop-up on the home page).
Exact-match: STOPS unless every anchor is found exactly once. Idempotent (2nd run says "already done"). Backup: src/site.html.bak4a."""
import pathlib, shutil, sys
HERE = pathlib.Path(__file__).resolve().parent
SITE = pathlib.Path("src/site.html")
for f in (SITE, HERE / "igbox_css.txt", HERE / "igbox_js.txt"):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root, after unzipping rr-4A.zip)" % f)
s = SITE.read_text(encoding="utf-8")
if 'id="rr-igbox-js"' in s:
    print("already done (nothing to change in src/site.html)"); sys.exit(0)
FETCH_OLD = "fetch(API+'/api/whats-new',{credentials:'omit',signal:ac?ac.signal:undefined})"
FETCH_NEW = "(window.rrWNFetch?window.rrWNFetch(API):fetch(API+'/api/whats-new',{credentials:'omit',signal:ac?ac.signal:undefined}))"
API_OLD = "window.RR_WHATSNEW={layout:layout,load:load,count:function(){return track.querySelectorAll('.rr-wn-card:not(.is-clone)').length}};"
API_NEW = "window.RR_WHATSNEW={layout:layout,load:load,open:openModal,count:function(){return track.querySelectorAll('.rr-wn-card:not(.is-clone)').length}};"
HOOK = '<script id="lv-listings">'
for name, a in (("whats-new fetch", FETCH_OLD), ("RR_WHATSNEW export", API_OLD), ("insert point (lv-listings)", HOOK)):
    c = s.count(a)
    if c != 1: sys.exit("STOP: %s found %d times (need 1)" % (name, c))
shutil.copyfile(SITE, "src/site.html.bak4a")
css = (HERE / "igbox_css.txt").read_text(encoding="utf-8").rstrip("\n")
js = (HERE / "igbox_js.txt").read_text(encoding="utf-8").rstrip("\n")
block = '<style id="rr-igbox-css">\n' + css + '\n</style>\n<script id="rr-igbox-js">' + js + '\n</script>\n'
s = s.replace(FETCH_OLD, FETCH_NEW).replace(API_OLD, API_NEW).replace(HOOK, block + HOOK)
SITE.write_text(s, encoding="utf-8")
print("PATCHED: Instagram box (shared /api/whats-new, fallback reels, code chip) (backup src/site.html.bak4a)")

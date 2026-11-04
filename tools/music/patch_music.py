#!/usr/bin/env python3
"""Step 3: music that travels (plan section 3). Run from the repo root, then rebuild.
 - NEW  <style id="rr-music-css"> + <script id="rr-music-js"> (music_css.txt / music_js.txt), placed right before <script id="lv-listings">.
        Saved state in localStorage (rrMusic on|off, rrMusicT seconds, rrMusicP = paused by the visitor), a mini player on every page
        (phone: 44px gold disc bottom-left, 92px up, above the glass nav; laptop: 210x44 glass pill bottom-left), "Tap to resume" when the
        browser blocks sound, x turns it off everywhere, never on /checkout/, view-transition-name rr-music.
 - EDIT the home hero's music script, 3 exact lines: its button now goes through window.rrMusic (so the hero pill and the mini player stay in step).
Exact-match: STOPS unless every anchor is found exactly once. Idempotent (2nd run says "already done"). Backup: src/site.html.bak3."""
import pathlib, shutil, sys
HERE = pathlib.Path(__file__).resolve().parent
SITE = pathlib.Path("src/site.html")
for f in (SITE, HERE / "music_css.txt", HERE / "music_js.txt"):
    if not f.exists(): sys.exit("STOP: %s not found (run from the repo root, after unzipping rr-3.zip)" % f)
s = SITE.read_text(encoding="utf-8")
if 'id="rr-music-js"' in s:
    print("already done (nothing to change in src/site.html)"); sys.exit(0)
START_OLD = "async function startMusic(){ambience=true;try{await royalAudio.play();updateMusicUI(true)}catch(e){ambience=false;updateMusicUI(false)}}"
START_NEW = "async function startMusic(){ambience=true;try{if(window.rrMusic)await window.rrMusic.start();else await royalAudio.play();updateMusicUI(true)}catch(e){ambience=false;updateMusicUI(false)}}"
STOP_OLD = "function stopMusic(){ambience=false;royalAudio.pause();updateMusicUI(false)}"
STOP_NEW = "function stopMusic(){ambience=false;if(window.rrMusic)window.rrMusic.off(true);else royalAudio.pause();updateMusicUI(false)}"
CLICK_OLD = "musicButton?.addEventListener('click',()=>ambience?stopMusic():startMusic());"
CLICK_NEW = "window.rrHeroMusicUI=updateMusicUI;musicButton?.addEventListener('click',()=>(royalAudio&&!royalAudio.paused)?stopMusic():startMusic());"
HOOK = '<script id="lv-listings">'
for name, a in (("hero startMusic", START_OLD), ("hero stopMusic", STOP_OLD), ("hero music click", CLICK_OLD), ("insert point (lv-listings)", HOOK)):
    c = s.count(a)
    if c != 1: sys.exit("STOP: %s found %d times (need 1)" % (name, c))
shutil.copyfile(SITE, "src/site.html.bak3")
css = (HERE / "music_css.txt").read_text(encoding="utf-8").rstrip("\n")
js = (HERE / "music_js.txt").read_text(encoding="utf-8").rstrip("\n")
block = '<style id="rr-music-css">\n' + css + '\n</style>\n<script id="rr-music-js">' + js + '\n</script>\n'
s = s.replace(START_OLD, START_NEW).replace(STOP_OLD, STOP_NEW).replace(CLICK_OLD, CLICK_NEW).replace(HOOK, block + HOOK)
SITE.write_text(s, encoding="utf-8")
print("PATCHED: music that travels (mini player, saved state, Tap to resume) (backup src/site.html.bak3)")

# rr-4A: Instagram box (core)
Box bottom-left on every page except checkout, pickup, track-order, legal and catering. Home: only after What's new. Music player lifts above it.

**1. Apply** (run from the repo root, on `perf-fixes-28oct`):
```bash
git pull origin perf-fixes-28oct && unzip -o rr-4A.zip && python3 tools/igbox/patch_igbox.py && bash tools/patches/rebuild.sh
```
Expect: `PATCHED: Instagram box (shared /api/whats-new, fallback reels, code chip) (backup src/site.html.bak4a)` then `RESULT: 0 error(s), 1 warning(s)` (the pickup-menu h1 warning was already there). A 2nd run of the patch says `already done`.

**2. Test:**
```bash
(cd public && python3 -m http.server 8765 &) ; sleep 1; python3 tools/igbox/igbox_test.py
```
Expect: `RESULT: ALL PASS` (73 PASS). About 3 minutes.

**3. Push:**
```bash
git add src/site.html public tools/igbox/patch_igbox.py tools/igbox/igbox_css.txt tools/igbox/igbox_js.txt tools/igbox/igbox_test.py tools/igbox/APPLY.md && git commit -m "Instagram box: live from Instagram, fallback reels, code chip (step 4A)" && git push origin perf-fixes-28oct && git merge-base --is-ancestor origin/main HEAD && git push origin perf-fixes-28oct:main
```
Don't add the zip or *.bak files.

**Notes**
- Existing tests: whatsnew 37, catering 115, v5 14, hero360 all 8 slides, branches_b 17, music 57 all pass. `hero_v6_test` has 1 failure ("animated properties besides transform/opacity: :width") that is already there on clean main baf81d5.
- Edits to the home What's new script (2 exact spots): its fetch goes through `window.rrWNFetch` (one `/api/whats-new` request per page) and `window.RR_WHATSNEW` gets `open`.
- Not in 4A (it is 4B): pop-up on every page, #rrcatering rule on /catering/, final layout polish.

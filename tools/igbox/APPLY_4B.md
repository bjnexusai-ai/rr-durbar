# rr-4B: Instagram box on every page + final floating layout (WIP)
- Tap on the box opens the What's new pop-up player on every page (home uses the existing one; other pages build the same pop-up with the same rr-wn-* classes). "Watch on Instagram" = the post permalink.
- /catering/: box only for posts with #rrcatering (any case) in the caption; no fallback reels; none = nothing shown.
- Apply (repo root, after 4A is in): `unzip -o rr-4B-wip.zip && python3 tools/igbox/patch_igbox_4b.py && bash tools/patches/rebuild.sh`
  Expect `PATCHED: Instagram box 4B ...` then `RESULT: 0 error(s), 1 warning(s)`. 2nd run: `already done`.
- Tests (server on :8765, run one at a time): `python3 tools/igbox/igbox_test.py`, `python3 tools/igbox/layout_test.py` (floating overlap check at 360/390/1440, music on/off x box open/collapsed), then whatsnew, catering, music, hero_v6 tests.
- Push: `git add src/site.html public tools/igbox/{patch_igbox_4b.py,igbox_css.txt,igbox_js.txt,igbox_test.py,layout_test.py,APPLY_4B.md}` (not the zip or *.bak).

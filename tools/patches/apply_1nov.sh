#!/usr/bin/env bash
# 1 Nov update: run from the website repo root AFTER unzipping rr-durbar-1nov.zip over it.
# The zip already contains the finished files (src/site.html + rebuilt public/ + new images). Do NOT run patch_1nov.py again.
set -u
cd "$(dirname "$0")/../.." || exit 1
base=$(git merge-base HEAD 517feae 2>/dev/null | cut -c1-7)
[ "$base" = "517feae" ] || echo "WARNING: this repo does not contain commit 517feae; the zip was built on 517feae. Stop and tell the builder."
# old shared CSS/JS files replaced by new hashed ones
for f in rr-0b000cf6b0.js rr-10c0056f71.js rr-73f638d883.css rr-80e4f5cecc.css rr-8d9b1cca66.css rr-b3124e8725.css rr-cf6619b038.css rr-dbc7372c6b.css rr-e7747a9dc8.js rr-e830f900a9.css rr-eb26e161d3.js rr-f436809ebd.js; do
  [ -e "public/$f" ] && git rm -q "public/$f" && echo "removed public/$f"
done
missing=0
for f in public/assets/map-topdown.webp public/assets/rr-exterior.webp public/assets/rr-exterior-760.webp; do
  [ -s "$f" ] || { echo "MISSING $f"; missing=1; }
done
grep -q 'rraExt' public/about-us/index.html || { echo "MISSING: about-us page not updated"; missing=1; }
for r in $(grep -ho 'rr-[0-9a-f]\{10\}\.\(css\|js\)' public/index.html public/*/index.html | sort -u); do [ -s "public/$r" ] || { echo "MISSING public/$r"; missing=1; }; done
[ $missing = 0 ] && echo "CHECK OK: ready to commit"

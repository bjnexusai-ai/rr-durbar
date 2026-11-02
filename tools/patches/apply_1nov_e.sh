#!/usr/bin/env bash
# 1 Nov part E (cumulative: hero heat-haze + legal name RR Fresh Foods + footer/contact details + Google Analytics 4): run from the website repo root AFTER unzipping rr-durbar-1nov-e.zip over it. Built on commit 7d5c138.
set -u
cd "$(dirname "$0")/../.." || exit 1
[ "$(git rev-parse --short HEAD)" = "7d5c138" ] || echo "WARNING: HEAD is not 7d5c138 (the zip was built on it). Stop and tell the builder."
for f in rr-39a5eb106a.js rr-7f1b575f8b.css rr-d1a49c6f85.js ; do [ -e "public/$f" ] && git rm -q "public/$f" && echo "removed public/$f"; done
missing=0
for r in $(grep -ho 'rr-[0-9a-f]\{10\}\.\(css\|js\)' public/index.html public/*/index.html | sort -u); do [ -s "public/$r" ] || { echo "MISSING public/$r"; missing=1; }; done
grep -q 'rr-heathaze-js' src/site.html || { echo "MISSING: heathaze"; missing=1; }
grep -q 'G-1E6TC2HSXV' src/site.html || { echo "MISSING: GA4"; missing=1; }
grep -rq 'RR Fresh Foods (RR Durbar)' src public cms/seed && { echo "OLD LEGAL NAME STILL PRESENT"; missing=1; }
grep -q 'Registered address:' src/site.html || { echo "MISSING: footer address"; missing=1; }
[ $missing = 0 ] && echo "CHECK OK: ready to commit"

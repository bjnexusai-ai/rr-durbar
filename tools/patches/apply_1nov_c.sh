#!/usr/bin/env bash
# 1 Nov parts B+C: run from the website repo root AFTER unzipping rr-durbar-1nov-c.zip over it. Built on commit 99b3074.
set -u
cd "$(dirname "$0")/../.." || exit 1
[ "$(git rev-parse --short HEAD)" = "99b3074" ] || echo "WARNING: HEAD is not 99b3074 (the zip was built on it). Stop and tell the builder."
for f in rr-0982c0c343.css rr-1b9b075a10.css rr-255538772f.js rr-25deef2bbb.js rr-4dad0cb23c.js rr-59e34c4a5e.css rr-8723e8e556.css rr-b5bd11e87a.js rr-d0ef3f0a9f.js rr-d4b55f0394.css rr-df963b0005.css ; do [ -e "public/$f" ] && git rm -q "public/$f" && echo "removed public/$f"; done
missing=0
for r in $(grep -ho 'rr-[0-9a-f]\{10\}\.\(css\|js\)' public/index.html public/*/index.html | sort -u); do [ -s "public/$r" ] || { echo "MISSING public/$r"; missing=1; }; done
grep -rqE '7702077999|77020 77999' public src && { echo "OLD NUMBER STILL PRESENT"; missing=1; }
grep -q 'rr-1nov-c-js' src/site.html || { echo "MISSING: part C"; missing=1; }
[ $missing = 0 ] && echo "CHECK OK: ready to commit"

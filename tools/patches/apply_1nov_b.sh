#!/usr/bin/env bash
# 1 Nov part B: run from the website repo root AFTER unzipping rr-durbar-1nov-b.zip over it. Built on commit 99b3074.
set -u
cd "$(dirname "$0")/../.." || exit 1
[ "$(git rev-parse --short HEAD)" = "99b3074" ] || echo "WARNING: HEAD is not 99b3074 (the zip was built on it). Stop and tell the builder."
for f in rr-25deef2bbb.js rr-59e34c4a5e.css rr-d0ef3f0a9f.js ; do [ -e "public/$f" ] && git rm -q "public/$f" && echo "removed public/$f"; done
missing=0
for r in $(grep -ho 'rr-[0-9a-f]\{10\}\.\(css\|js\)' public/index.html public/*/index.html | sort -u); do [ -s "public/$r" ] || { echo "MISSING public/$r"; missing=1; }; done
grep -q 'ext-armed' public/about-us/index.html public/rr-*.js 2>/dev/null || { echo "MISSING: about fix"; missing=1; }
[ $missing = 0 ] && echo "CHECK OK: ready to commit"

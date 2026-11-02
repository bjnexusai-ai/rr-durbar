#!/usr/bin/env bash
# The usual rebuild after any change to src/site.html. Run from the website repo root.
set -e
python3 tools/split/split_pages.py | tail -1
python3 tools/perf/prerender_menu.py --write | tail -1
python3 tools/perf/rewrite_images.py --write | tail -1
python3 tools/perf/slim_pages.py --write | tail -1
python3 tools/verify/routecheck.py public | tail -3
python3 tools/split/compare_split.py public | tail -3 || true

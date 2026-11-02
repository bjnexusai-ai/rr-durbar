#!/usr/bin/env bash
# Rebuild all generated pages from src/site.html. Run from the repo root.
set -e
python3 tools/perf/css_balance_check.py src/site.html | tail -1
python3 tools/split/split_pages.py | tail -1
python3 tools/perf/prerender_menu.py --write | tail -1
python3 tools/perf/rewrite_images.py --write | tail -1
python3 tools/perf/slim_pages.py --write | tail -1
python3 tools/perf/check_refs.py | tail -1

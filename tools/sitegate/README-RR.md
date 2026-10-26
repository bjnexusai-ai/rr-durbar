# sitegate for RR Durbar (plan section 16, tasks 3.0 and 3.9)

The owner's own kit from the FURSAT project, set up for RR Durbar. It is OUTSIDE `public/`, so it is never deployed.

| File | What it is |
|---|---|
| `sitegate.py`, `prelaunch_audit.py`, `mobile_check.py` | The kit, unchanged |
| `sitegate.config.json` | RR Durbar values (plan section 3). No secrets |
| `launch-checklist.json` | The 13 post-launch tasks G1 to G13, written for 6 outlets |
| `menu-snapshot.mjs` (+ test) | Makes `menu-snapshot.json` from `/api/menu` and `/api/prices` (our menu has no static file) |
| `../../docs/sitegate-baseline-2026-10-26.txt` | The "before" report (task 3.0) with notes on which lines are real |

## Rules on this project
1. `--fix` and `--gen-seo` CHANGE files. Use them ONLY on the new split pages (Phase 3), never on `public/index.html`. On today's site: `check` only.
2. `NOINDEX` is ignored on purpose (checkout and order pages must stay noindex). `seocheck.mjs` checks noindex page by page.
3. Until the cutover every page is noindex through `public/_headers`. That is expected.
4. The kit checks one name, address and phone. Our 6 outlets are checked by hand (plan 16.4).
5. Run the gate before a commit. A push to `main` deploys.

## Runs (website Codespace, /workspaces/rr-durbar)
- Menu data, between 11:00 and 23:30: `node tools/sitegate/menu-snapshot.mjs --api https://rr-durbar-api.ramana-peravali.workers.dev --branch MR`
- Static check of what is in `public/`: `python3 tools/sitegate/sitegate.py check public --config tools/sitegate/sitegate.config.json`
- Add the phone check (needs Playwright with Chromium): add `--mobile` to the line above.
- After the cutover: add `--url https://rrdurbar.com --crawl 25`. When G1 to G13 are ticked in `launch-checklist.json`: add `--launch`.
Paste the raw output to the builder. Every BLOCKER becomes a fix task.

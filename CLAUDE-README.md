# RR Durbar: handoff README for any Claude session

Read this fully before doing anything. Owner: Alekya (BJNEXUS AI, Hyderabad).

## Working rules (mandatory)

- Short commands, ONE consolidated block at a time. Raw output, minimal explanation.
- Never ask for or accept tokens/secrets in chat. For deploys, use a hidden prompt: `read -rsp "Cloudflare API token (hidden): " CLOUDFLARE_API_TOKEN`, then `unset CLOUDFLARE_API_TOKEN` afterwards. Never type placeholder text as a token.
- Do NOT delete any file until deployment is verified and Alekya says so. Untracked `old-v79d.html` in the website repo root stays until she confirms.
- Never `git add -A` in the website repo. Add files by explicit path.
- Diagnose from evidence (command output). Label guesses as guesses. Do not state hosting or DNS conclusions without headers or DNS output.
- Do not deploy before checking `wrangler.jsonc` `assets.directory` is `./public`.

## Project

RR Durbar: restaurant, 6 Vijayawada outlets. Static single-page site, routes via `?page=...` (home, menu, order-now, pickup, pickup-menu, branches, catering, policies...). Live Rista (POS) menu comes from the API Worker.

## Repos

1. Website: github.com/bjnexusaialekya-rgb/RR-Durbar, Codespace folder `/workspaces/RR-Durbar`. Key files: `public/index.html` (currently v89), `public/_headers`, `wrangler.jsonc` (static assets Worker `rr-durbar`, `assets.directory` = `./public`, SPA not-found handling).
2. API: github.com/bjnexusaialekya-rgb/rr-durbar-api. Worker URL `https://rr-durbar-api.bjnexusai-alekya.workers.dev`. Files: `src/index.js, quote.js, order.js, rista.js, cache.js, config.js, jwt.js, transform.js`, `test/`. This repo is NOT in the website Codespace by default. Clone it under `/workspaces` or use its own Codespace.

Cloudflare account id: `d8154abdb162e29563f2949bee205aa0`.

## Where the site actually runs (verified 2026-10-20)

- Live new site: `https://rr-durbar.bjnexusai-alekya.workers.dev` (Cloudflare Worker `rr-durbar`).
- `rrdurbar.com` is NOT this Worker. It resolves to `65.1.235.112`, served by nginx (an old 2022 site), nameservers `ns1/ns2.dns-parking.com`. Pointing the domain at the Worker is a separate, later cutover decision. Do not assume it.

## How to deploy (manual, reliable)

Website:
```bash
cd /workspaces/RR-Durbar && git status -sb | head -3 && read -rsp "Cloudflare API token (hidden): " CLOUDFLARE_API_TOKEN && echo && export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=d8154abdb162e29563f2949bee205aa0 && npx wrangler deploy 2>&1 | tail -25; unset CLOUDFLARE_API_TOKEN
```
API repo: same pattern from its folder, run `npm test` first (38 tests expected to pass). `wrangler deploy` keeps existing secrets (e.g. `COD_TEST_CODE`).

Why it matters: without `CLOUDFLARE_API_TOKEN` set, wrangler tries browser login, which times out in a Codespace.

## Verify after every deploy

- Logo: `curl -sI <site>/assets/logo/rr-logo-800.webp` must show `content-type: image/webp` (not `text/html`).
- Markers in live HTML: `curl -s <site>/ | grep -o -E 'pickup-menu|api/prices|api/quote' | sort | uniq -c`.
- API: `curl -s "<api>/api/prices?branch=MR"` must return 200 with JSON, not `{"error":"not_found"}`.
- Browser: hard refresh (Ctrl+Shift+R), check logo, Order Now dropdown, `?page=pickup`, `?page=pickup-menu&outlet=moghalrajpuram`, price labels on add buttons.

## Gotchas

- SPA fallback: the Worker answers ANY missing path with the home page (HTTP 200, `text/html`). A 200 does not mean the file exists. Always check `content-type`. This is how fake 1.3 MB logo files were created before.
- Logo files (`public/assets/logo/rr-logo-480.webp`, `rr-logo-800.webp`, `rr-logo.webp`) were never in git before commit `d32bab1`; real WebP files (22 KB, 39 KB, 85 KB). Verify with `file`.
- Git pushes do NOT auto-deploy right now. Cloudflare Git builds stopped (last build #8cc5539a); cause not confirmed (build token "bjnexus-ai build token", Git trigger, or paused connection). Check Worker `rr-durbar` > Settings > Build. Until fixed, deploy manually.
- Old build #8cc5539a read 334 files from the repo root (including `.git`). Current config reads from `./public` (290 files). `.git/config` was checked and is not served.
- `_headers` cache rules are already merged.
- An alternative v90 (four-piece logo) exists locally; NOT pushed, not needed.
- Do not paste or commit secrets. If a secret is ever found in git history, rotate it.

## Current state

- Website v89 deployed (version `a2418b7c`), logo served as image/webp.
- Live outlets (Rista menu): moghalrajpuram (MR), singhnagar (SN), bhavanipuram (BH), poranki (PO), autonagar (AT). Patamatalanka (PL) not connected (shows "Call to order").
- `GET /api/prices?branch=MR` committed (`70953d3`); API deploy was the next step and must be verified with the check above.
- `/api/order` is TEST only: pay at outlet, needs secret `COD_TEST_CODE`, only branches in `COD_BRANCHES` (default MR), dry run unless `COD_LIVE=1`. Keep `COD_LIVE` off unless Alekya says otherwise.
- Item prices show on add buttons via `/api/prices`; site-wide `RR_SHOW_PRICES=false` still hides prices on the main Menu page (client decision). `/api/prices` is public.
- WhatsApp is the last ordering step. Real order push (PayU / live Rista orders) is not on.

## Open items

1. Fix Cloudflare Git build connection (see Gotchas), then test by pushing a small change.
2. Deploy and verify the API repo (`/api/prices`).
3. Confirm Patamatalanka menu is ready before adding PL to the LIVE list.
4. Outlet GPS coordinates in the pickup script are marked "FILL IN"; only Singhnagar matches its Maps link. Confirm the other five from Google Maps.
5. Possible: remember last chosen outlet; remove leftover Swiggy/Zomato "Step 3" panel on Order Now (untested).
6. Domain cutover for rrdurbar.com (currently an old nginx host on parked DNS).
7. After Alekya confirms: delete untracked `old-v79d.html`.

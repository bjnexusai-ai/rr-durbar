# RR Durbar: project status (for any Claude session)

Last updated: 2026-10-21 (IST, late). Owner: Alekya (BJNEXUS AI, Hyderabad).
Read `CLAUDE-README.md` (working rules, deploy steps) and `RISTA-INTEGRATION.md` too. This file is the current state; if it conflicts with older notes, this file wins.

## 1. How Alekya wants you to work (mandatory)

- Short commands, ONE consolidated block at a time. Raw output, minimal explanation. She gets tired.
- File-writing block and run block are SEPARATE. Long output goes to a file; she pastes only NEW output.
- Never ask for or accept tokens in chat. Deploys use a hidden prompt:
  `read -rsp "Cloudflare API token (hidden): " CLOUDFLARE_API_TOKEN; echo; export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=d8154abdb162e29563f2949bee205aa0`, deploy, then `unset CLOUDFLARE_API_TOKEN`.
- Do NOT delete any file until she says so. Never `git add -A` (once done by mistake, fixed in commit 1349fa2). Add files by explicit path.
- Diagnose from pasted evidence. Label guesses as guesses. Several earlier guesses were wrong.
- Two Codespaces: website `/workspaces/RR-Durbar`; API `/workspaces/rr-durbar-api` (the website Codespace cannot clone it, 403). Swagramam is a SEPARATE project. Always say which terminal.
- Patches: quoted heredoc (`node - <<'EOF'`), exact-anchor check (count must be 1, else abort), syntax check (`vm.Script` of the touched script), backup to /tmp, then write, print PATCHED. Type `clear` first.
- Edit the ORIGINAL rules in place. No override blocks, no new `<style>`/`<script>` tags. Phone-only changes via media queries; desktop stays unchanged unless she says. Everything must render on phones at every size (320, 390, landscape).
- Test on PREVIEW first, then merge to main and deploy live.
- She cannot do visual checks easily. Use headless Playwright in `/tmp/pw`. `/tmp` is wiped often: reinstall with `npm i playwright sharp; npx playwright install chromium; sudo npx playwright install-deps chromium`. Test scripts are lost on wipe; rewrite them. If `cd /tmp/pw` fails, a following `cat > file` heredoc will NOT run (this caused several false "WROTE" results): always `mkdir -p /tmp/pw && cd /tmp/pw && cat > ...`.
- Headless cannot judge the WebGL founder reveal and cannot show GPU gains (blur/filter removal); only a real device can.

## 2. Project and URLs

RR Durbar: restaurant, 6 Vijayawada outlets. Static single-page site (`public/index.html`, about 1.2 MB, routes via `?page=...`), live Rista (POS) menu through an API Worker.

- Live: https://rr-durbar.bjnexusai-alekya.workers.dev/ (Worker `rr-durbar`, `wrangler.jsonc`, `assets.directory` = `./public`)
- Preview: https://rr-durbar-preview.bjnexusai-alekya.workers.dev/ (deploy ONLY with `npx wrangler deploy -c wrangler.preview.jsonc`)
- API: https://rr-durbar-api.bjnexusai-alekya.workers.dev/ (`/api/menu`, `/api/prices`, `/api/quote`, `/api/order` dry run, `COD_LIVE` not set)
- Repos: github.com/bjnexusaialekya-rgb/RR-Durbar and .../rr-durbar-api
- `rrdurbar.com` is NOT this Worker (old nginx 65.1.235.112, parked DNS). Cutover is a later decision. A `noindex` header is on (`public/_headers`); remove at cutover.
- **DANGER:** bare `npx wrangler deploy` deploys the CURRENT BRANCH to LIVE. For live: `git checkout main`, `git merge --ff-only <branch>`, confirm `git branch --show-current` prints `main`, then deploy.
- Cloudflare Git auto-builds are broken (last build #8cc5539a). All deploys are manual.

## 3. Current state

| Item | Value |
|---|---|
| `main` / live code | `d85aadc` (latest commit that changed `public/index.html`) |
| Live Worker version | newest in the Cloudflare dashboard (Worker `rr-durbar`); `d7d8bdfc` was live before the outlet-button change |
| Previous live versions (rollback) | `d7d8bdfc` (menu tile fix), `8a702877` (images), `d489fb9b` (scan throttle), `37afafd5` (before this session's perf work) |
| Preview version | `4c4f8700` (same code as `main`) |
| Pending branch | none (`br-order` merged into `main`) |

Recent commits on `main` (newest first):
- `d85aadc` outlet "Order pickup" buttons open that outlet's pickup menu (Patamatalanka unchanged)
- `c748a62` docs: add this status file
- `7d39db3` menu tiles use one reveal only (removed duplicate JS rise)
- `42a280f` webp card images and footer logo (originals kept)
- `ff722cc` throttle rrC scan observer; pause v77 sweep when tab hidden
- `d706175` phone menu page: drop tile filters, blur and 3D tilt (desktop unchanged)
- `1349fa2` untrack notes and old-v79d.html (files kept on disk)

## 4. Done and live

Earlier sessions:
1. Founder WebGL images as files; mobile menu closes after link tap; Swiggy/Zomato links; WhatsApp typing delay 350 ms; crest SVG overflow fixed.
2. Phone only: hero eyebrow + title hidden; lighter phone hero shade; About page hero stat numbers visible.
3. WhatsApp chat widget (`#rrw`, `#rrw-panel`, `#rrw-body`): quick routes, outlet picker for pickup menu (5 live outlets; Patamatalanka = tel link), Order Now, Talk to staff. Landscape fit. Closes after any link tap.
4. Phone bottom tab bar `#rr-tabbar` (built by script `rr-v85-js`): Home, About Us, Menu, Order Now, Branches, Catering, Contact. Hamburger hidden when it shows; landscape phones keep the hamburger.
5. Pickup menu: sold-out dishes kept and greyed (`.lv-so`), available first, notice when fewer than 20 available.
6. Track Order unlinked everywhere (page/section still exists in code). Real tracking needs a Rista status API (none listed in `RISTA-INTEGRATION.md`; unconfirmed).
7. Perf: GSAP lazy-loaded via IntersectionObserver near the founder section; smaller outlet photos (`br-*-m.webp`), crest as webp, lazy images below the fold.

This session (2026-10-21):
- `d706175`: on phones only, menu tiles lose image filters, backdrop blurs and the 3D tilt/hover transform (backdrop-filter count 75 to 20). Desktop unchanged.
- `ff722cc`: `rrC-js` MutationObserver callback throttled to 250 ms (headless profile 1,510 ms to about 700-840 ms); `rr-v77-motion-js` safety sweep skips when tab hidden, interval 700 to 1000 ms.
- `42a280f`: 24 card images and the footer logo converted to `NAME-w.webp` (max 900 px, footer logo 700 px, quality 76); 2,451 KB to 1,861 KB; 25 references swapped; originals kept. Preview test: 24,137 KB vs 26,929 KB over six pages, no broken images.
- `7d39db3`: menu tiles had TWO reveal systems on the same elements (CSS `m52reveal` scroll-timeline and the JS rise in `rr-v77-motion-js` via the `RISE` selector). Removed `#m52 .m52-t` from `RISE`. Measured with `getAnimations()` on desktop: before, 57 of 204 visible-tile samples had 2 animations (max 2); after, 0 (max 1). Found from Alekya's screen recording of the desktop Menu page (washed-out tiles and doubled captions while scrolling).
- `d85aadc`: on `?page=locations`, the six outlet "Order pickup" buttons are built by `rr-section-controls` (`makeOutletCard`, `orderLink.href`). Singhnagar, Moghalrajpuram, Bhavanipuram, Poranki and Autonagar now open `?page=pickup-menu&outlet=<slug>`; Patamatalanka stays on `?page=order-now#ordering` (not connected to Rista). Verified on preview: all six hrefs correct and a click lands on the pickup menu.

## 5. PageSpeed (mobile, Lighthouse via pagespeed.web.dev)

| | Baseline | Measured before `ff722cc` |
|---|---|---|
| Mobile score | 45 | 64 |
| FCP / LCP | 4.2 s / 12.5 s | 2.7 s / 4.7 s |
| TBT | 480 ms | 520 ms |
| CLS | 0.05 | 0.059 |
| Payload | 6.2 MB | 4,066 KiB |
| Desktop | 83 | 98 |

Accessibility 100, Best Practices 100, SEO 69 (the `noindex` header; returns to about 100 at cutover). Scores swing about +-5. **Not re-measured since `ff722cc`, `42a280f` and `7d39db3`: run PageSpeed on live (mobile) twice and record it here.**

## 6. In progress

**Outlet "Order pickup" buttons: done and live** (commit `d85aadc`, see section 4). Lesson: the "Order from outlet" markup around line 5556 of `public/index.html` is static HTML that a script replaces at load, so editing it has no visible effect; the real buttons are on `?page=locations`, built in `rr-section-controls`. The Branches page (`?page=branches`) only has the generic Order Now and Order Pickup links. Alekya has not yet checked it on her phone.

**Alekya's live check of the Menu scroll** (is the jerk gone after `7d39db3`?) has not been reported. If blank/white tiles still appear on fast scroll, a guess is the lazy tile images arriving late; the fix would be to load images for tiles near the viewport earlier.

## 7. Tried and reverted (do not redo without new evidence)

- Early route attribute for `?page=menu` (`data-rr-p`), to hide other sections before the router runs: CLS went from 1.588 to 1.681. Reverted.
- Lazy word-splitting of headings (`prep` in `rr-v77-motion-js` via IntersectionObserver): correct but no measurable gain (about 1,079-1,149 ms either way). Reverted.

## 8. Known issues, left alone

- **Menu deep-link CLS about 1.59** (direct load of `?page=menu`): every section renders until the router adds `body.rr-route-active` (about 3.5 s headless), then `#menu-page` grows 460 to 10,482 px when tiles are built. Does not affect the home-page PageSpeed score. The router is `<script id="rr-page-router">` (`applyPage`); sections hide via `body.rr-route-active section.rr-page-hidden{display:none!important}`. `<script id="rr-v66-early-route">` already marks the Home route before first paint.
- **Main-thread work:** TBT 520 ms; 15 long tasks on mobile. Headless profile: about 15 s of 16 s is browser style/layout/paint; JS about 3.5 s. Remaining JS hot spots: `rr-v77-motion-js` `prep` (about 0.9-1.0 s), `rrC-js` scan, `rr-v52-menu-js` `top_`, `rr-v85-js` `sync`, `rr-v29-story-cats-js` `upd`, `rr-motion-p2-js` `mark`.
- **Do NOT delete the 6 duplicate keyframes** (`rrhPush`, `rrBounce`, `rrTilt`, `rrRingPhone`, `rrShine`, `rrDraw`): each pair has DIFFERENT definitions (the later one wins). Unused CSS is about 51% of 591 KB across 149 style blocks; not removed.
- Reduced-motion is OFF on Alekya's phone (default). 52 of 59 animation/transition "none" rules are inside `prefers-reduced-motion`.
- Images not yet optimised: `br-*.webp` outlet photos (about 230-275 KB each), `54dfd81795.webp` (221 KB), `founder-sketch.webp` (113 KB). All 8 `hero-m-*.webp` load eagerly (stacked slides; `hero-m-0` is preloaded with `fetchpriority=high`, the rest `low`).

## 9. Open items

1. Outlet pickup buttons: done (section 6); Alekya to check on her phone.
2. Re-run PageSpeed and record numbers; then TBT / main-thread work; delay non-first-screen scripts (cart, search, Instagram, reviews).
3. Phone checks on live not yet reported: swipe tab bar, chat flow, crest sharpness in header, founder reveal. Hero screenshots (2-3 slides) still to send so focal points can be checked.
4. Stock data: API available dishes (evening): MR 233, SN 13, BH 236, PO 44, AT 13, PL 0. Later live pickup showed MR and SN all greyed. Hypothesis (unverified): outlets closed so Rista stock reads zero. Recheck after 11:00 IST with `curl /api/menu?branch=MR|SN|BH|PO|AT|PL` and count available.
5. Patamatalanka (PL) is not connected to Rista (0 available, site shows Call to order). Client message drafted: enable website channel, add prices + tax, turn on stock tracking. Do not add PL to the live list until done. Its plus code shows undecoded (FMR4%2BG2F) in the outlets strip.
6. Outlet GPS: Singhnagar 16.5332,80.6358 (confirmed); Moghalrajpuram 16.5057,80.6384; Bhavanipuram 16.5369,80.5898; Poranki 16.4801,80.6922; Patamatalanka 16.4912,80.6554; Autonagar none.
7. Real order push (PayU / live Rista orders) is NOT on; WhatsApp is the last ordering step. Do not enable `/api/order` live. The test route accepts only `COD_BRANCHES` (default MR).
8. Placeholder text visible on live (needs client-approved content): News "Add announcement headline" x2; Instagram "Connected · synced just now" demo; catering PLACEHOLDER blocks and "Occasion 01 · Replace text"; gallery items 05, 06 and event photos 01-04; "Outlet photo to be added"; Contact "add approved number / address / social"; Track Order "connect WooCommerce status" (unlinked); vision/mission "Draft · needs client approval"; "Editable trust point"; privacy policy "[Grievance officer name]".
9. Confirm with the client's compliance person that FSSAI numbers must stay in the footer.
10. Hero text overlap on short windows: unverified guess, not fixed.
11. Screenshots never sent: signatures section, footer, Find nearest outlet, pickup cart, "Your name" box and "Review & send on WhatsApp" spacing.
12. **Domain cutover checklist:** remove `X-Robots-Tag: noindex` from `public/_headers` and redeploy; point DNS from the old nginx server to the Worker; canonical/og/sitemap already point to rrdurbar.com; fix Cloudflare Git builds; re-run PageSpeed (SEO should return to about 100).

## 10. Useful facts

- Fonts are self-hosted. Asset cache 30 days; HTML must-revalidate.
- The Worker answers ANY missing path with the home page (HTTP 200, `text/html`): always check `content-type` when verifying assets (e.g. `curl -sI <site>/assets/logo/rr-logo-800.webp` must say `image/webp`).
- Useful ids/classes: `#rrw #rrw-panel #rrw-body #rrw-skip #rrw-launch .rrw-chip .rrw-grid`; `#rr-tabbar`; `#rrP3` (pickup menu), `.lv-d` rows, `getMenu(code)` in the pickup script; `#m52` (menu showcase; tiles `.m52-t`, summaries `m52-b-*`), `#menu-page`; `#fnd`/`#story`/`.fnd-frame` (founder, About page); `#crestG` (header crest SVG); `.nav-brand .rr-lg`; `#br-locator`, `#br-list`; scripts `rr-v77-motion-js`, `rrC-js`, `rr-page-router`.
- Header and logo on RR Durbar pages are fixed: do not change.
- Notes files (`info-*.txt`, `old-v79d.html`) are untracked and excluded via `.git/info/exclude`; files are kept on disk until Alekya says delete.
- Never paste or commit secrets. If a secret is ever found in git history, rotate it.

## 11. First step for a new session

```
cd /workspaces/RR-Durbar && git status --short; git branch; git log --oneline -5
```

Then: ask Alekya for the live Menu scroll result and PageSpeed numbers, and record them in section 5.

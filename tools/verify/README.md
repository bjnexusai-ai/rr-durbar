# rr-verify: smoke and SEO checks (tasks 2a.6, 3.7, 10.5)

Two read-only scripts. Node 18+, no installs. They only GET, HEAD or OPTIONS: they never place an order or change anything.
Put them in the website repo, for example `tools/verify/` (a folder outside `public/`, so they are never deployed).

    unzip -o rr-verify.zip -d /workspaces/RR-Durbar/tools/verify
    cd /workspaces/RR-Durbar && node --test tools/verify/test/*.test.mjs      # expect 6 pass

## 1. smoke.mjs: run after EVERY deploy (replaces the manual "verify after every deploy" list)
    node tools/verify/smoke.mjs \
      --site https://rr-durbar-preview.ramana-peravali.workers.dev \
      --api  https://rr-durbar-api.ramana-peravali.workers.dev \
      --public public \
      --origins https://rr-durbar.ramana-peravali.workers.dev,https://rr-durbar-preview.ramana-peravali.workers.dev

Checks: home and checkout equal your local files (same SHA-256 prefix as `ship.sh`), logo/robots/sitemap have real content types (the SPA fallback trap in plan section 14),
`/api/prices` returns prices for all 8 Rista branches (AT BH HO MR PA PL PO SN), CORS allows each listed origin and refuses an unlisted one (no wildcard),
`/api/debug` is closed without the token, API sends `nosniff`. Prints PASS or FAIL per line. Exit code 1 if anything fails.
Add the production origins to `--origins` at cutover: `https://rrdurbar.com,https://www.rrdurbar.com`.

## 2. seocheck.mjs: run on preview after the Phase 3 split, and again after the DNS cutover (task 3.7)
    node tools/verify/seocheck.mjs --base https://rr-durbar-preview.ramana-peravali.workers.dev --canonical-base https://rrdurbar.com \
      --noindex /checkout/,/order-now/,/pickup/ \
      /,/about-us/,/menu/,/branches/,/catering/,/contact/,/loyalty/,/policies/,/privacy-policy/,/terms-of-service/,/refund-cancellation/
    (or: add --sitemap instead of the path list)

Checks the RAW HTML (what a crawler sees before JavaScript): one title, one h1, meta description, absolute canonical that points to itself, Open Graph tags,
no `?page=` links, JSON-LD parses, `noindex` present on order pages and ABSENT on public pages, titles/h1/descriptions unique across pages,
raw HTML under 600 KB. WARN lines are advice, FAIL lines fail the run.
Before cutover, public pages will FAIL "indexable page has no noindex" because `public/_headers` sends `X-Robots-Tag: noindex, nofollow` on every path.
That is expected, and it is the reminder to remove that line at cutover (plan 3.8).

## Limits
Not covered: real-device phone checks, Lighthouse and axe (plan 2b.3, 2b.4), image 404s (use `imgcheck.js`), and anything behind a login.
The tools were tested here against fake servers, not against your real Workers. Run them once on preview and read the output before trusting a green result.

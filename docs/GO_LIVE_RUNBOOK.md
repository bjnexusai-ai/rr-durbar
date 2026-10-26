# RR Durbar: go-live runbook (v1.1, 26 Oct 2026; v1.0 was 24 Oct)
v1.1 change: deploys are Git-connected. A push to `main` deploys the live website Worker `rr-durbar` and the API Worker `rr-durbar-api`. `./ship.sh preview` is the manual PREVIEW path only. Everything else is unchanged from v1.0.
Covers plan tasks 3.8a, 3.8, 10.5, 10.6 and the owner inputs that block them. Written for the deploy session and the owner. Nothing here has been executed.
Items marked **[VERIFY]** are my reading of documentation or the plan and must be confirmed on the day. Items marked **[GUESS]** are not verified.

## 1. The shortest honest path to go live (two separate go-lives)
**Go-live A: the new website on rrdurbar.com (no ordering needed).** Needs: Phase 3 SEO split done and checked on preview, owner approval, DNS access.
**Go-live B: online pickup ordering at MR, then the other outlets.** Needs: API routes finished and tested, MSG91 with DLT approval, PayU live merchant, Reelo answers, Rista push proven at a staffed test.
Do A first. B has long outside waits (DLT, PayU KYC), so START those waits now, in parallel with the code.

## 2. What blocks go-live, by lead time (owner actions first, because they are the slowest)
| # | Blocker | Who | Why it matters | Default if the owner does not answer |
|---|---|---|---|---|
| 1 | MSG91 account + DLT registration and OTP template approval | Owner | No OTP SMS means no login, no orders. DLT approval can take days. | None. Cannot ship ordering without it. |
| 2 | PayU TEST merchant key and salt, then LIVE merchant KYC | Owner | Hash and callback cannot be tested without it. Live KYC has its own wait. | None. |
| 3 | Reelo: answers R1 to R5, the 6 missing doc sections, production host, sandbox | Owner | Decides points earning. R5 matters most: if Rista already sends bills to Reelo, our own credit would double count. | Earn-only v1 stays OFF until R5 is answered. Orders do not wait for loyalty. |
| 4 | Rista: Sale and Payment models, tax/charges lines, one real invoice per outlet | Owner + Rista | The quote total must equal the Rista invoice (task 4.5). | None. Verify at a staffed test. |
| 5 | Legal pages approved, grievance officer named | Owner | Needed before payments (DPDP, plan 10.3). | Pages stay "draft", ordering does not launch. |
| 6 | Domain: who controls rrdurbar.com DNS and the registrar login | Owner | Needed for go-live A (section 3). | None. |
| 7 | Autonagar hours, outlet GPS (C32), dish descriptions, Menu old names, catering photos | Owner | Content gaps. Not blockers for B. Autonagar hours block its listing only. | Show "call for hours". |
Suggested single owner message: send items 1, 2, 3, 6 today. They have waits. The rest can follow.

## 3. Domain cutover (tasks 3.8a and 3.8): rrdurbar.com to the new website
### 3.1 What is known
- rrdurbar.com currently resolves to an old nginx server (65.1.235.112 in the plan) and its DNS is at Hostinger **[VERIFY: plan 22 Oct, re-check with `dig`]**. The old Petpooja site is mapped to the domain.
- A Cloudflare Worker Custom Domain needs an **active Cloudflare zone** for the domain, and cannot be created on a hostname that already has a CNAME record **[VERIFIED in Cloudflare docs, 24 Oct 2026]**. A plain A record at Hostinger cannot point at a Worker.
- So the domain's DNS (nameservers) must move to Cloudflare, in the CLIENT account (same account as the Workers).

### 3.2 The danger that is easy to miss: email and other records
The client's own logins use `@rrdurbar.com` addresses (the Cloudflare account itself is `Ramana.peravali@rrdurbar.com`), and orders go to `orders@rrdurbar.com`.
If the mail records (MX, SPF, DKIM, DMARC) are not copied exactly when DNS moves, **email stops**, including password-reset mail for the Cloudflare account.
Before touching anything: (a) find out who hosts the mailboxes (Hostinger mail, Google Workspace, Zoho, other); (b) make sure the Cloudflare account has a recovery method that does not depend on an rrdurbar.com mailbox; (c) take a full DNS export.

### 3.3 Pre-flight (all must be YES before the nameserver change)
1. Fresh DNS export saved: every record at Hostinger (screenshot AND text), including MX, TXT (SPF, DKIM, DMARC, Google/Search Console verification), CNAME, SRV. Save in the repo under `docs/dns-export-2026-MM-DD.txt` (no secrets in DNS).
2. Zone `rrdurbar.com` added in the client Cloudflare account. Cloudflare scans and proposes records: compare line by line with the export. Add anything missing. Leave every mail record as DNS-only (grey cloud).
3. Registrar login works; DNSSEC at the registrar is OFF, or is disabled before the change **[VERIFY at Hostinger]**.
4. Lower the TTL of the important records at Hostinger to 300 seconds, 24 hours before.
5. Phase 3 split and `seocheck.mjs` clean on preview. `smoke.mjs` clean on live workers.dev.
6. Owner has approved the go-live time. Pick a quiet time (not lunch or dinner service), a weekday morning.
7. Rollback owner named, with the Hostinger nameserver values written down.

### 3.4 Cutover steps (deploy session does these with the owner)
1. At the registrar, change the nameservers to the two Cloudflare ones shown for the zone. The old Hostinger DNS stays untouched as the rollback.
2. Wait until Cloudflare shows the zone **Active** (minutes to hours; up to 24 to 48 hours is possible). Until then the old site keeps working.
3. Check mail still works (send and receive a test message) BEFORE doing anything else.
4. In the zone's DNS, remove the apex `rrdurbar.com` A record and the `www` record that point to the old server **[GUESS: Cloudflare may refuse to create the Custom Domain while they exist; do the delete and the next step in one sitting, because the site is down in between]**.
5. Worker `rr-durbar` (live), Settings, Domains and Routes, Add, Custom Domain: add `rrdurbar.com`, then `www.rrdurbar.com`. Cloudflare issues the certificate.
6. Redirect `www` to the root (or the reverse, owner's choice) so there is one canonical host **[VERIFY: Cloudflare Redirect Rules or a Worker rule]**.
7. Code change (deploy session, preview first): remove the `X-Robots-Tag: noindex, nofollow` line from `public/_headers`; canonical, Open Graph and sitemap URLs on `https://rrdurbar.com`. Ship preview, run `seocheck.mjs`, then live.
8. API: add `https://rrdurbar.com` and `https://www.rrdurbar.com` to `ALLOWED_ORIGINS`, redeploy the API, run `smoke.mjs` with the new origins.
9. `smoke.mjs --site https://rrdurbar.com` and `seocheck.mjs --base https://rrdurbar.com`. Phone test on mobile data, not Wi-Fi.
10. Search Console: verify the domain property (TXT record in the zone), submit `sitemap.xml`, URL Inspection "View crawled page" on `/about-us/` and `/menu/` (task 3.7). Update Google Business Profile links.
11. Keep the old site and the Petpooja mapping for at least a week. Remove the mapping only when the owner confirms the new site is live and orders (if any) are fine.

### 3.5 Rollback
- Before step 1: nothing to roll back.
- After step 1: change the nameservers back at the registrar to the Hostinger values. **This is not instant** (DNS caches, minutes to hours) **[GUESS: lower TTLs in 3.3 step 4 shorten it]**. That is why the zone is checked fully and mail is tested before the site is switched.
- Site problem only (DNS fine): `git revert <commit>` in `/workspaces/rr-durbar` and push to `main` (the push deploys), then run the smoke test.

### 3.6 Production address for the API **[DECISION NEEDED]**
Contract v1 assumes same-origin `/api`. Today the API is on its own workers.dev address. Recommended: add a Custom Domain `api.rrdurbar.com` to `rr-durbar-api` (same zone), change the website's API base once, add CORS for the site origins. A Route such as `rrdurbar.com/api/*` is possible but I have not verified how it ranks against the website's Custom Domain **[VERIFY before choosing it]**.

## 4. Ordering launch sequence (go-live B)
1. **Staging with mock providers** (4.7): mock OTP, mock payment, mock Reelo, mock Rista. Done when quote equals Rista price and the state-machine tests pass.
2. **Real keys on staging**: MSG91 real SMS to the owner's phone (5.3), PayU test payments including failure, cancel, closed tab, duplicate callback and webhook, wrong hash, tampered amount (7.5).
3. **Rista**: staffed test at MR; the order appears on the counter screen and prints a KOT (8.6). Check amount against the Rista invoice (4.5).
4. **Hardening** (10.1, 10.2, 10.4): Turnstile ON, rate limits, alerts to the owner, forms really deliver, test-order path removed or locked.
5. **Checklist**: run plan section 10 completely. Record the result in the plan.
6. **Flags**: `ONLINE_ORDER_LIVE=true`, `ONLINE_OUTLETS_LIVE=moghalrajpuram`. Owner and staff place 3 to 5 real orders.
7. **Other outlets** one at a time through `ONLINE_OUTLETS_LIVE`, each after 3 to 5 real orders. Patamatalanka stays call-only.
Daily for the first week: reconcile PayU against Rista (8.5) and check for orders in REFUND_NEEDED.

## 5. Rollback table
| Layer | How | Time |
|---|---|---|
| Website code | `git revert <commit>`, push to `main` (deploys); `./ship.sh preview` only to check preview first | minutes |
| API code | `git revert <commit>` in `/workspaces/rr-durabr-api`, push to `main` (deploys) | minutes |
| Ordering off | set `ONLINE_ORDER_LIVE=false`: every ordering endpoint answers 503, the menu keeps working | one deploy |
| One outlet off | remove it from `ONLINE_OUTLETS_LIVE` | one deploy |
| Database | migrations are append-only; `tools/rollback_dev_only.sql` is for an EMPTY database only. Never run it with real orders | n/a |
| Domain | nameservers back to Hostinger (3.5) | minutes to hours |

# RR Durbar CMS (Sanity): setup and rules

The owner edits the website text, photos, outlet details, offers and policy pages in the Studio.
The site build reads that content, checks it, and writes one file: `cms-out/site-data.json`. The split pages use that file.
**Prices and availability never come from the CMS.** They come live from Rista through the API.

## What is in the repo (no secrets)

| Path | What it is |
|---|---|
| `cms/routes.js` | The 16 pages and the sections each page has. Matches the route map in `public/index.html`, plus the new `loyalty` page (plan 9.4). |
| `cms/schemaTypes/` | The edit forms: Business details, Outlets, Pages (with sections), Dish cards, Offers, Policy pages. |
| `cms/sanity.config.js`, `cms/sanity.cli.js`, `cms/package.json` | The Studio. Versions are pinned. |
| `cms/seed/seed.ndjson` | First content, 72 items, taken **from the live site** (nothing typed in by hand). |
| `tools/cms/seed_from_site.py` | Rebuilds the seed from `public/index.html`. |
| `tools/cms/cms-build.mjs`, `cms-lib.mjs` | Checks the content and writes `cms-out/site-data.json`. |
| `tools/cms/cms-ids.lock.json` | Locked outlet codes, Rista codes, addresses and dish names. |
| `tools/cms/cms.test.mjs` | 12 tests. |

## The rules the build enforces (any ERROR = nothing is written, the site keeps its last good content)

- **No prices.** A price, amount, paise or MRP field, or a rupee amount in a dish card, stops the build.
- **Outlets.** There are exactly the 6 known codes. Each Rista code is fixed (SN MR BH PO AT PL).
- **Patamatalanka** is call-to-order only (D3).
- **Hours** are HH:MM, or "Call for hours" is ticked.
- **Phone** is +91 with 10 digits.
- **PIN code** is 5xxxxx.
- **Lock.**
  - A locked Rista code cannot change.
  - An address change needs new GPS.
  - An outlet cannot be deleted: untick "Show on the website" instead.
- **GPS** reaches Google only after "GPS checked" is ticked (C32). It must also fall inside Vijayawada.
- **Founding year** reaches Google only after "Year confirmed" is ticked (D5). Until then, a "1991" in page text gives a warning.
- **Sections** go only on a page that really has them (from `cms/routes.js`). A page outside the site list stops the build.
- **Policy pages** publish only after "Approved by the owner" is ticked. Drafts are skipped and the site keeps its current text.
- **Placeholder text** in anything published stops the build: lorem ipsum, TODO, `[Grievance officer name]` and similar.
- **Offers** show only between their start and end times, and only while active.
- **Sanity down or empty** stops the build. Nothing changes.
- **Warnings** do not stop the build. They cover: a Google title or description missing or too long, sections imported from the live site but not yet reviewed, and draft policy pages.

## Order of setup

1. **Wait.** Turn the CMS on only after:
   - The Swagramam CMS dry run passes (decision: the sister project goes first).
   - The page split exists, because the split pages read `site-data.json`. Until then the build is check-only.
2. **Owner: create a new Sanity project** named "RR Durbar", with dataset `production`.
   - Keep it separate from Swagramam and never share the two.
   - Send the builder only the **project id**. It is not a secret.
3. **Read token.** Only needed if the dataset is set to private.
   - The owner creates a **Viewer** token in Sanity.
   - The deploy session stores it as `SANITY_READ_TOKEN` in the build settings, at a hidden prompt.
   - Never put it in chat, the repo, `.env` committed files or a zip.
4. **Studio on the Codespace.**
   - Inside `cms/`, create `cms/.env` with `SANITY_STUDIO_PROJECT_ID=<id>`. That file is ignored by git.
   - Then run `npm install` and `npm run dev`.
   - Publishing the Studio to the web is a deploy step, done by the deploy session.
5. **Import the seed.** The deploy session imports `cms/seed/seed.ndjson` into the dataset. This is a write to Sanity.
6. **Owner reviews in the Studio:**
   - Business details.
   - Each outlet: tick GPS checked only after looking at the pin on the map.
   - Each page's sections, clearing the "imported" tick.
   - Dish names and photos (see `docs/dish-photo-table-2026-10-26.md`).
   - The policy pages (tick Approved only after the lawyer/owner check, plan 10.3).
7. **Builder dry run against Sanity.** Run `node tools/cms/cms-build.mjs --check` with `SANITY_PROJECT_ID` set. Expect `CHECK ONLY: content is valid`.
8. **Wire into the page build** (task in plan 23). The split pages take titles, sections, outlets, Google data, dish names and photos, offers, and approved policy text from `site-data.json`.
9. **Re-run the lock.** After the first good live run, refresh the lock with `--update-lock` and commit it. Only do this when an outlet change was intended.

## Check it offline (no Sanity needed)

```
node tools/cms/cms-build.mjs --input cms/seed/seed.ndjson --check
node --test tools/cms/cms.test.mjs
```
Expected results:
- The first command prints `CHECK ONLY: content is valid (22 warning(s))`. The warnings are the imported sections, the loyalty page without a Google title, the 3 draft policy pages, and the unconfirmed year.
- The second prints `pass 12, fail 0`.

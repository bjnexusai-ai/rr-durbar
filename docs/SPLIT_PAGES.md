# Page split (plan 3.1), step A: one real page per address

`tools/split/split_pages.py` builds `public/<page>/index.html` for 14 pages FROM `public/index.html`.
Each page holds only its own sections. It has its own title, description, canonical address and Open Graph tags, and `noindex` on the order pages.
`public/index.html` is not changed.

## After any change to public/index.html (content, styles, scripts)
```
python3 tools/split/split_pages.py && python3 tools/verify/routecheck.py public | tail -3 && python3 tools/split/compare_split.py public | tail -3
```
- Commit `public/index.html` together with the 14 regenerated page files, by explicit path.
- Never edit a page file by hand: it is overwritten on the next run.
- If the script says STOP, the router code in `index.html` changed. Ask the builder to update the script.

## What the checks prove (26 Oct)
- **routecheck:** each of the 14 pages has its own title, canonical address and one h1, and only its own sections. The pickup menu page has no h1; that is only a warning, because it is an order page and not in Google.
  - The 3 remaining errors are all `home`, which is step B.
  - The new loyalty page (9.4) is not built yet, which is a warning.
- **compare_split:** in a real browser at 390 and 1280 width, every new page matches today's `/?page=<page>`.
  - The visible text is the same.
  - There are no new script errors and no broken images.
  - The first screen differs by under 0.2% (the scrollbar).
  - A link to another page loads that page's own address and keeps `?outlet=` and `?category=`.

## Step B (separate change, after the owner looks at step A on preview)
1. The home page also becomes its own file, with only the home sections.
2. Old `?page=X` links (Google, WhatsApp shares) are sent to `/X/`. This needs a decision: where content is edited from then on. The full source file moves out of `public/`, and `public/index.html` becomes generated too.
3. `/our-story/` gets a 301 to `/about-us/`. `/locations/` gets a 301 to `/branches/` after the owner approves (19.2 item 11).

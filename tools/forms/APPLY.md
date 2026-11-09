# Forms to Web3Forms (catering + contact)

The access key is NOT in this zip. The patch puts the placeholder `__WEB3FORMS_KEY__` in `src/site.html`; step 1 asks you for the key at a hidden prompt and swaps it in.

## 1. Apply (run from the repo root, in your Codespace)
```bash
git pull origin perf-fixes-28oct && unzip -o ~/Downloads/rr-forms.zip && python3 tools/forms/patch_forms.py \
&& read -rsp "Web3Forms access key (hidden): " K && echo \
&& [[ "$K" =~ ^[0-9a-fA-F-]{36}$ ]] && sed -i "s/__WEB3FORMS_KEY__/$K/" src/site.html && unset K \
&& ! grep -q "__WEB3FORMS_KEY__" src/site.html && bash tools/patches/rebuild.sh
```
Expected: `patched: 2 honeypots, Web3Forms submit, helpers ...`, then a hidden prompt (nothing shows as you paste), then the rebuild lines ending in `RESULT: 0 error(s), 1 warning(s)`. If the key is not a 36-character UUID the command stops before changing anything, and the placeholder stays.

## 2. Test
```bash
(cd public && python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1; timeout 280 python3 tools/forms/forms_test.py 2>&1 | grep -E "PASS|FAIL|RESULT"
```
Expected: all `PASS`, last line `RESULT: 0 failed`. (The test uses the mocked Web3Forms request and never sends a real email. It reads the key from the built page, so it works with the real key too.)

## 3. Commit and push
```bash
git add src/site.html tools/forms/patch_forms.py tools/forms/forms_test.py tools/forms/APPLY.md public && git commit -m "Forms: Web3Forms for catering + contact" && git push origin perf-fixes-28oct && git merge-base --is-ancestor origin/main HEAD && git push origin perf-fixes-28oct:main
```
Do not add the zip or any `*.bak*` files.

## Notes
- A Web3Forms key is public by design (it is visible in the page). In the Web3Forms dashboard, limit it to rrdurbar.com so nobody else can use it.
- After going live, send one real test enquiry from each form and check the email arrives.

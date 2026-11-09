# Forms polish: readable email fields, nice date, Call + WhatsApp, Submitted from

Builds on the forms patch that is already on main. It does NOT touch the access key (no key prompt this time).

## 1. Apply (repo root, in your Codespace)
```bash
git pull origin perf-fixes-28oct && unzip -o ~/Downloads/rr-forms2.zip && python3 tools/forms/patch_forms2.py && bash tools/patches/rebuild.sh
```
Expected: `patched: readable field names, nice date, Call + WhatsApp, Submitted from, subject fallbacks (key untouched)`, then the rebuild lines ending in `RESULT: 0 error(s), 1 warning(s)`. A 2nd run of the patch says `already done`.

## 2. Test
```bash
(cd public && python3 -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1; timeout 280 python3 tools/forms/forms_test.py 2>&1 | grep -E "PASS|FAIL|RESULT"
```
Expected: all `PASS`, last line `RESULT: 0 failed`. The Web3Forms request is mocked, so no email is sent.

## 3. Commit and push
```bash
git add src/site.html tools/forms/patch_forms2.py tools/forms/forms_test.py tools/forms/APPLY2.md public ':!*.bak*' && git commit -m "Forms: readable email fields, Call/WhatsApp, Submitted from" && git push origin perf-fixes-28oct && git merge-base --is-ancestor origin/main HEAD && git push origin perf-fixes-28oct:main
```
Do not add the zip or any `*.bak*` files.

## 4. After it is live
Send one real catering enquiry. The email should show: Name, Phone, Email, Event type, Event date (like `12 Dec 2026`), Number of guests, Venue / location, Requirements, Call, WhatsApp, Submitted from. Press Reply and check the To address is the customer's email.

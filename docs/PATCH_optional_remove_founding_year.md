# OPTIONAL patch: remove the printed founding year from the Google data (decision D5)

Apply ONLY if the owner says so. D5 says: do not print the year "1991" until it is confirmed. The live site prints it inside the
Organization JSON-LD (invisible to visitors, read by Google). If the owner CONFIRMS 1991, do not apply this; keep it.

File: `public/index.html` in `/workspaces/rr-durbar` (expected hash before: b1d4b89eae0468a6).
Checked by the builder on 26 Oct: the OLD string occurs exactly once in the live file.

OLD (exactly once):
```
"url": "https://rrdurbar.com/", "foundingDate": "1991", "telephone": "+9177
```
NEW:
```
"url": "https://rrdurbar.com/", "telephone": "+9177
```
One command (website Codespace, prompt `/workspaces/rr-durbar`; stops if the text is not found exactly once):
```
cd /workspaces/rr-durbar && python3 -c "import pathlib;p=pathlib.Path('public/index.html');s=p.read_text(encoding='utf-8');o='\"url\": \"https://rrdurbar.com/\", \"foundingDate\": \"1991\", \"telephone\": \"+9177';assert s.count(o)==1,'not found once';p.write_text(s.replace(o,'\"url\": \"https://rrdurbar.com/\", \"telephone\": \"+9177'),encoding='utf-8');print('patched')" && git diff --stat
```
Expect `patched` and `1 file changed, 1 insertion(+), 1 deletion(-)`. Preview first (`./ship.sh preview`), check, then commit by explicit path. The visible logo ribbon is NOT changed by this patch.

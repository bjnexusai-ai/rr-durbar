#!/usr/bin/env python3
"""
css_balance_check.py - find <style> blocks whose braces/comments are not closed.

A browser silently closes an open { at the end of a <style> tag. When many <style>
blocks are merged into ONE css file, that open { swallows every rule after it
(for example inside @media (prefers-reduced-motion: reduce) { ... }).

  python3 tools/perf/css_balance_check.py src/site.html            # report only
  python3 tools/perf/css_balance_check.py src/site.html --fix      # add the missing closers (backup: .bak)
Exit code 1 if any block is unbalanced (use it as a test).
"""
import re, sys
from pathlib import Path

STYLE = re.compile(r'(<style\b[^>]*>)(.*?)(</style>)', re.I | re.S)

def scan(css):
    """return (open_braces, in_comment, in_string) at end of css"""
    depth = 0; i = 0; n = len(css); in_str = None
    while i < n:
        c = css[i]
        if in_str:
            if c == '\\': i += 2; continue
            if c == in_str: in_str = None
        elif c == '/' and css[i:i+2] == '/*':
            j = css.find('*/', i + 2)
            if j == -1: return depth, True, None
            i = j + 2; continue
        elif c in '"\'': in_str = c
        elif c == '{': depth += 1
        elif c == '}': depth = max(0, depth - 1)
        i += 1
    return depth, False, in_str

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    path = Path(sys.argv[1]); fix = "--fix" in sys.argv
    html = path.read_text(encoding="utf-8")
    bad = []; out = []; last = 0
    for k, m in enumerate(STYLE.finditer(html), 1):
        body = m.group(2)
        depth, in_c, in_s = scan(body)
        if depth or in_c or in_s:
            line = html.count("\n", 0, m.start(2)) + 1
            bad.append((k, line, depth, in_c, in_s, body.rstrip()[-110:].replace("\n", " ")))
            if fix:
                add = ("*/" if in_c else "") + ('"' if in_s == '"' else "'" if in_s == "'" else "")
                body = body.rstrip() + "\n" + add + "}" * depth + "\n"
        out.append(html[last:m.start(2)]); out.append(body); last = m.end(2)
    out.append(html[last:])
    total = len(STYLE.findall(html))
    print(f"{path}: {total} <style> blocks, {len(bad)} unbalanced")
    for k, line, depth, in_c, in_s, tail in bad:
        why = []
        if depth: why.append(f"{depth} unclosed '{{'")
        if in_c: why.append("unclosed /* comment")
        if in_s: why.append("unclosed string")
        print(f"  block #{k} (starts line {line}): {', '.join(why)}\n      ends with: ...{tail}")
    if fix and bad:
        path.with_suffix(path.suffix + ".bak").write_text(html, encoding="utf-8")
        path.write_text("".join(out), encoding="utf-8")
        print(f"FIXED {len(bad)} block(s). Backup: {path}.bak")
    sys.exit(1 if bad and not fix else 0)

if __name__ == "__main__":
    main()

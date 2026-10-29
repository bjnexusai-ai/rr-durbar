#!/usr/bin/env python3
"""
slim_html.py - make a heavy single-file HTML light.

What it does (on ONE html file, normally the source: public/index.html):
  1. base64 images (<img src="data:..."> and CSS url(data:image/...)) -> /assets/img/<hash>.webp
     - adds width/height to <img> when missing
     - loading="lazy" decoding="async" on every <img> except the first --eager N
     - first image gets fetchpriority="high" and a <link rel="preload"> in <head>
  2. big inline <style> blocks   -> /assets/site.css   (only blocks >= --min-bytes)
  3. big inline classic <script> -> /assets/site.js    (loaded with defer)
     (JSON-LD and other non-JS types are never touched)

Usage:
  python3 tools/perf/slim_html.py public/index.html --out public --dry-run
  python3 tools/perf/slim_html.py public/index.html --out public

Run it on the SOURCE file, then regenerate the pages with split_pages.py.
Always keeps a backup: <file>.bak (git-ignored if you add *.bak to .gitignore).
"""
import argparse, base64, hashlib, io, re, sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow missing. Run: pip install pillow")

DATA_IMG = re.compile(r'data:image/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)', re.I)
IMG_TAG = re.compile(r'<img\b[^>]*>', re.I | re.S)
STYLE_BLK = re.compile(r'<style\b([^>]*)>(.*?)</style>', re.I | re.S)
SCRIPT_BLK = re.compile(r'<script\b([^>]*)>(.*?)</script>', re.I | re.S)


def to_webp(raw, max_w, quality):
    im = Image.open(io.BytesIO(raw))
    im.load()
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "transparency" in im.info or im.mode == "P" else "RGB")
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue(), im.width, im.height


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--out", default="public", help="site folder (assets go in <out>/assets)")
    ap.add_argument("--max-width", type=int, default=1200)
    ap.add_argument("--quality", type=int, default=76)
    ap.add_argument("--eager", type=int, default=1, help="first N images are NOT lazy (hero)")
    ap.add_argument("--min-bytes", type=int, default=2000, help="move inline css/js only if >= this")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    src = Path(a.html)
    html = src.read_text(encoding="utf-8")
    before = len(html.encode("utf-8"))
    out = Path(a.out)
    img_dir = out / "assets" / "img"
    seen = {}      # hash -> (url, w, h)
    stats = {"img": 0, "img_bytes_in": 0, "img_bytes_out": 0}
    pending = []   # (path, bytes)

    def convert(b64):
        raw = base64.b64decode(re.sub(r"\s+", "", b64))
        h = hashlib.sha1(raw).hexdigest()[:10]
        if h not in seen:
            webp, w, hh = to_webp(raw, a.max_width, a.quality)
            seen[h] = (f"/assets/img/{h}.webp", w, hh)
            pending.append((img_dir / f"{h}.webp", webp))
            stats["img"] += 1
            stats["img_bytes_in"] += len(raw)
            stats["img_bytes_out"] += len(webp)
        return seen[h]

    # ---- 1a. <img> tags
    order = {"n": 0}
    first_url = {"u": None}

    def fix_img(m):
        tag = m.group(0)
        sm = re.search(r'\ssrc\s*=\s*(["\'])(data:image/[^"\']+)\1', tag, re.I)
        if not sm:
            return tag
        dm = DATA_IMG.search(sm.group(2))
        if not dm:
            return tag
        url, w, h = convert(dm.group(2))
        tag = tag.replace(sm.group(0), f' src="{url}"')
        if not re.search(r'\swidth\s*=', tag, re.I):
            tag = tag[:-1].rstrip("/ ") + f' width="{w}"' + tag[-1:]
        if not re.search(r'\sheight\s*=', tag, re.I):
            tag = tag[:-1].rstrip("/ ") + f' height="{h}"' + tag[-1:]
        # remove old loading/decoding/fetchpriority then set ours
        tag = re.sub(r'\s(loading|decoding|fetchpriority)\s*=\s*(["\'])[^"\']*\2', "", tag, flags=re.I)
        order["n"] += 1
        if order["n"] <= a.eager:
            if first_url["u"] is None:
                first_url["u"] = url
            extra = ' fetchpriority="high" decoding="async"'
        else:
            extra = ' loading="lazy" decoding="async"'
        tag = tag[:-1].rstrip("/ ") + extra + tag[-1:]
        if not re.search(r'\salt\s*=', tag, re.I):
            tag = tag[:-1].rstrip("/ ") + ' alt=""' + tag[-1:]
        return tag

    html = IMG_TAG.sub(fix_img, html)

    # ---- 1b. data images left anywhere else (CSS url(), inline style, JS strings)
    def fix_other(m):
        url, _, _ = convert(m.group(2))
        return url

    html = DATA_IMG.sub(fix_other, html)

    # ---- 2. inline CSS
    css_parts = []

    def move_css(m):
        attrs, body = m.group(1), m.group(2)
        if re.search(r'\b(media|type)\s*=', attrs, re.I) and not re.search(r'type\s*=\s*["\']text/css', attrs, re.I):
            return m.group(0)
        if len(body.encode("utf-8")) < a.min_bytes:
            return m.group(0)
        css_parts.append(body.strip())
        if len(css_parts) == 1:
            return '<link rel="stylesheet" href="/assets/site.css">'
        return ""

    html = STYLE_BLK.sub(move_css, html)

    # ---- 3. inline JS (classic only)
    js_parts = []
    JS_OK = re.compile(r'^\s*$|text/javascript|application/javascript', re.I)

    head_end = html.lower().find("</head>")

    def move_js(m):
        attrs, body = m.group(1), m.group(2)
        if re.search(r'\bsrc\s*=', attrs, re.I):
            return m.group(0)
        tm = re.search(r'type\s*=\s*["\']([^"\']*)["\']', attrs, re.I)
        if tm and not JS_OK.search(tm.group(1)):
            return m.group(0)           # JSON-LD, speculationrules, module, importmap...
        if re.search(r'\b(type\s*=\s*["\']module)', attrs, re.I):
            return m.group(0)
        in_head = m.start() < head_end
        if in_head and len(body.encode("utf-8")) < a.min_bytes:
            return m.group(0)          # tiny head scripts stay (run early)
        js_parts.append(body.strip().rstrip(";") + ";")
        return ""

    html = SCRIPT_BLK.sub(move_js, html)

    # ---- head insertions
    head_add = ""
    if first_url["u"]:
        head_add += f'<link rel="preload" as="image" href="{first_url["u"]}" fetchpriority="high">\n'
    if head_add:
        html = re.sub(r'(</head>)', head_add + r'\1', html, count=1, flags=re.I)
    if js_parts:
        html = re.sub(r'(</body>)', '<script src="/assets/site.js" defer></script>\n\\1', html, count=1, flags=re.I)

    after = len(html.encode("utf-8"))
    print(f"HTML size : {before/1024:.0f} KiB -> {after/1024:.0f} KiB")
    print(f"Images    : {stats['img']} files, {stats['img_bytes_in']/1024:.0f} KiB -> {stats['img_bytes_out']/1024:.0f} KiB (webp)")
    print(f"CSS moved : {len(css_parts)} block(s), {sum(len(x) for x in css_parts)/1024:.0f} KiB")
    print(f"JS moved  : {len(js_parts)} block(s), {sum(len(x) for x in js_parts)/1024:.0f} KiB")
    if a.dry_run:
        print("DRY RUN: nothing written.")
        return
    img_dir.mkdir(parents=True, exist_ok=True)
    for p, b in pending:
        p.write_bytes(b)
    if css_parts:
        (out / "assets").mkdir(parents=True, exist_ok=True)
        (out / "assets" / "site.css").write_text("\n".join(css_parts) + "\n", encoding="utf-8")
    if js_parts:
        (out / "assets").mkdir(parents=True, exist_ok=True)
        (out / "assets" / "site.js").write_text("\n".join(js_parts) + "\n", encoding="utf-8")
    Path(str(src) + ".bak").write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
    src.write_text(html, encoding="utf-8")
    print(f"WROTE {src}  (backup: {src}.bak)")


if __name__ == "__main__":
    main()

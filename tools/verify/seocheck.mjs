#!/usr/bin/env node
// SEO and content check for the page split (plan task 3.7 and the "Site" part of section 10). Node 18+, no dependencies. Read-only.
//
//   node seocheck.mjs --base https://rr-durbar-preview.ramana-peravali.workers.dev --canonical-base https://rrdurbar.com \
//        --noindex /checkout/,/order-now/,/pickup/ /,/about-us/,/menu/,/branches/
// The last argument is a comma list of paths to check (or --sitemap to read them from /sitemap.xml). Exit 1 on any FAIL.
// Regex based on purpose (no HTML parser needed). It checks what a crawler sees in the RAW HTML, before any JavaScript runs.
import { pathToFileURL } from 'node:url';

const strip = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const tagAll = (html, re) => [...html.matchAll(re)];
const metaContent = (html, attr, val) => {
  const m = tagAll(html, /<meta\b[^>]*>/gi).map((x) => x[0]).find((t) => new RegExp(`${attr}\\s*=\\s*["']${val}["']`, 'i').test(t));
  const c = m && m.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
  return c ? (c[1] ?? c[2]) : null;
};

export function inspectPage(html, headers = {}) {
  const titles = tagAll(html, /<title[^>]*>([\s\S]*?)<\/title>/gi).map((m) => strip(m[1]));
  const h1s = tagAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map((m) => strip(m[1]));
  const canon = tagAll(html, /<link\b[^>]*>/gi).map((x) => x[0]).find((t) => /rel\s*=\s*["']canonical["']/i.test(t));
  const canonical = canon ? (canon.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i) || [])[1] || null : null;
  const robotsMeta = (metaContent(html, 'name', 'robots') || '').toLowerCase();
  const xrobots = String(headers['x-robots-tag'] || '').toLowerCase();
  const ld = tagAll(html, /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi).map((m) => m[1]);
  let ldBad = 0; for (const j of ld) { try { JSON.parse(j); } catch { ldBad++; } }
  return {
    title: titles[0] || '', titleCount: titles.length, h1: h1s, description: metaContent(html, 'name', 'description') || '', canonical,
    og: ['og:title', 'og:description', 'og:image'].filter((p) => !metaContent(html, 'property', p)),
    noindex: /noindex/.test(robotsMeta) || /noindex/.test(xrobots), siteWideHeaderNoindex: /noindex/.test(xrobots),
    pageParamLinks: tagAll(html, /href\s*=\s*["'](?:\/)?\?page=[^"']*["']/gi).length, ldCount: ld.length, ldBad, bytes: Buffer.byteLength(html),
  };
}

export async function runSeo({ base, canonicalBase, paths, noindexPaths = [], maxBytes = 600000, fetchImpl = fetch }) {
  base = base.replace(/\/$/, ''); canonicalBase = (canonicalBase || base).replace(/\/$/, '');
  const out = []; const add = (page, name, ok, detail = '', warn = false) => out.push({ page, name, ok: Boolean(ok), detail, warn });
  const seen = { title: new Map(), h1: new Map(), description: new Map() };
  for (const path of paths) {
    let r, html = '';
    try { r = await fetchImpl(base + path, { redirect: 'manual' }); html = await r.text(); } catch (e) { add(path, 'fetch', false, String(e.message)); continue; }
    const headers = Object.fromEntries([...r.headers.entries()]);
    add(path, 'status 200', r.status === 200, `status ${r.status}`);
    const p = inspectPage(html, headers);
    const mustBeNoindex = noindexPaths.includes(path);
    add(path, 'one non-empty title', p.titleCount === 1 && p.title.length > 0, `${p.titleCount} title(s)`);
    add(path, 'title length 15-70', p.title.length >= 15 && p.title.length <= 70, `${p.title.length} chars`, true);
    add(path, 'meta description 70-170', p.description.length >= 70 && p.description.length <= 170, `${p.description.length} chars`, true);
    add(path, 'exactly one h1', p.h1.length === 1, `${p.h1.length} h1`);
    const want = canonicalBase + path;
    add(path, 'canonical is absolute and points to itself', p.canonical === want, `got ${p.canonical}, want ${want}`);
    add(path, 'Open Graph title, description, image', p.og.length === 0, p.og.length ? `missing ${p.og.join(', ')}` : '', true);
    add(path, 'no ?page= links', p.pageParamLinks === 0, `${p.pageParamLinks} link(s)`);
    add(path, 'JSON-LD blocks parse', p.ldBad === 0, `${p.ldCount} block(s), ${p.ldBad} broken`);
    add(path, `raw HTML under ${maxBytes} bytes`, p.bytes <= maxBytes, `${p.bytes} bytes`, true);
    if (mustBeNoindex) add(path, 'order page is noindex', p.noindex, p.noindex ? '' : 'missing noindex');
    else {
      add(path, 'indexable page has no noindex', !p.noindex, p.noindex ? (p.siteWideHeaderNoindex ? 'X-Robots-Tag header (remove from _headers at cutover)' : 'robots meta') : '');
      for (const k of ['title', 'description']) { if (p[k]) seen[k].set(p[k], [...(seen[k].get(p[k]) || []), path]); }
      if (p.h1[0]) seen.h1.set(p.h1[0], [...(seen.h1.get(p.h1[0]) || []), path]);
    }
  }
  for (const k of ['title', 'h1', 'description']) for (const [val, pages] of seen[k]) if (pages.length > 1) add(pages.join(' and '), `unique ${k}`, false, `same ${k}: "${val.slice(0, 50)}"`);
  return out;
}

export function reportSeo(results) {
  for (const r of results) console.log(`${r.ok ? 'PASS' : r.warn ? 'WARN' : 'FAIL'}  ${r.page.padEnd(14)} ${r.name}${r.detail ? '  (' + r.detail + ')' : ''}`);
  const bad = results.filter((r) => !r.ok && !r.warn).length, warn = results.filter((r) => !r.ok && r.warn).length;
  console.log(`\n${results.length - bad - warn} passed, ${warn} warnings, ${bad} failed`);
  return bad;
}

const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : undefined; };
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const base = arg('base');
  if (!base) { console.log('Usage: node seocheck.mjs --base <url> [--canonical-base <url>] [--noindex /a/,/b/] </,/about-us/,... | --sitemap>'); process.exit(2); }
  let paths = process.argv.slice(2).filter((a, i, all) => a.startsWith('/') && !['--base', '--canonical-base', '--noindex'].includes(all[i - 1])).flatMap((a) => a.split(','));
  if (process.argv.includes('--sitemap')) {
    const x = await (await fetch(base.replace(/\/$/, '') + '/sitemap.xml')).text();
    paths = [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  }
  process.exit(reportSeo(await runSeo({ base, canonicalBase: arg('canonical-base'), paths, noindexPaths: (arg('noindex') || '').split(',').filter(Boolean) })) ? 1 : 0);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runSmoke } from '../smoke.mjs';
import { runSeo, inspectPage } from '../seocheck.mjs';

const listen = (handler) => new Promise((res) => { const s = http.createServer(handler); s.listen(0, '127.0.0.1', () => res({ s, url: `http://127.0.0.1:${s.address().port}` })); });
const OK_ORIGIN = 'https://rr-durbar.example.workers.dev';

function fixtureDir() {
  const d = mkdtempSync(join(tmpdir(), 'rr-pub-'));
  mkdirSync(join(d, 'checkout')); mkdirSync(join(d, 'assets/logo'), { recursive: true });
  writeFileSync(join(d, 'index.html'), '<html>home</html>'); writeFileSync(join(d, 'checkout/index.html'), '<html>checkout</html>');
  writeFileSync(join(d, 'assets/logo/rr-logo-800.webp'), 'RIFFxxxxWEBP'); writeFileSync(join(d, 'robots.txt'), 'User-agent: *');
  return d;
}
const siteHandler = (over = {}) => (req, res) => {
  const t = { '/': ['text/html', '<html>home</html>'], '/checkout/': ['text/html', '<html>checkout</html>'], '/assets/logo/rr-logo-800.webp': ['image/webp', 'RIFFxxxxWEBP'], '/robots.txt': ['text/plain', 'User-agent: *'], ...over }[req.url];
  if (!t) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end('<html>spa fallback</html>'); }
  res.writeHead(200, { 'content-type': t[0] }); res.end(t[1]);
};
const apiHandler = (o = {}) => (req, res) => {
  const origin = req.headers.origin;
  const h = { 'content-type': 'application/json', 'x-content-type-options': 'nosniff' };
  if (origin && (o.wildcard || origin === OK_ORIGIN)) h['access-control-allow-origin'] = o.wildcard ? '*' : origin;
  if (req.url.startsWith('/api/debug')) { res.writeHead(o.debugOpen ? 200 : 401, h); return res.end('{}'); }
  if (req.url.startsWith('/api/prices?branch=PL') && o.plEmpty) { res.writeHead(200, h); return res.end('{"prices":{}}'); }
  res.writeHead(200, h); res.end('{"prices":{"1":100}}');
};

test('smoke: healthy site and API pass everything', async () => {
  const a = await listen(siteHandler()), b = await listen(apiHandler()), d = fixtureDir();
  const r = await runSmoke({ site: a.url, api: b.url, publicDir: d, origins: [OK_ORIGIN] });
  a.s.close(); b.s.close();
  assert.deepEqual(r.filter((x) => !x.ok).map((x) => x.name), []);
  assert.ok(r.length >= 17);
});
test('smoke: catches a stale deploy (hash differs), a fake logo (SPA html), wildcard CORS, open debug and an empty branch', async () => {
  const a = await listen(siteHandler({ '/': ['text/html', '<html>OLD</html>'], '/assets/logo/rr-logo-800.webp': ['text/html', '<html>spa</html>'] }));
  const b = await listen(apiHandler({ wildcard: true, debugOpen: true, plEmpty: true })), d = fixtureDir();
  const r = await runSmoke({ site: a.url, api: b.url, publicDir: d, origins: [OK_ORIGIN] });
  a.s.close(); b.s.close();
  const failed = r.filter((x) => !x.ok).map((x) => x.name);
  for (const must of ['site / equals local index.html', 'site /assets/logo/rr-logo-800.webp has the right content-type (SPA fallback trap)', 'api CORS refuses an unlisted origin (no wildcard)', 'api debug route is closed without the token', 'api prices PL']) assert.ok(failed.includes(must), 'should fail: ' + must);
});
test('smoke: a dead server is reported as FAIL, not a crash', async () => {
  const r = await runSmoke({ site: 'http://127.0.0.1:1', api: 'http://127.0.0.1:1', branches: ['MR'] });
  assert.ok(r.filter((x) => !x.ok).length >= 3);
});

const page = (o = {}) => `<!doctype html><html><head><title>${o.title ?? 'Best Biryani in Vijayawada | RR Durbar'}</title>
<meta name="description" content="${o.desc ?? 'RR Durbar serves royal biryani, kebabs and curries across Vijayawada. Order pickup online from your nearest outlet today.'}">
<link rel="canonical" href="${o.canon ?? 'https://rrdurbar.com/'}">${o.robots ? `<meta name="robots" content="${o.robots}">` : ''}
<meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="https://rrdurbar.com/i.jpg">
${o.ld === false ? '' : `<script type="application/ld+json">${o.ldRaw ?? '{"@type":"Restaurant"}'}</script>`}</head><body><h1>${o.h1 ?? 'Welcome'}</h1>${o.extra || ''}</body></html>`;

test('seo: a clean page passes; each defect is caught', async () => {
  const pages = {
    '/': page(),
    '/about-us/': page({ title: 'About RR Durbar | Since 1991 in Vijayawada', desc: 'The story of RR Durbar, Vijayawada, a family restaurant serving dum biryani and kebabs since 1991, now with several outlets.', canon: 'https://rrdurbar.com/about-us/', h1: 'About us' }),
    '/menu/': page({ title: 'x', canon: 'https://rrdurbar.com/WRONG/', h1: 'A</h1><h1>B', extra: '<a href="/?page=menu">old</a>', ldRaw: '{broken', robots: 'noindex' }),
    '/checkout/': page({ canon: 'https://rrdurbar.com/checkout/', h1: 'Checkout', robots: 'noindex, nofollow', title: 'Checkout | RR Durbar order', desc: 'Secure pickup checkout for RR Durbar online orders placed from your chosen outlet in Vijayawada.' }),
    '/order-now/': page({ canon: 'https://rrdurbar.com/order-now/', h1: 'Order now', title: 'Order Now | RR Durbar pickup', desc: 'Order biryani for pickup from RR Durbar. Choose an outlet and a time. Online ordering for pickup only, Vijayawada.' }),
  };
  const s = await listen((q, r) => { const html = pages[q.url]; r.writeHead(html ? 200 : 404, { 'content-type': 'text/html' }); r.end(html || 'no'); });
  const res = await runSeo({ base: s.url, canonicalBase: 'https://rrdurbar.com', paths: Object.keys(pages), noindexPaths: ['/checkout/', '/order-now/'] });
  s.s.close();
  const bad = (p) => res.filter((x) => x.page === p && !x.ok && !x.warn).map((x) => x.name);
  assert.deepEqual(bad('/'), []);
  assert.deepEqual(bad('/about-us/'), []);
  assert.deepEqual(bad('/checkout/'), []);
  for (const must of ['exactly one h1', 'canonical is absolute and points to itself', 'no ?page= links', 'JSON-LD blocks parse', 'indexable page has no noindex']) assert.ok(bad('/menu/').includes(must), must);
  assert.ok(bad('/order-now/').includes('order page is noindex'));
});
test('seo: duplicate titles and descriptions across pages are flagged, and the site-wide X-Robots-Tag header is called out', async () => {
  const same = page({ canon: 'https://rrdurbar.com/a/', h1: 'A' });
  const s = await listen((q, r) => { r.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex, nofollow' }); r.end(q.url === '/a/' ? same : page({ canon: 'https://rrdurbar.com/b/', h1: 'B' })); });
  const res = await runSeo({ base: s.url, canonicalBase: 'https://rrdurbar.com', paths: ['/a/', '/b/'] });
  s.s.close();
  assert.ok(res.some((x) => x.name === 'unique title' && !x.ok));
  assert.ok(res.some((x) => x.name === 'unique description' && !x.ok));
  assert.ok(res.some((x) => x.name === 'indexable page has no noindex' && !x.ok && /X-Robots-Tag/.test(x.detail)));
});
test('inspectPage reads a bare page without crashing', () => { const p = inspectPage('<html></html>'); assert.deepEqual([p.titleCount, p.h1.length, p.canonical], [0, 0, null]); });

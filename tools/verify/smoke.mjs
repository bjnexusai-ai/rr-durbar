#!/usr/bin/env node
// Post-deploy smoke test for RR Durbar (plan section 14 "Verify after every deploy" + section 10 site checks, as one command).
// Node 18+, no dependencies. Read-only: only GET, HEAD and OPTIONS requests. It never places an order.
//
//   node smoke.mjs --site https://rr-durbar-preview.ramana-peravali.workers.dev \
//                  --api  https://rr-durbar-api.ramana-peravali.workers.dev \
//                  --public /workspaces/RR-Durbar/public \
//                  --origins https://rr-durbar.ramana-peravali.workers.dev,https://rr-durbar-preview.ramana-peravali.workers.dev
// Exit code 0 = all PASS, 1 = at least one FAIL.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);
const BRANCHES = ['AT', 'BH', 'HO', 'MR', 'PA', 'PL', 'PO', 'SN'];

export async function runSmoke({ site, api, publicDir, origins = [], branches = BRANCHES, evil = 'https://evil.example.com', fetchImpl = fetch } = {}) {
  const out = [];
  const add = (name, ok, detail = '') => out.push({ name, ok: Boolean(ok), detail });
  const get = async (url, init) => { try { return await fetchImpl(url, { redirect: 'manual', ...init }); } catch (e) { return { status: 0, headers: new Headers(), _err: String(e.message || e) }; } };
  const buf = async (r) => Buffer.from(await r.arrayBuffer());

  if (site) {
    site = site.replace(/\/$/, '');
    for (const [path, local] of [['/', 'index.html'], ['/checkout/', 'checkout/index.html']]) {
      const r = await get(site + path);
      const body = r.status ? await buf(r) : Buffer.alloc(0);
      add(`site ${path} returns 200 html`, r.status === 200 && /text\/html/.test(r.headers.get('content-type') || ''), `status ${r.status}`);
      if (publicDir && existsSync(join(publicDir, local))) {
        const want = sha(readFileSync(join(publicDir, local)));
        add(`site ${path} equals local ${local}`, sha(body) === want, `remote ${sha(body)} local ${want}`);
      }
    }
    for (const [path, type] of [['/assets/logo/rr-logo-800.webp', /image\/webp/], ['/robots.txt', /text\/plain/], ['/sitemap.xml', /xml/]]) {
      if (publicDir && !existsSync(join(publicDir, path))) continue; // only check files that exist in the repo
      const r = await get(site + path);
      add(`site ${path} has the right content-type (SPA fallback trap)`, r.status === 200 && type.test(r.headers.get('content-type') || ''), `${r.status} ${r.headers.get('content-type')}`);
    }
  }

  if (api) {
    api = api.replace(/\/$/, '');
    for (const b of branches) {
      const r = await get(`${api}/api/prices?branch=${b}`);
      let ok = false, detail = `status ${r.status}`;
      if (r.status === 200) { try { const j = await r.json(); const n = Object.keys(j.prices || {}).length; ok = n > 0; detail = `${n} prices`; } catch { detail = 'not JSON'; } }
      add(`api prices ${b}`, ok, detail);
    }
    const first = branches[0];
    for (const o of origins) {
      const r = await get(`${api}/api/prices?branch=${first}`, { headers: { Origin: o } });
      add(`api CORS allows ${o}`, r.headers.get('access-control-allow-origin') === o, `header: ${r.headers.get('access-control-allow-origin')}`);
    }
    const r2 = await get(`${api}/api/prices?branch=${first}`, { headers: { Origin: evil } });
    const acao = r2.headers.get('access-control-allow-origin');
    add('api CORS refuses an unlisted origin (no wildcard)', r2.status !== 0 && !acao, `header: ${acao}`);
    const r3 = await get(`${api}/api/debug?path=/branch/list`);
    add('api debug route is closed without the token', [401, 403, 404].includes(r3.status), `status ${r3.status}`);
    const r4 = await get(`${api}/api/prices?branch=${first}`);
    add('api sends X-Content-Type-Options: nosniff', (r4.headers.get('x-content-type-options') || '').toLowerCase() === 'nosniff');
  }
  return out;
}

export function report(results) {
  const w = Math.max(...results.map((r) => r.name.length));
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(w)}  ${r.detail}`);
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - bad} passed, ${bad} failed`);
  return bad;
}

const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : undefined; };
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const results = await runSmoke({ site: arg('site'), api: arg('api'), publicDir: arg('public'), origins: (arg('origins') || '').split(',').filter(Boolean), branches: arg('branches') ? arg('branches').split(',') : undefined });
  if (!results.length) { console.log('Nothing to check. Pass --site and/or --api.'); process.exit(2); }
  process.exit(report(results) ? 1 : 0);
}

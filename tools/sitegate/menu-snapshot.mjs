#!/usr/bin/env node
// RR Durbar: write tools/sitegate/menu-snapshot.json for the sitegate menu checks (task 3.9).
// Our menu comes live from Rista through the API, so there is no static menu file. This reads
// GET /api/menu?branch=XX and GET /api/prices?branch=XX (read-only, public, no secrets) and writes
// the kit's format: { "food": [ { "title": "<category>", "items": [ { "name": "...", "price": 123 } ] } ] }.
// Usage (website Codespace):  node tools/sitegate/menu-snapshot.mjs --api https://rr-durbar-api.ramana-peravali.workers.dev --branch MR
// Exit 0 = written. Exit 1 = the API answered in a shape this script does not know: it prints the keys it saw.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? a.concat([[v.slice(2), all[i + 1]]]) : a), []));
const api = String(args.api || '').replace(/\/+$/, '');
const branch = String(args.branch || 'MR');

async function getJson(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}

export function toKitFormat(menu, prices) {
  if (!menu || !Array.isArray(menu.categories)) return { error: 'menu has no categories[]; keys: ' + Object.keys(menu || {}).join(',') };
  const p = (prices && prices.prices) || {};
  const food = [];
  let priced = 0, total = 0;
  for (const c of menu.categories) {
    const items = [];
    for (const d of c.items || []) {
      if (!d || !d.name) continue;
      const vs = Array.isArray(d.variants) ? d.variants : [];
      const it = { name: String(d.name) };
      if (vs.length) {
        it.variants = vs.map((v) => ({ name: v.label || v.name || '', price: Number(p[v.id]) || 0 }));
      } else {
        it.price = Number(p[d.id]) || 0;
      }
      total += 1;
      if ((it.price || 0) > 0 || (it.variants || []).some((v) => v.price > 0)) priced += 1;
      items.push(it);
    }
    if (items.length) food.push({ title: String(c.name || c.title || c.label || 'Menu'), items });
  }
  return { food, priced, total };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (!/^https:\/\//.test(api)) { console.error('give --api https://... (the API address)'); process.exit(2); }
  try {
    const [menu, prices] = await Promise.all([
      getJson(`${api}/api/menu?branch=${encodeURIComponent(branch)}`),
      getJson(`${api}/api/prices?branch=${encodeURIComponent(branch)}`).catch(() => ({})),
    ]);
    const out = toKitFormat(menu, prices);
    if (out.error) { console.error('UNKNOWN SHAPE: ' + out.error); process.exit(1); }
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'menu-snapshot.json');
    await writeFile(file, JSON.stringify({ food: out.food }, null, 2) + '\n');
    console.log(`wrote ${file}: ${out.food.length} categories, ${out.total} dishes, ${out.priced} with a price (branch ${branch})`);
    if (out.priced < out.total) console.log('note: dishes without a price are sold out or unpriced at this moment; run between 11:00 and 23:30');
  } catch (e) {
    console.error('FAILED: ' + e.message);
    process.exit(1);
  }
}

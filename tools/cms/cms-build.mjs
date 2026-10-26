#!/usr/bin/env node
// RR Durbar CMS build. Run from the website repo root.
//   node tools/cms/cms-build.mjs --input cms/seed/seed.ndjson --check   offline dry run on a file (no Sanity needed)
//   node tools/cms/cms-build.mjs --check                                 dry run against Sanity (reads only)
//   node tools/cms/cms-build.mjs                                         writes cms-out/site-data.json (only if there is no ERROR)
//   add --update-lock to record outlet codes, Rista codes and dish names in tools/cms/cms-ids.lock.json (after the first good run)
// Sanity settings (environment, never in the repo): SANITY_PROJECT_ID, SANITY_DATASET (default production),
// SANITY_READ_TOKEN (secret, only if the dataset is private). Exit 0 = good, 1 = stopped (nothing written), 2 = wrong usage.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseNdjson, validate, build, lockFrom } from './cms-lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCK = path.join(HERE, 'cms-ids.lock.json');
const TYPES = ['siteSettings', 'outlet', 'page', 'dish', 'offer', 'legalPage'];

export async function fetchSanity({ projectId, dataset = 'production', token = '', fetchImpl = fetch }) {
  if (!/^[a-z0-9]{6,20}$/.test(projectId || '')) throw new Error('SANITY_PROJECT_ID is missing or looks wrong');
  const q = `*[_type in ${JSON.stringify(TYPES)} && !(_id in path("drafts.**"))]`;
  const host = token ? 'api.sanity.io' : 'apicdn.sanity.io';
  const url = `https://${projectId}.${host}/v2024-06-01/data/query/${encodeURIComponent(dataset)}?query=${encodeURIComponent(q)}`;
  const r = await fetchImpl(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!r.ok) throw new Error(`Sanity answered HTTP ${r.status}`);
  const j = await r.json();
  if (!j || !Array.isArray(j.result)) throw new Error('Sanity sent an unexpected answer');
  return j.result;
}

export async function run(argv, { env = process.env, fetchImpl = fetch, outDir = 'cms-out', lockPath = LOCK, log = console.log } = {}) {
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const check = argv.includes('--check');
  let docs, source;
  try {
    if (arg('--input')) { docs = parseNdjson(await readFile(arg('--input'), 'utf8')); source = `file ${arg('--input')}`; }
    else { docs = await fetchSanity({ projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_DATASET || 'production', token: env.SANITY_READ_TOKEN || '', fetchImpl }); source = 'sanity'; }
  } catch (e) { log(`STOP: ${e.message}. Nothing written; the site keeps its last good content.`); return 1; }
  let lock = null;
  try { lock = JSON.parse(await readFile(lockPath, 'utf8')); } catch { lock = null; }
  const { errors, warnings } = validate(docs, { lock });
  const count = (t) => docs.filter((d) => d._type === t).length;
  log(`Read ${docs.length} documents from ${source}: ${count('outlet')} outlets, ${count('page')} pages, ${count('dish')} dish cards, ${count('offer')} offers, ${count('legalPage')} legal pages.`);
  for (const w of warnings) log('WARN  ' + w);
  for (const e of errors) log('ERROR ' + e);
  if (errors.length) { log(`STOP: ${errors.length} error(s). Nothing written; the site keeps its last good content.`); return 1; }
  const data = build(docs, { projectId: env.SANITY_PROJECT_ID || '', dataset: env.SANITY_DATASET || 'production', source });
  if (check) { log(`CHECK ONLY: content is valid (${warnings.length} warning(s)). Nothing written.`); return 0; }
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'site-data.json'), JSON.stringify(data, null, 2) + '\n');
  if (argv.includes('--update-lock')) await writeFile(lockPath, JSON.stringify(lockFrom(docs), null, 2) + '\n');
  log(`WRITTEN: ${path.join(outDir, 'site-data.json')}${argv.includes('--update-lock') ? ' and the id lock' : ''}.`);
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(await run(process.argv.slice(2)));

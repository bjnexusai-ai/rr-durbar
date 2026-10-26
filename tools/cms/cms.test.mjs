// RR Durbar CMS rules. Run: node --test tools/cms/cms.test.mjs   (from the website repo root)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseNdjson, validate, build, lockFrom, ptToHtml } from './cms-lib.mjs';
import { run } from './cms-build.mjs';

const SEED = parseNdjson(readFileSync('cms/seed/seed.ndjson', 'utf8'));
const fresh = () => structuredClone(SEED);
const one = (docs, id) => docs.find((d) => d._id === id);
const errs = (docs, opt) => validate(docs, opt).errors.join('\n');

test('the seed from the live site is valid and complete', () => {
  const { errors } = validate(SEED);
  assert.deepEqual(errors, []);
  assert.equal(SEED.filter((d) => d._type === 'outlet').length, 6);
  assert.equal(SEED.filter((d) => d._type === 'page').length, 16);
  assert.equal(SEED.filter((d) => d._type === 'legalPage').length, 3);
});

test('a price anywhere on a dish stops the build', () => {
  const d = fresh(); d.find((x) => x._type === 'dish').pricePaise = 24900;
  assert.match(errs(d), /price-like field pricePaise/);
  const d2 = fresh(); d2.find((x) => x._type === 'dish').extra = { mrp: 100 };
  assert.match(errs(d2), /price-like field extra\.mrp/);
  const d3 = fresh(); d3.find((x) => x._type === 'dish').description = 'Our best biryani, only Rs. 249';
  assert.match(errs(d3), /rupee amount is in the text/);
});

test('outlet codes, Rista codes and Patamatalanka call-only are enforced', () => {
  const a = fresh(); one(a, 'outlet-poranki').ristaCode = 'XX';
  assert.match(errs(a), /Rista code must be PO/);
  const b = fresh(); one(b, 'outlet-patamatalanka').onlineOrdering = true;
  assert.match(errs(b), /call-to-order only/);
  const c = fresh(); one(c, 'outlet-autonagar').code = 'auto';
  assert.match(errs(c), /unknown code/);
});

test('hours must be HH:MM unless "Call for hours"', () => {
  const a = fresh(); const o = one(a, 'outlet-singhnagar'); o.callForHours = false; o.opens = '11am'; o.closes = '23:30';
  assert.match(errs(a), /HH:MM/);
  o.callForHours = true; assert.doesNotMatch(errs(a), /HH:MM/);
});

test('the lock: address change without new GPS, deleted outlet, locked Rista code', () => {
  const lock = lockFrom(SEED);
  const a = fresh(); one(a, 'outlet-bhavanipuram').street = 'New road';
  assert.match(errs(a, { lock }), /address changed but the GPS did not/);
  one(a, 'outlet-bhavanipuram').lat += 0.001; assert.doesNotMatch(errs(a, { lock }), /GPS did not/);
  const b = fresh().filter((x) => x._id !== 'outlet-poranki');
  assert.match(errs(b, { lock }), /Outlet poranki was deleted/);
  const c = fresh(); one(c, 'outlet-moghalrajpuram').ristaCode = 'ZZ';
  assert.match(errs(c, { lock }), /Rista code is locked \(MR\)/);
});

test('a section can only sit on a page that has it', () => {
  const a = fresh(); one(a, 'page-menu').sections.push({ _key: 'x', key: 'catering-cta', visible: true });
  assert.match(errs(a), /section "catering-cta" is not on this page/);
  const b = fresh(); one(b, 'page-home').route = 'blog';
  assert.match(errs(b), /not a page of the site/);
});

test('placeholder text stops the build, but drafts of legal pages are not checked', () => {
  const a = fresh(); one(a, 'page-home').sections[0].intro = 'Lorem ipsum dolor';
  assert.match(errs(a), /Placeholder text/);
  const b = fresh(); one(b, 'legal-privacy').body[0].children[0].text = '[Grievance officer name]';
  assert.doesNotMatch(errs(b), /Placeholder/);
  one(b, 'legal-privacy').approvedByOwner = true;
  assert.match(errs(b), /Placeholder/);
});

test('empty or missing content stops the build', () => {
  assert.match(errs([]), /no content/);
  assert.match(errs(fresh().filter((x) => x._type !== 'siteSettings')), /Business details are missing/);
});

test('output: no GPS or founding year until confirmed, drafts not published, only live offers', () => {
  const now = new Date('2026-11-01T10:00:00Z');
  const a = fresh();
  a.push({ _id: 'offer-live', _type: 'offer', title: 'Live', startsAt: '2026-10-30T00:00:00Z', endsAt: '2026-11-05T00:00:00Z', active: true });
  a.push({ _id: 'offer-old', _type: 'offer', title: 'Old', startsAt: '2026-10-01T00:00:00Z', endsAt: '2026-10-10T00:00:00Z', active: true });
  a.push({ _id: 'offer-off', _type: 'offer', title: 'Off', startsAt: '2026-10-30T00:00:00Z', endsAt: '2026-11-05T00:00:00Z', active: false });
  let out = build(a, { now });
  assert.equal(out.outlets.every((o) => o.geo === null), true);
  assert.equal(JSON.stringify(out.jsonLd).includes('GeoCoordinates'), false);
  assert.equal('foundingDate' in out.jsonLd['@graph'][0], false);
  assert.deepEqual(Object.keys(out.legal), []);
  assert.deepEqual(out.offers.map((o) => o.title), ['Live']);
  const js = JSON.stringify(out);
  assert.equal(js.match(/"[^"]*(price|paise|amount|mrp)[^"]*":/i), null, 'no price field in the output');
  assert.equal(JSON.stringify(out.dishes).match(/(₹|Rs\.?)\s?\d/), null, 'no rupee amount on any dish card');
  one(a, 'outlet-poranki').gpsVerified = true; one(a, 'siteSettings').yearConfirmed = true; one(a, 'legal-refund').approvedByOwner = true;
  out = build(a, { now });
  assert.deepEqual(out.outlets.find((o) => o.code === 'poranki').geo, { lat: 16.4801, lng: 80.6922 });
  assert.equal(out.jsonLd['@graph'][0].foundingDate, '1991');
  assert.deepEqual(Object.keys(out.legal), ['refund']);
  assert.equal(out.pages['order-now'].seo.noindex, true);
  assert.equal(out.pages.home.seo.canonical, 'https://rrdurbar.com/');
});

test('rich text is escaped and only safe links are kept', () => {
  const h = ptToHtml([{ _type: 'block', style: 'normal', markDefs: [{ _key: 'l', _type: 'link', href: 'javascript:alert(1)' }, { _key: 'm', _type: 'link', href: '/contact/' }],
    children: [{ text: '<b>x</b>', marks: ['l'] }, { text: ' call', marks: ['m', 'strong'] }] }]);
  assert.equal(h, '<p>&lt;b&gt;x&lt;/b&gt;<strong><a href="/contact/"> call</a></strong></p>');
});

test('the build stops and writes nothing when Sanity is down', async () => {
  const lines = []; const log = (l) => lines.push(l);
  const down = async () => ({ ok: false, status: 503 });
  assert.equal(await run([], { env: { SANITY_PROJECT_ID: 'abc123xy' }, fetchImpl: down, outDir: '/nonexistent/never', log }), 1);
  assert.match(lines.join('\n'), /STOP: Sanity answered HTTP 503/);
  const empty = async () => ({ ok: true, json: async () => ({ result: [] }) });
  assert.equal(await run([], { env: { SANITY_PROJECT_ID: 'abc123xy' }, fetchImpl: empty, outDir: '/nonexistent/never', log }), 1);
  assert.equal(await run([], { env: {}, fetchImpl: down, log }), 1);
});

test('the committed id lock matches the seed', () => {
  const lock = JSON.parse(readFileSync('tools/cms/cms-ids.lock.json', 'utf8'));
  assert.deepEqual(validate(SEED, { lock }).errors, []);
  assert.deepEqual(Object.keys(lock.outlets).sort(), ['autonagar', 'bhavanipuram', 'moghalrajpuram', 'patamatalanka', 'poranki', 'singhnagar']);
});

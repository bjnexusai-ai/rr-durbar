// RR Durbar CMS build library: validate the content and turn it into one data file the site build uses (cms-out/site-data.json).
// Rules decided for RR Durbar (plan section 23):
//  - NO prices in the CMS: prices and availability come live from Rista through the API (any price-like field stops the build).
//  - Outlet codes and Rista codes are locked once published (orders use them). An address change needs new GPS.
//  - GPS goes to Google only when the owner ticked "GPS checked" (C32). The founding year only when "Year confirmed" (D5).
//  - Legal pages publish only when "Approved by the owner" is ticked (10.3).
//  - A section can only go into a page that really has it (cms/routes.js). Placeholder text stops the build.
//  - Any ERROR stops the build and nothing is written: the live site keeps its last good content.
import { ROUTES, NOINDEX_ROUTES, OUTLETS, LEGAL_KINDS } from '../../cms/routes.js';

export const parseNdjson = (text) => String(text).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
const PLACEHOLDER = /lorem ipsum|\bTODO\b|PLACEHOLDER|\[Grievance officer name\]|sample photo|insert (text|image) here|dummy text/i;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') for (const v of Object.values(o)) strings(v, out); return out; };
const priceKeys = (o, path = '', out = []) => {
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
    if (/price|amount|paise|rupee|\bmrp\b|cost/i.test(k)) out.push(path + k);
    priceKeys(v, `${path}${k}.`, out);
  }
  return out;
};

export function ptToHtml(blocks = []) {
  let html = '', list = false;
  for (const b of blocks || []) {
    if (!b || b._type !== 'block') continue;
    const marks = Object.fromEntries((b.markDefs || []).map((m) => [m._key, m]));
    const inner = (b.children || []).map((c) => {
      let t = esc(c.text || '');
      for (const m of c.marks || []) {
        if (m === 'strong') t = `<strong>${t}</strong>`; else if (m === 'em') t = `<em>${t}</em>`;
        else if (marks[m] && marks[m]._type === 'link' && /^(https:|\/|mailto:|tel:)/.test(marks[m].href || '')) t = `<a href="${esc(marks[m].href)}">${t}</a>`;
      }
      return t;
    }).join('');
    if (b.listItem === 'bullet') { if (!list) { html += '<ul>'; list = true; } html += `<li>${inner}</li>`; continue; }
    if (list) { html += '</ul>'; list = false; }
    html += b.style === 'h3' ? `<h3>${inner}</h3>` : `<p>${inner}</p>`;
  }
  return list ? html + '</ul>' : html;
}

export function lockFrom(docs) {
  const outlets = {};
  for (const o of docs.filter((d) => d._type === 'outlet')) outlets[o.code] = { ristaCode: o.ristaCode, street: o.street, pincode: o.pincode, lat: o.lat, lng: o.lng };
  return { outlets, dishes: docs.filter((d) => d._type === 'dish').map((d) => String(d.ristaName).toLowerCase()).sort() };
}

export function validate(docs, { lock = null, now = new Date() } = {}) {
  const E = [], W = [];
  if (!Array.isArray(docs) || !docs.length) return { errors: ['the CMS returned no content (Sanity down or empty dataset)'], warnings: [] };
  const by = (t) => docs.filter((d) => d._type === t);
  const s = by('siteSettings')[0];
  if (!s) E.push('Business details are missing');
  else {
    if (!/^\+91[6-9]\d{9}$/.test(s.phone || '')) E.push('Business details: phone must be +91 and 10 digits');
    if (!/^91[6-9]\d{9}$/.test(s.whatsapp || '')) E.push('Business details: WhatsApp must be digits with 91');
    if (!/^\S+@\S+\.\S+$/.test(s.email || '')) E.push('Business details: email looks wrong');
  }
  // outlets
  const seen = new Set();
  for (const o of by('outlet')) {
    const n = o.name || o._id;
    if (!(o.code in OUTLETS)) { E.push(`Outlet ${n}: unknown code "${o.code}"`); continue; }
    if (seen.has(o.code)) E.push(`Outlet ${n}: code ${o.code} used twice`); seen.add(o.code);
    if (o.ristaCode !== OUTLETS[o.code]) E.push(`Outlet ${n}: Rista code must be ${OUTLETS[o.code]}`);
    if (!/^5\d{5}$/.test(o.pincode || '')) E.push(`Outlet ${n}: PIN code looks wrong`);
    if (!/^\+91[6-9]\d{9}$/.test(o.phone || '')) E.push(`Outlet ${n}: phone must be +91 and 10 digits`);
    if (!o.callForHours) {
      if (!HHMM.test(o.opens || '') || !HHMM.test(o.closes || '')) E.push(`Outlet ${n}: opening and closing times must be HH:MM (or tick "Call for hours")`);
      else if (o.opens >= o.closes) E.push(`Outlet ${n}: closing time must be after opening time`);
    }
    if (o.callOnly && o.onlineOrdering) E.push(`Outlet ${n}: cannot be both "call to order only" and "takes online orders"`);
    if (o.code === 'patamatalanka' && o.onlineOrdering) E.push('Patamatalanka is call-to-order only (decision D3)');
    if (o.gpsVerified && !(Number.isFinite(o.lat) && Number.isFinite(o.lng) && o.lat > 16.3 && o.lat < 16.7 && o.lng > 80.4 && o.lng < 80.9)) E.push(`Outlet ${n}: GPS ticked as checked but the numbers are not in Vijayawada`);
    if (lock && lock.outlets && lock.outlets[o.code]) {
      const L = lock.outlets[o.code];
      if (L.ristaCode !== o.ristaCode) E.push(`Outlet ${n}: the Rista code is locked (${L.ristaCode})`);
      if ((L.street !== o.street || L.pincode !== o.pincode) && L.lat === o.lat && L.lng === o.lng) E.push(`Outlet ${n}: the address changed but the GPS did not: update the GPS too`);
    }
  }
  if (lock && lock.outlets) for (const code of Object.keys(lock.outlets)) if (!seen.has(code)) E.push(`Outlet ${code} was deleted: untick "Show on the website" instead (orders and Google use it)`);
  // dishes: never prices
  const keys = new Set();
  for (const d of by('dish')) {
    const pk = priceKeys(d);
    if (pk.length) E.push(`Dish ${d.ristaName}: price-like field ${pk.join(', ')}: prices come only from Rista`);
    if (strings(d).some((t) => /(₹|\bRs\.?|\bINR)\s?\d/i.test(t))) E.push(`Dish ${d.ristaName}: a rupee amount is in the text: prices come only from Rista`);
    const k = String(d.ristaName || '').toLowerCase();
    if (!k) E.push(`Dish ${d._id}: Rista name is empty`);
    if (keys.has(k)) E.push(`Dish ${d.ristaName}: Rista name used twice`); keys.add(k);
  }
  if (lock && lock.dishes) for (const k of lock.dishes) if (!keys.has(k)) W.push(`Dish card "${k}" was removed`);
  // pages
  const routes = new Set();
  for (const p of by('page')) {
    const R = ROUTES[p.route];
    if (!R) { E.push(`Page "${p.route}": not a page of the site`); continue; }
    if (routes.has(p.route)) E.push(`Page "${p.route}" exists twice`); routes.add(p.route);
    const ks = new Set();
    for (const sec of p.sections || []) {
      if (!R.sections.includes(sec.key)) E.push(`Page "${p.route}": section "${sec.key}" is not on this page (allowed: ${R.sections.join(', ')})`);
      if (ks.has(sec.key)) E.push(`Page "${p.route}": section "${sec.key}" appears twice`); ks.add(sec.key);
    }
    if (!NOINDEX_ROUTES.includes(p.route)) {
      if (!p.seoTitle) W.push(`Page "${p.route}": no Google title`); else if (p.seoTitle.length > 65) W.push(`Page "${p.route}": Google title longer than 65 characters`);
      if (!p.seoDescription) W.push(`Page "${p.route}": no Google description`); else if (p.seoDescription.length > 170) W.push(`Page "${p.route}": Google description longer than 170 characters`);
    }
    const imported = (p.sections || []).filter((x) => x.imported).length;
    if (imported) W.push(`Page "${p.route}": ${imported} section(s) imported from the live site, not yet reviewed`);
  }
  // offers
  for (const o of by('offer')) if (!(Date.parse(o.endsAt) > Date.parse(o.startsAt))) E.push(`Offer "${o.title}": end must be after start`);
  // legal
  const approvedKinds = new Set();
  for (const l of by('legalPage')) {
    if (!(l.kind in LEGAL_KINDS)) { E.push(`Legal page ${l._id}: unknown kind`); continue; }
    if (l.approvedByOwner) {
      if (!(l.body || []).length) E.push(`Legal page ${l.kind}: approved but empty`);
      if (approvedKinds.has(l.kind)) E.push(`Legal page ${l.kind}: two approved versions; keep one`); approvedKinds.add(l.kind);
    } else W.push(`Legal page ${l.kind} (${l.version}) is a DRAFT: the site keeps its current text`);
  }
  // text checks across everything that is published
  const published = docs.filter((d) => !(d._type === 'legalPage' && !d.approvedByOwner));
  for (const t of strings(published)) if (PLACEHOLDER.test(t)) { E.push(`Placeholder text found: "${t.match(PLACEHOLDER)[0]}"`); break; }
  if (s && !s.yearConfirmed && strings(published.filter((d) => d._type !== 'siteSettings')).some((t) => /\b1991\b/.test(t))) W.push('The year 1991 appears in page text but is not confirmed (decision D5)');
  return { errors: E, warnings: W };
}

const imageUrl = (img, cfg) => {
  const ref = img && img.asset && img.asset._ref; const m = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref || '');
  return m && cfg.projectId ? `https://cdn.sanity.io/images/${cfg.projectId}/${cfg.dataset || 'production'}/${m[1]}-${m[2]}.${m[3]}` : null;
};

export function build(docs, { now = new Date(), projectId = '', dataset = 'production', source = 'sanity' } = {}) {
  const cfg = { projectId, dataset };
  const by = (t) => docs.filter((d) => d._type === t);
  const s = by('siteSettings')[0] || {};
  const settings = { brandName: s.brandName, legalName: s.legalName, gstin: s.gstin, phone: s.phone, whatsapp: s.whatsapp, email: s.email, instagram: s.instagram || '',
    swiggyUrl: s.swiggyUrl || '', zomatoUrl: s.zomatoUrl || '', registeredAddress: s.registeredAddress || '', hoursText: s.hoursText || '' };
  if (s.yearConfirmed && s.foundingYear) settings.foundingYear = s.foundingYear;
  if (s.grievanceOfficer) settings.grievanceOfficer = s.grievanceOfficer;
  const outlets = by('outlet').filter((o) => o.active !== false).sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99)).map((o) => ({
    code: o.code, ristaCode: o.ristaCode, name: o.name, street: o.street, locality: o.locality || 'Vijayawada', pincode: o.pincode, phone: o.phone,
    hours: o.callForHours ? null : { opens: o.opens, closes: o.closes }, callForHours: !!o.callForHours, onlineOrdering: !!o.onlineOrdering, callOnly: !!o.callOnly,
    mapsUrl: o.mapsUrl || '', reviewUrl: o.reviewUrl || '', fssai: o.fssai || '', photo: imageUrl(o.photo, cfg),
    geo: o.gpsVerified ? { lat: o.lat, lng: o.lng } : null }));
  const site = 'https://rrdurbar.com';
  const org = { '@type': 'Organization', '@id': `${site}/#organization`, name: settings.brandName, url: `${site}/`, telephone: settings.phone, email: settings.email,
    taxID: settings.gstin, sameAs: settings.instagram ? [`https://www.instagram.com/${settings.instagram}/`] : [] };
  if (settings.foundingYear) org.foundingDate = String(settings.foundingYear);
  const restaurants = outlets.map((o) => {
    const r = { '@type': 'Restaurant', name: `${settings.brandName} ${o.name}`, url: `${site}/branches/#${o.code}`, telephone: o.phone, servesCuisine: ['Indian', 'Andhra', 'Biryani'],
      address: { '@type': 'PostalAddress', streetAddress: o.street, addressLocality: o.locality, addressRegion: 'Andhra Pradesh', postalCode: o.pincode, addressCountry: 'IN' },
      hasMenu: `${site}/menu/`, image: o.photo || `${site}/assets/logo/rr-logo-800.webp`, sameAs: org.sameAs, parentOrganization: { '@id': org['@id'] } };
    if (o.hours) r.openingHoursSpecification = [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: o.hours.opens, closes: o.hours.closes }];
    if (o.geo) r.geo = { '@type': 'GeoCoordinates', latitude: o.geo.lat, longitude: o.geo.lng };
    if (o.fssai) r.identifier = { '@type': 'PropertyValue', propertyID: 'FSSAI', value: o.fssai };
    return r;
  });
  const dishes = {};
  for (const d of by('dish')) dishes[String(d.ristaName).toLowerCase()] = { displayName: d.displayName || '', description: d.description || '', photo: imageUrl(d.photo, cfg) || d.photoFile || '', alt: (d.photo && d.photo.alt) || '', showOnHome: !!d.showOnHome, homeOrder: d.homeOrder ?? null };
  const pages = {};
  for (const p of by('page')) {
    pages[p.route] = { seo: { title: p.seoTitle || '', description: p.seoDescription || '', noindex: NOINDEX_ROUTES.includes(p.route), canonical: p.route === 'home' ? `${site}/` : `${site}/${p.route}/`, ogImage: imageUrl(p.ogImage, cfg) },
      h1: p.h1 || '', sections: Object.fromEntries((p.sections || []).map((x) => [x.key, { visible: x.visible !== false, eyebrow: x.eyebrow || '', heading: x.heading || '', intro: x.intro || '', bodyHtml: ptToHtml(x.body) }])) };
  }
  const t = now.getTime();
  const offers = by('offer').filter((o) => o.active !== false && Date.parse(o.startsAt) <= t && t < Date.parse(o.endsAt)).map((o) => ({ title: o.title, text: o.text || '', linkText: o.linkText || '', linkUrl: o.linkUrl || '', pages: o.pages || ['home'], endsAt: o.endsAt }));
  const legal = {};
  for (const l of by('legalPage').filter((x) => x.approvedByOwner)) legal[l.kind] = { route: LEGAL_KINDS[l.kind], version: l.version, effectiveDate: l.effectiveDate || '', html: ptToHtml(l.body) };
  return { generatedAt: now.toISOString(), source, settings, outlets, jsonLd: { '@context': 'https://schema.org', '@graph': [org, ...restaurants] }, dishes, pages, offers, legal };
}

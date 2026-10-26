// "Outlets": one document per outlet. Feeds the Branches page, the footer, Order Now and the Google data (one Restaurant each).
// Code and Rista code are LOCKED once used (tools/cms/cms-ids.lock.json): online orders reference them.
import { OUTLETS } from '../routes.js';
const hhmm = (R) => R.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'HH:MM, 24-hour' });
export default {
  name: 'outlet', title: 'Outlets', type: 'document',
  fields: [
    { name: 'name', title: 'Outlet name', type: 'string', description: 'For example: Moghalrajpuram', validation: (R) => R.required() },
    { name: 'code', title: 'Website code', type: 'string', options: { list: Object.keys(OUTLETS) }, validation: (R) => R.required(), readOnly: ({ document }) => Boolean(document && document._createdAt && document.code) },
    { name: 'ristaCode', title: 'Rista branch code', type: 'string', options: { list: Object.values(OUTLETS) }, validation: (R) => R.required() },
    { name: 'active', title: 'Show on the website', type: 'boolean', initialValue: true },
    { name: 'onlineOrdering', title: 'Takes online orders', type: 'boolean', initialValue: false, description: 'Also needs ONLINE_OUTLETS_LIVE on the API. Patamatalanka: off (call to order).' },
    { name: 'callOnly', title: 'Call to order only', type: 'boolean', initialValue: false },
    { name: 'street', title: 'Street address', type: 'string', validation: (R) => R.required() },
    { name: 'locality', title: 'City', type: 'string', initialValue: 'Vijayawada' },
    { name: 'pincode', title: 'PIN code', type: 'string', validation: (R) => R.required().regex(/^5\d{5}$/) },
    { name: 'phone', title: 'Phone (+91...)', type: 'string', validation: (R) => R.required().regex(/^\+91[6-9]\d{9}$/) },
    { name: 'opens', title: 'Opens (HH:MM)', type: 'string', validation: hhmm },
    { name: 'closes', title: 'Closes (HH:MM)', type: 'string', validation: hhmm },
    { name: 'callForHours', title: 'Show "Call for hours" instead of times', type: 'boolean', initialValue: false },
    { name: 'lat', title: 'Latitude (from Google Maps)', type: 'number' },
    { name: 'lng', title: 'Longitude (from Google Maps)', type: 'number' },
    { name: 'gpsVerified', title: 'GPS checked by the owner on Google Maps', type: 'boolean', initialValue: false, description: 'Unchecked GPS is never sent to Google (C32).' },
    { name: 'mapsUrl', title: 'Google Maps / directions link', type: 'url' },
    { name: 'reviewUrl', title: 'Google review link (task G8)', type: 'url' },
    { name: 'fssai', title: 'FSSAI number', type: 'string', validation: (R) => R.regex(/^\d{14}$/) },
    { name: 'photo', title: 'Outlet photo', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Describe the photo', type: 'string' }] },
    { name: 'sort', title: 'Order on the page', type: 'number' },
  ],
  orderings: [{ title: 'Page order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
  preview: { select: { title: 'name', code: 'ristaCode', on: 'onlineOrdering' }, prepare: ({ title, code, on }) => ({ title, subtitle: `${code || ''}${on ? ' · online orders' : ''}` }) },
};

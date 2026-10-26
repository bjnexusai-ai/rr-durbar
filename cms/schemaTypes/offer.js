// "Offers banner" (addition A15): short banners with a start and end date. Only active, in-date offers reach the site.
import { ROUTES } from '../routes.js';
export default {
  name: 'offer', title: 'Offers banner', type: 'document',
  fields: [
    { name: 'title', title: 'Headline', type: 'string', validation: (R) => R.required().max(70) },
    { name: 'text', title: 'Details', type: 'string', validation: (R) => R.max(160) },
    { name: 'linkText', title: 'Button text', type: 'string' },
    { name: 'linkUrl', title: 'Button link', type: 'string', description: 'A page like /?page=order-now, or a full https:// link' },
    { name: 'startsAt', title: 'Starts', type: 'datetime', validation: (R) => R.required() },
    { name: 'endsAt', title: 'Ends', type: 'datetime', validation: (R) => R.required().min(R.valueOfField('startsAt')) },
    { name: 'pages', title: 'Show on pages', type: 'array', of: [{ type: 'string' }], options: { list: Object.entries(ROUTES).map(([value, r]) => ({ value, title: r.title })) }, initialValue: ['home'] },
    { name: 'active', title: 'Active', type: 'boolean', initialValue: true },
  ],
};

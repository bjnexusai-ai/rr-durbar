// "What's new" announcements (home page, row 1). Up to 2 live cards: image + EITHER a one-line description (with Order Now) OR a second image.
// Only active announcements between Start and End reach the site; after End the card disappears by itself.
export default {
  name: 'announcement', title: "What's new announcement", type: 'document',
  validation: (R) => R.custom((d) => {
    if (!d) return true;
    const hasLine = Boolean(d.line && String(d.line).trim());
    const hasImg2 = Boolean(d.image2 && d.image2.asset);
    if (hasLine && hasImg2) return 'Use EITHER a one-line description OR a second image, not both';
    if (!hasLine && !hasImg2) return 'Add a one-line description or a second image';
    return true;
  }),
  fields: [
    { name: 'image', title: 'Main image', type: 'image', options: { hotspot: true }, validation: (R) => R.required(),
      fields: [{ name: 'alt', title: 'Describe the image (for screen readers)', type: 'string' }] },
    { name: 'line', title: 'One-line description (shows with an Order Now button)', type: 'string', validation: (R) => R.max(120) },
    { name: 'image2', title: 'OR a second image (a ready-made poster)', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Describe the image', type: 'string' }] },
    { name: 'link', title: 'Button link', type: 'string', initialValue: '/order-now/', description: 'A page like /order-now/, or a full https:// link',
      validation: (R) => R.regex(/^(https:\/\/|\/)/, { name: 'starts with / or https://' }) },
    { name: 'startsAt', title: 'Starts', type: 'datetime', validation: (R) => R.required() },
    { name: 'endsAt', title: 'Ends (the card disappears after this)', type: 'datetime', validation: (R) => R.required().min(R.valueOfField('startsAt')) },
    { name: 'active', title: 'Active', type: 'boolean', initialValue: true },
    { name: 'sort', title: 'Order (1 shows first; only 2 are shown)', type: 'number' },
  ],
  orderings: [{ title: 'Order', name: 'sort', by: [{ field: 'sort', direction: 'asc' }] }],
  preview: { select: { title: 'line', media: 'image', ends: 'endsAt' }, prepare: ({ title, media, ends }) => ({ title: title || 'Poster announcement', subtitle: ends ? 'Ends ' + String(ends).slice(0, 10) : '', media }) },
};

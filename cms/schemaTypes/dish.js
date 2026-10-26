// "Dish cards": names, descriptions and photos shown on the site. NO PRICES here, ever: prices and availability come live
// from Rista through the API, so the cart always shows what is charged. The Rista name is the key; it must match Rista exactly.
export default {
  name: 'dish', title: 'Dish cards (no prices)', type: 'document',
  fields: [
    { name: 'ristaName', title: 'Name in Rista (exact)', type: 'string', description: 'The key. Cart, WhatsApp text and orders keep this name.', validation: (R) => R.required() },
    { name: 'displayName', title: 'Name shown on the card', type: 'string', description: 'Leave empty to show the Rista name (task 1.3).' },
    { name: 'description', title: 'Short description', type: 'text', rows: 3, validation: (R) => R.max(240) },
    { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Describe the photo', type: 'string', validation: (R) => R.required() }] },
    { name: 'photoFile', title: 'Current photo file on the site', type: 'string', readOnly: true, description: 'Imported from the live site; replaced when a new photo is uploaded.' },
    { name: 'showOnHome', title: 'Show in Home signature dishes', type: 'boolean', initialValue: false },
    { name: 'homeOrder', title: 'Order in Home signature dishes', type: 'number' },
    { name: 'photoChecked', title: 'Owner checked the photo shows this dish (task 1.1)', type: 'boolean', initialValue: false },
  ],
  preview: { select: { title: 'displayName', sub: 'ristaName', media: 'photo' }, prepare: ({ title, sub, media }) => ({ title: title || sub, subtitle: title ? `Rista: ${sub}` : '', media }) },
};

// "Business details": one document (id siteSettings). Shown on every page (footer, contact, Google data).
const phoneRule = (R) => R.required().regex(/^\+91[6-9]\d{9}$/, { name: '+91 and 10 digits' });
export default {
  name: 'siteSettings', title: 'Business details', type: 'document',
  fields: [
    { name: 'brandName', title: 'Brand name', type: 'string', initialValue: 'RR Durbar', validation: (R) => R.required() },
    { name: 'legalName', title: 'Legal name', type: 'string', validation: (R) => R.required() },
    { name: 'gstin', title: 'GSTIN', type: 'string', validation: (R) => R.regex(/^[0-9A-Z]{15}$/, { name: '15 letters/digits' }) },
    { name: 'phone', title: 'Main phone (+91...)', type: 'string', validation: phoneRule },
    { name: 'whatsapp', title: 'WhatsApp number (digits only, with 91)', type: 'string', validation: (R) => R.required().regex(/^91[6-9]\d{9}$/) },
    { name: 'email', title: 'Orders email', type: 'string', validation: (R) => R.required().email() },
    { name: 'instagram', title: 'Instagram handle (without @)', type: 'string' },
    { name: 'swiggyUrl', title: 'Swiggy link', type: 'url' },
    { name: 'zomatoUrl', title: 'Zomato link', type: 'url' },
    { name: 'registeredAddress', title: 'Registered address', type: 'text', rows: 3 },
    { name: 'hoursText', title: 'Opening hours (as shown to guests)', type: 'string', description: 'For example: 11:00 AM to 11:30 PM, all days' },
    { name: 'foundingYear', title: 'Year founded', type: 'number', description: 'Shown ONLY when "Year confirmed" is ticked (decision D5).' },
    { name: 'yearConfirmed', title: 'Year confirmed by the owner', type: 'boolean', initialValue: false },
    { name: 'grievanceOfficer', title: 'Grievance officer name', type: 'string', description: 'Shown on the privacy page only when filled (C1).' },
  ],
  preview: { prepare: () => ({ title: 'Business details' }) },
};

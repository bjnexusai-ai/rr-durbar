// "Legal pages": privacy, terms, refund. Text the owner (and a lawyer) approve. The build publishes a version ONLY when
// "Approved by the owner" is ticked, so a draft can never reach the live site by accident (plan 10.3, DPDP).
import { LEGAL_KINDS } from '../routes.js';
export default {
  name: 'legalPage', title: 'Legal pages', type: 'document',
  fields: [
    { name: 'kind', title: 'Which page', type: 'string', options: { list: Object.keys(LEGAL_KINDS) }, validation: (R) => R.required() },
    { name: 'version', title: 'Version (for example 2026-11-01-v1)', type: 'string', validation: (R) => R.required() },
    { name: 'effectiveDate', title: 'Effective from', type: 'date' },
    { name: 'body', title: 'Text', type: 'array', of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Heading', value: 'h3' }], lists: [{ title: 'Bullets', value: 'bullet' }] }] },
    { name: 'approvedByOwner', title: 'Approved by the owner (publish)', type: 'boolean', initialValue: false },
    { name: 'imported', title: 'Imported from the live site', type: 'boolean', initialValue: false, readOnly: true },
  ],
  preview: { select: { title: 'kind', v: 'version', ok: 'approvedByOwner' }, prepare: ({ title, v, ok }) => ({ title, subtitle: `${v || ''}${ok ? ' · approved' : ' · DRAFT'}` }) },
};

// RR Durbar Studio (content editing). Separate Sanity project and dataset from Swagramam (never share them).
// Project id and dataset come from cms/.env (SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET): see docs/CMS_SETUP_RR.md.
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes/index.js';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'set-SANITY_STUDIO_PROJECT_ID';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'rr-durbar', title: 'RR Durbar website',
  projectId, dataset,
  plugins: [structureTool({ structure: (S) => S.list().title('RR Durbar').items([
    S.listItem().title('Business details').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    S.documentTypeListItem('outlet').title('Outlets'),
    S.documentTypeListItem('page').title('Pages and sections'),
    S.documentTypeListItem('dish').title('Dish cards (no prices)'),
    S.documentTypeListItem('offer').title('Offers banner'),
    S.documentTypeListItem('legalPage').title('Legal pages'),
  ]) })],
  schema: { types: schemaTypes, templates: (t) => t.filter((x) => x.schemaType !== 'siteSettings') },
  document: { actions: (prev, ctx) => (ctx.schemaType === 'siteSettings' ? prev.filter((a) => ['publish', 'discardChanges', 'restore'].includes(a.action)) : prev) },
});

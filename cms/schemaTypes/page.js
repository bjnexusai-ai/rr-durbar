// "Pages": one document per website page (route). Holds the Google fields and the text of that page's sections.
// Section keys are the real section ids of RR Durbar's pages (cms/routes.js), so text lands in the right place.
// Layout, design and the live menu are NOT edited here: they stay in the site code.
import { ROUTES } from '../routes.js';
const ALL_SECTIONS = [...new Set(Object.values(ROUTES).flatMap((r) => r.sections))];
export const sectionBlock = {
  name: 'pageSection', title: 'Section', type: 'object',
  fields: [
    { name: 'key', title: 'Which section', type: 'string', options: { list: ALL_SECTIONS }, validation: (R) => R.required() },
    { name: 'visible', title: 'Show this section', type: 'boolean', initialValue: true },
    { name: 'eyebrow', title: 'Small label above the heading', type: 'string', validation: (R) => R.max(60) },
    { name: 'heading', title: 'Heading', type: 'string', validation: (R) => R.max(120) },
    { name: 'intro', title: 'Intro text', type: 'text', rows: 3, validation: (R) => R.max(600) },
    { name: 'body', title: 'More text', type: 'array', of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Subheading', value: 'h3' }], lists: [{ title: 'Bullets', value: 'bullet' }], marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }] } }] },
    { name: 'imported', title: 'Imported from the live site, not yet reviewed', type: 'boolean', initialValue: false, readOnly: true },
  ],
  preview: { select: { title: 'key', sub: 'heading' }, prepare: ({ title, sub }) => ({ title, subtitle: sub }) },
};
export default {
  name: 'page', title: 'Pages', type: 'document',
  fields: [
    { name: 'route', title: 'Page', type: 'string', options: { list: Object.entries(ROUTES).map(([value, r]) => ({ value, title: r.title })) }, validation: (R) => R.required() },
    { name: 'seoTitle', title: 'Google title (50 to 60 characters)', type: 'string', validation: (R) => R.max(65) },
    { name: 'seoDescription', title: 'Google description (120 to 160 characters)', type: 'text', rows: 2, validation: (R) => R.max(170) },
    { name: 'h1', title: 'Main heading of the page (one per page)', type: 'string' },
    { name: 'ogImage', title: 'Share image (WhatsApp, social)', type: 'image' },
    { name: 'sections', title: 'Sections', type: 'array', of: [{ type: 'pageSection' }] },
  ],
  preview: { select: { title: 'route' }, prepare: ({ title }) => ({ title: (ROUTES[title] && ROUTES[title].title) || title }) },
};

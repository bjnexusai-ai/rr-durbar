// Plain object on purpose (no defineCliConfig import): avoids the version mismatch seen in the Swagramam Studio.
export default {
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'set-SANITY_STUDIO_PROJECT_ID', dataset: process.env.SANITY_STUDIO_DATASET || 'production' },
  studioHost: process.env.SANITY_STUDIO_HOST || 'rr-durbar',
};

import { createCollections } from '@parche/astro/content';

const { pages, layouts, patterns } = createCollections();

export const collections = { pages, layouts, patterns };

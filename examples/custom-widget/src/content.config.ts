import { createCollections } from '@parche/astro/content';

const { pages, layouts, widgets } = createCollections();

export const collections = { pages, layouts, widgets };

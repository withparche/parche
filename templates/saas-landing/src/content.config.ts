import { createCollections } from '@parche/astro/content';

const { pages, layouts, navigation } = createCollections();

export const collections = { pages, layouts, navigation };

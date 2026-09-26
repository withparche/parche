import { createCollections } from '@parche/astro/content';

const { pages, layouts, navigation, patterns } = createCollections();

export const collections = { pages, layouts, navigation, patterns };

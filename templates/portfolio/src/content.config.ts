import { createCollections } from '@parche/astro/content';

const { pages, layouts } = createCollections();

export const collections = { pages, layouts };

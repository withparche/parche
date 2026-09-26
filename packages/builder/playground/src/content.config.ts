import { createCollections } from '@parche/astro/content';

const { pages, layouts, navigation, presets, widgets } = createCollections();

export const collections = { pages, layouts, navigation, presets, widgets };

import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, presets, widgets, navigation } = createCollections();
const { posts, authors, taxonomies, views } = createBlogCollections();

export const collections = { pages, layouts, presets, widgets, navigation, posts, authors, taxonomies, views };

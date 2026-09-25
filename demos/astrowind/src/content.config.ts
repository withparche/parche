import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, presets, navigation } = createCollections();
const { posts, authors, taxonomies } = createBlogCollections();

export const collections = { pages, layouts, presets, navigation, posts, authors, taxonomies };

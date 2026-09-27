import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, navigation, patterns } = createCollections();
const { posts, authors, taxonomies, series, views } = createBlogCollections();

export const collections = { pages, layouts, navigation, patterns, posts, authors, taxonomies, series, views };

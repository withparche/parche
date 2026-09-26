import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, patterns, navigation } = createCollections();
const { posts, authors, taxonomies, views } = createBlogCollections();

export const collections = { pages, layouts, patterns, navigation, posts, authors, taxonomies, views };

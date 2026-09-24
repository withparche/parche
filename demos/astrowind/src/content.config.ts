import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts, presets } = createCollections();
const { posts, authors, taxonomies } = createBlogCollections();

export const collections = { pages, layouts, presets, posts, authors, taxonomies };

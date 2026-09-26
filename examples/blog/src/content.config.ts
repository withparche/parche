import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts } = createCollections();
const { posts, authors, series } = createBlogCollections();

export const collections = { pages, layouts, posts, authors, series };

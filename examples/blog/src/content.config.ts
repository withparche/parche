import { createCollections } from '@parche/astro/content';
import { createBlogCollections } from '@parche/astro-blog/content';

const { pages, layouts } = createCollections();
const { posts, authors } = createBlogCollections();

export const collections = { pages, layouts, posts, authors };

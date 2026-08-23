import { createCollections } from '@parche/core/content';
import { createBlogCollections } from '@parche/blog/content';

const { pages, layouts } = createCollections();
const { posts, authors } = createBlogCollections();

export const collections = { pages, layouts, posts, authors };

import { createCollections } from '@parche/core/content';
import { createBlogCollections } from '@parche/blog/content';

const { pages, layouts } = createCollections();
const { posts, authors, taxonomies } = createBlogCollections();

export const collections = { pages, layouts, posts, authors, taxonomies };

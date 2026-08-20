import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, authorSchema } from './schemas.js';

export { postSchema, authorSchema } from './schemas.js';
export type { PostEntry, AuthorEntry } from './schemas.js';

/**
 * Create blog content collections.
 * Follows the same factory pattern as core's createCollections().
 *
 * Usage in content.config.ts:
 *   import { createBlogCollections } from '@parche/blog/content';
 *   const { posts, authors } = createBlogCollections();
 *   export const collections = { ...coreCollections, posts, authors };
 */
export function createBlogCollections(options?: {
  postSchema?: import('zod').ZodType;
  authorSchema?: import('zod').ZodType;
  postsBase?: string;
  authorsBase?: string;
}) {
  return {
    posts: defineCollection({
      loader: glob({
        pattern: '**/*.{md,mdx}',
        base: options?.postsBase ?? './src/content/posts',
      }),
      schema: options?.postSchema ?? postSchema,
    }),
    authors: defineCollection({
      loader: glob({
        pattern: '**/*.{json,yaml,yml}',
        base: options?.authorsBase ?? './src/content/authors',
      }),
      schema: options?.authorSchema ?? authorSchema,
    }),
  };
}

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, authorSchema, taxonomySchema } from './schemas.js';

export { postSchema, authorSchema, taxonomySchema, taxonomyTermSchema } from './schemas.js';
export type { PostEntry, AuthorEntry, TaxonomyEntry, TaxonomyTerm } from './schemas.js';

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
  taxonomySchema?: import('zod').ZodType;
  postsBase?: string;
  authorsBase?: string;
  taxonomiesBase?: string;
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
    // One flat entry per locale (en.json, es.json) — a term is a couple of
    // fields, so a file each would be noise.
    taxonomies: defineCollection({
      loader: glob({
        pattern: '*.{json,yaml,yml}',
        base: options?.taxonomiesBase ?? './src/content/taxonomies',
      }),
      schema: options?.taxonomySchema ?? taxonomySchema,
    }),
  };
}

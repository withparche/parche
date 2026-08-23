import { z } from 'zod';
import { metadataSchema } from '@parche/core/content';

/**
 * Schema for blog post entries.
 * Reuses metadataSchema from core for SEO — only adds blog-specific fields.
 */
export const postSchema = z.object({
  // Core
  title: z.string(),
  description: z.string().optional(),
  urlSlug: z.string().optional(),

  // SEO/metadata — reuses core schema
  metadata: metadataSchema.optional(),

  // Publishing
  publishDate: z.coerce.date(),
  modifiedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),

  // Taxonomy
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Authors
  authors: z.array(z.string()).default([]),
  authorName: z.string().optional(),

  // Media
  image: z
    .object({
      src: z.string(),
      alt: z.string().default(''),
      caption: z.string().optional(),
    })
    .optional(),

  // Series
  series: z
    .object({
      name: z.string(),
      order: z.number(),
    })
    .optional(),

  // Content hints
  excerpt: z.string().optional(),
  readingTime: z.number().optional(),

  // Layout
  template: z.string().default('blog-post'),
  layout: z.string().default('default'),

  // Builder sections (optional visual hero area)
  sections: z
    .array(
      z.object({
        widget: z.string(),
        props: z.record(z.string(), z.unknown()).default({}),
      }),
    )
    .optional(),
});

/**
 * Schema for author entries.
 */
/**
 * A declared taxonomy term — a category or a tag with details of its own.
 *
 * Posts reference taxonomies by plain string ('Tutorials', 'astro'), which is
 * enough to group them but leaves nowhere to put a translated name, a
 * description, or a clean URL segment. Declaring a term fills those in; a term
 * that is never declared keeps working exactly as before.
 */
export const taxonomyTermSchema = z.object({
  /** The value as written in post frontmatter. Matched case-insensitively. */
  key: z.string(),
  /** Display name. Defaults to the key with its first letter capitalized. */
  title: z.string().optional(),
  /** URL segment. Defaults to the key lowercased, as before — declare it to get
   *  a clean slug for a term whose name has spaces or accents. */
  slug: z.string().optional(),
  /** Shown on the term's own listing page and used as its meta description. */
  description: z.string().optional(),
  image: z
    .object({
      src: z.string(),
      alt: z.string().default(''),
    })
    .optional(),
});

/** One entry per locale: `src/content/taxonomies/en.json`. */
export const taxonomySchema = z.object({
  categories: z.array(taxonomyTermSchema).default([]),
  tags: z.array(taxonomyTermSchema).default([]),
});

export const authorSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  bio: z.string().optional(),
  avatar: z
    .object({
      src: z.string(),
      alt: z.string().default(''),
    })
    .optional(),
  role: z.string().optional(),
  website: z.string().url().optional(),
  social: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      mastodon: z.string().optional(),
    })
    .optional(),
});

export type PostEntry = z.infer<typeof postSchema>;
export type AuthorEntry = z.infer<typeof authorSchema>;
export type TaxonomyTerm = z.infer<typeof taxonomyTermSchema>;
export type TaxonomyEntry = z.infer<typeof taxonomySchema>;

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

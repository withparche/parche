import { z } from 'zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schema for page-level SEO/metadata overrides.
 * All fields are optional — the system resolves fallbacks at render time
 * (e.g. metadata.title ?? page.title).
 */
export const metadataSchema = z.object({
  // Meta basics (override page-level title/description for SEO)
  title: z.string().optional(),
  description: z.string().optional(),
  canonical: z.string().optional(),
  keywords: z.string().optional(),

  // Indexing & robots
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  robots: z
    .object({
      maxSnippet: z.number().optional(),
      maxImagePreview: z.enum(['none', 'standard', 'large']).optional(),
      maxVideoPreview: z.number().optional(),
    })
    .optional(),

  // Open Graph
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  ogType: z.enum(['website', 'article', 'product', 'profile']).default('website'),

  // Twitter Card
  twitterCard: z.enum(['summary', 'summary_large_image', 'player', 'app']).default('summary_large_image'),

  // Article (relevant when ogType='article')
  article: z
    .object({
      author: z.string().optional(),
      publishedDate: z.string().optional(),
      modifiedDate: z.string().optional(),
      section: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),

  // Custom structured data escape hatch
  jsonLd: z.unknown().optional(),
});

/**
 * Base schema for page content entries.
 * Users can extend this with `.extend({ myField: z.string() })`.
 */
/**
 * Schema for a single section (shared by pages and layouts).
 */
export const sectionSchema = z.object({
  widget: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  wrapper: z.union([
    z.literal(false),
    z.object({
      id: z.string().optional(),
      isDark: z.boolean().optional(),
      bg: z.string().optional(),
      classes: z.record(z.string(), z.unknown()).optional(),
      as: z.string().optional(),
    }),
  ]).optional(),
});

export const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  urlSlug: z.string().optional(),
  template: z.string().default('dynamic'),
  layout: z.string().optional(),
  metadata: metadataSchema.optional(),
  sections: z.array(sectionSchema).optional(),
  body: z.string().optional(),
  formLabels: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for a single navigation link (used in dropdowns, mega menus, etc.)
 */
const navLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for a group of links (used in dropdowns and mega menu columns).
 */
const navGroupSchema = z.object({
  title: z.string().optional(),
  links: z.array(navLinkSchema),
});

/**
 * Schema for mega menu configuration.
 */
const megaMenuSchema = z.object({
  columns: z.number().min(1).max(4).default(3),
  featured: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    href: z.string(),
  }).optional(),
  footer: z.string().optional(),
});

/**
 * Schema for a top-level header link.
 * - href only → simple link
 * - children without mega → dropdown
 * - children + mega → mega menu
 */
const headerLinkSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
  children: z.array(navGroupSchema).optional(),
  mega: megaMenuSchema.optional(),
});

/**
 * Schema for a header CTA action button.
 */
const headerActionSchema = z.object({
  label: z.string(),
  href: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
  icon: z.string().optional(),
});

/**
 * Schema for the announcement bar above the header.
 */
const announcementSchema = z.object({
  text: z.string(),
  href: z.string().optional(),
  icon: z.string().optional(),
  dismissible: z.boolean().default(true),
  aside: z.string().optional(),
  class: z.string().optional(),
});

/**
 * Schema for the header logo (text or image).
 */
const logoSchema = z.union([
  z.string(),
  z.object({
    src: z.string(),
    alt: z.string().default('Logo'),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
]);

/**
 * Base schema for navigation entries.
 */
export const navigationSchema = z.object({
  header: z.object({
    logo: logoSchema.optional(),
    links: z.array(headerLinkSchema),
    actions: z.array(headerActionSchema).optional(),
    announcement: announcementSchema.optional(),
  }),
  footer: z.object({
    columns: z.array(
      z.object({
        title: z.string(),
        links: z.array(z.object({ label: z.string(), href: z.string() })),
      }),
    ),
    secondaryLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    socialLinks: z.array(z.object({
      label: z.string(),
      href: z.string(),
      icon: z.string().optional(),
    })).optional(),
    footNote: z.string().optional(),
    copyright: z.string().optional(),
  }),
});

/**
 * Schema for layout entries (same sections format as pages).
 */
export const layoutSchema = z.object({
  sections: z.array(sectionSchema),
});

export type MetadataEntry = z.infer<typeof metadataSchema>;
export type PageEntry = z.infer<typeof pageSchema>;
export type NavigationEntry = z.infer<typeof navigationSchema>;
export type LayoutEntry = z.infer<typeof layoutSchema>;
export type SectionEntry = z.infer<typeof sectionSchema>;

/**
 * Ready-to-use collections for a standard Parche project.
 *
 * Usage in content.config.ts:
 *   export { collections } from '@parche/core/content';
 *
 * Or extend:
 *   import { createCollections, pageSchema } from '@parche/core/content';
 *   export const collections = createCollections({
 *     pageSchema: pageSchema.extend({ author: z.string() }),
 *   });
 */
export function createCollections(options?: {
  pageSchema?: z.ZodType;
  navigationSchema?: z.ZodType;
  layoutSchema?: z.ZodType;
  pagesBase?: string;
  navigationBase?: string;
  layoutsBase?: string;
}) {
  return {
    pages: defineCollection({
      loader: glob({
        pattern: '**/*.{json,md}',
        base: options?.pagesBase ?? './src/content/pages',
      }),
      schema: options?.pageSchema ?? pageSchema,
    }),
    navigation: defineCollection({
      loader: glob({
        pattern: '*.json',
        base: options?.navigationBase ?? './src/content/navigation',
      }),
      schema: options?.navigationSchema ?? navigationSchema,
    }),
    layouts: defineCollection({
      loader: glob({
        pattern: '**/*.{yaml,yml,json}',
        base: options?.layoutsBase ?? './src/content/layouts',
      }),
      schema: options?.layoutSchema ?? layoutSchema,
    }),
  };
}

/** Default collections — import directly if no customization needed */
export const collections = createCollections();

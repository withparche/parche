import { z } from 'zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { nodeSchema } from './node.js';

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
 *
 * A page is metadata plus trees of nodes: `sections` fills the layout's
 * unnamed outlet, `slots[name]` fills a named one (`aside`, `toolbar`…).
 */
export const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  urlSlug: z.string().optional(),
  layout: z.string().optional(),
  metadata: metadataSchema.optional(),
  sections: z.array(nodeSchema).optional(),
  slots: z.record(z.string(), z.array(nodeSchema)).optional(),
  body: z.string().optional(),
  formLabels: z.record(z.string(), z.string()).optional(),
});

/**
 * A menu in the `navigation` collection, one file per menu and locale
 * (`navigation/en/main.json`). `items` is the list a widget prop takes, in
 * that widget's shape: header links for a header, link columns for a footer.
 * A prop points at it with `{ "$navigation": "main" }`; the renderer replaces
 * the reference by the items and the widget's own schema checks them.
 */
export const navigationSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.unknown()),
});

/**
 * Schema for layout entries: a tree of nodes with `Outlet` nodes where the
 * page goes. `{ "widget": "Outlet" }` is the unnamed outlet; `props.name`
 * names another.
 */
export const layoutSchema = z.object({
  sections: z.array(nodeSchema),
});

/**
 * Schema for preset entries: a saved subtree with real values, inserted into
 * a page by name through a `Preset` node, or copied by an editor. `label`
 * and `description` are what a palette shows.
 */
export const presetSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  tree: z.array(nodeSchema).min(1),
});

export type PresetEntry = z.infer<typeof presetSchema>;
export type MetadataEntry = z.infer<typeof metadataSchema>;
export type PageEntry = z.infer<typeof pageSchema>;
export type NavigationEntry = z.infer<typeof navigationSchema>;
export type LayoutEntry = z.infer<typeof layoutSchema>;

/**
 * Ready-to-use collections for a standard Parche project.
 *
 * Usage in content.config.ts:
 *   export { collections } from '@parche/astro/content';
 *
 * Or extend:
 *   import { createCollections, pageSchema } from '@parche/astro/content';
 *   export const collections = createCollections({
 *     pageSchema: pageSchema.extend({ author: z.string() }),
 *   });
 */
export function createCollections(options?: {
  pageSchema?: z.ZodType;
  navigationSchema?: z.ZodType;
  layoutSchema?: z.ZodType;
  presetSchema?: z.ZodType;
  pagesBase?: string;
  navigationBase?: string;
  layoutsBase?: string;
  presetsBase?: string;
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
        pattern: '**/*.{yaml,yml,json}',
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
    presets: defineCollection({
      loader: glob({
        pattern: '**/*.{yaml,yml,json}',
        base: options?.presetsBase ?? './src/content/presets',
      }),
      schema: options?.presetSchema ?? presetSchema,
    }),
  };
}

/** Default collections — import directly if no customization needed */
export const collections = createCollections();

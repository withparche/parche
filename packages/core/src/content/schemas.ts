import { z } from 'zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { nodeSchema } from './node.js';
import { patternSchema } from './patterns.js';

export {
  metadataSchema,
  pageSchema,
  navigationSchema,
  layoutSchema,
} from './entries.js';
export { patternSchema } from './patterns.js';
export type { MetadataEntry, PageEntry, NavigationEntry, LayoutEntry } from './entries.js';
export type { PatternEntry } from './patterns.js';
import { metadataSchema, pageSchema, navigationSchema, layoutSchema } from './entries.js';

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
  pagesBase?: string;
  navigationBase?: string;
  layoutsBase?: string;
  patternsBase?: string;
}) {
  return {
    pages: defineCollection({
      loader: glob({
        pattern: '**/*.{json,md,yaml,yml}',
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
    // Compositions used as `pattern/<id>`: `<id>.json`, or `<locale>/<id>.json`
    // for one written per language (see content/patterns.ts).
    patterns: defineCollection({
      loader: glob({
        pattern: '**/*.{yaml,yml,json}',
        base: options?.patternsBase ?? './src/content/patterns',
      }),
      schema: patternSchema,
    }),
  };
}

/** Default collections — import directly if no customization needed */
export const collections = createCollections();

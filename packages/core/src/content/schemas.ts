import { z } from 'zod';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { nodeSchema } from './node.js';
import { widgetDefinitionSchema } from './json-widgets.js';

export {
  metadataSchema,
  pageSchema,
  navigationSchema,
  layoutSchema,
  presetSchema,
} from './entries.js';
export type { PresetEntry, MetadataEntry, PageEntry, NavigationEntry, LayoutEntry } from './entries.js';
import { metadataSchema, pageSchema, navigationSchema, layoutSchema, presetSchema } from './entries.js';

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
  widgetsBase?: string;
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
    presets: defineCollection({
      loader: glob({
        pattern: '**/*.{yaml,yml,json}',
        base: options?.presetsBase ?? './src/content/presets',
      }),
      schema: options?.presetSchema ?? presetSchema,
    }),
    // JSON widgets: the file name is the widget name, case kept (TourStep.json
    // is "TourStep"), so the id is not slugified like other entries.
    widgets: defineCollection({
      loader: glob({
        pattern: '*.{yaml,yml,json}',
        base: options?.widgetsBase ?? './src/content/widgets',
        generateId: ({ entry }) => entry.replace(/\.(json|ya?ml)$/, ''),
      }),
      schema: widgetDefinitionSchema,
    }),
  };
}

/** Default collections — import directly if no customization needed */
export const collections = createCollections();

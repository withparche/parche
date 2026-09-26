/**
 * The validation context for the running site: its catalog from the
 * virtual modules core generates, its patterns and references through
 * core's own resolvers, and each collection's schema. Only routes import
 * this (it needs the site's Vite); the checks themselves are pure
 * (validate.ts).
 */
// @ts-expect-error virtual module provided by @parche/astro
import { widgetMeta, widgetPropSchemas } from 'parche:registry/widgetSchemas';
// @ts-expect-error virtual module provided by @parche/astro
import { tones, wrapper } from 'parche:config/layout';
// @ts-expect-error virtual module provided by @parche/astro
import { defaultLocale } from 'parche:config/i18n';
import { definePattern, loadPatterns, resolveRefs } from '@parche/astro/dev';
import { layoutSchema, navigationSchema, pageSchema, patternSchema } from '@parche/astro/content/pure';
import type { ZodType } from 'zod';
import type { ValidationContext } from './validate.js';

const schemas: Record<string, ZodType> = { pages: pageSchema, layouts: layoutSchema, patterns: patternSchema, navigation: navigationSchema };

/** A document's locale: the first segment of its id when it is a locale folder. */
export const localeOf = (id: string) => (id.includes('/') ? id.split('/')[0] : defaultLocale);

export async function validationContext(collection: string, id: string): Promise<ValidationContext> {
  const loaded = await loadPatterns(localeOf(id));
  return {
    widgetMeta,
    widgetPropSchemas,
    tones: (tones as { name: string }[]).map((t) => t.name),
    wrapper: wrapper ?? null,
    definitions: loaded.patterns,
    collectionSchema: schemas[collection],
    resolveRefs: (nodes, base) => resolveRefs(nodes, localeOf(id), base),
    definePattern,
  };
}

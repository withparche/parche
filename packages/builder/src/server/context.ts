/**
 * The validation context for the running site: its catalog from the
 * virtual modules core generates, its JSON widgets and references through
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
import { defineJsonWidget, loadJsonWidgets, resolveRefs } from '@parche/astro/dev';
import { layoutSchema, navigationSchema, pageSchema, presetSchema } from '@parche/astro/content/pure';
import type { ZodType } from 'zod';
import type { ValidationContext } from './validate.js';

const schemas: Record<string, ZodType> = { pages: pageSchema, layouts: layoutSchema, presets: presetSchema, navigation: navigationSchema };

/** A document's locale: the first segment of its id when it is a locale folder. */
export const localeOf = (id: string) => (id.includes('/') ? id.split('/')[0] : defaultLocale);

export async function validationContext(collection: string, id: string): Promise<ValidationContext> {
  const json = await loadJsonWidgets();
  return {
    widgetMeta,
    widgetPropSchemas,
    tones: (tones as { name: string }[]).map((t) => t.name),
    wrapper: wrapper ?? null,
    definitions: json.widgets,
    collectionSchema: schemas[collection],
    resolveRefs: (nodes, base) => resolveRefs(nodes, localeOf(id), base),
    defineJsonWidget,
  };
}

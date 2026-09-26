/**
 * What the editor knows about the site: its widgets with their props as
 * JSON Schema and their meta (slots, wrapper, groups), the tones and the
 * default wrapper, the themes and the locales. Read from the virtual
 * modules core generates, so it is always the site's own catalog.
 */
// @ts-expect-error virtual module provided by @parche/astro
import { widgetSchemas, widgetMeta } from 'parche:registry/widgetSchemas';
// @ts-expect-error virtual module provided by @parche/astro
import { tones, wrapper, unwrapped } from 'parche:config/layout';
// @ts-expect-error virtual module provided by @parche/astro
import { themes, defaultTheme } from 'parche:config/themes';
// @ts-expect-error virtual module provided by @parche/astro
import { locales, defaultLocale } from 'parche:config/i18n';
import { z } from 'zod';
import { loadJsonWidgets } from '@parche/astro/dev';
import { MAX_NODE_DEPTH, outletWrappers, pageSchema } from '@parche/astro/content/pure';
import { listDocs, readDoc } from './files.js';
import { session } from './session.js';

export interface CatalogWidget {
  label: string;
  category?: string;
  description?: string;
  icon?: string;
  hidden?: boolean;
  wrapper?: boolean;
  slots?: Record<string, { label?: string; help?: string; allow?: string[]; min?: number; max?: number }>;
  ui?: { groups?: { key: string; label: string; fields: string[] }[] };
  schema: unknown;
}

export async function buildCatalog() {
  const widgets: Record<string, CatalogWidget> = {};
  for (const [name, meta] of Object.entries(widgetMeta as Record<string, any>)) {
    widgets[name] = {
      label: meta.label ?? name,
      category: meta.category,
      description: meta.description,
      icon: meta.icon,
      hidden: meta.hidden,
      wrapper: meta.wrapper,
      slots: meta.slots,
      ui: meta.ui,
      schema: (widgetSchemas as Record<string, unknown>)[name] ?? null,
    };
  }
  const json = await loadJsonWidgets();
  const jsonWidgets = Object.fromEntries(
    Object.values(json.widgets).map((d) => [d.name, { label: d.label, description: d.description, category: d.category ?? 'custom', icon: d.icon, wrapper: d.wrapper, schema: d.props }]),
  );
  // The layouts a page can pick, each with the outlets it declares (a page
  // fills the named ones through its `slots`).
  const root = session().root;
  const layouts = [];
  for (const d of await listDocs(root, 'layouts')) {
    const doc = await readDoc(root, 'layouts', d.id).catch(() => null);
    const [locale, ...rest] = d.id.includes('/') ? d.id.split('/') : [defaultLocale, d.id];
    const outlets = doc ? outletWrappers(Array.isArray(doc.data.sections) ? (doc.data.sections as never) : []).map((o) => o.name) : [];
    layouts.push({ id: d.id, locale, name: rest.join('/'), outlets });
  }
  const page = z.toJSONSchema(pageSchema, { unrepresentable: 'any' }) as { properties: Record<string, unknown> };
  const pageSettings = {
    type: 'object',
    properties: Object.fromEntries(['title', 'description', 'urlSlug', 'metadata'].map((k) => [k, page.properties[k]])),
  };
  return {
    widgets,
    jsonWidgets,
    layouts,
    pageSettings,
    limits: { maxDepth: MAX_NODE_DEPTH, maxFilledSlots: 6 },
    tones: (tones as { name: string }[]).map((t) => t.name),
    defaultWrapper: wrapper ?? null,
    unwrapped: unwrapped ?? [],
    themes: { list: themes ?? [], default: defaultTheme ?? null },
    i18n: { locales, defaultLocale },
  };
}

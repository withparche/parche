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
  return {
    widgets,
    tones: (tones as { name: string }[]).map((t) => t.name),
    defaultWrapper: wrapper ?? null,
    unwrapped: unwrapped ?? [],
    themes: { list: themes ?? [], default: defaultTheme ?? null },
    i18n: { locales, defaultLocale },
  };
}

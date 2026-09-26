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
import { loadPatterns } from '@parche/astro/dev';
import { outletWrappers, pageSchema, rootWidgets } from '@parche/astro/content/pure';
import { listDocs, readDoc } from './files.js';
import { session } from './session.js';
import { navRefs, schemaAt } from './usage.js';
import { pageUrl } from '../shared/page-url.js';

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
  // Where a layout puts the page: the renderer's, not a registered widget.
  // Its props are its name (the unnamed one is `default`) and the wrapper
  // every item of the page's list goes in, which the inspector edits apart.
  widgets.Outlet = {
    label: 'Outlet',
    category: 'layout',
    description: "Where the page goes in a layout. A named outlet takes what a page puts in its slot of that name; the unnamed one takes the page's sections.",
    wrapper: false,
    schema: { type: 'object', properties: { name: { type: 'string', title: 'Name', description: 'Leave empty for the page\'s sections; a name makes a slot pages fill by that name.' } } },
  };
  // Every pattern once, by its entry (`tour-step`, `en/faq-agencies`): the
  // editor resolves `pattern/<id>` in the document's locale, as a page does.
  // `roots` is what it stands for in a slot that allows only some widgets.
  const loaded = await loadPatterns();
  const patterns = Object.values(loaded.patterns).map((p) => ({
    entry: p.entry,
    label: p.label,
    description: p.description,
    category: p.category ?? 'patterns',
    icon: p.icon,
    schema: p.props,
    roots: rootWidgets(p.name, loaded.patterns),
  }));
  // The layouts a page can pick, each with the outlets it declares (a page
  // fills the named ones through its `slots`) and the pages that use it.
  const root = session().root;
  const pages = [];
  for (const d of await listDocs(root, 'pages')) {
    const doc = await readDoc(root, 'pages', d.id).catch(() => null);
    if (doc) pages.push({ id: d.id, data: doc.data });
  }
  // Each page's URL, as the page route builds it: a layout or a menu shows
  // in the preview through a page that uses it.
  const pageUrls = Object.fromEntries(pages.map((p) => [p.id, pageUrl(p.id, p.data.urlSlug as string | undefined, defaultLocale)]));
  const layouts = [];
  const refs: { doc: string; widget: string; prop: (string | number)[]; ref: string; locale: string }[] = [];
  for (const d of await listDocs(root, 'layouts')) {
    const doc = await readDoc(root, 'layouts', d.id).catch(() => null);
    const [locale, ...rest] = d.id.includes('/') ? d.id.split('/') : [defaultLocale, d.id];
    const name = rest.join('/');
    const sections = doc && Array.isArray(doc.data.sections) ? (doc.data.sections as never[]) : [];
    const outlets = outletWrappers(sections).map((o) => o.name);
    const usedBy = pages.filter((p) => (p.id.includes('/') ? p.id.split('/')[0] : defaultLocale) === locale && ((p.data.layout as string | undefined) ?? 'default') === name).map((p) => p.id);
    layouts.push({ id: d.id, locale, name, outlets, usedBy });
    for (const r of navRefs(sections)) refs.push({ doc: `layouts/${d.id}`, locale, ...r });
  }
  for (const p of pages) {
    const locale = p.id.includes('/') ? p.id.split('/')[0] : defaultLocale;
    for (const r of navRefs([...((p.data.sections as never[]) ?? []), ...Object.values((p.data.slots as Record<string, never[]>) ?? {}).flat()])) refs.push({ doc: `pages/${p.id}`, locale, ...r });
  }
  // A menu's items take the shape of the prop that uses it (Header.links,
  // Footer.columns): its schema is that prop's.
  const navigation = [];
  for (const d of await listDocs(root, 'navigation')) {
    const [locale, ...rest] = d.id.includes('/') ? d.id.split('/') : [defaultLocale, d.id];
    const name = rest.join('/');
    const usedBy = refs.filter((r) => r.ref === `navigation/${name}` && (r.locale === locale || !d.id.includes('/')));
    const first = usedBy[0];
    const itemsSchema = first ? schemaAt((widgetSchemas as Record<string, unknown>)[first.widget], first.prop) : null;
    navigation.push({ id: d.id, locale, name, usedBy: usedBy.map(({ doc, widget, prop }) => ({ doc, widget, prop: prop.join('.') })), itemsSchema });
  }
  const page = z.toJSONSchema(pageSchema, { unrepresentable: 'any' }) as { properties: Record<string, unknown> };
  const pageSettings = {
    type: 'object',
    properties: Object.fromEntries(['title', 'description', 'urlSlug', 'metadata'].map((k) => [k, page.properties[k]])),
  };
  return {
    widgets,
    patterns,
    layouts,
    navigation,
    pageUrls,
    pageSettings,
    limits: { maxFilledSlots: 6 },
    tones: (tones as { name: string }[]).map((t) => t.name),
    defaultWrapper: wrapper ?? null,
    unwrapped: unwrapped ?? [],
    themes: { list: themes ?? [], default: defaultTheme ?? null },
    i18n: { locales, defaultLocale },
  };
}

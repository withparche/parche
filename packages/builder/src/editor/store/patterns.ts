import { patternsFor, PATTERN_PREFIX } from '@parche/astro/content/pure';
import type { Catalog, CatalogPattern, CatalogWidget } from './types';

/**
 * Patterns as a document uses them: `pattern/<id>` is looked up in the
 * document's locale first (`en/faq`), then as written (`faq`), as the page
 * renders it. The catalog lists each once, by its entry.
 */
const cache = new WeakMap<Catalog, Map<string, Record<string, CatalogPattern>>>();

export function patternsIn(catalog: Catalog, locale: string): Record<string, CatalogPattern> {
  let byLocale = cache.get(catalog);
  if (!byLocale) cache.set(catalog, (byLocale = new Map()));
  let out = byLocale.get(locale);
  if (!out) byLocale.set(locale, (out = patternsFor(catalog.patterns ?? [], locale)));
  return out;
}

/** The locale a document is written in: its id's first folder, else the site's default. */
export const localeOfDoc = (id: string, catalog: Catalog) => (id.includes('/') && catalog.i18n.locales.includes(id.split('/')[0]) ? id.split('/')[0] : catalog.i18n.defaultLocale);

/** A widget or a pattern as the editor shows and inserts it; undefined when the site has neither. */
export function entryOf(catalog: Catalog | null, name: string, locale: string): (Pick<CatalogWidget, 'label' | 'schema'> & Partial<CatalogWidget>) | undefined {
  if (!catalog) return undefined;
  return name.startsWith(PATTERN_PREFIX) ? patternsIn(catalog, locale)[name] : catalog.widgets[name];
}

/** What a pattern stands for where it is used: its root widgets (the name itself for anything else). */
export function standsFor(catalog: { patterns?: Pick<CatalogPattern, 'entry' | 'roots'>[] }, name: string): string[] {
  if (!name.startsWith(PATTERN_PREFIX)) return [name];
  const id = name.slice(PATTERN_PREFIX.length);
  const list = catalog.patterns ?? [];
  return (list.find((p) => p.entry === id) ?? list.find((p) => p.entry.endsWith(`/${id}`)))?.roots ?? [name];
}

/**
 * What a document can have inserted: the site's widgets and the patterns in
 * its locale, each by the name it is used with. A pattern never offers
 * itself.
 */
export function insertable(catalog: Catalog, doc: { collection: string; id: string }): [string, { label: string; description?: string; category?: string; hidden?: boolean }][] {
  const locale = localeOfDoc(doc.id, catalog);
  const own = doc.collection === 'patterns' ? [PATTERN_PREFIX + doc.id, PATTERN_PREFIX + doc.id.replace(new RegExp(`^${locale}/`), '')] : [];
  return [...Object.entries(catalog.widgets), ...Object.entries(patternsIn(catalog, locale)).filter(([name]) => !own.includes(name) && !name.startsWith(`${PATTERN_PREFIX}${locale}/`))];
}

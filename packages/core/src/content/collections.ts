import { localizePath, splitLocale } from '../utils/paths.js';
import type { CollectionPages } from '../types/config.js';

/**
 * The pages of the site's collections of plain data (`collections` in the
 * site config), as data: where each entry is served, and what the widget that
 * renders it is given. Pure, so it is tested without a site; the resolver and
 * the entry addresses both use it, so a page is always linked where it is
 * served.
 */
export type { CollectionPages };

export interface Entry {
  id: string;
  data: Record<string, unknown>;
}

/** A value at a dotted path (`photos.0.src`). */
export function get(obj: unknown, path: string): unknown {
  let cur: any = obj;
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

/** An entry's locale (its id's locale folder, else the default) and its key. */
export function entryLocale(entry: Entry, locales: readonly string[], defaultLocale: string): { locale: string; key: string } {
  return splitLocale(entry.id, locales, defaultLocale);
}

/** Where an entry is served, its locale's prefix included. */
export function entryPath(spec: CollectionPages, entry: Entry, locales: readonly string[], defaultLocale: string): string {
  const { locale, key } = entryLocale(entry, locales, defaultLocale);
  const slug = typeof entry.data.slug === 'string' ? entry.data.slug : key;
  return localizePath(spec.path.replace(/%slug%/g, slug), locale, defaultLocale);
}

/**
 * A collection's entries prepared once, so a page is a lookup: by id (a
 * built page asks by entry), by the address it is served at (a server
 * request asks by path), and by key for the translations of one entry. At
 * an address two entries claim, the first in the list wins, as a scan did.
 * Drafts are indexed too; whoever looks one up decides whether to serve it.
 */
export function indexEntries(spec: CollectionPages, entries: Entry[], locales: readonly string[], defaultLocale: string): { byId: Map<string, Entry>; byPath: Map<string, Entry>; byKey: Map<string, Entry[]> } {
  const byId = new Map<string, Entry>();
  const byPath = new Map<string, Entry>();
  const byKey = new Map<string, Entry[]>();
  for (const entry of entries) {
    byId.set(entry.id, entry);
    const path = entryPath(spec, entry, locales, defaultLocale);
    if (!byPath.has(path)) byPath.set(path, entry);
    const { key } = entryLocale(entry, locales, defaultLocale);
    (byKey.get(key) ?? byKey.set(key, []).get(key)!).push(entry);
  }
  return { byId, byPath, byKey };
}

/**
 * What the widget is given: the entry's fields it declares, by name, and
 * those `props` maps from other fields. A field the widget does not declare
 * is left out, so a collection can describe its entries fully while a page
 * shows a part of them. With no declaration known (`declared` null), every
 * field goes through.
 */
export function propsFor(spec: CollectionPages, entry: Entry, declared: readonly string[] | null): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const mapped = spec.props ?? {};
  for (const [key, value] of Object.entries(entry.data)) {
    if (key in mapped) continue;
    if (declared && !declared.includes(key)) continue;
    out[key] = value;
  }
  for (const [prop, path] of Object.entries(mapped)) {
    const value = get(entry.data, path);
    if (value !== undefined) out[prop] = value;
  }
  return out;
}

/** The page's title, description and picture, from the fields `metadata` names or the usual ones. */
export function metadataFor(spec: CollectionPages, entry: Entry): { title: string; description?: string; image?: string } {
  const m = spec.metadata ?? {};
  const str = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined);
  const title = str(get(entry.data, m.title ?? 'title')) ?? str(entry.data.name) ?? entry.id;
  const description = str(get(entry.data, m.description ?? 'description')) ?? str(entry.data.summary);
  const image = m.image ? str(get(entry.data, m.image)) : undefined;
  return { title, description, image };
}

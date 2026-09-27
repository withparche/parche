/**
 * Where an entry of a collection with pages is served, for core (`urls` in
 * the manifest): a `{ "$collection": … }` of it yields each entry with this
 * address as `href`.
 */
import config from 'parche:app/collection-pages';
import { defaultLocale, locales } from 'parche:config/i18n';
import { entryPath, type CollectionPages, type Entry } from './pages.js';

export default function entryUrl(entry: Entry, collection: string): string | undefined {
  const spec = (config as unknown as Record<string, CollectionPages>)[collection];
  return spec ? entryPath(spec, entry, locales, defaultLocale) : undefined;
}

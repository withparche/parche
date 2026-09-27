/**
 * Where an entry of a collection with pages (`collections` in the site
 * config) is served, for `urlFor`: a `{ "$collection": … }` of it yields each
 * entry with this address as `href`.
 */
import config from 'parche:config';
import { defaultLocale, locales } from 'parche:config/i18n';
import { entryPath, type Entry } from '../content/collections.js';

export default function entryUrl(entry: Entry, collection: string): string | undefined {
  const spec = config.collections?.[collection];
  return spec ? entryPath(spec, entry, locales, defaultLocale) : undefined;
}

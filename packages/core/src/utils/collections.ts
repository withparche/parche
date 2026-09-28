/**
 * The pages of the site's collections (`collections` in the site config),
 * through core's page route, as a resolver like the blog's root-level posts:
 * `getPaths` lists an address per entry, `resolve` finds the entry an address
 * names and returns its page — its layout, its metadata, its translations,
 * and one node, the widget with the entry's fields as props, which core
 * renders with the layout's wrapper. Registered only when the site names a
 * collection there.
 */
import config from 'parche:config';
import { defaultLocale, locales } from 'parche:config/i18n';
import { widgetSchemas } from 'parche:registry/widgetSchemas';
import { localizeSiteConfig } from 'parche:utils/site';
import { pageMetadata } from 'parche:utils/metadata';
import { resolveAssets } from 'parche:utils/assets';
import { loadPatterns } from 'parche:utils/patterns';
import { localizePath } from './paths.js';
import { entriesOf, memo } from './entries.js';
import { PATTERN_PREFIX } from '../content/patterns.js';
import { entryLocale, entryPath, indexEntries, metadataFor, propsFor, type CollectionPages, type Entry } from '../content/collections.js';

const configured = (): Record<string, CollectionPages> => config.collections ?? {};

const entries = (name: string) => entriesOf(name) as unknown as Promise<Entry[]>;

/** The collection read and indexed once per build or server (utils/entries.ts), so an entry's page is a lookup. */
async function indexed(name: string, spec: CollectionPages) {
  const list = await entries(name);
  return memo(`collections:${name}`, () => indexEntries(spec, list, locales, defaultLocale));
}

const draft = (e: Entry) => e.data.draft === true;

/** The props the widget declares: a pattern's from its JSON Schema, a registered widget's from its schema. */
async function declaredProps(widget: string, locale: string): Promise<string[] | null> {
  if (widget.startsWith(PATTERN_PREFIX)) {
    const pattern = (await loadPatterns(locale)).patterns[widget];
    return pattern ? Object.keys(pattern.props.properties ?? {}) : null;
  }
  const schema = (widgetSchemas as Record<string, { properties?: Record<string, unknown> }>)[widget];
  return schema?.properties ? Object.keys(schema.properties) : null;
}

export async function getPaths(_locales: string[], _defaultLocale: string, opts: { showDrafts?: boolean } = {}) {
  const paths: { params: { slug: string }; props: { fromResolver: true; resolverSlug: string; resolverLocale: string } }[] = [];
  for (const [name, spec] of Object.entries(configured())) {
    const list = await entries(name);
    // Astro cannot tell a collection it does not know from an empty one; either is a mistake here.
    if (list.length === 0) {
      throw new Error(
        `[parche] collections.${name} in the site config: no entries found. ` +
          `Declare a "${name}" collection in content.config.ts and give it an entry, or remove it from collections.`,
      );
    }
    for (const entry of list) {
      if (draft(entry) && !opts.showDrafts) continue;
      const { locale } = entryLocale(entry, locales, defaultLocale);
      // The lookup key is the entry itself: the address may hold any segments.
      paths.push({ params: { slug: entryPath(spec, entry, locales, defaultLocale).slice(1) }, props: { fromResolver: true, resolverSlug: `${name}:${entry.id}`, resolverLocale: locale } });
    }
  }
  return paths;
}

export async function resolve(slug: string, locale: string, opts: { showDrafts?: boolean } = {}) {
  for (const [name, spec] of Object.entries(configured())) {
    const index = await indexed(name, spec);
    // A built page asks by entry (`products:lamp`); a server request by its address.
    const entry =
      (slug.startsWith(`${name}:`) ? index.byId.get(slug.slice(name.length + 1)) : undefined) ??
      index.byPath.get(localizePath(`/${slug}`, locale, defaultLocale));
    if (!entry || (draft(entry) && !opts.showDrafts)) continue;

    const props = propsFor(spec, entry, await declaredProps(spec.widget, locale));
    const { key } = entryLocale(entry, locales, defaultLocale);
    const alternates = (index.byKey.get(key) ?? [])
      .filter((e) => !(draft(e) && !opts.showDrafts))
      .map((e) => ({ locale: entryLocale(e, locales, defaultLocale).locale, path: entryPath(spec, e, locales, defaultLocale) }));

    const meta = metadataFor(spec, entry);
    const metadata = await resolveAssets(
      pageMetadata(localizeSiteConfig(config, locale), locale, {
        title: meta.title,
        description: meta.description,
        ogImage: meta.image,
        metadata: entry.data.metadata as Record<string, unknown> | undefined,
        noindex: draft(entry),
      }),
    );

    return {
      template: '',
      layout: spec.layout ?? 'default',
      collection: name,
      entryId: entry.id,
      templateProps: {},
      metadata,
      alternates,
      // The page is one node: the widget with the entry's fields.
      extras: { sections: [{ widget: spec.widget, props }] },
    };
  }
  return null;
}

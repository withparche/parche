/**
 * The pages of collections, through core's page route (a resolver, as the
 * blog's root-level posts are): `getPaths` lists an address per entry,
 * `resolve` finds the entry an address names and returns its page — its
 * layout, its metadata, its translations, and one node, the widget with the
 * entry's fields as props, which core renders with the layout's wrapper.
 */
import { getCollection } from 'astro:content';
import { localizePath } from '@parche/astro/content/pure';
import { entryLocale, entryPath, metadataFor, propsFor, type CollectionPages, type Entry } from './pages.js';

const loadConfig = async () => (await import('parche:app/collection-pages')).default as unknown as Record<string, CollectionPages>;

async function entries(name: string): Promise<Entry[]> {
  try {
    return (await getCollection(name as never)) as unknown as Entry[];
  } catch {
    return [];
  }
}

const draft = (e: Entry) => e.data.draft === true;

/** The props the widget declares: a pattern's from its JSON Schema, a registered widget's from its schema. */
async function declaredProps(widget: string, locale: string): Promise<string[] | null> {
  if (widget.startsWith('pattern/')) {
    const { loadPatterns } = await import('parche:utils/patterns');
    const pattern = (await loadPatterns(locale)).patterns[widget];
    return pattern ? Object.keys(pattern.props.properties ?? {}) : null;
  }
  const { widgetSchemas } = await import('parche:registry/widgetSchemas');
  const schema = (widgetSchemas as Record<string, { properties?: Record<string, unknown> }>)[widget];
  return schema?.properties ? Object.keys(schema.properties) : null;
}

export async function getPaths(locales: string[], defaultLocale: string, opts: { showDrafts?: boolean } = {}) {
  const config = await loadConfig();
  const paths: { params: { slug: string }; props: { fromResolver: true; resolverSlug: string; resolverLocale: string } }[] = [];
  for (const [name, spec] of Object.entries(config)) {
    for (const entry of await entries(name)) {
      if (draft(entry) && !opts.showDrafts) continue;
      const { locale } = entryLocale(entry, locales, defaultLocale);
      // The lookup key is the entry itself: the address may hold any segments.
      paths.push({ params: { slug: entryPath(spec, entry, locales, defaultLocale).slice(1) }, props: { fromResolver: true, resolverSlug: `${name}:${entry.id}`, resolverLocale: locale } });
    }
  }
  return paths;
}

export async function resolve(slug: string, locale: string, opts: { showDrafts?: boolean } = {}) {
  const config = await loadConfig();
  const { locales, defaultLocale } = await import('parche:config/i18n');
  for (const [name, spec] of Object.entries(config)) {
    const list = await entries(name);
    // A built page asks by entry (`products:lamp`); a server request by its address.
    const entry =
      list.find((e) => `${name}:${e.id}` === slug) ??
      list.find((e) => entryLocale(e, locales, defaultLocale).locale === locale && entryPath(spec, e, locales, defaultLocale) === localizePath(`/${slug}`, locale, defaultLocale));
    if (!entry || (draft(entry) && !opts.showDrafts)) continue;

    const props = propsFor(spec, entry, await declaredProps(spec.widget, locale));
    const { key } = entryLocale(entry, locales, defaultLocale);
    const alternates = list
      .filter((e) => entryLocale(e, locales, defaultLocale).key === key && !(draft(e) && !opts.showDrafts))
      .map((e) => ({ locale: entryLocale(e, locales, defaultLocale).locale, path: entryPath(spec, e, locales, defaultLocale) }));

    const [{ default: siteConfig }, { localizeSiteConfig }, { pageMetadata }, { resolveAssets }] = await Promise.all([
      import('parche:config'),
      import('parche:utils/site'),
      import('parche:utils/metadata'),
      import('parche:utils/assets'),
    ]);
    const meta = metadataFor(spec, entry);
    const metadata = await resolveAssets(
      pageMetadata(localizeSiteConfig(siteConfig, locale), locale, {
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

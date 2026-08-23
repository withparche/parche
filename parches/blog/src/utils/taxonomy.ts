/**
 * Resolve categories and tags to their display details and URL segment.
 *
 * A post references a taxonomy by plain string, which is enough to group posts
 * but leaves nowhere to put a translated name or a clean URL. The optional
 * `taxonomies` collection fills that in, one entry per locale.
 *
 * The contract is deliberately conservative: **a term that is not declared
 * behaves exactly as it did before** — the URL segment is the raw value
 * lowercased, and the title is that value with its first letter capitalized. So
 * adding the collection changes nothing until you declare something in it, and
 * declaring one term does not disturb the rest.
 *
 * Resolution runs both ways because the two directions are used in different
 * places: link generation needs term → slug, and a route handler receiving a URL
 * parameter needs slug → term.
 */
import { getCollection } from 'astro:content';
import type { TaxonomyTerm } from '../content/schemas.js';
import { termFrom, termFromSlug } from './taxonomy-rules.js';

export type { TaxonomyKind, ResolvedTerm } from './taxonomy-rules.js';
export { termFrom, termFromSlug, defaultTitle, defaultSlug } from './taxonomy-rules.js';

import type { TaxonomyKind, ResolvedTerm } from './taxonomy-rules.js';

/** Load a locale's declared terms, keyed by lowercased key. Empty when the
 *  project ships no taxonomies collection at all. */
async function declaredTerms(
  kind: TaxonomyKind,
  locale: string,
): Promise<Map<string, TaxonomyTerm>> {
  const out = new Map<string, TaxonomyTerm>();
  try {
    const entries = await getCollection('taxonomies');
    const entry = entries.find((e: any) => e.id === locale || e.id === `${locale}/index`);
    for (const term of ((entry?.data as any)?.[kind] ?? []) as TaxonomyTerm[]) {
      out.set(term.key.toLowerCase(), term);
    }
  } catch {
    // No taxonomies collection — every term falls back to the defaults.
  }
  return out;
}

/** Resolve a frontmatter value (e.g. 'Tutorials') to its details. */
export async function resolveTerm(
  kind: TaxonomyKind,
  value: string,
  locale: string,
): Promise<ResolvedTerm> {
  return termFrom(await declaredTerms(kind, locale), value);
}

/** Resolve a URL segment back to the frontmatter value the queries expect. */
export async function resolveSlug(
  kind: TaxonomyKind,
  slug: string,
  locale: string,
  knownValues: string[],
): Promise<ResolvedTerm | null> {
  return termFromSlug(await declaredTerms(kind, locale), slug, knownValues);
}

/**
 * Load a locale's declared terms once and return synchronous lookups.
 *
 * Per-value async resolution does not survive contact with a `.map()` over post
 * cards — every call would return a promise. Loading the (small) term list up
 * front keeps the call sites readable and reads the collection once per page.
 */
export async function createTaxonomyResolver(locale: string) {
  const declared = {
    categories: await declaredTerms('categories', locale),
    tags: await declaredTerms('tags', locale),
  };

  const term = (kind: TaxonomyKind, value: string): ResolvedTerm =>
    termFrom(declared[kind], value);

  return {
    term,
    /** The URL segment for a value — what both links and paths must use. */
    slugFor: (kind: TaxonomyKind, value: string) => term(kind, value).slug,
    /** The display name for a value. */
    titleFor: (kind: TaxonomyKind, value: string) => term(kind, value).title,
  };
}

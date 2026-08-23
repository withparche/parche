/**
 * The rules that map a taxonomy value to its display details and URL segment.
 *
 * Deliberately free of Astro imports: these are the decisions worth testing, and
 * a module that reaches for `astro:content` cannot be loaded by a plain test
 * runner. `taxonomy.ts` supplies the collection data and delegates here.
 *
 * The contract is conservative: **a term that is not declared behaves exactly as
 * it did before** — the URL segment is the raw value lowercased and the title is
 * that value with its first letter capitalized. Adding the taxonomies collection
 * changes nothing until you declare something in it.
 */
import type { TaxonomyTerm } from '../content/schemas.js';

export type TaxonomyKind = 'categories' | 'tags';

export interface ResolvedTerm {
  /** The value as written in post frontmatter — what the queries match on. */
  key: string;
  /** Display name. */
  title: string;
  /** URL segment. */
  slug: string;
  description?: string;
  image?: { src: string; alt: string };
}

/** The default title for an undeclared term: unchanged from before. */
export function defaultTitle(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** The default URL segment for an undeclared term: unchanged from before. */
export function defaultSlug(value: string): string {
  return value.toLowerCase();
}

/** Resolve a frontmatter value against a set of declared terms. */
export function termFrom(declared: Map<string, TaxonomyTerm>, value: string): ResolvedTerm {
  const found = declared.get(value.toLowerCase());
  return {
    key: value,
    title: found?.title ?? defaultTitle(value),
    slug: found?.slug ?? defaultSlug(value),
    description: found?.description,
    image: found?.image,
  };
}

/**
 * Resolve a URL segment against declared terms plus the values actually in use.
 * Returns null when nothing matches, so the caller can 404 rather than render an
 * empty page.
 */
export function termFromSlug(
  declared: Map<string, TaxonomyTerm>,
  slug: string,
  knownValues: string[],
): ResolvedTerm | null {
  const wanted = slug.toLowerCase();

  // A declared term wins, so an explicit slug overrides the default shape.
  for (const term of declared.values()) {
    if ((term.slug ?? defaultSlug(term.key)).toLowerCase() === wanted) {
      return termFrom(declared, term.key);
    }
  }

  // Otherwise fall back to the raw value, exactly as before — but skip values
  // that ARE declared, or a declared term would stay reachable at both its own
  // slug and its default one, which is duplicate content.
  const match = knownValues.find(
    (v) => !declared.has(v.toLowerCase()) && defaultSlug(v) === wanted,
  );
  return match ? termFrom(declared, match) : null;
}

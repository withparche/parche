/**
 * Apply a locale's overrides to the site config.
 *
 * A page translates its own title and description in frontmatter, but the
 * site-wide fallbacks — used by the blog listing, taxonomy pages, RSS channels
 * and the Open Graph defaults — had nowhere to be translated. `locales` in
 * `parche.config.ts` fills that gap; this merges it.
 *
 * The merge is shallow per block and only over the fields a locale declares, so
 * the top-level values remain the default for anything left out.
 */
import type { SiteConfig } from '../types/config';

export function localizeSiteConfig(config: SiteConfig, locale: string): SiteConfig {
  const overrides = (config as any).i18n?.translations?.[locale];
  if (!overrides) return config;

  return {
    ...config,
    brand: { ...(config as any).brand, ...(overrides.brand ?? {}) },
    metadata: { ...((config as any).metadata ?? {}), ...(overrides.metadata ?? {}) },
  };
}

/**
 * Resolve the site URL from the two places it can be declared.
 *
 * The overlap between Astro's `site` and Parche's `site.url` is deliberate: the
 * goal is that a project can configure everything in `parche.config.ts`. What is
 * not allowed is declaring it twice, because then neither is the source of truth
 * and the two can drift apart silently.
 *
 *   Astro only        → Astro's
 *   Parche only       → Parche's
 *   both              → an error naming both places
 */
export function resolveSiteUrl(astroSite: string | undefined, parcheUrl: string | undefined): string {
  if (astroSite && parcheUrl) {
    throw new Error(
      `[parche] The site URL is declared twice: "${astroSite}" in astro.config (site) and ` +
        `"${parcheUrl}" in the Parche config (site.url). Keep one of them — Parche reads ` +
        `Astro's when only that is set, and feeds its own to Astro when only Parche declares it.`,
    );
  }
  return astroSite ?? parcheUrl ?? '';
}

/**
 * Resolve the i18n setup from the two places it can be declared.
 *
 * `defaultLocale` and `locales` exist on both sides — same names, same shapes —
 * so they follow the one-declaration rule:
 *
 *   Astro only        → Astro's
 *   Parche only       → Parche's, written into Astro
 *   both              → an error naming both places
 *
 * `translations` is never part of that: it carries the per-locale site identity,
 * which has no Astro counterpart and therefore always belongs in the Parche
 * config, whoever declares the languages.
 *
 * Returns the i18n config to hand to Astro, or null when Astro already has it.
 */
export function resolveI18n(
  astroI18n: { defaultLocale?: string; locales?: unknown[] } | undefined,
  parcheI18n:
    | { defaultLocale?: string; locales?: unknown[]; translations?: Record<string, unknown> }
    | undefined,
): { defaultLocale: string; locales: unknown[]; routing: 'manual' } | null {
  const parcheDeclares = Boolean(parcheI18n?.defaultLocale) || Boolean(parcheI18n?.locales?.length);

  const codesOf = (list: unknown[] | undefined) =>
    (list ?? []).map((l: any) => (typeof l === 'string' ? l : l?.codes?.[0]));

  if (astroI18n) {
    if (parcheDeclares) {
      throw new Error(
        '[parche] Internationalization is declared twice: in astro.config (i18n) and in the ' +
          'Parche config (i18n.defaultLocale / i18n.locales). Keep one of them — `i18n.translations` ' +
          'stays in the Parche config either way, since Astro has no equivalent.',
      );
    }

    // Astro owns the language list; a translation for a locale it does not have
    // would silently apply to nothing.
    const known = codesOf(astroI18n.locales);
    for (const code of Object.keys(parcheI18n?.translations ?? {})) {
      if (known.length > 0 && !known.includes(code)) {
        console.warn(
          `[parche] i18n.translations has an entry for "${code}", which astro.config does not list. ` +
            'It will never be used.',
        );
      }
    }
    return null;
  }

  if (!parcheDeclares) return null;

  const locales = parcheI18n?.locales?.length
    ? parcheI18n.locales
    : [parcheI18n?.defaultLocale ?? 'en'];
  const defaultLocale = parcheI18n?.defaultLocale ?? codesOf(locales)[0] ?? 'en';

  // Parche resolves URLs itself, so Astro's automatic routing must stay out.
  return { defaultLocale, locales, routing: 'manual' };
}

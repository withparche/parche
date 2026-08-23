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
  const overrides = (config as any).i18n?.locales?.[locale];
  if (!overrides) return config;

  return {
    ...config,
    site: { ...config.site, ...(overrides.site ?? {}) },
    metadata: { ...(config.metadata ?? {}), ...(overrides.metadata ?? {}) },
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
 * Same rule as the site URL: Astro's `i18n` block and Parche's are two ways to
 * say the same thing, and saying it twice leaves no source of truth. Parche's
 * `i18n.locales` is a map keyed by locale code, so it declares which languages
 * exist as well as what each overrides; the array Astro wants is derived from
 * its keys.
 *
 * Returns the i18n config to hand to Astro, or null when Astro already has it.
 */
export function resolveI18n(
  astroI18n: { defaultLocale?: string; locales?: unknown[] } | undefined,
  parcheI18n: { defaultLocale?: string; locales?: Record<string, unknown> } | undefined,
): { defaultLocale: string; locales: string[]; routing: 'manual' } | null {
  const parcheLocales = Object.keys(parcheI18n?.locales ?? {});
  const parcheDeclares = Boolean(parcheI18n?.defaultLocale) || parcheLocales.length > 0;

  if (!parcheDeclares) return null;

  if (astroI18n) {
    throw new Error(
      '[parche] Internationalization is declared twice: in astro.config (i18n) and in the ' +
        'Parche config (i18n.defaultLocale / i18n.locales). Keep one of them — Parche reads ' +
        "Astro's when only that is set, and writes its own into Astro when only Parche declares it. " +
        'Per-locale overrides such as `i18n.locales.es.site` always belong in the Parche config.',
    );
  }

  const defaultLocale = parcheI18n?.defaultLocale ?? parcheLocales[0] ?? 'en';
  const locales = parcheLocales.length > 0 ? parcheLocales : [defaultLocale];

  // Parche resolves URLs itself, so Astro's automatic routing must stay out.
  return { defaultLocale, locales, routing: 'manual' };
}

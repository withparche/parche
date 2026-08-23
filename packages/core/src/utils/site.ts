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
 * `i18n.locales` in the Parche config plays two roles depending on who declares
 * the languages, and only one of them can conflict with Astro:
 *
 *   - **Overrides.** Its entries always carry the per-locale site identity, and
 *     that belongs in the Parche config no matter what — Astro has no concept of
 *     it. So the map existing is never, by itself, a double declaration.
 *   - **Declaration.** When Astro has no i18n block, the map's keys are also the
 *     list of languages, and Parche hands them to Astro.
 *
 * `defaultLocale` is the one value that genuinely exists on both sides, so that
 * is what the conflict rule is about:
 *
 *   Astro only        → Astro's
 *   Parche only       → Parche's, written into Astro
 *   both              → an error naming both places
 *
 * Returns the i18n config to hand to Astro, or null when Astro already has it.
 */
export function resolveI18n(
  astroI18n: { defaultLocale?: string; locales?: unknown[] } | undefined,
  parcheI18n: { defaultLocale?: string; locales?: Record<string, unknown> } | undefined,
): { defaultLocale: string; locales: string[]; routing: 'manual' } | null {
  const parcheLocales = Object.keys(parcheI18n?.locales ?? {});

  if (astroI18n) {
    if (parcheI18n?.defaultLocale) {
      throw new Error(
        `[parche] The default locale is declared twice: "${astroI18n.defaultLocale}" in ` +
          `astro.config (i18n.defaultLocale) and "${parcheI18n.defaultLocale}" in the Parche ` +
          'config. Keep one of them — per-locale overrides such as `i18n.locales.es.site` stay ' +
          'in the Parche config either way, since Astro has no equivalent.',
      );
    }

    // Astro owns the language list; warn about an override for a locale it does
    // not have, which would otherwise apply to nothing and look like a no-op.
    const astroCodes = (astroI18n.locales ?? []).map((l: any) =>
      typeof l === 'string' ? l : l?.codes?.[0],
    );
    for (const code of parcheLocales) {
      if (astroCodes.length > 0 && !astroCodes.includes(code)) {
        console.warn(
          `[parche] i18n.locales has an entry for "${code}", which astro.config does not list. ` +
            'Its overrides will never be used.',
        );
      }
    }
    return null;
  }

  if (!parcheI18n?.defaultLocale && parcheLocales.length === 0) return null;

  const defaultLocale = parcheI18n?.defaultLocale ?? parcheLocales[0] ?? 'en';
  const locales = parcheLocales.length > 0 ? parcheLocales : [defaultLocale];

  // Parche resolves URLs itself, so Astro's automatic routing must stay out.
  return { defaultLocale, locales, routing: 'manual' };
}

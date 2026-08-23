import { z } from 'zod';

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const actionSchema = linkSchema.extend({
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
});

const footerColumnSchema = z.object({
  title: z.string(),
  links: z.array(linkSchema),
});

const verificationSchema = z.object({
  google: z.string().optional(),
  bing: z.string().optional(),
  yandex: z.string().optional(),
  pinterest: z.string().optional(),
}).default({});

// `.prefault` rather than `.default`: a Zod default is handed back untouched, so
// `.default({})` would skip the inner defaults and leave an absent block empty —
// while a block written as `{}` got them. Same config, different output depending
// on whether the key was there at all.
const defaultRobotsSchema = z.object({
  maxSnippet: z.number().default(-1),
  maxImagePreview: z.enum(['none', 'standard', 'large']).default('large'),
  maxVideoPreview: z.number().default(-1),
}).prefault({});

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const contactPointSchema = z.object({
  telephone: z.string().optional(),
  contactType: z.string().optional(),
  email: z.string().optional(),
});

export const siteConfigSchema = z.object({
  /**
   * The deployed origin — the same value, with the same name and type, as
   * Astro's `site`. Declare it here or in astro.config, never in both: Parche
   * uses Astro's when only Astro has it, hands its own to Astro when only Parche
   * has it, and errors when both do.
   */
  site: z.string().url().optional(),

  /** Mirrors Astro's `base`, under the same one-declaration rule. */
  base: z.string().optional(),

  /**
   * The site's identity — the part Astro has no concept of.
   *
   * Kept separate from `site` precisely because `site` means something specific
   * in Astro (an origin), and one name should not mean two things.
   */
  brand: z.object({
    name: z.string(),
    description: z.string().default(''),
    logo: z.string().optional(),
  }),


  /**
   * Internationalization, mirroring Astro's own `i18n` block.
   *
   * `defaultLocale` and `locales` have the same names and shapes Astro uses, and
   * follow the one-declaration rule: Parche reads Astro's when only Astro has
   * them, writes its own into Astro when only Parche does, and errors when both
   * do. `routing` is not mirrored — Parche resolves URLs itself and always needs
   * Astro's manual mode.
   *
   * `translations` has no Astro counterpart. Astro's i18n is routing only; its
   * documentation puts translating metadata on the developer, and this is that
   * missing half. Each entry mirrors the shape it overrides and is merged over
   * the top-level values, so declare only what differs:
   *
   *   i18n: {
   *     defaultLocale: 'en',
   *     locales: ['en', 'es'],
   *     translations: {
   *       es: { brand: { description: 'Una plantilla gratuita…' } },
   *     },
   *   }
   *
   * Pages translate their own title and description in frontmatter; this covers
   * the site-wide fallbacks used by routes that have none — the blog listing,
   * taxonomy pages, RSS channels and the Open Graph defaults.
   */
  i18n: z
    .object({
      defaultLocale: z.string().optional(),
      /** Locale codes, or Astro's object form for a custom path segment. */
      locales: z
        .array(
          z.union([
            z.string(),
            z.object({ path: z.string(), codes: z.array(z.string()) }).strict(),
          ]),
        )
        .optional(),
      translations: z
        .record(
          z.string(),
          z.object({
            brand: z
              .object({
                name: z.string().optional(),
                description: z.string().optional(),
                logo: z.string().optional(),
              })
              .strict()
              .optional(),
            metadata: z
              .object({
                ogImage: z.string().optional(),
                twitterHandle: z.string().optional(),
              })
              .strict()
              .optional(),
          }).strict(),
        )
        .default({}),
    })
    .strict()
    .prefault({}),

  /**
   * The site-wide metadata a page falls back to when it declares none.
   *
   * Deliberately the same name as a page's own `metadata`, because it is the
   * same thing one level up: the defaults. A page overrides what it wants and
   * inherits the rest. Everything search engines and social cards read lives
   * here — including `organization`, which is JSON-LD and was sitting at the top
   * level as though it were a concept of its own.
   */
  metadata: z.object({
    /** Default share image, used when a page declares none. */
    ogImage: z.string().optional(),
    /** e.g. '@arthelokyo'. */
    twitterHandle: z.string().optional(),
    verification: verificationSchema,
    defaultRobots: defaultRobotsSchema,
    defaultOgType: z.enum(['website', 'article', 'product', 'profile']).default('website'),
    defaultTwitterCard: z.enum(['summary', 'summary_large_image', 'player', 'app']).default('summary_large_image'),
    // Note: AI-crawler policy for robots.txt is the `parche({ seo: { allowAICrawlers } })`
    // integration option, not a SiteConfig field — kept there so it's a single home.
    preconnect: z.array(z.string()).default([]),
    /** Publisher identity, emitted as a schema.org Organization node in JSON-LD.
     *  Worth declaring only with the fields that add something a `WebSite` node
     *  does not already say — logo, socialProfiles, address. */
    organization: z
      .object({
        type: z.enum(['Organization', 'LocalBusiness', 'Corporation']).default('Organization'),
        name: z.string().optional(),
        legalName: z.string().optional(),
        logo: z.string().optional(),
        url: z.string().optional(),
        description: z.string().optional(),
        foundingDate: z.string().optional(),
        /** Emitted as `sameAs` — the canonical way to claim an account. */
        socialProfiles: z.array(z.string()).default([]),
        address: addressSchema.optional(),
        contactPoint: contactPointSchema.optional(),
      })
      .optional(),
  }).prefault({}),

  // Note: header/footer nav and theme are NOT configured here.
  // - Chrome (header/footer) is authored in the `layouts` content collection
  //   (see content/schemas.ts navigationSchema) and passed to the layout widgets.
  // - Theming is driven by imported theme parches + the `[data-theme]` switcher,
  //   not by a config flag.
  // These fields used to live here but were consumed by nothing (a silent trap),
  // so they were removed. Setting them is now a type error, on purpose.
}).strict();
// `.strict()` so a stray/typo'd top-level key (e.g. the old `theme`, `header`,
// `footer`) fails at build with a clear message instead of being silently
// dropped by Zod — matching `userConfigSchema` in the integration.

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export function defineConfig(config: z.input<typeof siteConfigSchema>): SiteConfig {
  return siteConfigSchema.parse(config);
}

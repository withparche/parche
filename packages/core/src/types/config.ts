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

const defaultRobotsSchema = z.object({
  maxSnippet: z.number().default(-1),
  maxImagePreview: z.enum(['none', 'standard', 'large']).default('large'),
  maxVideoPreview: z.number().default(-1),
}).default({});

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
  site: z.object({
    name: z.string(),
    description: z.string().default(''),
    url: z.string().url().optional(),
    defaultLanguage: z.string().default('en'),
    logo: z.string().optional(),
  }),

  metadata: z.object({
    ogImage: z.string().optional(),
    twitterHandle: z.string().optional(),
  }).default({}),

  seo: z.object({
    verification: verificationSchema,
    defaultRobots: defaultRobotsSchema,
    defaultOgType: z.enum(['website', 'article', 'product', 'profile']).default('website'),
    defaultTwitterCard: z.enum(['summary', 'summary_large_image', 'player', 'app']).default('summary_large_image'),
    // Note: AI-crawler policy for robots.txt is the `parche({ seo: { allowAICrawlers } })`
    // integration option, not a SiteConfig field — kept there so it's a single home.
    preconnect: z.array(z.string()).default([]),
  }).default({}),

  organization: z.object({
    type: z.enum(['Organization', 'LocalBusiness', 'Corporation']).default('Organization'),
    name: z.string().optional(),
    legalName: z.string().optional(),
    logo: z.string().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    foundingDate: z.string().optional(),
    socialProfiles: z.array(z.string()).default([]),
    address: addressSchema.optional(),
    contactPoint: contactPointSchema.optional(),
  }).default({}),

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

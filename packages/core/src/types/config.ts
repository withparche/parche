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
    allowAICrawlers: z.boolean().default(true),
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

  header: z.object({
    logo: z.string().optional(),
    links: z.array(linkSchema).default([]),
    actions: z.array(actionSchema).default([]),
  }).default({}),

  footer: z.object({
    columns: z.array(footerColumnSchema).default([]),
    copyright: z.string().default(''),
    socialLinks: z.array(linkSchema).default([]),
  }).default({}),

  theme: z.object({
    name: z.string().default(''),
    darkMode: z.boolean().default(true),
  }).default({}),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export function defineConfig(config: z.input<typeof siteConfigSchema>): SiteConfig {
  return siteConfigSchema.parse(config);
}

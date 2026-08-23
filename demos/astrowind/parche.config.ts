import { defineConfig } from '@parche/core/config';

export default defineConfig({
  site: 'https://astrowind.example.com',
  brand: {
    name: 'AstroWind',
    description:
      'Free template for creating websites with Astro + Tailwind CSS. Suitable for startups, small business, SaaS websites, professional portfolios, marketing websites, landing pages and blogs.',
  },

  // Astro's i18n block owns routing; this owns translation. Only what differs
  // from the top-level site identity needs declaring.
  i18n: {
    translations: {
      es: {
        brand: {
          description:
            'Una plantilla gratuita, personalizable y lista para producción para Astro 7 + Tailwind CSS v4. Válida para startups, pequeños negocios, webs SaaS, porfolios profesionales, webs de marketing, landings y blogs.',
        },
      },
    },
  },
  metadata: {
    // AstroWind's own default share image.
    ogImage: '@/assets/images/default.png',
    twitterHandle: '@arthelokyo',
    // The publisher, as a schema.org Organization node. Only worth declaring
    // with fields the WebSite node does not already carry — a logo search
    // engines can use, and the accounts that are verifiably ours (sameAs).
    organization: {
      type: 'Organization',
      name: 'AstroWind',
      logo: '@/assets/images/default.png',
      socialProfiles: [
        'https://github.com/arthelokyo/astrowind',
        'https://twitter.com/arthelokyo',
      ],
    },
  },
});

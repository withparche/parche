import { defineConfig } from '@parche/core/config';

export default defineConfig({
  site: {
    name: 'AstroWind',
    description:
      'Free template for creating websites with Astro + Tailwind CSS. Suitable for startups, small business, SaaS websites, professional portfolios, marketing websites, landing pages and blogs.',
    url: 'https://astrowind.example.com',
  },
  metadata: {
    // AstroWind's own default share image.
    ogImage: '@/assets/images/default.png',
    twitterHandle: '@arthelokyo',
  },

  // Astro's i18n block owns routing; this owns translation. Only what differs
  // from the top-level site identity needs declaring.
  i18n: {
    locales: {
      es: {
        site: {
          description:
            'Una plantilla gratuita, personalizable y lista para producción para Astro 7 + Tailwind CSS v4. Válida para startups, pequeños negocios, webs SaaS, porfolios profesionales, webs de marketing, landings y blogs.',
        },
      },
    },
  },
  organization: {
    type: 'Organization',
    name: 'AstroWind',
    description: 'A free and open-source template for Astro + Tailwind CSS.',
  },
});

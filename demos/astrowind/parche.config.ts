import { defineConfig } from '@parche/core/config';

export default defineConfig({
  site: {
    name: 'AstroWind',
    description:
      'Free template for creating websites with Astro + Tailwind CSS. Suitable for startups, small business, SaaS websites, professional portfolios, marketing websites, landing pages and blogs.',
    url: 'https://astrowind.example.com',
    defaultLanguage: 'en',
  },
  metadata: {
    twitterHandle: '@arthelokyo',
  },
  organization: {
    type: 'Organization',
    name: 'AstroWind',
    description: 'A free and open-source template for Astro + Tailwind CSS.',
  },
});

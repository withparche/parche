import { defineConfig } from '@parche/core/config';

// Site identity for the whole project. The parches live in astro.config.mjs;
// everything else is configured here.
export default defineConfig({
  site: {
    name: '{{siteName}}',
    description: 'Built with Parche.',
    url: 'https://example.com',
    defaultLanguage: 'en',
  },
});

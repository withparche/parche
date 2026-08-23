import { defineConfig } from '@parche/core/config';

// Site identity for the whole project. The parches live in astro.config.mjs;
// everything else is configured here.
export default defineConfig({
  site: 'https://example.com',
  brand: {
    name: 'Hello Parche',
    description: 'Built with Parche.',
  },
});

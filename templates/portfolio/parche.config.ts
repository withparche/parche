import { defineConfig } from '@parche/core/config';

// Site identity for the whole project. The parches live in astro.config.mjs;
// everything else is configured here. (You can also inline this into
// parche({ site: { … } }) instead of using a separate file.)
export default defineConfig({
  site: {
    name: 'Alex Rivera',
    description: 'Product designer & developer crafting calm, useful software.',
    url: 'https://example.com',
    defaultLanguage: 'en',
  },
});

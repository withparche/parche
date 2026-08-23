import { defineConfig } from '@parche/core/config';

// Separate-file mode: the parches stay in astro.config.mjs; the whole site
// identity is configured here. Referenced from parche({ config: … }).
export default defineConfig({
  site: {
    name: 'Parche',
    description: 'The all-in-one workspace to plan, track and ship your work.',
    url: 'https://example.com',
  },
});

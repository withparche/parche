import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

// Personal portfolio — static output (SSG). No adapter needed.
export default defineConfig({
  integrations: [
    // Parches here; the site identity is configured in ./src/parche.config.json.
    parche({
      parches: [createElements(), createUI()],
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

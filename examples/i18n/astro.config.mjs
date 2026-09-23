import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

export default defineConfig({
  integrations: [
    parche({
      parches: [createElements(), createUI()],
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    icon(),
  ],
  // Three locales; the default (en) is served without a prefix, es under /es, zh under /zh.
  i18n: { defaultLocale: 'en', locales: ['en', 'es', 'zh'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

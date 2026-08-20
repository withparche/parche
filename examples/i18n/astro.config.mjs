import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  site: 'https://example.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({
      primitives: createPrimitives(),
      ui: createUI(),
      config: './src/parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  fonts: parcheFonts,
  // Two locales; the default (en) is served without a prefix, es under /es.
  i18n: { defaultLocale: 'en', locales: ['en', 'es'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

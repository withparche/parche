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
      parches: [createPrimitives(), createUI()],
      config: './src/parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

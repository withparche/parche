import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [
    // Parches here; the site identity is configured in ./parche.config.ts.
    // (Or inline it with `site: { … }` instead of a separate file.)
    parche({
      parches: [createPrimitives(), createUI()],
      config: './parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

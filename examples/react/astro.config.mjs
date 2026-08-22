import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import react from '@astrojs/react';
import { defineParche } from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    defineParche({
      parches: [createPrimitives(), createUI()],
      config: './parche.config.ts',
      routes: { pages: true },
      // Register a React-backed widget. Content can now use "widget": "Counter".
      overrides: {
        'widgets:Counter': './src/widgets/CounterWidget.astro',
      },
    }),
    react(),
    icon(),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import react from '@astrojs/react';
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
      overrides: { 'widgets:ShadcnShowcase': './src/widgets/ShadcnWidget.astro' },
      // Multiple themes so you can watch the shadcn components reskin.
      themes: {
        available: [
          { label: 'Default', value: '' },
          { label: 'Corporate', value: 'corporate' },
          { label: 'Minimal', value: 'minimal' },
          { label: 'Playful', value: 'playful' },
        ],
        showPanel: true,
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

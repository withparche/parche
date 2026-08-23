import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  integrations: [
    parche({
      parches: [createPrimitives(), createUI()],
      config: './parche.config.ts',
      routes: { pages: true },
      // Register a project-local widget. Content can now use "widget": "Callout".
      overrides: {
        'widgets:Callout': './src/widgets/Callout.astro',
      },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

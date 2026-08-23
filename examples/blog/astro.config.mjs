import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';
import createBlog from '@parche/blog';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    parche({
      parches: [createPrimitives(), createUI(), createBlog({ postsPerPage: 6, permalinks: { post: '/%slug%' } })],
      config: './parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

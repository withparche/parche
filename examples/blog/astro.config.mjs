import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';
import createBlog from '@parche/astro-blog';

// BLOG_PRESET builds this example as another publication (test/blog-presets.mjs).

export default defineConfig({
  integrations: [
    parche({
      parches: [createElements(), createUI(), createBlog({ preset: process.env.BLOG_PRESET ?? 'personal', subscribe: {}, postsPerPage: 6, permalinks: { post: '/%slug%' } })],
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

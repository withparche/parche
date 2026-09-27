import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';
import createBlog from '@parche/astro-blog';

// The builder's fixture: a small site with every shape the editor handles
// (slots, node wrappers, a named outlet, a navigation reference, patterns
// with and without props, a Markdown page, the blog). Its content is seeded
// from ./seed.
export default defineConfig({
  integrations: [parche({ parches: [createElements(), createUI(), createBlog({ preset: 'company' })], config: './src/parche.config.json', routes: { pages: true } }), icon()],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  vite: { plugins: [tailwindcss()] },
});

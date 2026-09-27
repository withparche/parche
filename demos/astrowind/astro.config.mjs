import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';
import createBlog from '@parche/astro-blog';
import createCollectionPages from '@parche/astro-collections';
import { astrowind, product, editorial } from '@parche/themes';
import { blogLabels } from './src/blog-labels.js';

// AstroWind recreated on Parche — English while the site is rebuilt (Spanish
// returns at the end), static output.
//
// This demo exists to test the framework against a real, complete site rather
// than a curated slice: 20 pages, three layouts, a blog with taxonomies, and a
// visual identity of its own. Findings go to BACKLOG.md.
export default defineConfig({
  integrations: [
    parche({
      parches: [
        createElements(),
        createUI(),
        // Posts live at the site root ('/my-post'), as in AstroWind itself.
        // With no static prefix the blog registers a resolver and core's
        // catch-all serves posts, per locale.
        createBlog({
          // Several writers with their own pages, categories, one featured post.
          preset: 'company',
          // No endpoint: the form simulates the send, for the demo.
          subscribe: {},
          postsPerPage: 6,
          relatedPostsCount: 4,
          permalinks: { post: '/%slug%' },
          labels: blogLabels,
        }),
        // A page for each of the store's products: the collection holds only
        // the product's data, the product-page pattern lays the page out.
        createCollectionPages({
          products: { path: '/homes/store/%slug%', widget: 'pattern/product-page', layout: 'corvo' },
        }),
        astrowind(),
        product(),
        editorial(),
      ],
      config: './src/parche.config.json',
      routes: { pages: true },
      // Render the theme server-side so the first paint is the Product look,
      // not the base one. A visitor's own pick still wins on the client.
      themes: { default: 'product', showPanel: false },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

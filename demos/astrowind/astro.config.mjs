import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';
import createBlog from '@parche/blog';
import { astrowind } from '@parche/themes';
import { blogLabels } from './src/blog-labels.js';

// AstroWind recreated on Parche — bilingual (en/es), static output.
//
// This demo exists to test the framework against a real, complete site rather
// than a curated slice: 20 pages, three layouts, a blog with taxonomies, and a
// visual identity of its own. Findings go to BACKLOG.md.
export default defineConfig({
  site: 'https://astrowind.example.com',
  integrations: [
    parche({
      parches: [
        createPrimitives(),
        createUI(),
        // Posts live at the site root ('/my-post'), as in AstroWind itself.
        // With no static prefix the blog registers a resolver and core's
        // catch-all serves posts, per locale.
        createBlog({
          postsPerPage: 6,
          relatedPostsCount: 4,
          permalinks: { post: '/%slug%' },
          labels: blogLabels,
        }),
        astrowind(),
      ],
      config: './parche.config.ts',
      routes: { pages: true },
      // Render the theme server-side so the first paint is AstroWind, not the
      // base look. A visitor's own pick still wins on the client.
      themes: { default: 'astrowind', showPanel: false },
    }),
    icon(),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en', 'es'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

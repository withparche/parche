import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

export default defineConfig({
  // Server output: every route is rendered per request (true SSR).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({
      parches: [createElements(), createUI()],
      config: './src/parche.config.json',
      // Pages are data: content/pages/<locale>/*.json, served by Parche's
      // catch-all route. With output: 'server' it resolves the slug per request.
      routes: { pages: true },
    }),
    // Scoped icon set (SSR). Parche is data-driven: widgets receive icon `name`s
    // from JSON content, so the names are dynamic and astro-icon can't tree-shake
    // by scanning code. Without `include` it bundles the ENTIRE tabler set
    // (~2 MB) resident in the SSR server process. List exactly the icons this
    // demo's content + widgets use; add here when you use a new one.
    icon({
      include: {
        tabler: ['align-center', 'arrow-right', 'article', 'bookmark', 'brand-github', 'brand-linkedin', 'brand-mastodon', 'brand-x', 'building', 'cards', 'chart-bar', 'check', 'chevron-down', 'chevron-left', 'chevron-right', 'click', 'credit-card', 'external-link', 'help-circle', 'info-circle', 'info-square', 'layout-grid', 'layout-list', 'layout-rows', 'layout-sidebar', 'layout-sidebar-right', 'list-check', 'list-numbers', 'mail', 'menu-2', 'message-circle', 'speakerphone', 'world', 'x'],
      },
    }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

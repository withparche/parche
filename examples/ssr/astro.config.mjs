import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  // Server output: every route is rendered per request (true SSR).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({ parches: [createPrimitives(), createUI()], config: './parche.config.ts' }),
    // Scoped icon set (SSR). Parche is data-driven: widgets receive icon `name`s
    // from JSON content, so the names are dynamic and astro-icon can't tree-shake
    // by scanning code. Without `include` it bundles the ENTIRE tabler/lucide/
    // simple-icons sets (~2 MB) resident in the SSR server process. List exactly
    // the icons this demo's content + widgets use; add here when you use a new one.
    icon({
      include: {
        lucide: ['globe'],
        'simple-icons': ['github', 'linkedin', 'mastodon', 'x'],
        tabler: ['align-center', 'arrow-right', 'article', 'bookmark', 'brand-github', 'building', 'cards', 'chart-bar', 'check', 'chevron-right', 'click', 'credit-card', 'external-link', 'help-circle', 'info-circle', 'info-square', 'layout-grid', 'layout-list', 'layout-rows', 'layout-sidebar', 'layout-sidebar-right', 'list-check', 'list-numbers', 'mail', 'message-circle', 'speakerphone'],
      },
    }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

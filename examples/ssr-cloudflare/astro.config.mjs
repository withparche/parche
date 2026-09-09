import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import cloudflare from '@astrojs/cloudflare';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  // Server output: every route is rendered per request (true SSR), on Cloudflare
  // Workers. Both `astro dev` and `astro preview` run inside Cloudflare's
  // `workerd` runtime, not Node — see wrangler.jsonc for the worker settings.
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    parche({ parches: [createPrimitives(), createUI()], config: './src/parche.config.json' }),
    // Scoped icon set (SSR). Parche is data-driven: widgets receive icon `name`s
    // from JSON content, so the names are dynamic and astro-icon can't tree-shake
    // by scanning code. Without `include` it bundles the ENTIRE tabler set
    // (~2 MB) into the worker. List exactly the icons this demo's content +
    // widgets use; add here when you use a new one.
    icon({
      include: {
        tabler: ['align-center', 'arrow-right', 'article', 'bookmark', 'brand-github', 'brand-linkedin', 'brand-mastodon', 'brand-x', 'building', 'cards', 'chart-bar', 'check', 'chevron-right', 'click', 'credit-card', 'external-link', 'help-circle', 'info-circle', 'info-square', 'layout-grid', 'layout-list', 'layout-rows', 'layout-sidebar', 'layout-sidebar-right', 'list-check', 'list-numbers', 'mail', 'message-circle', 'speakerphone', 'world'],
      },
    }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

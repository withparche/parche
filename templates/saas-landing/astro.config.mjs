import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

// SaaS landing — built as SSR (output: 'server') to exercise Parche's
// data-driven catch-all/DynamicRenderer per request. Swap to static by
// removing `output`/`adapter` if the site doesn't need per-request rendering.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    // Parches here; the site identity is configured in ./src/parche.config.json.
    // (Or inline it with `site: { … }`. parche() also accepts a
    // (ctx) => config function for env-based / multi-tenant setups.)
    parche({
      parches: [createElements(), createUI()],
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    // Scoped icon set (SSR). Parche is data-driven: widgets receive icon `name`s
    // from JSON content, so the names are dynamic and astro-icon can't tree-shake
    // by scanning code. Without `include` it bundles the ENTIRE tabler set
    // (~2 MB) resident in the SSR server process. List exactly the icons this
    // demo's content + widgets use; add here when you use a new one.
    icon({
      include: {
        tabler: ['alert-circle', 'alert-triangle', 'align-center', 'arrow-right', 'article', 'bolt', 'bookmark', 'brand-facebook', 'brand-figma', 'brand-github', 'brand-linkedin', 'brand-mastodon', 'brand-notion', 'brand-slack', 'brand-stripe', 'brand-vercel', 'brand-whatsapp', 'brand-x', 'building', 'calendar', 'cards', 'chart-bar', 'check', 'chevron-down', 'chevron-left', 'chevron-right', 'circle-check', 'click', 'clock', 'credit-card', 'external-link', 'file-text', 'help-circle', 'info-circle', 'info-square', 'layout-grid', 'layout-kanban', 'layout-list', 'layout-rows', 'layout-sidebar', 'layout-sidebar-right', 'link', 'list-check', 'list-numbers', 'mail', 'map', 'menu-2', 'message-circle', 'palette', 'plug', 'server-bolt', 'share', 'sparkles', 'speakerphone', 'star', 'users-group', 'world', 'x'],
      },
    }),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

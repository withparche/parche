import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

// SaaS landing — built as SSR (output: 'server') to exercise Parche's
// data-driven catch-all/DynamicRenderer per request. Swap to static by
// removing `output`/`adapter` if the site doesn't need per-request rendering.
export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    // Parches here; the site identity is configured in ./parche.config.ts.
    // (Or inline it with `site: { … }`. parche() also accepts a
    // (ctx) => config function for env-based / multi-tenant setups.)
    parche({
      parches: [createPrimitives(), createUI()],
      config: './parche.config.ts',
      routes: { pages: true },
    }),
    // Scoped icon set (SSR). Parche is data-driven: widgets receive icon `name`s
    // from JSON content, so the names are dynamic and astro-icon can't tree-shake
    // by scanning code. Without `include` it bundles the ENTIRE tabler/lucide/
    // simple-icons sets (~2 MB) resident in the SSR server process. List exactly
    // the icons this demo's content + widgets use; add here when you use a new one.
    icon({
      include: {
        lucide: ['globe'],
        'simple-icons': ['github', 'linkedin', 'mastodon', 'x'],
        tabler: ['align-center', 'arrow-right', 'article', 'bolt', 'bookmark', 'brand-figma', 'brand-github', 'brand-linkedin', 'brand-notion', 'brand-slack', 'brand-stripe', 'brand-vercel', 'brand-x', 'building', 'calendar', 'cards', 'chart-bar', 'check', 'chevron-right', 'click', 'clock', 'credit-card', 'external-link', 'file-text', 'help-circle', 'info-circle', 'info-square', 'layout-grid', 'layout-kanban', 'layout-list', 'layout-rows', 'layout-sidebar', 'layout-sidebar-right', 'list-check', 'list-numbers', 'mail', 'map', 'message-circle', 'plug', 'server-bolt', 'sparkles', 'speakerphone', 'star', 'users-group'],
      },
    }),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

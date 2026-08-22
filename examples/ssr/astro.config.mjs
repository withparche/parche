import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import { defineParche } from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  site: 'https://example.com',
  // Server output: every route is rendered per request (true SSR).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    defineParche({ parches: [createPrimitives(), createUI()], config: './parche.config.ts' }),
    icon(),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

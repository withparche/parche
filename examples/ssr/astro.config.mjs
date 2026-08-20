import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';

export default defineConfig({
  site: 'https://example.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({ primitives: createPrimitives(), ui: createUI(), config: './src/parche.config.ts' }),
    icon(),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

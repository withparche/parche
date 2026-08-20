import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/core';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';
import createBlog from '@parche/blog';

const font = (name, cssVariable, weights, fallbacks) => ({
  provider: fontProviders.google(),
  name,
  cssVariable,
  weights,
  fallbacks,
});
const sans = ['ui-sans-serif', 'system-ui', 'sans-serif'];
const serif = ['ui-serif', 'Georgia', 'serif'];
const mono = ['ui-monospace', 'SFMono-Regular', 'monospace'];

export default defineConfig({
  site: 'https://example.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({
      primitives: createPrimitives(),
      ui: createUI(),
      apps: [createBlog({ postsPerPage: 6, permalinks: { post: '/%slug%' } })],
      config: './src/parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  // BaseLayout wires these CSS variables via Astro's Font component — all are required.
  fonts: [
    font('Geist', '--font-sans', [400, 500, 600, 700], sans),
    font('Lora', '--font-serif', [400, 700], serif),
    font('JetBrains Mono', '--font-mono', [400], mono),
    font('Literata', '--font-heading-alt', [400, 700], serif),
    font('Libre Franklin', '--font-body-alt', [400, 500, 600, 700], sans),
    font('Nunito', '--font-rounded', [400, 500, 600, 700], sans),
    font('Schibsted Grotesk', '--font-tech', [400, 500, 600, 700], sans),
    font('DM Sans', '--font-tech-body', [400, 500, 600, 700], sans),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

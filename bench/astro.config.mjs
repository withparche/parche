import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import { usedIcons } from '@parche/astro/icons';
import createElements from '@parche/elements';
import createUI from '@parche/ui';
import createBlog from '@parche/astro-blog';
import { astrowind, product, editorial } from '@parche/themes';

// The site the benchmark builds: the demo's parches and settings, over content
// `generate.mjs` writes at whatever size is being measured. BENCH_OUTPUT=server
// builds it for the Node adapter, to measure SSR.
const server = process.env.BENCH_OUTPUT === 'server';
const adapter = server ? (await import('@astrojs/node')).default({ mode: 'standalone' }) : undefined;

const parches = [
  createElements(),
  createUI(),
  createBlog({ preset: 'company', subscribe: {}, postsPerPage: 12, permalinks: { post: '/%slug%' } }),
  astrowind(),
  product(),
  editorial(),
];

export default defineConfig({
  ...(server ? { output: 'server', adapter } : {}),
  integrations: [
    parche({
      parches,
      config: './src/parche.config.json',
      routes: { pages: true },
      themes: { default: 'product', showPanel: false },
    }),
    // Only the icons the content and the parches name; without `include`,
    // astro-icon bundles the whole Tabler set (2 MB) into a server build.
    icon({ include: usedIcons(parches) }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

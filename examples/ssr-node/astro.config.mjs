import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/astro';
import { usedIcons } from '@parche/astro/icons';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

const parches = [createElements(), createUI()];

export default defineConfig({
  // Server output: every route is rendered per request (true SSR).
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({
      parches,
      config: './src/parche.config.json',
      // Pages are data: content/pages/<locale>/*.json, served by Parche's
      // catch-all route. With output: 'server' it resolves the slug per request.
      routes: { pages: true },
    }),
    // Only the icons this site's content and its parches name. Parche is
    // data-driven: widgets take icon names from JSON, so astro-icon cannot
    // see them by scanning code; without `include` it bundles the whole
    // Tabler set (~2 MB), resident in the server process. A name built at
    // run time goes in `also: { tabler: ['…'] }`.
    icon({ include: usedIcons(parches) }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

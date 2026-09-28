import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import cloudflare from '@astrojs/cloudflare';
import parche from '@parche/astro';
import { usedIcons } from '@parche/astro/icons';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

const parches = [createElements(), createUI()];

export default defineConfig({
  // Server output: every route is rendered per request (true SSR), on Cloudflare
  // Workers. Both `astro dev` and `astro preview` run inside Cloudflare's
  // `workerd` runtime, not Node — see wrangler.jsonc for the worker settings.
  output: 'server',
  adapter: cloudflare(),
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
    // Tabler set (~2 MB) into the worker. A name built at run time goes in
    // `also: { tabler: ['…'] }`.
    icon({ include: usedIcons(parches) }),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

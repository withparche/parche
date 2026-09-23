import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import { astrowind, corporate, minimal, playful, startup } from '@parche/themes';

// The elements playground: one page per element, every variant and example,
// under every theme. It is the fixture for the browser a11y tests and the
// no-JS pass — not a published site. Static output; the SSR proof lives in
// examples/ssr-node and examples/ssr-cloudflare.
export default defineConfig({
  integrations: [
    parche({
      parches: [createElements(), astrowind(), corporate(), minimal(), playful(), startup()],
      config: './src/parche.config.json',
    }),
    icon(),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

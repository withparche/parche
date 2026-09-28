import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import node from '@astrojs/node';
import parche from '@parche/astro';
import { usedIcons } from '@parche/astro/icons';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

// Parches here; the site identity is configured in ./src/parche.config.json.
// (Or inline it with `site: { … }` instead of a separate file.)
const parches = [createElements(), createUI()];

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [
    parche({
      parches,
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    // Only the icons the content and the parches name, not whole icon sets.
    icon({ include: usedIcons(parches) }),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'] },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

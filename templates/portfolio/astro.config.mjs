import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import { usedIcons } from '@parche/astro/icons';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

// Parches here; the site identity is configured in ./src/parche.config.json.
const parches = [createElements(), createUI()];

// Personal portfolio — static output (SSG). No adapter needed.
export default defineConfig({
  integrations: [
    parche({
      parches,
      config: './src/parche.config.json',
      routes: { pages: true },
    }),
    // Only the icons the content and the parches name, not whole icon sets.
    icon({ include: usedIcons(parches) }),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

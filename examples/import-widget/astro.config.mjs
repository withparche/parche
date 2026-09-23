import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

export default defineConfig({
  integrations: [
    parche({ parches: [createElements(), createUI()], config: './src/parche.config.json' }),
    icon(),
  ],
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

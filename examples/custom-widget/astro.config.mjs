import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import parche from '@parche/astro';
import createElements from '@parche/elements';
import createUI from '@parche/ui';

export default defineConfig({
  integrations: [
    parche({
      parches: [createElements(), createUI()],
      config: './src/parche.config.json',
      routes: { pages: true },
      // Register a project-local widget. Content can now use "widget": "Callout".
      // A JSON widget (src/content/widgets/ProductShot.json) needs no entry
      // here: the widgets collection is enough.
      overrides: {
        'widgets:Callout': './src/widgets/Callout.astro',
      },
    }),
    icon(),
  ],
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

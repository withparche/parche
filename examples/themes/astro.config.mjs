import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineParche } from '@parche/core';
import { parcheFonts } from '@parche/core/fonts';
import createPrimitives from '@parche/primitives';
import createUI from '@parche/ui';
import { corporate, minimal, playful, startup } from '@parche/themes';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    defineParche({
      // Import only the themes you want — each bundles its own CSS and adds
      // itself to the switcher. The floating ThemePanel appears automatically
      // when more than one theme (incl. the base "Default") is available.
      parches: [createPrimitives(), createUI(), corporate(), minimal(), playful(), startup()],
      config: './parche.config.ts',
      routes: { pages: true },
    }),
    icon(),
  ],
  fonts: parcheFonts,
  i18n: { defaultLocale: 'en', locales: ['en'], routing: 'manual' },
  image: { remotePatterns: [{ protocol: 'https' }] },
  vite: { plugins: [tailwindcss()] },
});

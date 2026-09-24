/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

// SSR render tests for the widgets. `experimental_AstroContainer` needs an
// Astro project with the parche integration so `parche:elements/*` resolves;
// the elements playground is that project, and the widgets are imported from
// this package by path.
export default getViteConfig(
  {
    test: {
      dir: new URL('./test/ssr/', import.meta.url).pathname,
      include: ['**/*.test.ts'],
      environment: 'node',
    },
  },
  { root: new URL('../elements/playground/', import.meta.url).pathname },
);

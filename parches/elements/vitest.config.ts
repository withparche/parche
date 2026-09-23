/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

// SSR render tests: `experimental_AstroContainer` needs Astro's Vite config
// (the .astro compiler, the parche:* virtual modules from the playground's
// integration). The playground is the project the container renders in.
export default getViteConfig(
  {
    test: {
      // `root` is the playground (Astro needs a project), so include from the package.
      dir: new URL('./test/ssr/', import.meta.url).pathname,
      include: ['**/*.test.ts'],
      environment: 'node',
    },
  },
  { root: new URL('./playground/', import.meta.url).pathname },
);

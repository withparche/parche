import { defineConfig } from 'tsup';

// The integration only: the CLI imports it in plain Node, which cannot strip
// types under node_modules. The routes and server modules stay TypeScript
// source, loaded by the site's own Vite like core's routes.
export default defineConfig({
  entry: { integration: 'src/integration.ts' },
  format: ['esm'],
  dts: true,
  clean: false,
  target: 'node20',
  external: ['astro'],
});

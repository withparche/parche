import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/lib/scaffold.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: true,
  banner: { js: '#!/usr/bin/env node' },
});

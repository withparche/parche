import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// The editor, prebuilt: served by /_parche/builder/assets/* as fixed files,
// never through the site's Vite, so saving content (which makes Astro reload
// the pages it serves) never reloads the editor.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist/editor',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        editor: fileURLToPath(new URL('./src/editor/main.tsx', import.meta.url)),
        'preview-client': fileURLToPath(new URL('./src/preview-client/index.ts', import.meta.url)),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (info) => (info.names?.[0]?.endsWith('.css') ? 'editor.css' : '[name][extname]'),
      },
    },
  },
});

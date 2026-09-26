import type { Plugin } from 'vite';

/**
 * Stands in for `astro:content` in the dev server, so the ~two dozen places
 * core and the parches read content see a draft when the preview context
 * holds one for that file, and the file otherwise. The real module is
 * imported through `astro:content?parche-real`, which this plugin resolves
 * to what Astro would have.
 */
const SHIM = '\0parche-builder:content';
const REAL = 'astro:content?parche-real';

const code = `
import * as real from ${JSON.stringify(REAL)};
export * from ${JSON.stringify(REAL)};
const context = () => globalThis[Symbol.for('parche.preview')]?.getStore();
const overlay = (entry) => {
  const c = context();
  if (!c || !entry || !entry.filePath) return entry;
  const draft = c.drafts.get(entry.filePath);
  return draft ? { ...entry, data: draft } : entry;
};
export async function getCollection(name, filter) {
  if (!context()) return real.getCollection(name, filter);
  const all = (await real.getCollection(name)).map(overlay);
  return filter ? all.filter(filter) : all;
}
export async function getEntry(...args) {
  return overlay(await real.getEntry(...args));
}
export async function getEntries(refs) {
  return (await real.getEntries(refs)).map(overlay);
}
`;

export function draftContent(): Plugin {
  return {
    name: 'parche-builder:draft-content',
    enforce: 'pre',
    // Astro resolves astro:content in its own plugin, which runs first; the
    // hook's own `order: 'pre'` puts this one ahead of every plugin's.
    resolveId: {
      order: 'pre',
      async handler(id, importer, options) {
        if (id === REAL) return (await this.resolve('astro:content', importer, { ...options, skipSelf: true }))?.id ?? null;
        if (id === 'astro:content' && importer !== SHIM) return SHIM;
        return null;
      },
    },
    load: {
      order: 'pre',
      handler(id) {
        return id === SHIM ? code : null;
      },
    },
  };
}

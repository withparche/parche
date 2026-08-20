import { defineCommand } from 'citty';

export default defineCommand({
  meta: { name: 'astro', description: 'Create and manage Parche (Astro) projects' },
  subCommands: {
    new: () => import('./new.js').then((m) => m.default),
    // Reserved, coming soon: generate (AI/Narrans), add, builder, dev, build.
  },
});

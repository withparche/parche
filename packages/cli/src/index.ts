import { defineCommand, runMain } from 'citty';

const main = defineCommand({
  meta: {
    name: 'parche',
    version: '0.1.0',
    description: "The Parche CLI — build sites you don't just fork.",
  },
  subCommands: {
    astro: () => import('./commands/astro/index.js').then((m) => m.default),
    // Reserved: narrans.
  },
});

runMain(main);

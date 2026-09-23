import { defineCommand, runMain } from 'citty';
import { version } from './lib/version.js';

const main = defineCommand({
  meta: {
    name: 'parche',
    version,
    description: "The Parche CLI — build sites you don't just fork.",
  },
  subCommands: {
    astro: () => import('./commands/astro/index.js').then((m) => m.default),
    // Reserved: narrans.
  },
});

runMain(main);

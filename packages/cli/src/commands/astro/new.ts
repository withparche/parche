import { defineCommand } from 'citty';
import { scaffold } from '../../lib/scaffold.js';
import type { PM } from '../../lib/install.js';

export default defineCommand({
  meta: { name: 'new', description: 'Create a new Parche project from a template' },
  args: {
    template: { type: 'positional', required: false, description: 'Template name or source (e.g. hello-parche)' },
    dir: { type: 'positional', required: false, description: 'Target directory' },
    pm: { type: 'string', description: 'Package manager (pnpm|npm|yarn|bun)' },
    ref: { type: 'string', description: 'Git ref/branch for remote templates' },
    install: { type: 'boolean', default: true, description: 'Install dependencies' },
    git: { type: 'boolean', default: true, description: 'Initialize a git repository' },
    force: { type: 'boolean', default: false, description: 'Overwrite a non-empty directory' },
    yes: { type: 'boolean', alias: 'y', default: false, description: 'Skip prompts, use defaults' },
  },
  async run({ args }) {
    await scaffold({
      template: args.template,
      dir: args.dir,
      pm: args.pm as PM | undefined,
      ref: args.ref,
      install: args.install,
      git: args.git,
      force: args.force,
      yes: args.yes,
    });
  },
});

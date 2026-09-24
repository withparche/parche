import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  command: z.string().meta({ help: 'The command, on one line.' }),
  prompt: z.string().default('$'),
  copyLabel: z.string().default('Copy'),
  copiedLabel: z.string().default('Copied'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Command',
    description: 'One shell command with a copy button: the install line under a hero, the last step of a guide.',
    category: 'content',
    icon: 'tabler:terminal-2',
  },
};

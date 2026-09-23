import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  keys: z.array(z.string()).optional().meta({ help: 'Render a combination: ["Cmd", "K"]. Otherwise the slot is one key.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Kbd',
    description: 'A keyboard key, or a key combination.',
    tokens: ['color-surface', 'color-border', 'color-heading'],
    parts: [
      { name: 'root', element: 'kbd' },
      { name: 'key', element: 'kbd', description: 'Each key of a combination.' },
    ],
  },
});

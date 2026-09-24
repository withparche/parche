import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  caption: z.string().optional().meta({ help: 'What goes here and at what size: "hero screenshot · 1200×900". Also the accessible name.' }),
  label: z.string().optional().meta({ help: 'The accessible name when there is no caption: "Portrait of L. Fontana".' }),
  stripe: z.number().default(12).meta({ help: 'Width of one stripe, in pixels.' }),
  compact: z.boolean().default(false).meta({ help: 'A smaller caption chip, for cards.' }),
  ratio: z.string().default('4/3').meta({ help: 'CSS aspect-ratio of the box.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Placeholder',
    description: 'A striped box standing in for an image that does not exist yet, captioned with what goes there and its size.',
    tokens: ['color-surface-2', 'color-border', 'color-muted', 'color-background', 'comp-placeholder-stripe-a', 'comp-placeholder-stripe-b'],
    parts: [
      { name: 'root', element: 'div', role: 'img', description: 'The striped box, named by its caption.' },
      { name: 'caption', element: 'span', description: 'The mono chip in the corner.' },
    ],
  },
});

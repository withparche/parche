import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const paddings = ['none', 'sm', 'md', 'lg'] as const;
export const shadows = ['none', 'sm', 'md'] as const;

export const schema = z.object({
  as: z.enum(['div', 'article', 'li', 'section']).default('div'),
  href: z.string().optional().meta({ input: 'url', help: 'Makes the whole card a link.' }),
  padding: z.enum(paddings).default('md'),
  shadow: z.enum(shadows).default('sm'),
  border: z.boolean().default(true),
  interactive: z.boolean().default(false).meta({ help: 'Hover lift and a pointer; on by default for a linked card.' }),
});

export type Props = z.infer<typeof schema> & { class?: string; id?: string };

export const meta = defineElement({
  element: {
    label: 'Card',
    description: 'A bounded surface for a unit of content, with optional media, header and footer.',
    tokens: ['color-surface', 'color-border', 'color-ring', 'color-primary'],
    parts: [
      { name: 'root', element: 'div | a', states: ['interactive'] },
      { name: 'media', element: 'div', description: 'The `media` slot, edge to edge above the body.' },
      { name: 'header', element: 'div', description: 'The `header` slot.' },
      { name: 'body', element: 'div', description: 'The default slot.' },
      { name: 'footer', element: 'div', description: 'The `footer` slot.' },
    ],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['text', 'rect', 'circle'] as const;

export const schema = z.object({
  variant: z.enum(variants).default('text'),
  lines: z.number().int().min(1).max(10).default(3).meta({ help: 'Number of text lines (text variant).' }),
  width: z.string().optional().meta({ help: 'CSS width, e.g. "12rem" or "100%".' }),
  height: z.string().optional().meta({ help: 'CSS height for rect/circle, e.g. "8rem".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Skeleton',
    description: 'A placeholder shape shown while content loads.',
    tokens: ['color-surface-hover'],
    parts: [
      { name: 'root', element: 'div' },
      { name: 'line', element: 'div', description: 'Each line of the text variant.' },
    ],
  },
});

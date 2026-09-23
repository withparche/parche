import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const tones = ['primary', 'muted', 'highlight'] as const;

export const schema = z.object({
  tone: z.enum(tones).default('primary'),
  as: z.enum(['p', 'span', 'div']).default('p'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Eyebrow',
    description: 'The small uppercase label above a heading.',
    tokens: ['color-primary', 'color-muted', 'color-highlight'],
    parts: [{ name: 'root', element: 'p', description: 'The label; `as` picks the tag.' }],
  },
});

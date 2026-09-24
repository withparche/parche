import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const tones = ['success', 'warning', 'primary', 'muted'] as const;

export const schema = z.object({
  url: z.string().optional().meta({ help: 'The address shown in the bar: "localhost:4321".' }),
  badge: z.string().optional().meta({ help: 'A short chip at the right of the bar: "LCP 0.4s".' }),
  badgeTone: z.enum(tones).default('success'),
  elevated: z.boolean().default(true).meta({ help: 'Lift the frame with the large shadow.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Frame',
    description: 'A browser window around a screenshot or a live demo: the dots, the address and a status chip.',
    tokens: ['color-surface', 'color-surface-2', 'color-border', 'color-muted', 'color-success', 'color-success-soft', 'color-warning', 'color-warning-soft', 'color-primary', 'color-primary-soft'],
    parts: [
      { name: 'root', element: 'div' },
      { name: 'bar', element: 'div', description: 'The window bar: three dots, the address, the chip.' },
      { name: 'url', element: 'span' },
      { name: 'badge', element: 'span' },
      { name: 'body', element: 'div', description: 'What the window shows: the slot.' },
    ],
  },
});

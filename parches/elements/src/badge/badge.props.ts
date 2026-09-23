import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['default', 'primary', 'success', 'warning', 'danger', 'muted'] as const;
export const sizes = ['sm', 'md'] as const;

export const schema = z.object({
  variant: z.enum(variants).default('default'),
  size: z.enum(sizes).default('md'),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Badge',
    description: 'A small status pill: a state, a category, a count.',
    tokens: [
      'color-surface', 'color-heading', 'color-border', 'color-primary', 'color-primary-soft', 'color-muted',
      'color-success', 'color-success-soft', 'color-warning', 'color-warning-soft', 'color-danger', 'color-danger-soft',
    ],
    parts: [{ name: 'root', element: 'span' }],
  },
});

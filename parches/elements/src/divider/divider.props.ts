import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['line', 'dots', 'gradient'] as const;

export const schema = z.object({
  variant: z.enum(variants).default('line'),
  label: z.string().optional().meta({ help: 'Short text in the middle of the line ("or").' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Divider',
    description: 'A horizontal separator between blocks.',
    a11y: { pattern: 'separator', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/' },
    tokens: ['color-border', 'color-muted'],
    parts: [
      { name: 'root', element: 'hr | div', description: 'The separator; `<hr>` for line, a `role="separator"` div otherwise.' },
      { name: 'label', element: 'span', description: 'The optional centred text.' },
    ],
  },
});

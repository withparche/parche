import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  text: z.string().meta({ help: 'The tooltip. Plain text: it is read as the trigger\'s description.' }),
  placement: z.enum(['top', 'bottom', 'left', 'right']).default('top'),
  delay: z.number().int().min(0).default(300).meta({ help: 'Milliseconds before it shows on hover.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Tooltip',
    description: 'A short description shown on hover and focus, anchored to its trigger.',
    a11y: { pattern: 'tooltip', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/' },
    tokens: ['color-heading', 'color-background'],
    tag: { name: 'parche-tooltip', entry: './tooltip.element.ts' },
    keyboard: {
      'Tab': 'Focusing the trigger shows it.',
      'Escape': 'Hides it.',
    },
    noJs: 'Shown on hover and focus by CSS alone (`:hover`, `:focus-within`), positioned next to the trigger. The description link (`aria-describedby`) needs the element.',
    parts: [
      { name: 'root', element: 'parche-tooltip', states: ['open', 'closed'] },
      { name: 'surface', element: 'div', role: 'tooltip' },
    ],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  id: z.string().meta({ help: 'The id invokers target: any button with `popovertarget={id}` toggles it and anchors it.' }),
  title: z.string().optional().meta({ help: 'Names the popover (it becomes a non-modal dialog). Inline HTML allowed.' }),
  placement: z.enum(['top', 'bottom', 'left', 'right']).default('bottom'),
  align: z.enum(['start', 'center', 'end']).default('center'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Popover',
    description: 'A small panel next to its trigger, on the Popover API and CSS anchor positioning.',
    a11y: { pattern: 'dialog (non-modal)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted'],
    tag: { name: 'parche-popover', entry: './popover.element.ts' },
    keyboard: {
      'Escape': 'Closes (light dismiss).',
      'Tab': 'Moves through the controls inside, then on through the page.',
    },
    noJs: 'Opens, closes and light-dismisses with no script: `popover="auto"` and `popovertarget` are Baseline 2024. It sits next to its invoker where CSS anchor positioning exists (Chrome 125, Safari 26); elsewhere the element positions it with a lazily loaded fallback, and with no script it appears in flow after the trigger.',
    parts: [
      { name: 'root', element: 'parche-popover', states: ['open', 'closed'] },
      { name: 'surface', element: 'div', description: 'The `[popover]` panel.' },
      { name: 'title', element: 'h2' },
      { name: 'content', element: 'div' },
    ],
  },
});

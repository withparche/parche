import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  title: z.string().optional().meta({ help: 'The trigger text. Otherwise use the `trigger` slot.' }),
  open: z.boolean().default(false).meta({ help: 'Expanded on first render.' }),
  name: z.string().optional().meta({ help: 'Collapsibles sharing a name close each other (native `details name`). Accordion sets it for you.' }),
  forceOpen: z.string().optional().meta({ help: 'A media query; while it matches the content stays open and the trigger is inert, e.g. "(min-width: 48rem)" to collapse only on small screens.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Collapsible',
    description: 'A disclosure: a trigger that shows and hides its content.',
    a11y: { pattern: 'disclosure', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/' },
    tokens: ['color-heading', 'color-muted', 'color-border', 'color-ring', 'color-surface-hover'],
    tag: { name: 'parche-collapsible', entry: './collapsible.element.ts' },
    keyboard: {
      'Enter / Space': 'Toggle the content (on the trigger).',
      'Tab': 'Moves through the trigger and, when open, the content.',
    },
    noJs: 'Fully functional: a native <details>/<summary>, so it opens and closes without any script. The element only adds the state hook, the change events and `forceOpen`.',
    parts: [
      { name: 'root', element: 'details', states: ['open', 'closed'] },
      { name: 'trigger', element: 'summary', description: 'The disclosure button.' },
      { name: 'indicator', element: 'svg', description: 'The chevron; rotates when open.' },
      { name: 'content', element: 'div' },
    ],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  id: z.string().meta({ help: 'The id invokers target: any button with `command="show-modal" commandfor={id}` opens it.' }),
  title: z.string().meta({ help: 'The accessible name. Inline HTML allowed.' }),
  description: z.string().optional().meta({ help: 'Short text under the title; becomes the accessible description.' }),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  closedBy: z.enum(['any', 'closerequest', 'none']).default('any').meta({
    help: '`any`: Escape and a click outside close it. `closerequest`: Escape only. `none`: only the close button.',
  }),
  closeLabel: z.string().default('Close').meta({ help: 'Accessible name of the close button.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Dialog',
    description: 'A modal window on the native <dialog>, opened by invoker commands.',
    a11y: { pattern: 'dialog (modal)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-overlay', 'color-ring', 'color-surface-hover'],
    tag: { name: 'parche-dialog', entry: './dialog.element.ts' },
    keyboard: {
      'Escape': 'Closes (unless `closedBy` is `none`).',
      'Tab / Shift+Tab': 'Cycles through the controls inside; focus cannot leave a modal.',
    },
    noJs: 'Opens and closes with no script in browsers with invoker commands (`command`/`commandfor`, Baseline 2025): the platform handles the top layer, focus trapping, Escape and focus return. The element only loads the commands polyfill where they are missing, honours `closedBy` where the attribute is unknown, and adds the state hook and events.',
    parts: [
      { name: 'root', element: 'parche-dialog', states: ['open', 'closed'] },
      { name: 'dialog', element: 'dialog', description: 'The native modal; also the backdrop.' },
      { name: 'panel', element: 'div', description: 'The visible box, scrolls its content.' },
      { name: 'header', element: 'header' },
      { name: 'title', element: 'h2' },
      { name: 'description', element: 'p' },
      { name: 'close', element: 'button', description: 'Sends `command="close"`.' },
      { name: 'content', element: 'div' },
      { name: 'footer', element: 'footer', description: 'Actions; only when the `footer` slot is filled.' },
    ],
  },
});

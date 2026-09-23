import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  id: z.string().meta({ help: 'The id invokers target: any button with `command="show-modal" commandfor={id}` opens it.' }),
  title: z.string().meta({ help: 'The accessible name. Inline HTML allowed.' }),
  description: z.string().optional(),
  side: z.enum(['left', 'right', 'top', 'bottom']).default('right').meta({ help: 'The edge it slides in from.' }),
  closedBy: z.enum(['any', 'closerequest', 'none']).default('any'),
  closeLabel: z.string().default('Close'),
  hideTitle: z.boolean().default(false).meta({ help: 'Keep the title for assistive tech only (e.g. a navigation drawer).' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Sheet',
    description: 'A panel that slides in from an edge: a modal <dialog> docked to a side.',
    a11y: { pattern: 'dialog (modal)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-overlay', 'color-ring', 'color-surface-hover'],
    tag: { name: 'parche-sheet', entry: './sheet.element.ts' },
    keyboard: {
      'Escape': 'Closes (unless `closedBy` is `none`).',
      'Tab / Shift+Tab': 'Cycles through the controls inside; focus cannot leave a modal.',
    },
    noJs: 'Same as Dialog: opens and closes with no script where invoker commands exist; the element only loads the polyfill elsewhere and adds the state hook and events.',
    parts: [
      { name: 'root', element: 'parche-sheet', states: ['open', 'closed'] },
      { name: 'dialog', element: 'dialog' },
      { name: 'panel', element: 'div' },
      { name: 'header', element: 'header' },
      { name: 'title', element: 'h2' },
      { name: 'description', element: 'p' },
      { name: 'close', element: 'button' },
      { name: 'content', element: 'div' },
      { name: 'footer', element: 'footer' },
    ],
  },
});

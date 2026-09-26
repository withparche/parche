import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  position: z.enum(['bottom', 'top']).default('bottom').meta({ help: 'bottom: a bar along the bottom edge · top: under the site header.' }),
  after: z.number().min(0).default(0.8).meta({ help: 'Appears once the reader has scrolled this many screens (the hero is behind them), or half of the page when it is shorter.' }),
  label: z.string().default('Call to action').meta({ help: 'The bar\'s accessible name.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'StickyBar',
    description: 'A bar that follows the reader once the hero is behind them, with the one action of the page; it steps aside at the footer.',
    tokens: ['color-border', 'color-background', 'color-heading', 'color-muted'],
    tag: { name: 'parche-sticky-bar', entry: './sticky-bar.element.ts' },
    keyboard: { Tab: 'The bar\'s links and buttons are in the tab order only while it shows.' },
    noJs: 'The bar stays hidden: the page already carries the same action in its hero and its close.',
    parts: [
      { name: 'root', element: 'parche-sticky-bar', states: ['hidden', 'shown'] },
      { name: 'bar', element: 'div' },
    ],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const item = z.object({
  value: z.string().meta({ help: 'Identifies the tab and names the panel slot.' }),
  label: z.string(),
  icon: z.string().optional().meta({ input: 'icon' }),
  disabled: z.boolean().default(false),
  content: z.string().optional().meta({ input: 'textarea', help: 'Panel HTML. Otherwise slot the panel under the tab\'s value.' }),
});

export const schema = z.object({
  items: z.array(item).min(1),
  value: z.string().optional().meta({ help: 'The selected tab; the first enabled one when omitted.' }),
  syncKey: z.string().optional().meta({ help: 'Keep the selected tab in the URL under this query key.' }),
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  variant: z.enum(['line', 'pill']).default('line'),
  label: z.string().optional().meta({ help: 'Accessible name of the tab list.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Tabs',
    description: 'One panel at a time, chosen from a tab list.',
    a11y: { pattern: 'tabs', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/' },
    tokens: ['color-heading', 'color-muted', 'color-primary', 'color-on-primary', 'color-border', 'color-ring', 'color-surface-hover'],
    tag: { name: 'parche-tabs', entry: './tabs.element.ts' },
    keyboard: {
      'ArrowRight / ArrowLeft': 'Next / previous tab (ArrowDown / ArrowUp when vertical); the panel follows the focus.',
      'Home / End': 'First / last tab.',
      'Tab': 'From the selected tab into its panel.',
    },
    noJs: 'Every panel is shown, stacked, each under a heading with its tab label; the tab list is hidden. Nothing is unreachable.',
    parts: [
      { name: 'root', element: 'parche-tabs' },
      { name: 'list', element: 'div', role: 'tablist' },
      { name: 'tab', element: 'button', role: 'tab', states: ['active', 'inactive'] },
      { name: 'panel', element: 'div', role: 'tabpanel', states: ['active', 'inactive'] },
      { name: 'heading', element: 'h3', description: 'The panel\'s label; visible only without script.' },
    ],
  },
});

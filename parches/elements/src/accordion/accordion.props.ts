import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const item = z.object({
  title: z.string().meta({ help: 'The question or heading. Inline HTML allowed.' }),
  content: z.string().meta({ input: 'textarea', help: 'The answer, as HTML (e.g. rendered Markdown).' }),
  open: z.boolean().default(false),
  icon: z.string().optional().meta({ input: 'icon', help: 'Shown before the title.' }),
});

export const schema = z.object({
  items: z.array(item).min(1),
  multiple: z.boolean().default(false).meta({ help: 'Allow several items open at once. Otherwise opening one closes the others.' }),
  name: z.string().optional().meta({ help: 'Group name for the native exclusivity; derived from the items when omitted.' }),
  forceOpen: z.string().optional().meta({ help: 'Media query that keeps every item open, e.g. "(min-width: 48rem)".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Accordion',
    description: 'A stack of disclosures where opening one closes the others.',
    a11y: { pattern: 'accordion', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/' },
    tokens: ['color-heading', 'color-muted', 'color-border', 'color-ring', 'color-surface-hover', 'color-primary'],
    parts: [
      { name: 'root', element: 'div' },
      { name: 'item', element: 'parche-collapsible', description: 'Each Collapsible.' },
    ],
  },
});

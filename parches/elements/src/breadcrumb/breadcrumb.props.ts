import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const item = z.object({
  label: z.string(),
  href: z.string().optional().meta({ input: 'url' }),
});

export const schema = z.object({
  items: z.array(item).min(1),
  label: z.string().default('Breadcrumb').meta({ help: 'Accessible name of the navigation landmark.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Breadcrumb',
    description: 'The trail from the home page to here.',
    a11y: { pattern: 'breadcrumb', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/' },
    tokens: ['color-muted', 'color-heading', 'color-primary', 'color-ring'],
    parts: [
      { name: 'root', element: 'nav' },
      { name: 'list', element: 'ol' },
      { name: 'item', element: 'li', states: ['current'] },
      { name: 'link', element: 'a | span' },
      { name: 'separator', element: 'svg' },
    ],
  },
});

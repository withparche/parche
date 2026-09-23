import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  current: z.number().int().min(1),
  total: z.number().int().min(1),
  base: z.string().meta({ help: 'URL of page 1, e.g. /blog. Page n is <base>/n.' }),
  numbers: z.boolean().default(true).meta({ help: 'Show page numbers around the current page.' }),
  window: z.number().int().min(0).max(4).default(1).meta({ help: 'Pages shown on each side of the current one.' }),
  prevLabel: z.string().default('Previous'),
  nextLabel: z.string().default('Next'),
  label: z.string().default('Pagination').meta({ help: 'Accessible name of the navigation landmark.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Pagination',
    description: 'Previous/next and page numbers for a paginated list.',
    tokens: ['color-heading', 'color-muted', 'color-primary', 'color-on-primary', 'color-surface-hover', 'color-border', 'color-ring'],
    parts: [
      { name: 'root', element: 'nav' },
      { name: 'list', element: 'ul' },
      { name: 'prev', element: 'a | span', states: ['disabled'] },
      { name: 'next', element: 'a | span', states: ['disabled'] },
      { name: 'page', element: 'a | span', states: ['current'] },
      { name: 'ellipsis', element: 'span' },
    ],
  },
});

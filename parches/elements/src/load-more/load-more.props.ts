import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  href: z.string().meta({ help: 'The next page, a real URL: /blog/2. Without script the control is this link.' }),
  list: z.string().default('[data-load-more-list]').meta({ help: 'The list whose items the next page adds to, as a selector matching it on both pages.' }),
  label: z.string().default('Load more'),
  loadingLabel: z.string().default('Loading…'),
  status: z.string().default('{n} more loaded').meta({ help: 'Announced after loading; {n} is replaced.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Load more',
    description: 'A link to the next page that, with script, adds that page to the list instead: the URL follows, and every page stays a real one.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-primary'],
    tag: { name: 'parche-load-more', entry: './load-more.element.ts' },
    keyboard: { 'Enter': 'Loads the next page into the list; focus moves to its first new item.' },
    noJs: 'A link to the next page, which is a complete page of its own.',
    parts: [
      { name: 'root', element: 'parche-load-more', states: ['idle', 'loading', 'done'] },
      { name: 'link', element: 'a' },
      { name: 'status', element: 'p' },
    ],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  bundle: z.string().default('/pagefind/').meta({ help: 'Where the Pagefind index lives: what the site build wrote.' }),
  param: z.string().default('q').meta({ help: 'The query in the address, so a search can be shared and reloaded.' }),
  label: z.string().default('Search').meta({ help: 'The accessible name of the field.' }),
  placeholder: z.string().default('Search'),
  button: z.string().default('Search'),
  clear: z.string().default('Clear'),
  loading: z.string().default('Searching…'),
  results: z.string().default('{n} results for “{q}”').meta({ help: 'Announced and shown over the results; {n} and {q} are replaced.' }),
  result: z.string().default('1 result for “{q}”'),
  none: z.string().default('Nothing matches “{q}”.'),
  noScript: z.string().default('Search runs in the browser.').meta({ help: 'Shown until the element runs: where to go instead.' }),
  limit: z.number().int().min(1).max(50).default(20),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Search',
    description: 'A search field over a static Pagefind index: results as the reader types, the query in the address, a way on when nothing matches.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-muted', 'color-primary', 'color-highlight'],
    tag: { name: 'parche-search', entry: './search.element.ts' },
    keyboard: {
      'Enter': 'Searches now (the field searches as you type, after a pause).',
      'Escape': 'Clears the field.',
    },
    noJs: 'A form that reloads the page with the query; the slot says where to go instead (an archive).',
    parts: [
      { name: 'root', element: 'parche-search', states: ['idle', 'loading', 'results', 'empty'] },
      { name: 'form', element: 'form', role: 'search' },
      { name: 'input', element: 'input' },
      { name: 'clear', element: 'button' },
      { name: 'status', element: 'p' },
      { name: 'results', element: 'ol' },
      { name: 'empty', element: 'div', description: 'The default slot, shown when nothing matches: topics, the archive.' },
      { name: 'nojs', element: 'p' },
    ],
  },
});

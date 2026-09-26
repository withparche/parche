import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export interface TocItem {
  text: string;
  slug: string;
  children?: TocItem[];
}

export const item: z.ZodType<TocItem> = z.lazy(() =>
  z.object({
    text: z.string(),
    slug: z.string().meta({ help: 'The heading id it links to.' }),
    children: z.array(item).optional(),
  }),
);

export const schema = z.object({
  items: z.array(item).min(1),
  title: z.string().default('On this page'),
  label: z.string().default('Table of contents').meta({ help: 'Accessible name of the nav.' }),
  offset: z.number().int().default(80).meta({ help: 'Pixels from the top (a sticky header): the last heading scrolled past it is current.' }),
  layout: z.enum(['sidebar', 'disclosure']).default('sidebar').meta({ help: 'disclosure: a closed "On this page" that opens on demand, for narrow screens.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Toc',
    description: 'A table of contents that follows the reader and never grows past its height: the sections in view are marked on a track, subsections open with their section, and the list scrolls inside itself.',
    tokens: ['color-heading', 'color-muted', 'color-primary', 'color-border', 'color-ring', 'comp-toc-max-height'],
    tag: { name: 'parche-toc', entry: './toc.element.ts' },
    keyboard: {
      'Tab': 'Through the links of the open section (a closed section\'s subsections are inert).',
      'Enter': 'Jumps to the heading.',
    },
    noJs: 'A nav of in-page links, fully functional, every level open, capped at its height with its own scroll. The tracking, the collapsing and the indicator need the element.',
    parts: [
      { name: 'root', element: 'parche-toc' },
      { name: 'nav', element: 'nav' },
      { name: 'disclosure', element: 'details', description: 'Only in the disclosure layout.' },
      { name: 'title', element: 'h2', description: 'A summary in the disclosure layout.' },
      { name: 'viewport', element: 'div', description: 'The capped, scrolling box; data-fade marks the edges with more to scroll.' },
      { name: 'track', element: 'div' },
      { name: 'indicator', element: 'span', description: 'Spans the sections in view.' },
      { name: 'list', element: 'ul' },
      { name: 'item', element: 'li' },
      { name: 'group', element: 'div', states: ['open', 'closed'], description: 'Wraps a section\'s subsections.' },
      { name: 'link', element: 'a', states: ['current', 'visible', 'idle'] },
    ],
  },
});

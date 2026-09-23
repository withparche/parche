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
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Toc',
    description: 'A table of contents that follows the reader: the visible heading\'s link is current.',
    tokens: ['color-heading', 'color-muted', 'color-primary', 'color-border', 'color-ring'],
    tag: { name: 'parche-toc', entry: './toc.element.ts' },
    keyboard: {
      'Tab': 'Through the links.',
      'Enter': 'Jumps to the heading.',
    },
    noJs: 'A nav of in-page links, fully functional; only the current-heading tracking needs the element.',
    parts: [
      { name: 'root', element: 'parche-toc' },
      { name: 'nav', element: 'nav' },
      { name: 'title', element: 'h2' },
      { name: 'list', element: 'ul' },
      { name: 'item', element: 'li' },
      { name: 'link', element: 'a', states: ['current'] },
    ],
  },
});

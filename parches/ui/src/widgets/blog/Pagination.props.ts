import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  numbers: z.boolean().default(true).meta({ help: 'Page numbers around the current page, not only newer and older.' }),
  summary: z.boolean().default(true).meta({ help: '"Page 1 of 7 · 38 posts" beside the links.' }),
  more: z.boolean().default(false).meta({ help: 'A "Load more" button instead of numbers: it adds the next page to the list, and is a link to it without script.' }),
  // Given by a route that renders the pagination directly; a blog view reads the page instead.
  currentPage: z.number().int().min(1).optional(),
  totalPages: z.number().int().min(1).optional(),
  baseUrl: z.string().optional(),
  prevText: z.string().optional(),
  nextText: z.string().optional(),
  class: z.string().optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Pagination',
    description: "Newer and older pages of a blog list, with numbers and where the reader is. Real links: every page is a URL.",
    category: 'blog',
    icon: 'tabler:dots',
  },
};

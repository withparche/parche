import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const toggle = () => z.boolean().optional();

export const schema = z.object({
  layout: z
    .enum(['list', 'cards', 'rows', 'compact'])
    .default('list')
    .meta({ help: 'list: a date column, title and lead, for a personal blog · cards: a grid with images · rows: category, title, lead and a thumbnail, for a magazine · compact: title and date only.' }),
  density: z.enum(['airy', 'compact']).default('airy').meta({ help: 'compact tightens rows, cards and titles for a busy publication.' }),
  columns: z.enum(['2', '3']).default('3').meta({ help: 'Cards per row at full width.' }),
  thumbnail: z.enum(['square', 'wide']).default('square').meta({ help: "rows: the picture beside each post · square 120px · wide 200px at 3:2, as a feed's (Medium, Substack)." }),
  // What each post shows. Left unset, the layout decides.
  date: toggle(),
  excerpt: toggle(),
  image: toggle(),
  author: toggle().meta({ help: 'Bylines. Never shown on a blog with one writer.' }),
  readingTime: toggle(),
  category: toggle(),
  tags: toggle(),
  title: z.string().optional().meta({ help: 'A heading over the list: "Writing" on an author page.' }),
  inFeedAfter: z.number().int().min(1).max(12).default(3).meta({ help: 'The in-feed slot (an ad, a subscribe box) goes after this many posts; never first.' }),
  empty: z.string().optional().meta({ help: 'What an empty list says. Default: the blog label.' }),
  /** Posts to show instead of the page's (a fixed list on a home page). */
  posts: z.array(z.any()).optional(),
});

export type Props = z.infer<typeof schema>;

export const slots = {
  inFeed: { label: 'In the list', help: 'After `inFeedAfter` posts, never first: an ad, a subscribe box. Not repeated by load more.', max: 1 },
};

export const meta: WidgetMeta = {
  slots,
  widget: {
    label: 'Post list',
    description: "The posts of a blog page, as a list, cards or rows. Reads the page's posts; takes a fixed list too.",
    category: 'blog',
    icon: 'tabler:list-details',
  },
  ui: {
    groups: [
      { key: 'layout', label: 'Layout', fields: ['layout', 'density', 'columns', 'thumbnail'] },
      { key: 'show', label: 'Show', fields: ['date', 'excerpt', 'image', 'author', 'readingTime', 'category', 'tags'] },
      { key: 'content', label: 'Content', fields: ['title', 'empty'] },
    ],
  },
};

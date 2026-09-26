import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  title: z.string().optional().meta({ help: '"Editor\'s picks", "Most read this week".' }),
  from: z.enum(['featured', 'posts', 'counts']).default('featured').meta({ help: 'featured: the posts marked featured · posts: the list below, in its order · counts: the most read, from numbers the site provides.' }),
  posts: z.array(z.string()).default([]).meta({ help: 'Post keys (file names), in order, for `from: posts`.' }),
  counts: z.record(z.string(), z.number()).default({}).meta({ help: 'Reads per post key, for `from: counts`: from your analytics, e.g. a $ref to a data file. Counted from finished reads, not clicks.' }),
  limit: z.number().int().min(1).max(10).default(5),
  numbered: z.boolean().optional().meta({ help: 'Numbers before the titles. Default: on for counts.' }),
  note: z.string().optional().meta({ help: 'A quiet line under the list: "Counted from finished reads, not clicks."' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Picks',
    description: "A short list beside a magazine's front: editor's picks, or the most read from numbers the site provides. Never invented.",
    category: 'blog',
    icon: 'tabler:list-numbers',
  },
};

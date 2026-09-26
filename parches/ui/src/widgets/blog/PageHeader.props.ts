import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional().meta({ help: "Left empty, the page's own: the blog's name, the tag, the category, the author." }),
  subtitle: z.string().optional().meta({ help: "Left empty on a tag or category page, the term's description." }),
  align: z.enum(['start', 'center']).default('start'),
  size: z.enum(['lg', 'md']).default('lg').meta({ help: 'lg: the index of a publication · md: a tag, a category, an author.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Blog page header',
    description: "The heading of a blog page: the blog's promise on the index, the term or author on theirs.",
    category: 'blog',
    icon: 'tabler:heading',
  },
};

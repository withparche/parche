import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  layout: z.enum(['centered', 'wide']).default('centered').meta({ help: 'centered: the text in the middle, with a 220px sidebar beside it · wide: across the page, from 1280px in three columns: the start rail, the text, and a 300px sidebar, wide enough for a standard 300×250 ad.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Article body',
    description: "The post's text at a reading measure, with what goes before and after it, the table of contents when the blog has one, and a sidebar when one is filled.",
    category: 'blog',
    icon: 'tabler:align-left',
  },
  slots: {
    before: { label: 'Before', help: 'Opens the text: the series box.', max: 2 },
    after: { label: 'After', help: 'Closes it: the next part, the author.', max: 4 },
    start: { label: 'Start rail', help: 'Wide layout only: a sticky column before the text, from 1280px: the share buttons.', max: 2 },
    aside: { label: 'Sidebar', help: 'Beside the text on wide screens, under the table of contents: an ad, a promotion.', max: 3 },
    inArticle: { label: 'In the article', help: 'After the first section, never before it: an ad, a subscribe box.', max: 1 },
  },
};

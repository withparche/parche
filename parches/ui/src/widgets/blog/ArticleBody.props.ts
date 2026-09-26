import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Article body',
    description: "The post's text at a reading measure, with what goes before and after it, and a sidebar when one is filled.",
    category: 'blog',
    icon: 'tabler:align-left',
  },
  slots: {
    before: { label: 'Before', help: 'Opens the text: the series box.', max: 2 },
    after: { label: 'After', help: 'Closes it: the next part, the author.', max: 4 },
    aside: { label: 'Sidebar', help: 'Beside the text on wide screens: the table of contents.', max: 3 },
  },
};

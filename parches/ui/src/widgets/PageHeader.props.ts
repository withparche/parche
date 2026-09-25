import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { link, text } from '../_shared/content';

export const schema = z.object({
  breadcrumb: z.array(z.object({ label: z.string(), href: z.string().optional() })).default([]).meta({ help: 'The path to this page; the last one is the page itself.' }),
  tagline: text().optional(),
  title: text(),
  subtitle: text({ input: 'textarea' }).optional(),
  meta: z.array(text()).default([]).meta({ help: 'Facts about the page, joined by dots: "Updated 4 September 2026", "4 min read".' }),
  link: link.optional().meta({ help: 'At the end of the meta line: "Edit this page".' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Page header',
    description: 'The top of a docs page, a policy or a release: breadcrumb, title, lead and a line of facts about the page.',
    category: 'content',
    icon: 'tabler:heading',
  },
};

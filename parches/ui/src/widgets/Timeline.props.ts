import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

const entry = z.object({
  label: z.string().meta({ help: 'The date or version in the left column: "2023", "v1.0".' }),
  title: z.string(),
  description: z.string().optional().meta({ input: 'textarea', markdown: 'inline' }),
  href: z.string().optional().meta({ help: 'A link to the release notes.' }),
  highlight: z.boolean().default(false).meta({ help: 'Mark the entry: the current release.' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(entry).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Timeline',
    description: 'Dated entries between hairlines beside a heading: a changelog, a history, a roadmap.',
    category: 'content',
    icon: 'tabler:timeline',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Entries', fields: ['items'] },
    ],
  },
};

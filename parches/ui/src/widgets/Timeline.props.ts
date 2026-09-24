import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const entry = z.object({
  label: z.string().meta({ help: 'The date or version in the left column: "2023", "v1.0".' }),
  title: z.string(),
  description: z.string().optional().meta({ input: 'textarea' }),
  href: z.string().optional().meta({ help: 'A link to the release notes.' }),
  highlight: z.boolean().default(false).meta({ help: 'Mark the entry: the current release.' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  link: z.object({ text: z.string(), href: z.string() }).optional().meta({ help: 'Under the heading: the full changelog, the RSS feed.' }),
  entries: z.array(entry).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Timeline',
    description: 'Dated entries between hairlines beside a heading: a changelog, a history, a roadmap.',
    category: 'content',
    icon: 'tabler:timeline',
  },
};

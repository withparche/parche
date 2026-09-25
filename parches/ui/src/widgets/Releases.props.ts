import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, actionVariants, image, link, text } from '../_shared/content';

export const types = ['new', 'improved', 'fixed', 'breaking'] as const;

const release = z.object({
  version: z.string().meta({ help: '"3.4.0". Also the anchor: #v3-4-0.' }),
  date: z.string().meta({ help: 'As shown: "11 September 2026".' }),
  title: text().optional(),
  latest: z.boolean().default(false),
  summary: text({ input: 'textarea' }).optional().meta({ help: 'Why it matters, for the people who use it.' }),
  image: image.optional(),
  caption: z.string().optional().meta({ help: 'The placeholder caption until there is an image: "read receipts screen · 1200×675".' }),
  changes: z.array(z.object({ type: z.enum(types), text: text() })).default([]),
  links: z.array(link).default([]).meta({ help: 'Under the changes: discuss, full diff.' }),
  meta: text().optional().meta({ help: 'A last quiet fact: "Shipped by 4 people".' }),
});

export const schema = z.object({
  items: z.array(release).default([]).meta({ help: 'Newest first.' }),
  filter: z.boolean().default(true).meta({ help: 'A bar to show only the releases with a kind of change.' }),
  labels: z
    .object({ all: z.string().default('Everything'), new: z.string().default('New'), improved: z.string().default('Improved'), fixed: z.string().default('Fixed'), breaking: z.string().default('Breaking') })
    .prefault({}),
  counts: z
    .object({ all: z.number().int().optional(), new: z.number().int().optional(), improved: z.number().int().optional(), fixed: z.number().int().optional(), breaking: z.number().int().optional() })
    .optional()
    .meta({ help: 'Counts across every release, when this page shows only the latest; counted from the items otherwise.' }),
  order: z.string().optional().meta({ help: 'At the end of the filter bar: "Everything, newest first".' }),
  jump: z
    .object({ title: z.string().default('Jump to'), links: z.array(link).default([]).meta({ help: 'Under the releases: archives, the feed, the status page.' }) })
    .optional()
    .meta({ help: 'A column beside the releases linking to each one, and to the archives.' }),
  more: z.object({ action: action.extend({ variant: z.enum(actionVariants).default('secondary') }), note: text().optional() }).optional().meta({ help: 'After the list: the archive button and a line on why there is no infinite scroll.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Releases',
    description: 'A changelog: releases with a version, a date and typed changes, filterable by type, each with a permalink.',
    category: 'content',
    icon: 'tabler:list-details',
  },
};

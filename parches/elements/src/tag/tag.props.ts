import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  href: z.string().optional().meta({ input: 'url', help: 'Makes the tag a link (a filter, a taxonomy page).' }),
  active: z.boolean().default(false).meta({ help: 'The selected state of a filter.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Tag',
    description: 'A taxonomy chip: a category, a tag, a filter.',
    tokens: ['color-primary', 'color-on-primary', 'color-surface', 'color-muted', 'color-heading', 'color-border', 'color-ring'],
    parts: [{ name: 'root', element: 'a | span', states: ['active'] }],
  },
});

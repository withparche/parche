import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  tone: z
    .string()
    .default('default')
    .meta({ input: 'tone', help: 'The band\'s colour treatment: a registered tone name. `dark` re-declares every role for dark mode inside the band.' }),
  width: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg').meta({ help: 'The measure: sm 48rem · md 64rem · lg 72rem (default) · xl 80rem · full edge to edge.' }),
  spacing: z.enum(['none', 'sm', 'md', 'lg']).default('md').meta({ help: 'Vertical rhythm: none · sm 3rem · md 4–6rem (default) · lg 6–8rem.' }),
  id: z.string().optional().meta({ help: 'Anchor, for links like #pricing and for the sub-navigation.' }),
  label: z.string().optional().meta({ help: 'How navigation names this section, when it has an anchor.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Section',
    description: 'The band a page root sits in: tone, measure, rhythm and anchor. Every root gets one unless its widget declares otherwise.',
    category: 'layout',
    icon: 'tabler:section',
    // The wrapper does not wrap itself.
    wrapper: false,
  },
  slots: {
    default: { label: 'Content', help: 'What the section contains.' },
  },
  ui: {
    groups: [
      { key: 'look', label: 'Look', fields: ['tone', 'width', 'spacing'] },
      { key: 'anchor', label: 'Anchor', fields: ['id', 'label'] },
    ],
  },
};

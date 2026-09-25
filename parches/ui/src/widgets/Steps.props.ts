import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image, heading, headingGroup } from '../_shared/content';

export const layouts = ['timeline', 'grid', 'numbered', 'rows'] as const;

const step = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea', markdown: 'inline' }),
  icon: z.string().optional().meta({ input: 'icon', help: 'Replaces the step number.' }),
  duration: z.string().optional().meta({ help: '"1 week", "3 days": how long the step takes.' }),
  owner: z.string().optional().meta({ help: 'Who is responsible: "you", "us", a role.' }),
});

export const schema = z.object({
  layout: z.enum(layouts).default('timeline').meta({ help: 'timeline: a vertical line beside the media · grid: columns under the headline · numbered: headline and CTA beside a numbered list · rows: headline and CTA beside rows between hairlines, the duration at the right.' }),
  ...heading(),
  items: z.array(step).default([]),
  actions: z.array(action).default([]).meta({ help: 'Beside or under the steps: book the call, start the trial.' }),
  reversed: z.boolean().default(false).meta({ help: 'Swap the two columns.' }),
  image: image.optional().meta({ help: 'Beside the timeline when the media slot is empty.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Steps',
    description: 'A process: steps with a number or an icon, each with what it delivers, how long it takes and who owns it.',
    category: 'steps',
    icon: 'tabler:list-numbers',
  },
  slots: {
    media: { label: 'Media', help: 'Beside the timeline, replacing the image: a screenshot, a video, a form.', max: 1 },
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Steps', fields: ['items', 'actions'] },
      { key: 'layout', label: 'Layout', fields: ['layout', 'reversed', 'image'] },
    ],
  },
};

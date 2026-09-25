import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { text } from '../_shared/content';

const option = z.object({
  value: z.string().meta({ help: 'Names the slot that holds this option\'s content.' }),
  label: z.string(),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  options: z.array(option).min(2).max(6),
  value: z.string().optional().meta({ help: 'The option shown first; the first one when omitted.' }),
  syncKey: z.string().optional().meta({ help: 'Keep the chosen option in the URL under this query key, so a link can open it.' }),
  variant: z.enum(['line', 'pill']).default('pill'),
  label: z.string().optional().meta({ help: 'Accessible name of the control: "I am building", "Billing period".' }),
  align: z.enum(['start', 'center']).default('center').meta({ help: 'Where the control sits when there is no heading.' }),
  tagline: text().optional(),
  title: text().optional().meta({ help: 'A heading beside the control: the control then sits at the right of it, at the bottom.' }),
  subtitle: text({ input: 'textarea' }).optional(),
  level: z.union([z.literal(1), z.literal(2)]).default(2).meta({ help: '1 when the heading is the page title (a pricing page).' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Switch',
    description: 'A segmented control that swaps what is below it: a demo per audience, a plan per billing period, a screenshot per starter. One slot per option.',
    category: 'layout',
    icon: 'tabler:switch-horizontal',
  },
  slots: {
    '*': { label: 'Option', help: 'One slot per option, named by its value.' },
  },
};

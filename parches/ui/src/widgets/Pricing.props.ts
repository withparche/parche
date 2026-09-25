import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, actionVariants, heading, headingGroup } from '../_shared/content';

/** A plan's button: primary on the recommended plan, secondary on the others, unless set. */
const planAction = action.extend({ variant: z.enum(actionVariants).optional() });

const plan = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  type: z.enum(['standard', 'custom']).default('standard').meta({ help: '"custom" renders a graceful contact-us card instead of a numeric price' }),
  price: z.string().optional().meta({ placeholder: '29', help: 'Numeric price for standard plans; ignored for a custom tier' }),
  currency: z.string().optional().meta({ placeholder: '$', help: 'Currency symbol shown before a numeric price' }),
  period: z.string().optional().meta({ placeholder: '/ month', help: 'Optional — omit for custom/contact tiers' }),
  features: z.array(z.string()).default([]).meta({ help: 'What the plan includes, one line each.' }),
  actions: z.array(planAction).default([]),
  note: z.string().optional().meta({ help: 'Under the price: "MIT, commercial use included".' }),
  suffix: z.string().optional().meta({ help: 'After the price, smaller: "once", "/ month".' }),
  recommended: z.boolean().default(false).meta({ help: 'The recommended plan: accented border, the badge above it, the primary button.' }),
  badge: z.string().optional().meta({ placeholder: 'Popular', help: 'The label on the plan\'s top edge.' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  items: z.array(plan).default([]).meta({ help: 'The plans, in order.' }),
  comparison: z
    .object({
      label: z.string().default('Compare'),
      rows: z.array(
        z.object({
          feature: z.string(),
          values: z.array(z.object({ text: z.string(), tone: z.enum(['default', 'muted', 'success']).default('default') })).meta({ help: 'One per plan, in the plans order.' }),
        }),
      ),
    })
    .optional()
    .meta({ help: 'A table under the cards, one column per plan: quantities, not ticks.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Pricing',
    description: 'Pricing plans comparison grid',
    category: 'pricing',
    icon: 'tabler:credit-card',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Plans', fields: ['items', 'comparison'] },
    ],
  },
};

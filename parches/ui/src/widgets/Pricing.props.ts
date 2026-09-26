import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, actionVariants, heading, headingGroup, text } from '../_shared/content';

/** A plan's button: primary on the recommended plan, secondary on the others, unless set. */
const planAction = action.extend({ variant: z.enum(actionVariants).optional() });

/**
 * A field that may change with the billing period: one value for every
 * period, or one per period keyed by its value (`{ "monthly": "29",
 * "yearly": "290" }`).
 */
const byPeriod = <T extends z.ZodTypeAny>(s: T) => z.union([s, z.record(z.string(), s)]);
/** The fields a plan may vary by period. */
export const periodFields = ['price', 'period', 'suffix', 'note', 'noteTone', 'features', 'actions'] as const;

const plan = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea', markdown: 'inline' }),
  type: z.enum(['standard', 'custom']).default('standard').meta({ help: '"custom" renders a graceful contact-us card instead of a numeric price' }),
  price: byPeriod(z.string()).optional().meta({ placeholder: '29', help: 'Numeric price for standard plans; ignored for a custom tier. One per period with `periods`: { "monthly": "29", "yearly": "290" }.' }),
  currency: z.string().optional().meta({ placeholder: '$', help: 'Currency symbol shown before a numeric price' }),
  period: byPeriod(z.string()).optional().meta({ placeholder: '/ month', help: 'Optional — omit for custom/contact tiers' }),
  features: byPeriod(z.array(z.string())).default([]).meta({ help: 'What the plan includes, one line each; one list per period when they differ.' }),
  actions: byPeriod(z.array(planAction)).default([]),
  note: byPeriod(text()).optional().meta({ help: 'Under the price: "MIT, commercial use included"; one per period when it differs.' }),
  noteTone: byPeriod(z.enum(['muted', 'success'])).default('muted').meta({ help: 'success for a saving: "Two months free against monthly".' }),
  suffix: byPeriod(z.string()).optional().meta({ help: 'After the price, smaller: "once", "/ month"; one per period: { "monthly": "/month", "yearly": "/year" }.' }),
  recommended: z.boolean().default(false).meta({ help: 'The recommended plan: accented border, the badge above it, the primary button.' }),
  badge: z.string().optional().meta({ placeholder: 'Popular', help: 'The label on the plan\'s top edge.' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  level: z.union([z.literal(1), z.literal(2)]).default(2).meta({ help: '1 when the heading is the page title (a pricing page).' }),
  periods: z
    .object({
      label: z.string().default('Billing period').meta({ help: 'Accessible name of the control.' }),
      options: z.array(z.object({ value: z.string(), label: z.string() })).min(2).max(6),
      value: z.string().optional().meta({ help: 'The period shown first; the first one when omitted.' }),
      syncKey: z.string().optional().meta({ help: 'Keep the chosen period in the URL under this query key, so a link can open it.' }),
    })
    .optional()
    .meta({ help: 'Billing periods (monthly, yearly…): a control over the plans, and fields that change keyed by period.' }),
  items: z.array(plan).default([]).meta({ help: 'The plans, in order.' }),
  note: text().optional().meta({ help: 'One line under the plans: the currency, the tax, who pays nothing.' }),
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
}).superRefine((value, ctx) => {
  // A field keyed by period must use the declared periods, and needs them.
  const known = value.periods?.options.map((o) => o.value);
  value.items.forEach((plan, i) => {
    for (const field of periodFields) {
      const v = (plan as Record<string, unknown>)[field];
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      const keys = Object.keys(v);
      if (!known) {
        ctx.addIssue({ code: 'custom', path: ['items', i, field], message: `keyed by period (${keys.join(', ')}), but the widget declares no periods` });
        continue;
      }
      const unknown = keys.filter((k) => !known.includes(k));
      if (unknown.length) ctx.addIssue({ code: 'custom', path: ['items', i, field], message: `unknown period(s) ${unknown.join(', ')} (declared: ${known.join(', ')})` });
    }
  });
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
      { key: 'content', label: 'Plans', fields: ['periods', 'items', 'note', 'comparison'] },
    ],
  },
};

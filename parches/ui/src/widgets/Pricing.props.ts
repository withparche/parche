import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const pricingItem = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional().meta({ input: 'icon' }),
});

const pricePlan = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  type: z.enum(['standard', 'custom']).default('standard').meta({ help: '"custom" renders a graceful contact-us card instead of a numeric price' }),
  price: z.string().optional().meta({ placeholder: '29', help: 'Numeric price for standard plans; ignored for a custom tier' }),
  currency: z.string().optional().meta({ placeholder: '$', help: 'Currency symbol shown before a numeric price' }),
  period: z.string().optional().meta({ placeholder: '/ month', help: 'Optional — omit for custom/contact tiers' }),
  items: z.array(pricingItem).default([]),
  callToAction: z.object({
    text: z.string().optional().meta({ placeholder: 'Get started' }),
    href: z.string().optional().meta({ placeholder: 'https://...' }),
  }).optional(),
  note: z.string().optional().meta({ help: 'Under the price: "MIT, commercial use included".' }),
  suffix: z.string().optional().meta({ help: 'After the price, smaller: "once", "/ month".' }),
  hasRibbon: z.boolean().default(false).meta({ help: 'The recommended tier: accented border, the label above it.' }),
  ribbonTitle: z.string().optional().meta({ placeholder: 'Popular' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  prices: z.array(pricePlan).default([]),
  align: z.enum(['center', 'start']).default('center').meta({ help: 'Where the heading sits.' }),
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
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Plans', fields: ['prices'] },
    ],
  },
};

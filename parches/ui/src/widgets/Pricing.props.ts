import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

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
  hasRibbon: z.boolean().default(false),
  ribbonTitle: z.string().optional().meta({ placeholder: 'Popular' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  prices: z.array(pricePlan).default([]),
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

import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const link = z.object({ label: z.string(), href: z.string(), icon: z.string().optional().meta({ input: 'icon' }), description: z.string().optional() });
const group = z.object({ title: z.string().optional(), links: z.array(link) });
const mega = z.object({
  columns: z.number().int().min(1).max(4).default(3),
  featured: z.object({ title: z.string(), description: z.string().optional(), image: z.string().optional(), href: z.string() }).optional(),
  footer: z.string().optional(),
});

export const schema = z.object({
  logo: z.union([z.string(), z.object({ src: z.string(), alt: z.string().default('Logo'), width: z.number().optional(), height: z.number().optional() }), z.object({ text: z.string(), href: z.string().optional() })]).optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().optional(), children: z.array(group).optional(), mega: mega.optional() })).default([]),
  actions: z.array(z.object({ label: z.string(), href: z.string(), variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'), icon: z.string().optional().meta({ input: 'icon' }) })).optional(),
  announcement: z.object({ text: z.string(), href: z.string().optional(), icon: z.string().optional(), dismissible: z.boolean().default(true), aside: z.string().optional() }).optional(),
  position: z.enum(['left', 'center', 'right']).default('center').meta({ help: 'Where the desktop navigation sits between the logo and the actions.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Header',
    description: 'The site header: logo, navigation with dropdowns and mega menus, actions, an announcement bar.',
    category: 'layout',
    icon: 'tabler:layout-navbar',
    // Chrome: a layout root, never wrapped, not offered in the palette.
    wrapper: false,
    hidden: true,
  },
};

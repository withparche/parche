import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export const schema = z.object({
  name: z.string().meta({ input: 'icon', help: 'Iconify name, e.g. tabler:arrow-right.' }),
  size: z.enum(sizes).default('md'),
  label: z.string().optional().meta({ help: 'Accessible name when the icon carries meaning on its own. Omit for decorative icons.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Icon',
    description: 'An SVG icon from the Iconify sets, decorative by default.',
    a11y: { pattern: 'img', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/' },
    tokens: [],
    parts: [{ name: 'root', element: 'svg', description: 'The inline SVG; sized in steps, coloured by currentColor.' }],
  },
});

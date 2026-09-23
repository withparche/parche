import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['underline', 'arrow', 'ghost'] as const;

export const schema = z.object({
  href: z.string().meta({ input: 'url' }),
  variant: z.enum(variants).default('underline').meta({ help: 'underline for inline text, arrow for a "read more", ghost for muted navigation.' }),
  external: z.boolean().default(false).meta({ help: 'Opens in a new tab with rel="noopener noreferrer".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Link',
    description: 'An inline text link, with an optional trailing arrow.',
    a11y: { pattern: 'link', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/' },
    tokens: ['color-primary', 'color-muted', 'color-heading', 'color-ring'],
    parts: [
      { name: 'root', element: 'a' },
      { name: 'arrow', element: 'svg', description: 'Decorative trailing arrow (variant="arrow").' },
    ],
  },
});

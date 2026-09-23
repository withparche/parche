import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const widths = ['sm', 'md', 'lg', 'xl', 'full'] as const;

export const schema = z.object({
  width: z.enum(widths).default('lg').meta({ help: 'sm 48rem · md 64rem · lg 72rem (default) · xl 80rem · full: no max width.' }),
  padding: z.boolean().default(true).meta({ help: 'Horizontal padding so content never touches the viewport edge.' }),
  as: z.enum(['div', 'section', 'article', 'header', 'footer', 'nav', 'main']).default('div'),
});

export type Props = z.infer<typeof schema> & { class?: string; id?: string };

export const meta = defineElement({
  element: {
    label: 'Container',
    description: 'Centres content at a chosen max width, with horizontal padding.',
    tokens: [],
    parts: [{ name: 'root', element: 'div', description: 'The centred box; `as` picks the tag.' }],
  },
});

import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const paddings = ['none', 'sm', 'md', 'lg'] as const;

export const schema = z.object({
  padding: z.enum(paddings).default('md').meta({ help: 'Vertical rhythm: sm 3rem · md 4–6rem (default) · lg 6–8rem.' }),
  surface: z.boolean().default(false).meta({ help: 'Paint the section on the surface token, to alternate bands.' }),
  as: z.enum(['section', 'div', 'article', 'aside']).default('section'),
});

export type Props = z.infer<typeof schema> & { class?: string; id?: string };

export const meta = defineElement({
  element: {
    label: 'Section',
    description: 'A full-width band with vertical rhythm; the outer box of a page section.',
    tokens: ['color-surface'],
    parts: [{ name: 'root', element: 'section', description: 'The band; `as` picks the tag.', states: ['surface'] }],
  },
});

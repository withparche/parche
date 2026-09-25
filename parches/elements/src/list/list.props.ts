import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['divided', 'plain'] as const;
export const paddings = ['none', 'sm', 'md', 'lg'] as const;

export const schema = z.object({
  as: z.enum(['ul', 'ol']).default('ul').meta({ help: 'ol when the order means something: steps, releases.' }),
  variant: z.enum(variants).default('divided').meta({ help: 'divided: a hairline between rows and at both edges · plain: rows only.' }),
  padding: z.enum(paddings).default('md').meta({ help: 'Vertical space in each row, from --ds-comp-list-padding-<size>: sm 12px · md 18px · lg 20px.' }),
  edges: z.boolean().default(true).meta({ help: 'A hairline above the first row and below the last.' }),
  label: z.string().optional().meta({ help: 'Accessible name, when the heading above does not name the list.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'List',
    description: 'Rows between hairlines: a changelog, a process, specs, a FAQ without disclosure.',
    tokens: ['color-border'],
    parts: [
      { name: 'root', element: 'ul | ol', description: 'The list; each child element is a row.' },
    ],
  },
});

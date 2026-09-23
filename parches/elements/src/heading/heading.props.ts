import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const levels = [1, 2, 3, 4] as const;
export const aligns = ['start', 'center'] as const;
export const widths = ['sm', 'md', 'lg', 'full'] as const;

export const schema = z.object({
  title: z.string().optional().meta({ help: 'The heading text. Inline HTML is allowed (e.g. a highlighted span).' }),
  subtitle: z.string().optional().meta({ input: 'textarea', help: 'One or two sentences under the title. Inline HTML allowed.' }),
  tagline: z.string().optional().meta({ help: 'The eyebrow above the title.' }),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2).meta({ help: 'Heading level in the document outline. Sections use 2.' }),
  align: z.enum(aligns).default('center'),
  width: z.enum(widths).default('md').meta({ help: 'Measure of the block: sm 42rem · md 48rem · lg 56rem · full.' }),
  spacing: z.boolean().default(true).meta({ help: 'Margin below, for a heading that introduces content.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Heading',
    description: 'A section headline: eyebrow, title and subtitle, at a heading level.',
    tokens: ['color-heading', 'color-muted', 'color-primary'],
    parts: [
      { name: 'root', element: 'div' },
      { name: 'tagline', element: 'p', description: 'The eyebrow.' },
      { name: 'title', element: 'h2', description: 'The heading; `level` picks h1–h4.' },
      { name: 'subtitle', element: 'p' },
    ],
  },
  ui: { groups: [{ key: 'text', label: 'Text', fields: ['tagline', 'title', 'subtitle'] }, { key: 'layout', label: 'Layout', fields: ['level', 'align', 'width', 'spacing'] }] },
});

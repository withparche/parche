import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

export const schema = z.object({
  ...heading(),
  markdown: z.string().optional().meta({ input: 'textarea', help: 'The text, in Markdown: ## headings, paragraphs, lists, ``` code, > quotes, and inline **bold**, `code`, [links](/x). Headings get anchors.' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'HTML, for text written before Markdown was supported. Prefer markdown.' }),
  width: z.enum(['sm', 'md', 'lg', 'none']).default('md').meta({ help: 'The reading measure: sm 36rem · md 48rem · lg 56rem · none fills its column (in a docs layout).' }),
  size: z.enum(['md', 'lg']).default('md').meta({ help: 'lg for an introduction or a bio.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Prose',
    description: 'A block of running text written in Markdown: a docs section, a policy, a bio.',
    category: 'content',
    icon: 'tabler:align-left',
  },
  ui: {
    groups: [headingGroup, { key: 'content', label: 'Text', fields: ['markdown', 'content'] }, { key: 'layout', label: 'Layout', fields: ['width', 'size'] }],
  },
};

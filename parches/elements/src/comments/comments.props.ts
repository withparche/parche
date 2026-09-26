import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, { message: 'owner/repo' }).meta({ help: 'The GitHub repository whose Discussions hold the comments: "owner/repo".' }),
  repoId: z.string().meta({ help: 'From giscus.app, for the repository.' }),
  category: z.string().meta({ help: 'The Discussions category new threads go in: "Comments".' }),
  categoryId: z.string(),
  mapping: z.enum(['pathname', 'url', 'title', 'og:title']).default('pathname').meta({ help: 'How a page finds its thread.' }),
  lang: z.string().default('en'),
  consent: z.boolean().default(true).meta({ help: 'Wait for "comments" in the Consent element: giscus loads from GitHub.' }),
  load: z.string().default('Load the comments'),
  note: z.string().optional().meta({ help: 'Beside the button: moderation and privacy. Inline HTML allowed.' }),
  waiting: z.string().default('Comments load from GitHub once you allow them.').meta({ help: 'Shown while consent is missing.' }),
  preferences: z.string().default('Cookie choices').meta({ help: 'The link after `waiting` that reopens the Consent panel.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Comments',
    description: 'A discussion under a post from GitHub Discussions (giscus), loaded only when the reader gets there or asks, and after consent; it follows the light or dark mode.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-muted'],
    tag: { name: 'parche-comments', entry: './comments.element.ts' },
    keyboard: { 'Enter / Space': 'On the button: loads the comments now.' },
    noJs: 'A note that the comments need JavaScript; nothing loads from GitHub.',
    parts: [
      { name: 'root', element: 'parche-comments', states: ['waiting', 'ready', 'loaded'] },
      { name: 'load', element: 'button' },
      { name: 'note', element: 'p' },
      { name: 'consent', element: 'p' },
      { name: 'frame', element: 'div' },
    ],
  },
});

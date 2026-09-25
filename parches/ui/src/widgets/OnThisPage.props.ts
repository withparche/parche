import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { link } from '../_shared/content';

export const schema = z.object({
  title: z.string().default('On this page'),
  items: z.array(z.object({ text: z.string(), slug: z.string().meta({ help: 'The heading id: "install-the-cli" for "## Install the CLI".' }) })).default([]),
  links: z.array(link).default([]).meta({ help: 'Under the index: view the source, report a problem, ask.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'On this page',
    description: 'The headings of the page, following the reader, with a few links under them.',
    category: 'navigation',
    icon: 'tabler:list',
    wrapper: false,
  },
};

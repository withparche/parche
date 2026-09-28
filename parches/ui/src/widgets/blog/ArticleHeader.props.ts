import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  image: z.boolean().default(true).meta({ help: "The post's image under the header, wider than the text." }),
  share: z.boolean().default(true).meta({ help: 'Copy link and the device share sheet, on the byline row.' }),
  breadcrumb: z.boolean().default(true).meta({ help: 'The blog and the category above the title.' }),
  layout: z.enum(['centered', 'wide']).default('centered').meta({ help: 'centered: the image a little wider than the text · wide: the image across the page, over an ArticleBody laid out wide. The title is centred in both.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Article header',
    description: "The post's title, lead, byline, date and reading time, and its image. Nothing between the title and the first paragraph.",
    category: 'blog',
    icon: 'tabler:article',
  },
};

import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  image: z.boolean().default(true).meta({ help: "The post's image under the header, wider than the text." }),
  share: z.boolean().default(true).meta({ help: 'Copy link and the device share sheet, on the byline row.' }),
  breadcrumb: z.boolean().default(true).meta({ help: 'The blog and the category above the title.' }),
  layout: z.enum(['centered', 'wide']).default('centered').meta({ help: 'centered: the image a little wider than the text · wide: the image across the page, over an ArticleBody laid out wide. The title is centred in both.' }),
  imageWidth: z.enum(['wide', 'full']).optional().meta({ help: "wide: up to 1100px, wider than the text but short of the page, as most blogs set a cover · full: across the page. Default: the layout's (centered 1040px, wide across the page)." }),
  imageRatio: z.enum(['16/9', '3/2', '1.91/1', '21/9']).optional().meta({ help: "The cover's shape at every width. 1.91/1 is a social card's (1200×630), so one picture serves as cover, thumbnail and card. Default: 16:9, and 21:9 across a wide screen in the wide layout." }),
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

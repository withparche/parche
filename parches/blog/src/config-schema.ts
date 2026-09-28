import { z } from 'zod';

/**
 * The blog's options as zod, checked when `createBlog()` runs, so a mistyped
 * key or a wrong value stops the build with its name instead of being ignored.
 * The types in ./types.ts are the documentation; a test holds the two in step.
 */
const permalink = z.string().startsWith('/', { message: 'a permalink starts with "/"' });

export const blogConfigSchema = z
  .object({
    permalinks: z
      .object({
        listing: permalink,
        post: permalink,
        tag: permalink,
        category: permalink,
        author: permalink,
        series: permalink,
        rss: permalink,
        archive: permalink,
      })
      .partial()
      .strict()
      .optional(),
    postsPerPage: z.number().int().positive().optional(),
    readingTime: z.boolean().optional(),
    wordsPerMinute: z.number().positive().optional(),
    relatedPostsCount: z.number().int().min(0).optional(),
    showDraftsInDev: z.boolean().optional(),
    rss: z.boolean().optional(),
    series: z.boolean().optional(),
    toc: z.boolean().optional(),
    dateFormat: z.record(z.string(), z.unknown()).optional(),
    labels: z.record(z.string(), z.record(z.string(), z.string())).optional(),
    preset: z.enum(['personal', 'company', 'magazine', 'newsletter']).optional(),
    authors: z.enum(['one', 'many']).optional(),
    aboutPath: permalink.optional(),
    tagIndexThreshold: z.number().int().min(0).optional(),
    archive: z.boolean().optional(),
    comments: z
      .union([
        z.literal(false),
        z
          .object({
            provider: z.literal('giscus').optional(),
            repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, { message: 'the repository as "owner/repo"' }),
            repoId: z.string(),
            category: z.string(),
            categoryId: z.string(),
            mapping: z.enum(['pathname', 'url', 'title', 'og:title']).optional(),
            consent: z.boolean().optional(),
          })
          .strict(),
      ])
      .optional(),
    ads: z
      .union([
        z.literal(false),
        z
          .object({
            provider: z.enum(['adsense', 'script']).optional(),
            client: z.string().regex(/^ca-pub-\d+$/, { message: 'an AdSense publisher id looks like "ca-pub-1234567890"' }).optional(),
            src: z.string().optional(),
            html: z.string().optional(),
            slots: z.record(z.string(), z.string()).optional(),
            consent: z.enum(['builtin', 'cmp']).optional(),
          })
          .strict(),
      ])
      .optional(),
    subscribe: z.union([z.literal(false), z.object({ endpoint: z.string().optional(), path: permalink.optional() }).strict()]).optional(),
  })
  .strict();

/** Validates the options; throws one error listing every problem, with the key. */
export function validateBlogConfig(config: unknown): void {
  const res = blogConfigSchema.safeParse(config ?? {});
  if (res.success) return;
  const lines = res.error.issues.map((i) => {
    const at = i.path.join('.') || 'options';
    if (i.code === 'unrecognized_keys') return `  ${at}: unknown option(s) ${i.keys.map((k) => `"${k}"`).join(', ')}`;
    return `  ${at}: ${i.message}`;
  });
  throw new Error(`[parche] createBlog() options:\n${lines.join('\n')}`);
}

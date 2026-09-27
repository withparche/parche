import { z } from 'zod';
import { listDocs, readDoc } from './files.js';
import { loadBlog } from './blog.js';

type Schema = Record<string, any>;
const toJson = (s: unknown) => z.toJSONSchema(s as z.ZodType, { unrepresentable: 'any', io: 'input' }) as Schema;

/**
 * What the editor needs to edit the blog, when the site has it: the forms
 * for its collections (a post's dates as dates, its image from the assets,
 * its category, tags and authors suggested from what the site has), the
 * preset's views and which the site overrides, and where each post and view
 * is shown. Read from disk, so a post just created is known at once.
 */
export async function blogCatalog(root: string, locales: string[], defaultLocale: string) {
  const blog = await loadBlog();
  if (!blog) return null;
  const read = async (collection: string) => {
    const out: { id: string; data: Record<string, any> }[] = [];
    for (const d of await listDocs(root, collection).catch(() => [])) {
      const doc = await readDoc(root, collection, d.id).catch(() => null);
      if (doc) out.push({ id: d.id, data: doc.data });
    }
    return out;
  };
  const [posts, authors, taxonomies, overrides] = await Promise.all([read('posts'), read('authors'), read('taxonomies'), listDocs(root, 'views').catch(() => [])]);

  const uniq = (xs: unknown[]) => [...new Set(xs.filter((x): x is string => typeof x === 'string' && x !== ''))].sort((a, b) => a.localeCompare(b));
  const categories = uniq([...taxonomies.flatMap((t) => (t.data.categories ?? []).map((c: any) => c.key)), ...posts.map((p) => p.data.category)]);
  const tags = uniq([...taxonomies.flatMap((t) => (t.data.tags ?? []).map((c: any) => c.key)), ...posts.flatMap((p) => p.data.tags ?? [])]);
  const authorKeys = uniq(authors.map((a) => (a.id.includes('/') && locales.includes(a.id.split('/')[0]) ? a.id.split('/').slice(1).join('/') : a.id)));

  // The post form: the frontmatter as core's schema describes it, with the
  // inputs a person expects. Its sections are edited in the outline.
  const post = toJson(blog.schemas.posts);
  const props = post.properties as Record<string, Schema>;
  for (const k of ['publishDate', 'modifiedDate']) if (props[k]) props[k] = { type: 'string', input: 'date', description: props[k].description };
  if (props.image?.properties?.src) props.image.properties.src = { ...props.image.properties.src, input: 'image' };
  if (props.category) props.category = { ...props.category, examples: categories };
  if (props.tags?.items) props.tags.items = { ...props.tags.items, examples: tags };
  if (props.authors?.items) props.authors.items = { ...props.authors.items, examples: authorKeys };
  if (props.excerpt) props.excerpt = { ...props.excerpt, input: 'textarea' };
  for (const k of ['sections', 'template']) delete props[k];

  return {
    preset: blog.blogConfig.preset,
    config: blog.blogConfig,
    forms: {
      posts: post,
      authors: toJson(blog.schemas.authors),
      taxonomies: toJson(blog.schemas.taxonomies),
      series: toJson(blog.schemas.series),
    },
    views: blog.viewNames.map((name) => ({
      name,
      /** The site's own documents for it: `blog-<name>`, and per locale. */
      overrides: overrides.map((o) => o.id).filter((id) => id === `blog-${name}` || id.endsWith(`/blog-${name}`)),
      preset: blog.presetViews[blog.blogConfig.preset]?.[name] ?? { sections: [] },
    })),
    postPaths: Object.fromEntries(posts.map((p) => [p.id, blog.postPath(blog.blogConfig, p, locales, defaultLocale)])),
    viewPaths: blog.viewPaths(blog.blogConfig, posts, blog.viewNames, defaultLocale),
  };
}

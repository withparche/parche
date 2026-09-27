import { existsSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { CONTENT, file } from './_shared';

// The blog: posts (frontmatter as a form, the body as Markdown, both shown
// in the preview before a save), views customised from the preset's,
// authors, and the blog's options read-only.
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');

async function openDoc(page: Page, collection: string, name: string) {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: collection });
  await page.getByRole('region', { name: collection }).getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) }).click();
  // The editor has wired its preview client, so an edit refreshes the page in place.
  await expect.poll(() => page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => typeof (f.contentWindow as any)?.__parchePreview?.onSelect), { timeout: 20_000 }).toBe('function');
}

test("a post's title and its Markdown text show in the preview before a save, and save into the file", async ({ page }) => {
  await openDoc(page, 'Posts', 'first-post');
  await expect(frame(page).getByRole('heading', { level: 1 })).toHaveText('The first post', { timeout: 20_000 });
  const post = page.getByRole('region', { name: 'Post', exact: true });
  // The post's own title (required, so labelled "Title *"), not the SEO one under Metadata.
  await post.getByLabel(/^Title/).first().fill('A retitled post');
  await expect(frame(page).getByRole('heading', { level: 1 })).toHaveText('A retitled post');

  await page.getByRole('radio', { name: 'Markdown' }).click();
  const body = page.getByLabel('Markdown body');
  await expect(body).toHaveValue(/The body of the first post/);
  await body.fill('A new first paragraph, **in bold**.\n\n## A section\n\nWith a paragraph under it.\n');
  await page.getByRole('radio', { name: 'Page' }).click();
  await expect(frame(page).locator('strong', { hasText: 'in bold' })).toBeVisible();

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  const text = file('posts/en/first-post.md');
  expect(text).toMatch(/title: "?A retitled post"?/);
  expect(text).toContain('excerpt: "What the builder\'s tests edit."');
  expect(text).toContain('A new first paragraph, **in bold**.');
  expect(text).not.toContain('The body of the first post');
});

test('a new post starts as a draft dated today, and shows at its address', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: 'Posts' });
  const panel = page.getByRole('region', { name: 'Posts' });
  await panel.getByRole('button', { name: 'New' }).click();
  await panel.getByLabel('New post name').fill('second-post');
  await panel.getByLabel('New post title').fill('A second post');
  await panel.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('region', { name: 'Post', exact: true })).toBeVisible();
  const text = file('posts/en/second-post.md');
  expect(text).toMatch(/title: A second post/);
  expect(text).toContain('draft: true');
  expect(text).toContain(`publishDate: ${new Date().toISOString().slice(0, 10)}`);
  await expect(frame(page).getByRole('heading', { level: 1 })).toHaveText('A second post', { timeout: 20_000 });
});

test("a blog view is customised from the preset's, into the site's own file", async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: 'Blog views' });
  await page.getByRole('region', { name: 'Blog views' }).getByRole('button', { name: 'Customize index' }).click();
  await expect(page.getByRole('region', { name: 'Blog view', exact: true })).toBeVisible();
  expect(existsSync(`${CONTENT}views/blog-index.json`)).toBe(true);
  const view = JSON.parse(file('views/blog-index.json'));
  expect(JSON.stringify(view.sections)).toContain('blog/PostList');
  await expect(page.getByRole('region', { name: 'Outline' }).getByRole('button', { name: /Post list|PostList/ }).first()).toBeVisible();
  // The preview is the listing.
  await expect(frame(page).getByRole('link', { name: /first post|retitled/i }).first()).toBeVisible({ timeout: 20_000 });
});

test("an author is edited with its collection's form; the blog's options are shown, not edited", async ({ page }) => {
  await openDoc(page, 'Authors', 'jane');
  const author = page.getByRole('region', { name: 'Author' });
  await author.getByLabel('Role', { exact: true }).fill('Editor');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  expect(JSON.parse(file('authors/en/jane.json')).role).toBe('Editor');

  await page.getByRole('button', { name: 'Site', exact: true }).click();
  const options = page.getByRole('region', { name: 'Blog options' });
  await expect(options.getByText('company')).toBeVisible();
  await expect(options.getByText('/blog/%slug%')).toBeVisible();
});

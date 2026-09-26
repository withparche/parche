import { expect, test, type Page } from '@playwright/test';
import { file } from './_shared';

async function open(page: Page, name: string) {
  await page.goto('/_parche/builder');
  // The Pages panel is the one open when the editor starts.
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) }).click();
  await expect(page.getByRole('region', { name: 'Outline' })).toBeVisible();
}

test('select a widget in the outline, edit a prop, save: the file changes by that one value', async ({ page }) => {
  await open(page, 'home');
  await page.getByRole('region', { name: 'Outline' }).getByRole('button', { name: /^Hero/ }).click();
  const title = page.getByRole('region', { name: 'Hero' }).getByLabel('Title', { exact: true }).first();
  await expect(title).toHaveValue('Fixture home');
  await title.fill('Edited by the test');
  await expect(page.getByTitle('Unsaved changes')).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  const text = file('pages/en/home.json');
  expect(text).toContain('"title": "Edited by the test"');
  expect(text).not.toContain('"id": "n_');
  // The preview is the dev page: it reloads with the saved content.
  await expect(page.frameLocator('iframe[title="Preview"]').getByRole('heading', { level: 1 })).toHaveText('Edited by the test', { timeout: 20_000 });
});

test('undo and redo walk the edits back and forth', async ({ page }) => {
  await open(page, 'docs');
  await page.getByRole('region', { name: 'Outline' }).getByRole('button', { name: /^Features\s*Getting started/ }).click();
  // The widget's own title comes first; its items have one each.
  const title = page.getByRole('region', { name: 'Features' }).getByLabel('Title', { exact: true }).first();
  await title.fill('Changed');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(title).toHaveValue('Getting started');
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(title).toHaveValue('Changed');
});

test('add a widget where it fits, from the outline, and save it', async ({ page }) => {
  await open(page, 'docs');
  const outline = page.getByRole('region', { name: 'Sections' });
  await outline.getByRole('button', { name: '+ Add' }).last().click();
  await page.getByRole('textbox', { name: 'Widget to add' }).fill('FAQs');
  await page.getByRole('button', { name: /^FAQs/ }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  expect(JSON.parse(file('pages/en/docs.json')).sections.map((s: { widget: string }) => s.widget)).toEqual(['Features', 'FAQs']);
});

test('a Markdown page keeps its body and its frontmatter comment', async ({ page }) => {
  await open(page, 'about');
  await page.getByRole('button', { name: /^About\s*Page settings/ }).click();
  // The page's title, before the metadata's.
  await page.getByLabel('Title', { exact: true }).first().fill('About us');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  const text = file('pages/en/about.md');
  expect(text).toContain('title: About us');
  expect(text).toContain("# The page's frontmatter");
  expect(text.endsWith('The *body* of the about page, which the builder never rewrites.\n')).toBe(true);
});

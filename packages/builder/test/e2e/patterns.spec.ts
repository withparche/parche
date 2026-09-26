import { existsSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { CONTENT, file } from './_shared';

// Patterns: a node saved as one and used in its place, a use detached back
// into widgets, a field linked to a prop, a new pattern from the panel.
const outline = (page: Page) => page.getByRole('region', { name: 'Outline' });
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');

async function openDoc(page: Page, collection: 'Pages' | 'Patterns', name: string) {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: collection });
  await page.getByRole('region', { name: collection }).getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) }).click();
  await expect(outline(page)).toBeVisible();
}

test('a node saved as a pattern is used in its place, and a use detaches back into widgets', async ({ page }) => {
  await openDoc(page, 'Pages', 'home');
  await outline(page).getByRole('button', { name: /^Features\s*What is here/ }).click();
  await page.getByRole('button', { name: 'Save as pattern' }).click();
  const form = page.getByRole('form', { name: 'Save as pattern' });
  await form.getByLabel('Pattern label').fill('What is here');
  await form.getByLabel('Pattern name').fill('what-is-here');
  await form.getByRole('button', { name: 'Save pattern' }).click();

  // The pattern file holds the widget, without the page's own wrapper; the page uses it.
  await expect(outline(page).getByRole('button', { name: /^What is here/ })).toBeVisible();
  expect(existsSync(`${CONTENT}patterns/what-is-here.json`)).toBe(true);
  const saved = JSON.parse(file('patterns/what-is-here.json'));
  expect(saved.label).toBe('What is here');
  expect(saved.tree).toHaveLength(1);
  expect(saved.tree[0].widget).toBe('Features');
  expect(saved.tree[0].wrapper).toBeUndefined();
  // The preview renders the use: the same heading, from the pattern.
  await expect(frame(page).getByRole('heading', { name: 'What is here' })).toBeVisible();

  await outline(page).getByRole('button', { name: /^What is here/ }).click();
  await page.getByRole('button', { name: 'Detach' }).click();
  await expect(outline(page).getByRole('button', { name: /^Features\s*What is here/ })).toBeVisible();
});

test("a field linked to a prop becomes a placeholder, declared with the field's value as its default", async ({ page }) => {
  await openDoc(page, 'Patterns', 'faq');
  await outline(page).getByRole('button', { name: /^FAQs/ }).click();
  const inspector = page.getByRole('region', { name: 'FAQs' });
  const title = inspector.getByLabel('Title', { exact: true }).first();
  await title.hover();
  page.once('dialog', (d) => void d.accept('title'));
  await inspector.getByRole('button', { name: 'Link Title to a prop' }).first().click();
  await expect(inspector.getByRole('button', { name: 'Unlink title' })).toBeVisible();

  // The pattern's settings list the prop.
  await outline(page).getByRole('button', { name: /^Common questions/ }).click();
  await expect(page.getByRole('region', { name: 'Props' }).getByLabel('Prop title name')).toHaveValue('title');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  const saved = JSON.parse(file('patterns/en/faq.json'));
  expect(saved.tree[0].props.title).toEqual({ $prop: 'title' });
  expect(saved.props.properties.title.default).toBe('Questions');
});

test('a new pattern starts from a widget the person picks', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: 'Patterns' });
  const panel = page.getByRole('region', { name: 'Patterns' });
  await panel.getByRole('button', { name: 'New' }).click();
  await panel.getByLabel('New pattern label').fill('Product page');
  await panel.getByLabel('Starts from').selectOption({ label: 'Hero' });
  await panel.getByRole('button', { name: 'Create' }).click();
  await expect(outline(page).getByRole('button', { name: /^Hero/ })).toBeVisible();
  const saved = JSON.parse(file('patterns/product-page.json'));
  expect(saved.label).toBe('Product page');
  expect(saved.tree[0].widget).toBe('Hero');
  expect(JSON.stringify(saved)).not.toContain('"id"');
});

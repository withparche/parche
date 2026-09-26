import { expect, test, type Page } from '@playwright/test';
import { file } from './_shared';

// Layouts and menus: documents a page shows through. The preview loads a
// page that uses them, with the drafts in place.
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const outline = (page: Page) => page.getByRole('region', { name: 'Outline' });

async function openDoc(page: Page, collection: 'Layouts' | 'Menus', name: string) {
  await page.goto('/_parche/builder');
  await page.getByRole('combobox', { name: 'Documents' }).selectOption({ label: collection });
  await page.getByRole('region', { name: collection }).getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) }).click();
  await expect.poll(() => page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => typeof (f.contentWindow as any)?.__parchePreview?.onSelect)).toBe('function');
}

test('a layout previews through a page that uses it, and its Outlet wraps what the page puts in it', async ({ page }) => {
  await openDoc(page, 'Layouts', 'docs');
  const settings = page.getByRole('region', { name: 'Layout' });
  await expect(settings.getByText('Used by 1 page.')).toBeVisible();
  await expect(frame(page).getByRole('heading', { name: 'Getting started' })).toBeVisible({ timeout: 20_000 });

  // The aside outlet takes the page's `aside` slot, bare for now.
  await outline(page).getByRole('button', { name: /^Outlet\s*aside/ }).click();
  const inspector = page.getByRole('region', { name: 'Outlet' });
  await expect(inspector.getByText('Takes what a page puts in its aside slot.')).toBeVisible();
  const aside = frame(page).getByRole('heading', { name: 'On this page' });
  // How many bands the heading sits in: one more once the outlet wraps it.
  const bands = () => aside.evaluate((h) => { let n = 0; for (let e = h.parentElement; e; e = e.parentElement) if (e.tagName === 'SECTION') n++; return n; });
  const bare = await bands();
  await inspector.getByText('Wraps each item in').click();
  await inspector.getByRole('radio', { name: 'A wrapper' }).click();
  await expect.poll(bands).toBe(bare + 1);

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  expect(JSON.parse(file('layouts/en/docs.json')).sections[2]).toEqual({ widget: 'Outlet', props: { name: 'aside', wrapper: {} } });
});

test('two outlets of one name are flagged', async ({ page }) => {
  await openDoc(page, 'Layouts', 'docs');
  await outline(page).getByRole('button', { name: /^Outlet\s*aside/ }).click();
  await page.getByRole('region', { name: 'Outlet' }).getByLabel('Name').fill('default');
  await expect(page.getByRole('region', { name: 'Outlet' }).getByRole('alert')).toContainText('also "default"');
});

test("a menu is edited with the form of the prop that uses it, and the header shows the draft", async ({ page }) => {
  await openDoc(page, 'Menus', 'main');
  const menu = page.getByRole('region', { name: 'Menu' });
  await expect(menu.getByText('Header.links').first()).toBeVisible();
  // The menu's own label first, then each item's.
  await menu.getByRole('textbox', { name: 'Label', exact: true }).nth(1).fill('Start');
  await expect(frame(page).locator('header a', { hasText: 'Start' }).first()).toBeAttached();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  expect(JSON.parse(file('navigation/en/main.json')).items[0]).toEqual({ label: 'Start', href: '/' });
});

test("a linked value opens the entry it names", async ({ page }) => {
  await openDoc(page, 'Layouts', 'default');
  await outline(page).getByRole('button', { name: /^Header/ }).click();
  await page.getByRole('button', { name: 'Open navigation/main' }).click();
  await expect(page.getByRole('region', { name: 'Menu' })).toBeVisible();
});

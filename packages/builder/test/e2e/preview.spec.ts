import { expect, test, type Page } from '@playwright/test';
import { settle } from './_shared';

async function openHome(page: Page) {
  await page.goto('/_parche/builder');
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: /^home(\s|$)/ }).click();
  await expect(page.frameLocator('iframe[title="Preview"]').getByRole('heading', { level: 1 })).toBeVisible();
  // The editor has wired its preview client (it injects it once the page loads).
  await expect.poll(() => page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => typeof (f.contentWindow as any)?.__parchePreview?.onSelect)).toBe('function');
  // The dev server reloads a page on its own now and then (dependency
  // optimisation, the content sync after another test's save): wait for quiet.
  await settle(page);
}

const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const outline = (page: Page) => page.getByRole('region', { name: 'Outline' });

test('an edit shows in the preview in place, without a reload, and only there', async ({ page, request }) => {
  await openHome(page);
  await page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => ((f.contentWindow as any).__probe = 'alive'));
  await outline(page).getByRole('button', { name: /^Hero/ }).click();
  await page.getByRole('region', { name: 'Hero' }).getByLabel('Title', { exact: true }).first().fill('Only a draft');
  await expect(frame(page).getByRole('heading', { level: 1 })).toHaveText('Only a draft');
  expect(await page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => (f.contentWindow as any).__probe)).toBe('alive');
  // Nothing saved, and the site itself still serves the file.
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  expect(await (await request.get('/')).text()).not.toContain('Only a draft');
});

test('a click in the preview selects the node it lands on', async ({ page }) => {
  await openHome(page);
  await frame(page).getByRole('heading', { name: 'What is here' }).click();
  await expect(page.getByRole('region', { name: 'Features' })).toBeVisible();
  await expect(outline(page).locator('[aria-current="true"]').filter({ hasText: 'Features' })).toHaveCount(1);
});

test('reordering in the outline reorders the preview', async ({ page }) => {
  await openHome(page);
  const headings = () => frame(page).locator('h2').allTextContents();
  const before = await headings();
  expect(before.indexOf('What is here')).toBeLessThan(before.indexOf('Plans'));
  const row = outline(page).getByRole('button', { name: /^Pricing/ });
  await row.hover();
  await outline(page).getByRole('button', { name: 'Move up' }).last().click();
  await expect.poll(async () => { const h = await headings(); return h.indexOf('Plans') < h.indexOf('What is here'); }).toBe(true);
});

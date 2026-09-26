import { expect, test, type Page } from '@playwright/test';

// The side panels: pinned, a panel takes its own space beside the preview;
// unpinned, it floats over the page. The choice is remembered.
const previewWidth = (page: Page) => page.locator('iframe[title="Preview"]').evaluate((f) => f.getBoundingClientRect().width);

test('a pin docks a panel beside the preview or floats it over the page, and the choice is remembered', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: /^home(\s|$)/ }).click();
  const inspector = page.getByRole('complementary', { name: 'Inspector' });
  await expect(inspector).toBeVisible();
  // By default the inspector floats: the preview keeps its width under it.
  const pin = inspector.getByRole('button', { name: 'Pin the panel' });
  await expect(pin).toHaveAttribute('aria-pressed', 'false');
  const floating = await previewWidth(page);
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => previewWidth(page)).toBeLessThan(floating - 200);
  await page.reload();
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: /^home(\s|$)/ }).click();
  await expect(page.getByRole('complementary', { name: 'Inspector' }).getByRole('button', { name: 'Pin the panel' })).toHaveAttribute('aria-pressed', 'true');
});

test('the inspector closes to show the whole page, and opens again for the next selection', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: /^home(\s|$)/ }).click();
  const inspector = page.getByRole('complementary', { name: 'Inspector' });
  await inspector.getByRole('button', { name: 'Close Page' }).click();
  await expect(inspector).toBeHidden();
  await page.getByRole('region', { name: 'Outline' }).getByRole('button', { name: /^Hero/ }).click();
  await expect(inspector.getByRole('region', { name: 'Hero' })).toBeVisible();
});

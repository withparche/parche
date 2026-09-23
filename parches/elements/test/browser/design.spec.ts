import { test, expect } from '@playwright/test';
import { expectAccessible, jsDisabled } from './_shared';

// The design-system pages: same shell, same gate. They document the tokens
// the elements are painted with, so they must pass what the elements pass.
for (const path of ['/design', '/design/colors', '/design/typography', '/design/shape', '/design/themes']) {
  test(`${path} is complete and accessible`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (jsDisabled()) return;
    await expectAccessible(page);
  });
}

test('the contrast table measures every pair, and every default pair meets its target', async ({ page }) => {
  test.skip(jsDisabled());
  await page.goto('/design/colors');
  const cells = page.locator('[data-contrast] [data-ratio]');
  await expect(cells.first()).not.toHaveText('…');
  const texts = await cells.allTextContents();
  expect(texts.length).toBeGreaterThan(10);
  for (const dark of [false, true]) {
    await page.evaluate((d) => document.documentElement.classList.toggle('dark', d), dark);
    await expect(cells.first()).not.toHaveText('…');
    const failing = (await cells.allTextContents()).filter((t) => t.includes('✗')); // △ is advisory
    expect(failing, `${dark ? 'dark' : 'light'} pairs below target`).toEqual([]);
  }
});

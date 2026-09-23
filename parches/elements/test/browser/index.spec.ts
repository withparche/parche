import { test, expect } from '@playwright/test';
import { expectAccessible } from './_shared';

// The playground index is itself part of the fixture: header, theme controls,
// skip link and the catalog listing must pass the same sweep as every element.
test('playground index is accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Elements');
  await expectAccessible(page);
});

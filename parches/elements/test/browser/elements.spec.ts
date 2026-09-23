import { test, expect } from '@playwright/test';
import createElements from '../../src/index.ts';
import { expectAccessible, jsDisabled } from './_shared';

// One test per element page: every example of every element, under the axe
// WCAG 2.1 AA sweep in light and dark. In the no-JS project the sweep is
// skipped and the structure is asserted instead — the page must be complete
// with no script at all, which for static elements is the whole point.
const names = Object.keys(createElements().elements ?? {});

for (const name of names) {
  test(`${name} page is complete and accessible`, async ({ page }) => {
    await page.goto(`/${name.toLowerCase()}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    const examples = page.locator('[data-example]');
    expect(await examples.count(), 'at least one example rendered').toBeGreaterThan(0);
    if (jsDisabled()) {
      // Static elements ship no script: every example must be fully present,
      // i.e. its markup rendered (an image-only example has no text, so count
      // elements, not text).
      for (const ex of await examples.all()) expect(await ex.locator('*').count()).toBeGreaterThan(0);
      return;
    }
    await expectAccessible(page);
  });
}

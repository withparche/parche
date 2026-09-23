import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Toc', () => {
  test('the link of the heading in view is current', async ({ page }) => {
    test.skip(jsDisabled());
    await page.setViewportSize({ width: 1000, height: 400 });
    await page.goto('/toc');
    const nav = example(page, 'basic').getByRole('navigation', { name: 'Table of contents' });
    await expect(nav.getByRole('link', { name: 'Why pages are data' })).toHaveAttribute('aria-current', 'true');
    // Put the "Themes" heading just under the offset (80px).
    await page.evaluate(() => {
      const h = document.getElementById('ex-toc-themes')!;
      window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 80);
    });
    await expect(nav.getByRole('link', { name: 'Themes' })).toHaveAttribute('aria-current', 'true');
    await expect(nav.getByRole('link', { name: 'Widgets' })).not.toHaveAttribute('aria-current', 'true');
  });

  test('links jump to their headings without script', async ({ page }) => {
    await page.goto('/toc');
    await example(page, 'basic').getByRole('link', { name: 'Swapping them' }).click();
    expect(page.url()).toContain('#ex-toc-swap');
  });
});

test.describe('Share', () => {
  test('network links carry the intents; copy link appears with script and announces', async ({ page, context, browserName }) => {
    await page.goto('/share');
    const group = example(page, 'basic').getByRole('group', { name: 'Share' });
    await expect(group.getByRole('link', { name: 'Share on X' })).toHaveAttribute('href', /twitter\.com\/intent\/tweet/);
    const copy = group.getByRole('button', { name: 'Copy link' });
    if (jsDisabled()) {
      await expect(copy).toBeHidden();
      return;
    }
    await expect(copy).toBeVisible();
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await copy.click();
    await expect(group.getByRole('status')).toHaveText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://parche.dev/blog/pages-are-data');
  });
});

test.describe('Stat', () => {
  test('counts up to the figure, or shows it at once under reduced motion', async ({ page }) => {
    await page.goto('/stat');
    const value = example(page, 'basic').locator('[data-counter]').first();
    await expect(value).toHaveText('10K+', { timeout: 4000 });
  });
});

test.describe('Banner', () => {
  test('dismiss removes the bar', async ({ page }) => {
    await page.goto('/banner');
    const banner = example(page, 'basic').locator('parche-banner').filter({ hasText: 'Parche 0.7' });
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Dismiss' }).click();
    if (jsDisabled()) {
      await expect(banner).toBeVisible();
      return;
    }
    await expect(banner).toHaveCount(0);
  });
});

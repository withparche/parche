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

  test('a long one stays capped: folds, marks what is in view, scrolls itself, fades its edges', async ({ page }) => {
    test.skip(jsDisabled());
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto('/toc');
    const toc = example(page, 'long').locator('parche-toc');
    const viewport = toc.locator('[data-part="viewport"]');
    const groups = toc.locator('[data-part="group"]');
    await expect(toc).toHaveAttribute('data-upgraded', '');
    // Capped at the 16rem the example sets, with more below it.
    const box = await viewport.evaluate((v) => ({ height: v.clientHeight, scroll: v.scrollHeight }));
    expect(box.height).toBeLessThanOrEqual(256);
    expect(box.scroll).toBeGreaterThan(box.height);
    await expect(viewport).toHaveAttribute('data-fade', 'bottom');
    // Only the section being read shows its subsections; the others are inert.
    await expect(groups.nth(0)).toHaveAttribute('data-state', 'open');
    await expect(groups.nth(1)).toHaveAttribute('data-state', 'closed');
    expect(await groups.nth(1).evaluate((g) => (g as HTMLElement).inert)).toBe(true);

    // Read "Deploy": its group opens, Install's closes, the box scrolls to it.
    await page.evaluate(() => {
      const h = document.getElementById('ex-long-deploy')!;
      window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 80);
    });
    await expect(toc.getByRole('link', { name: 'Deploy', exact: true })).toHaveAttribute('aria-current', 'true');
    await expect(groups.nth(7)).toHaveAttribute('data-state', 'open');
    await expect(groups.nth(0)).toHaveAttribute('data-state', 'closed');
    await expect.poll(() => viewport.evaluate((v) => v.scrollTop)).toBeGreaterThan(0);
    await expect(viewport).toHaveAttribute('data-fade', /top|both/);
    // The indicator runs over what is on screen, starting at the current link.
    const indicator = toc.locator('[data-part="indicator"]');
    await expect(indicator).toHaveAttribute('data-shown', '');
    await expect
      .poll(async () => {
        const [i, l] = await Promise.all([indicator.boundingBox(), toc.getByRole('link', { name: 'Deploy', exact: true }).boundingBox()]);
        return Math.abs(i!.y - l!.y) < 2 && i!.height >= l!.height - 1;
      })
      .toBe(true);
  });

  test('without script every level is open and the list is still capped', async ({ page }) => {
    test.skip(!jsDisabled());
    await page.goto('/toc');
    const toc = example(page, 'long').locator('parche-toc');
    await expect(toc.locator('[data-part="group"][data-state="closed"]')).toHaveCount(0);
    await expect(toc.getByRole('link', { name: 'Why: troubleshoot' })).toBeAttached();
    expect(await toc.locator('[data-part="viewport"]').evaluate((v) => v.clientHeight)).toBeLessThanOrEqual(256);
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

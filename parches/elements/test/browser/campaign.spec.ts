/**
 * The campaign elements: a countdown, a before-and-after frame, a sticky bar
 * and a calculator. Each reads right from the server; script makes it move.
 */
import { expect, test } from '@playwright/test';
import { example, expectAccessible, jsDisabled } from './_shared';

test.describe('Countdown', () => {
  test('counts the units down, and the date in words is always there', async ({ page }) => {
    await page.goto('/countdown');
    const root = example(page, 'basic').locator('parche-countdown');
    await expect(root.locator('[data-part="date"]')).toHaveText('1 December 2030 · 18:00 CET');
    if (jsDisabled()) return;
    await expect(root).toHaveAttribute('data-state', 'counting');
    await expect(root.locator('[data-part="value"]').first()).toHaveText(/^\d+$/);
    await expectAccessible(page);
  });
});

test.describe('Compare', () => {
  test('the range moves the divider, from the keyboard and by pointing at the frame', async ({ page }) => {
    await page.goto('/compare');
    const root = example(page, 'basic').locator('parche-compare');
    await expect(root.getByText('before · 4.1 s · 820 KB')).toBeVisible();
    await expect(root.getByText('after · 0.4 s · 38 KB')).toBeVisible();
    test.skip(jsDisabled(), 'without script the divider stays at the start');
    const range = root.getByRole('slider', { name: 'Drag to compare' });
    await range.focus();
    await page.keyboard.press('Home');
    await expect.poll(() => root.evaluate((el) => el.style.getPropertyValue('--pos'))).toBe('0%');
    await root.scrollIntoViewIfNeeded();
    const box = (await root.locator('[data-part="frame"]').boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    await expect.poll(() => root.evaluate((el) => parseInt(el.style.getPropertyValue('--pos')))).toBeGreaterThan(65);
    await expectAccessible(page);
  });
});

test.describe('StickyBar', () => {
  test('stays out of the way until the first screen is behind, then comes up', async ({ page }) => {
    await page.goto('/stickybar');
    const root = page.locator('parche-sticky-bar').first();
    await expect(root).toHaveAttribute('data-state', 'hidden');
    await expect(root.locator('[data-part="bar"]')).toHaveAttribute('inert', '');
    test.skip(jsDisabled(), 'without script the bar never shows');
    await page.evaluate(() => scrollTo(0, innerHeight));
    await expect(root).toHaveAttribute('data-state', 'shown');
    await expect(root.locator('[data-part="bar"]')).not.toHaveAttribute('inert', '');
    await expect(root.getByRole('link', { name: 'Send it to me' })).toBeInViewport();
  });
});

test.describe('Calculator', () => {
  test('the result is computed on the server, and follows the inputs', async ({ page }) => {
    await page.goto('/calculator');
    const root = example(page, 'basic').locator('parche-calculator');
    const value = root.locator('[data-part="value"]');
    await expect(value).toHaveText('20 hours / month');
    test.skip(jsDisabled(), 'without script the starting result stays');
    await root.getByRole('button', { name: 'More Discovery calls per month' }).click();
    await expect(value).toHaveText('23 hours / month');
    await root.getByRole('spinbutton', { name: 'Hours each, including prep' }).fill('2');
    await expect(value).toHaveText('45 hours / month');
    await expect(page).toHaveURL(/calls=45&hours=2/);
    await expect(root.locator('[data-part="link"]')).toHaveText(/calls=45&hours=2/);
    await expectAccessible(page);
  });
});

test.describe('LoadMore', () => {
  test('adds the next page to the list, moves focus to it and updates the address', async ({ page }) => {
    await page.goto('/loadmore');
    const root = example(page, 'basic');
    const items = root.locator('[data-load-more-list] > li');
    await expect(items).toHaveCount(2);
    const link = root.getByRole('link', { name: 'Load more' });
    await expect(link).toHaveAttribute('href', '?page=2');
    test.skip(jsDisabled(), 'without script it is a link to the next page');
    await link.click();
    await expect(items).toHaveCount(4);
    await expect(page).toHaveURL(/\?page=2$/);
    await expect(root.locator('[data-part="status"]')).toHaveText('2 more loaded');
    await expect(items.nth(2).locator('a')).toBeFocused();
    await expectAccessible(page);
  });
});

test.describe('Search', () => {
  // A stand-in for the Pagefind bundle the site build writes.
  const fake = `
    const pages = [
      { url: '/postgres', excerpt: 'How we run <mark>Postgres</mark> on one box &amp; why', meta: { title: 'Postgres on one box', category: 'Engineering', date: '3 Sept 2026' } },
      { url: '/self-hosting', excerpt: 'One container, any <mark>Postgres</mark>', meta: { title: 'Self-hosting ships', category: 'Product' } },
    ];
    export async function search(q) {
      const hits = pages.filter((p) => p.meta.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));
      return { results: hits.map((p) => ({ data: async () => p })) };
    }`;

  test('searches as the reader types, keeps the query in the address, and offers a way on when nothing matches', async ({ page }) => {
    await page.route('**/pagefind-example/pagefind.js', (route) => route.fulfill({ contentType: 'text/javascript', body: fake }));
    await page.goto('/search');
    const root = example(page, 'basic').locator('parche-search');
    test.skip(jsDisabled(), 'without script it is a form and a note');
    await expect(root.locator('[data-part="nojs"]')).toBeHidden();
    const field = root.getByRole('searchbox');
    await field.fill('postgres');
    await expect(root.locator('[data-part="status"]')).toHaveText('2 results for “postgres”');
    await expect(root.locator('[data-part="results"] a')).toHaveText(['Postgres on one box', 'Self-hosting ships']);
    await expect(root.locator('[data-part="results"] li').first()).toContainText('Engineering · 3 Sept 2026');
    await expect(root.locator('[data-part="results"] mark').first()).toHaveText('Postgres');
    await expect(page).toHaveURL(/\?q=postgres$/);
    await field.fill('zzqx');
    await expect(root.locator('[data-part="status"]')).toHaveText('Nothing matches “zzqx”.');
    await expect(root.locator('[data-part="empty"]')).toBeVisible();
    await field.press('Escape');
    await expect(root.locator('[data-part="results"] li')).toHaveCount(0);
    await expectAccessible(page);
  });

  test('a shared link with the query searches on arrival', async ({ page }) => {
    test.skip(jsDisabled(), 'needs script');
    await page.route('**/pagefind-example/pagefind.js', (route) => route.fulfill({ contentType: 'text/javascript', body: fake }));
    await page.goto('/search?q=self');
    await expect(example(page, 'basic').locator('[data-part="status"]')).toHaveText('1 result for “self”');
  });

  test('without script the note says where to go', async ({ page }) => {
    test.skip(!jsDisabled(), 'no-JS only');
    await page.goto('/search');
    await expect(example(page, 'basic').locator('[data-part="nojs"]')).toBeVisible();
  });
});

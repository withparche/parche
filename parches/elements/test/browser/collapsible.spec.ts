import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Collapsible', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collapsible');
  });

  test('opens and closes from the trigger, with keyboard, and syncs data-state', async ({ page }) => {
    const first = example(page, 'basic').locator('parche-collapsible').first();
    const trigger = first.locator('summary');
    const content = first.locator('[data-part="content"]');

    await expect(content).toBeHidden();
    await trigger.click();
    await expect(content).toBeVisible();
    if (!jsDisabled()) await expect(first).toHaveAttribute('data-state', 'open');

    await trigger.focus();
    await page.keyboard.press('Space');
    await expect(content).toBeHidden();
    if (!jsDisabled()) await expect(first).toHaveAttribute('data-state', 'closed');
  });

  test('the second one is open on first render', async ({ page }) => {
    const second = example(page, 'basic').locator('parche-collapsible').nth(1);
    await expect(second.locator('[data-part="content"]')).toBeVisible();
  });

  test('forceOpen keeps the third open on a wide viewport and makes the trigger inert', async ({ page }) => {
    test.skip(jsDisabled(), 'forceOpen needs the element');
    await page.setViewportSize({ width: 1024, height: 800 });
    const third = example(page, 'basic').locator('parche-collapsible').nth(2);
    await expect(third).toHaveAttribute('data-state', 'open');
    await expect(third.locator('summary')).toHaveAttribute('aria-disabled', 'true');
    await third.locator('summary').click();
    await expect(third.locator('[data-part="content"]')).toBeVisible();

    await page.setViewportSize({ width: 500, height: 800 });
    await expect(third.locator('summary')).toHaveAttribute('aria-disabled', 'false');
    await third.locator('summary').click();
    await expect(third.locator('[data-part="content"]')).toBeHidden();
  });

  test('emits cancelable parche:toggle and parche:toggled', async ({ page }) => {
    test.skip(jsDisabled(), 'events need the element');
    const first = example(page, 'basic').locator('parche-collapsible').first();
    const seen = await first.evaluate(async (el) => {
      const events: string[] = [];
      el.addEventListener('parche:toggle', () => events.push('toggle'));
      el.addEventListener('parche:toggled', () => events.push('toggled'));
      el.querySelector('summary')!.click();
      await new Promise((r) => setTimeout(r, 50));
      return events;
    });
    expect(seen).toEqual(['toggle', 'toggled']);

    const vetoed = await first.evaluate(async (el) => {
      const d = el.querySelector('details')!;
      const before = d.open;
      el.addEventListener('parche:toggle', (e) => e.preventDefault(), { once: true });
      el.querySelector('summary')!.click();
      await new Promise((r) => setTimeout(r, 50));
      return d.open === before;
    });
    expect(vetoed).toBe(true);
  });
});

import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Dialog', () => {
  test('the invoker opens it, Escape closes it and focus returns to the invoker', async ({ page }) => {
    await page.goto('/dialog');
    const trigger = example(page, 'basic').getByRole('button', { name: 'Open a dialog' });
    const dialog = page.locator('#example-dialog');
    await expect(dialog).not.toHaveAttribute('open', '');
    // Opened from the keyboard: WebKit does not focus a clicked button, and
    // focus return goes to whatever was focused before showModal().
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog).toHaveRole('dialog');
    if (!jsDisabled()) await expect(dialog.locator('xpath=..')).toHaveAttribute('data-state', 'open');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('the close button and a click on the backdrop close it', async ({ page }) => {
    await page.goto('/dialog');
    const trigger = example(page, 'basic').getByRole('button', { name: 'Open a dialog' });
    const dialog = page.locator('#example-dialog');
    await trigger.click();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await trigger.click();
    await expect(dialog).toHaveAttribute('open', '');
    await page.mouse.click(4, 4);
    await expect(dialog).not.toHaveAttribute('open', '');
  });

  test('closedBy="none" ignores Escape', async ({ page }) => {
    await page.goto('/dialog');
    await example(page, 'basic').getByRole('button', { name: 'Only the button closes' }).click();
    const dialog = page.locator('#example-dialog-strict');
    await expect(dialog).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await expect(dialog).toHaveAttribute('open', '');
    await dialog.getByRole('button', { name: 'Got it' }).click();
    await expect(dialog).not.toHaveAttribute('open', '');
  });

  test('parche:open can veto', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/dialog');
    await page.evaluate(() => document.addEventListener('parche:open', (e) => e.preventDefault(), { once: true }));
    const trigger = example(page, 'basic').getByRole('button', { name: 'Open a dialog' });
    await trigger.click();
    await page.waitForTimeout(100);
    await expect(page.locator('#example-dialog')).not.toHaveAttribute('open', '');
    await trigger.click();
    await expect(page.locator('#example-dialog')).toHaveAttribute('open', '');
  });
});

test.describe('Sheet', () => {
  test('opens docked to its side and closes on Escape', async ({ page }) => {
    await page.goto('/sheet');
    await example(page, 'basic').getByRole('button', { name: 'From the right' }).click();
    const sheet = page.locator('#example-sheet');
    await expect(sheet).toHaveAttribute('open', '');
    await expect(sheet).toHaveAccessibleName('Menu');
    const width = page.viewportSize()!.width;
    // Docked to the right edge once the slide-in transition has settled.
    await expect.poll(async () => Math.round((await sheet.boundingBox())!.x + (await sheet.boundingBox())!.width)).toBe(width);
    await page.keyboard.press('Escape');
    await expect(sheet).not.toHaveAttribute('open', '');
  });
});

test.describe('Popover', () => {
  test('toggles from its invoker, mirrors aria-expanded, light-dismisses', async ({ page }) => {
    await page.goto('/popover');
    const trigger = example(page, 'basic').getByRole('button', { name: 'Below, centred' });
    const surface = page.locator('#example-popover');
    await expect(surface).toBeHidden();
    await trigger.click();
    await expect(surface).toBeVisible();
    if (!jsDisabled()) {
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(surface.locator('xpath=..')).toHaveAttribute('data-state', 'open');
      // Anchored to the trigger (below, or above when there is no room below):
      // either the platform's anchor positioning or the fallback.
      const t = (await trigger.boundingBox())!;
      const s = (await surface.boundingBox())!;
      expect(s.y >= t.y + t.height - 1 || s.y + s.height <= t.y + 1).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(surface).toBeHidden();
    await trigger.click();
    await expect(surface).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(surface).toBeHidden();
  });

  test('a titled popover is a named dialog', async ({ page }) => {
    await page.goto('/popover');
    await example(page, 'basic').getByRole('button', { name: 'Above, with a title' }).click();
    const surface = page.locator('#example-popover-titled');
    await expect(surface).toHaveRole('dialog');
    await expect(surface).toHaveAccessibleName('Share this page');
    await surface.getByRole('button', { name: 'Done' }).click();
    await expect(surface).toBeHidden();
  });
});

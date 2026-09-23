import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Accordion', () => {
  test('opening one item closes the other, natively', async ({ page }) => {
    await page.goto('/accordion');
    const acc = example(page, 'basic').locator('.parche-accordion').first();
    const details = acc.locator('details');
    await expect(details.nth(0)).toHaveAttribute('open', '');
    await details.nth(1).locator('summary').click();
    await expect(details.nth(1)).toHaveAttribute('open', '');
    await expect(details.nth(0)).not.toHaveAttribute('open', '');
  });

  test('multiple lets several stay open', async ({ page }) => {
    await page.goto('/accordion');
    const acc = example(page, 'basic').locator('.parche-accordion').nth(1);
    const details = acc.locator('details');
    await details.nth(0).locator('summary').click();
    await details.nth(1).locator('summary').click();
    await expect(details.nth(0)).toHaveAttribute('open', '');
    await expect(details.nth(1)).toHaveAttribute('open', '');
  });
});

test.describe('Switch', () => {
  test('toggles with Space and is announced as a switch', async ({ page }) => {
    await page.goto('/switch');
    const first = example(page, 'basic').getByRole('switch', { name: 'Email me the changelog' });
    await expect(first).not.toBeChecked();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();
    await expect(example(page, 'basic').getByRole('switch', { name: 'Beta features' })).toBeDisabled();
  });
});

test.describe('Slider', () => {
  test('arrow keys move the value and the output follows', async ({ page }) => {
    await page.goto('/slider');
    const volume = example(page, 'basic').getByRole('slider', { name: 'Volume' });
    await expect(volume).toHaveValue('40');
    await volume.focus();
    await page.keyboard.press('ArrowRight');
    await expect(volume).toHaveValue('41');
    // The readout is an inline handler: script, so it stays put without JS.
    await expect(example(page, 'basic').locator('output').first()).toHaveText(jsDisabled() ? '40%' : '41%');
  });
});

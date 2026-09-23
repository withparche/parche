import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Form controls', () => {
  test('Input, Select, Checkbox and RadioGroup are named, described and native', async ({ page }) => {
    await page.goto('/input');
    const email = example(page, 'basic').getByRole('textbox', { name: 'Email' });
    await expect(email).toHaveAccessibleDescription('We never share it.');
    const handle = example(page, 'basic').getByRole('textbox', { name: 'Handle' });
    await expect(handle).toHaveAttribute('aria-invalid', 'true');
    await expect(handle).toHaveAccessibleDescription('That handle is taken.');

    await page.goto('/select');
    const plan = example(page, 'basic').getByRole('combobox', { name: 'Plan' });
    await plan.selectOption('pro');
    await expect(plan).toHaveValue('pro');

    await page.goto('/checkbox');
    const terms = example(page, 'basic').getByRole('checkbox', { name: /I agree to the terms/ });
    await terms.check();
    await expect(terms).toBeChecked();

    await page.goto('/radiogroup');
    const group = example(page, 'basic').getByRole('group', { name: 'Billing' });
    await expect(group.getByRole('radio', { name: /Monthly/ })).toBeChecked();
    await group.getByRole('radio', { name: /Monthly/ }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(group.getByRole('radio', { name: /Yearly/ })).toBeChecked();
  });
});

test.describe('Combobox', () => {
  test('typing filters, arrows highlight, Enter commits the value', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/combobox');
    const input = example(page, 'basic').getByRole('combobox', { name: 'Country' });
    const listbox = page.locator('#country-listbox');
    await input.click();
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.fill('can');
    // "can": Canada only.
    await expect(listbox.locator('[data-part="option"]:not([hidden])')).toHaveCount(1);
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', /country-option-/);
    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('Canada');
    await expect(input).toHaveAttribute('data-value', 'ca');
  });

  test('a preset value shows its label; Escape closes; nothing matching shows the empty text', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/combobox');
    const input = example(page, 'basic').getByRole('combobox', { name: 'Ship to' });
    await expect(input).toHaveValue('Spain');
    await input.fill('zzz');
    await expect(page.locator('#ship-to-listbox [data-part="empty"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#ship-to-listbox')).toBeHidden();
  });

  test('without script the input keeps its datalist', async ({ page }) => {
    test.skip(!jsDisabled());
    await page.goto('/combobox');
    const input = example(page, 'basic').getByRole('combobox', { name: 'Country' });
    await expect(input).toHaveAttribute('list', 'country-datalist');
    await expect(page.locator('#country-datalist option')).toHaveCount(8);
  });
});

import { test, expect } from '@playwright/test';
import { example, jsDisabled } from './_shared';

test.describe('Tabs', () => {
  test('arrows move the selection, the panel follows, the URL syncs', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/tabs');
    const tabs = example(page, 'basic').getByRole('tablist', { name: 'Billing period' });
    const monthly = tabs.getByRole('tab', { name: 'Monthly' });
    const yearly = tabs.getByRole('tab', { name: 'Yearly' });
    await expect(monthly).toHaveAttribute('aria-selected', 'true');
    await monthly.focus();
    await page.keyboard.press('ArrowRight');
    await expect(yearly).toBeFocused();
    await expect(yearly).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: 'Yearly' })).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: 'Monthly' })).toBeHidden();
    expect(new URL(page.url()).searchParams.get('billing')).toBe('yearly');
    // The disabled tab is skipped and wrapping goes back to the first.
    await page.keyboard.press('ArrowRight');
    await expect(monthly).toBeFocused();
  });

  test('a URL opens the page on that tab', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/tabs?billing=yearly');
    await expect(example(page, 'basic').getByRole('tab', { name: 'Yearly' })).toHaveAttribute('aria-selected', 'true');
  });

  test('without script every panel shows under its heading and the list is hidden', async ({ page }) => {
    test.skip(!jsDisabled());
    await page.goto('/tabs');
    const ex = example(page, 'basic');
    await expect(ex.getByRole('tablist', { name: 'Billing period' })).toBeHidden();
    await expect(ex.getByText('Pay month to month. Cancel any time.')).toBeVisible();
    await expect(ex.getByText('Two months free.')).toBeVisible();
    await expect(ex.getByRole('heading', { name: 'Yearly' })).toBeVisible();
  });
});

test.describe('Menu', () => {
  test('opens on click, focuses the first item, arrows roam, Escape returns focus', async ({ page }) => {
    await page.goto('/menu');
    const trigger = example(page, 'basic').getByRole('button', { name: 'Product' });
    await trigger.click();
    const menu = page.locator('#example-menu');
    await expect(menu).toBeVisible();
    if (jsDisabled()) {
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      return;
    }
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('menuitem', { name: /Widgets/ })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: /Themes/ })).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu.getByRole('menuitem', { name: 'Changelog' })).toBeFocused();
    await page.keyboard.press('w');
    await expect(menu.getByRole('menuitem', { name: /Widgets/ })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('ArrowDown on the trigger opens; a radio item emits parche:select and closes', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/menu');
    await page.evaluate(() => document.addEventListener('parche:select', (e) => ((window as any).__sel = (e as CustomEvent).detail.value)));
    const trigger = example(page, 'basic').getByRole('button', { name: 'Language: English' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.locator('#example-menu-radio');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitemradio', { name: 'English' })).toBeFocused();
    await expect(menu.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    expect(await page.evaluate(() => (window as any).__sel)).toBe('es');
  });
});

test.describe('Tooltip', () => {
  test('focus shows it and links it as the description; Escape hides it', async ({ page }) => {
    test.skip(jsDisabled());
    await page.goto('/tooltip');
    const button = example(page, 'basic').getByRole('button', { name: 'Copy link' });
    const tip = page.getByRole('tooltip', { name: 'Copy the link to this page' });
    await expect(tip).toBeHidden();
    await button.focus();
    await expect(tip).toBeVisible();
    await expect(button).toHaveAccessibleDescription('Copy the link to this page');
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await button.hover();
    await expect(tip).toBeVisible();
  });

  test('without script hover reveals it by CSS', async ({ page }) => {
    test.skip(!jsDisabled());
    await page.goto('/tooltip');
    const button = example(page, 'basic').getByRole('button', { name: 'Copy link' });
    await button.hover();
    await expect(page.getByRole('tooltip', { name: 'Copy the link to this page' })).toBeVisible();
  });
});

test.describe('Toast', () => {
  test('script toasts arrive in the status region and dismiss; server toasts are there from the start', async ({ page }) => {
    await page.goto('/toast');
    const region = page.getByRole('status', { name: 'Notifications' });
    await expect(region.getByText('Rendered on the server')).toBeVisible();
    if (jsDisabled()) return;
    await example(page, 'basic').getByRole('button', { name: 'Saved' }).click();
    const toast = region.locator('[data-part="toast"][data-tone="success"]').filter({ hasText: 'Changes saved' });
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Dismiss' }).click();
    await expect(toast).toHaveCount(0);
  });
});

test.describe('Carousel', () => {
  test('next moves to the next slide, the picker follows, keys work on the track', async ({ page }) => {
    test.skip(jsDisabled());
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/carousel');
    const carousel = example(page, 'basic').getByRole('region', { name: 'What people say' });
    const next = carousel.getByRole('button', { name: 'Next slide' });
    const prev = carousel.getByRole('button', { name: 'Previous slide' });
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(carousel.getByRole('button', { name: 'Slide 2' })).toHaveAttribute('aria-current', 'true');
    await expect(carousel.locator('[data-part="slide"]').nth(1)).toHaveAttribute('data-state', 'active');
    await expect(prev).toBeEnabled();
    await carousel.getByRole('group', { name: 'What people say: slides' }).focus();
    await page.keyboard.press('End');
    await expect(carousel.getByRole('button', { name: 'Slide 4' })).toHaveAttribute('aria-current', 'true');
    await expect(next).toBeDisabled();
  });

  test('without script the track scrolls natively and the controls are hidden', async ({ page }) => {
    test.skip(!jsDisabled());
    await page.goto('/carousel');
    const carousel = example(page, 'basic').getByRole('region', { name: 'What people say' });
    await expect(carousel.getByRole('button', { name: 'Next slide' })).toBeHidden();
    await expect(carousel.getByRole('group', { name: '2 of 4' })).toBeAttached();
  });
});

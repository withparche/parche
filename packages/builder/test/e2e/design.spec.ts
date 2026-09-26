import { expect, test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { CONTENT, file } from './_shared';

const TOKENS = CONTENT.replace(/content\/$/, 'parche.tokens.json');

test('a token change shows in the preview at once, and Save writes it to parche.tokens.json', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('region', { name: 'Pages' }).getByRole('button', { name: /^home(\s|$)/ }).click();
  const frame = page.locator('iframe[title="Preview"]');
  await expect.poll(() => frame.evaluate((f: HTMLIFrameElement) => typeof (f.contentWindow as any).__parchePreview?.setTokens)).toBe('function');
  await frame.evaluate((f: HTMLIFrameElement) => ((f.contentWindow as any).__probe = 'alive'));

  await page.getByRole('button', { name: 'Design', exact: true }).click();
  const design = page.getByRole('region', { name: 'Design' });
  await design.getByRole('textbox', { name: 'Search tokens' }).fill('sys-color-primary');
  await design.getByLabel('primary', { exact: true }).fill('rgb(1, 2, 3)');

  const primary = () => frame.evaluate((f: HTMLIFrameElement) => getComputedStyle(f.contentDocument!.documentElement).getPropertyValue('--ds-sys-color-primary').trim());
  await expect.poll(primary).toBe('rgb(1, 2, 3)');
  expect(await frame.evaluate((f: HTMLIFrameElement) => (f.contentWindow as any).__probe)).toBe('alive');
  expect(existsSync(TOKENS)).toBe(false);

  await design.getByRole('button', { name: 'Save tokens' }).click();
  await expect(design.getByText('src/parche.tokens.json')).toBeVisible();
  expect(JSON.parse(file('../parche.tokens.json'))).toEqual({ base: { light: { '--ds-sys-color-primary': 'rgb(1, 2, 3)' } } });
  // The site's own CSS carries it now: the preview keeps it after a reload.
  await page.getByRole('button', { name: 'Reload' }).click();
  await expect.poll(primary, { timeout: 20_000 }).toBe('rgb(1, 2, 3)');
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const CONFIG = fileURLToPath(new URL('../../playground/src/parche.config.json', import.meta.url));

// The site config is read once, at startup: a save restarts the dev server,
// and the editor, which is not a page of that server, waits for it.
test('the site identity saves, the server restarts, and the preview shows it', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/_parche/builder');
  await page.getByRole('button', { name: 'Site', exact: true }).click();
  const site = page.getByRole('region', { name: 'Site' });
  await site.getByLabel('Name').first().fill('Renamed fixture');
  await site.getByRole('button', { name: 'Save site' }).click();
  await expect(site.getByRole('status')).toHaveText('Restarting the dev server…');
  await expect(site.getByRole('status')).toHaveText('Saved', { timeout: 60_000 });
  expect(JSON.parse(readFileSync(CONFIG, 'utf8')).brand.name).toBe('Renamed fixture');
  await expect.poll(() => page.locator('iframe[title="Preview"]').evaluate((f: HTMLIFrameElement) => f.contentDocument?.title ?? ''), { timeout: 30_000 }).toContain('Renamed fixture');
});

test('a config the schema refuses is not written', async ({ page }) => {
  await page.goto('/_parche/builder');
  await page.getByRole('button', { name: 'Site', exact: true }).click();
  const site = page.getByRole('region', { name: 'Site' });
  const before = readFileSync(CONFIG, 'utf8');
  await site.getByLabel('Site', { exact: true }).fill('not a url');
  await site.getByRole('button', { name: 'Save site' }).click();
  await expect(site.getByRole('alert')).toContainText('site');
  expect(readFileSync(CONFIG, 'utf8')).toBe(before);
});

import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** True in the `no-js` project: the page runs with JavaScript disabled. */
export function jsDisabled(): boolean {
  return test.info().project.name === 'no-js';
}

/**
 * Freeze CSS transitions and animations, then finish any in flight. axe reads
 * computed colours at the moment it runs; `body` transitions its background
 * (base.css), so a contrast check right after toggling `.dark` would sample a
 * mid-transition colour and differ by engine.
 */
async function settle(page: Page): Promise<void> {
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
}

/**
 * WCAG 2.1 AA sweep over the current page, in both colour modes. Skipped in the
 * no-JS project: axe and the mode toggle both need script; that project asserts
 * the degraded markup instead (see the element specs).
 */
export async function expectAccessible(page: Page): Promise<void> {
  if (jsDisabled()) return;
  for (const dark of [false, true]) {
    await page.evaluate((d) => document.documentElement.classList.toggle('dark', d), dark);
    await settle(page);
    // Third-party embeds (YouTube, Vimeo) are not ours to fix: axe can reach
    // into cross-origin frames through Playwright, so exclude every iframe.
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('iframe').analyze();
    const report = results.violations
      .map((v) => `${v.id}:\n` + v.nodes.map((n) => `    ${n.target.join(' ')} — ${n.any.map((a) => a.message).join('; ')}`).join('\n'))
      .join('\n');
    expect(results.violations, `${dark ? 'dark' : 'light'}\n${report}`).toEqual([]);
  }
}

/** The example block for `name` on an element page. */
export function example(page: Page, name: string) {
  return page.locator(`[data-example="${name}"]`);
}

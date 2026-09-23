import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Button from '../../src/button/Button.astro';
import Basic from '../../src/button/examples/basic.astro';
import Icons from '../../src/button/examples/icons.astro';

describe('Button', () => {
  it('renders a <button type="button"> with the hooks and no script', async () => {
    const html = await render(Button, {}, { default: 'Go' });
    expect(html).toMatch(/<button[^>]*type="button"/);
    expect(html).toMatch(/data-part="root"/);
    expect(html).toMatch(/data-variant="primary"/);
    expect(html).toMatch(/class="[^"]*parche-button/);
    expect(scriptCount(html)).toBe(0);
  });

  it('renders an <a> for href, with rel for _blank', async () => {
    const html = await render(Button, { href: '/x', target: '_blank' }, { default: 'Go' });
    expect(html).toMatch(/<a[^>]+href="\/x"/);
    expect(html).toMatch(/rel="noopener noreferrer"/);
    expect(html).not.toMatch(/type=/);
  });

  it('a disabled link keeps aria-disabled and drops its href', async () => {
    const html = await render(Button, { href: '/x', disabled: true }, { default: 'Go' });
    expect(html).toMatch(/aria-disabled="true"/);
    expect(html).not.toMatch(/href=/);
    expect(html).toMatch(/data-state="disabled"/);
  });

  it('an icon-only button carries its label as the accessible name', async () => {
    const html = await render(Button, { icon: 'tabler:x', label: 'Close' });
    expect(html).toMatch(/aria-label="Close"/);
    expect(html).toMatch(/aria-hidden="true"/);
  });

  it('danger tone changes the classes, block adds full width', async () => {
    const html = await render(Button, { tone: 'danger', block: true }, { default: 'Delete' });
    expect(html).toMatch(/bg-danger/);
    expect(html).toMatch(/w-full/);
    expect(html).toMatch(/data-tone="danger"/);
  });

  it('every example renders', async () => {
    for (const Example of [Basic, Icons]) {
      const html = await render(Example);
      expect(html).toMatch(/parche-button/);
      expect(scriptCount(html)).toBe(0);
    }
  });
});

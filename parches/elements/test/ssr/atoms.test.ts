import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Button from '../../src/atoms/Button.astro';
import Badge from '../../src/atoms/Badge.astro';

// Smoke for the SSR harness itself, on the legacy atoms: the container renders
// .astro on Node, output is markup only. Real per-element render tests land
// with each rebuilt element.
describe('ssr harness', () => {
  it('renders a static atom with no client script', async () => {
    const html = await render(Button, { variant: 'primary' }, { default: 'Go' });
    expect(html).toContain('Go');
    expect(html).toMatch(/<button/);
    expect(scriptCount(html)).toBe(0);
  });

  it('renders a link-shaped button when href is set', async () => {
    const html = await render(Button, { href: '/x' }, { default: 'Go' });
    expect(html).toMatch(/<a[^>]+href="\/x"/);
  });

  it('renders a badge', async () => {
    const html = await render(Badge, { variant: 'primary' }, { default: 'New' });
    expect(html).toContain('New');
  });
});

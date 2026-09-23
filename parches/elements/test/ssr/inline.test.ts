import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Eyebrow from '../../src/eyebrow/Eyebrow.astro';
import Divider from '../../src/divider/Divider.astro';
import Badge from '../../src/badge/Badge.astro';
import Tag from '../../src/tag/Tag.astro';

describe('Eyebrow', () => {
  it('is a type-label paragraph in the primary tone', async () => {
    const html = await render(Eyebrow, {}, { default: 'Features' });
    expect(html).toMatch(/<p[^>]*class="[^"]*parche-eyebrow[^"]*type-label[^"]*text-primary/);
    expect(scriptCount(html)).toBe(0);
  });
  it('takes the highlight tone and another tag', async () => {
    const html = await render(Eyebrow, { tone: 'highlight', as: 'span' }, { default: 'New' });
    expect(html).toMatch(/<span/);
    expect(html).toMatch(/text-highlight/);
    expect(html).toMatch(/data-tone="highlight"/);
  });
});

describe('Divider', () => {
  it('the line is a real <hr>', async () => {
    expect(await render(Divider)).toMatch(/<hr[^>]*class="[^"]*parche-divider/);
  });
  it('decorative variants keep the separator role', async () => {
    expect(await render(Divider, { variant: 'dots' })).toMatch(/role="separator"/);
    expect(await render(Divider, { variant: 'gradient' })).toMatch(/role="separator"/);
  });
  it('a label names the separator', async () => {
    const html = await render(Divider, { label: 'or' });
    expect(html).toMatch(/aria-label="or"/);
    expect(html).toMatch(/data-part="label"[^>]*>or</);
  });
});

describe('Badge', () => {
  it('status variants use the status tokens, never a raw palette', async () => {
    const html = await render(Badge, { variant: 'success' }, { default: 'Passing' });
    expect(html).toMatch(/bg-success-soft/);
    expect(html).toMatch(/text-success/);
    expect(html).not.toMatch(/green/);
  });
  it('default and small size', async () => {
    const html = await render(Badge, { size: 'sm' }, { default: 'x' });
    expect(html).toMatch(/data-variant="default"/);
    expect(html).toMatch(/data-size="sm"/);
    expect(scriptCount(html)).toBe(0);
  });
});

describe('Tag', () => {
  it('a plain tag is a span', async () => {
    const html = await render(Tag, {}, { default: 'x' });
    expect(html).toMatch(/<span[^>]*parche-tag/);
    expect(html).not.toMatch(/aria-current/);
  });
  it('an active linked tag is the current one', async () => {
    const html = await render(Tag, { href: '/t', active: true }, { default: 'x' });
    expect(html).toMatch(/<a[^>]+href="\/t"/);
    expect(html).toMatch(/aria-current="true"/);
    expect(html).toMatch(/data-state="active"/);
    expect(html).toMatch(/bg-primary/);
  });
});

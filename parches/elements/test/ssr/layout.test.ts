import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Container from '../../src/container/Container.astro';
import Section from '../../src/section/Section.astro';
import Link from '../../src/link/Link.astro';
import ContainerExample from '../../src/container/examples/basic.astro';
import SectionExample from '../../src/section/examples/basic.astro';

describe('Container', () => {
  it('centres at the default width with padding', async () => {
    const html = await render(Container, {}, { default: 'x' });
    expect(html).toMatch(/<div[^>]*class="[^"]*parche-container[^"]*mx-auto[^"]*max-w-6xl[^"]*px-4/);
    expect(html).toMatch(/data-width="lg"/);
    expect(scriptCount(html)).toBe(0);
  });
  it('maps widths and can drop padding and change tag', async () => {
    const html = await render(Container, { width: 'sm', padding: false, as: 'main', id: 'main' }, { default: 'x' });
    expect(html).toMatch(/<main[^>]*id="main"/);
    expect(html).toMatch(/max-w-3xl/);
    expect(html).not.toMatch(/px-4/);
  });
  it('example renders', async () => {
    expect(await render(ContainerExample)).toMatch(/data-width="full"/);
  });
});

describe('Section', () => {
  it('is a section with medium rhythm by default', async () => {
    const html = await render(Section, {}, { default: 'x' });
    expect(html).toMatch(/<section[^>]*class="[^"]*parche-section[^"]*py-16/);
    expect(html).not.toMatch(/bg-surface/);
  });
  it('paints on the surface token and reports the state', async () => {
    const html = await render(Section, { surface: true, padding: 'lg' }, { default: 'x' });
    expect(html).toMatch(/bg-surface/);
    expect(html).toMatch(/data-state="surface"/);
    expect(html).toMatch(/py-24/);
  });
  it('example renders', async () => {
    expect(await render(SectionExample)).toMatch(/parche-container/);
  });
});

describe('Link', () => {
  it('is an underlined primary link by default', async () => {
    const html = await render(Link, { href: '/x' }, { default: 'Go' });
    expect(html).toMatch(/<a[^>]+href="\/x"/);
    expect(html).toMatch(/underline/);
    expect(html).not.toMatch(/target=/);
    expect(scriptCount(html)).toBe(0);
  });
  it('external adds target and rel', async () => {
    const html = await render(Link, { href: 'https://x', external: true }, { default: 'Go' });
    expect(html).toMatch(/target="_blank"/);
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });
});

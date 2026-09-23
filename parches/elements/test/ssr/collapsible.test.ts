import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Collapsible from '../../src/collapsible/Collapsible.astro';
import Basic from '../../src/collapsible/examples/basic.astro';

describe('Collapsible', () => {
  it('is a native details/summary wrapped in the custom element, closed by default', async () => {
    const html = await render(Collapsible, { title: 'Q' }, { default: 'A' });
    expect(html).toMatch(/<parche-collapsible[^>]*data-part="root"[^>]*data-state="closed"/);
    expect(html).toMatch(/<details[^>]*>/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html).toMatch(/<summary[^>]*data-part="trigger"[^>]*>/);
    expect(html).toMatch(/data-part="content"/);
    expect(html).toMatch(/data-part="indicator"/);
  });

  it('open, name and forceOpen reach the markup', async () => {
    const html = await render(Collapsible, { title: 'Q', open: true, name: 'faq', forceOpen: '(min-width: 48rem)' }, { default: 'A' });
    expect(html).toMatch(/data-state="open"/);
    expect(html).toMatch(/<details[^>]*\sopen/);
    expect(html).toMatch(/name="faq"/);
    expect(html).toMatch(/force-open="\(min-width: 48rem\)"/);
  });

  it('hoists exactly one script and renders the example', async () => {
    const html = await render(Basic);
    expect(html.match(/<parche-collapsible/g)?.length).toBe(3);
    expect(scriptCount(html)).toBeLessThanOrEqual(1);
  });
});

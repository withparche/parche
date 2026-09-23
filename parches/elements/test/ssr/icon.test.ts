import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Icon from '../../src/icon/Icon.astro';
import Basic from '../../src/icon/examples/basic.astro';

describe('Icon', () => {
  it('is decorative by default', async () => {
    const html = await render(Icon, { name: 'tabler:check' });
    expect(html).toMatch(/<svg/);
    expect(html).toMatch(/aria-hidden="true"/);
    expect(html).not.toMatch(/role="img"/);
    expect(html).toMatch(/data-part="root"/);
    expect(html).toMatch(/parche-icon/);
    expect(scriptCount(html)).toBe(0);
  });

  it('becomes an image with a name when labelled', async () => {
    const html = await render(Icon, { name: 'tabler:check', label: 'Included' });
    expect(html).toMatch(/role="img"/);
    expect(html).toMatch(/aria-label="Included"/);
    expect(html).not.toMatch(/aria-hidden/);
  });

  it('sizes map to fixed steps', async () => {
    expect(await render(Icon, { name: 'tabler:check', size: 'xl' })).toMatch(/size-8/);
  });

  it('the example renders', async () => {
    expect(await render(Basic)).toMatch(/parche-icon/);
  });
});

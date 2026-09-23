import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Dialog from '../../src/dialog/Dialog.astro';
import Sheet from '../../src/sheet/Sheet.astro';
import Popover from '../../src/popover/Popover.astro';

describe('Dialog', () => {
  it('renders a native modal wired to invoker commands, labelled and described, with one script', async () => {
    const html = await render(Dialog, { id: 'd', title: 'Title', description: 'Desc' }, { default: '<p>body</p>', footer: '<button>Ok</button>' });
    expect(html).toMatch(/<parche-dialog[^>]*data-part="root"[^>]*data-state="closed"/);
    expect(html).toMatch(/<dialog[^>]*id="d"[^>]*closedby="any"[^>]*aria-labelledby="d-title"[^>]*aria-describedby="d-description"/);
    expect(html).toMatch(/<h2 id="d-title"[^>]*data-part="title"[^>]*>Title</);
    expect(html).toMatch(/<button[^>]*command="close"[^>]*commandfor="d"[^>]*aria-label="Close"/);
    expect(html).toMatch(/data-part="footer"/);
    expect(html).not.toMatch(/<dialog[^>]*\sopen/);
    expect(scriptCount(html)).toBe(1);
  });
  it('closedBy and the missing footer reach the markup', async () => {
    const html = await render(Dialog, { id: 'd', title: 'T', closedBy: 'none', size: 'sm' });
    expect(html).toMatch(/closedby="none"/);
    expect(html).toMatch(/max-w-sm/);
    expect(html).not.toMatch(/data-part="footer"/);
    expect(html).not.toMatch(/aria-describedby/);
  });
});

describe('Sheet', () => {
  it('is a docked modal under its own tag, title kept for assistive tech when hidden', async () => {
    const html = await render(Sheet, { id: 's', title: 'Menu', hideTitle: true, side: 'left' });
    expect(html).toMatch(/<parche-sheet[^>]*data-side="left"/);
    expect(html).toMatch(/<dialog[^>]*id="s"[^>]*aria-labelledby="s-title"/);
    expect(html).toMatch(/<h2 id="s-title"[^>]*sr-only/);
    expect(html).toMatch(/left-0 right-auto/);
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Popover', () => {
  it('is a popover="auto" surface; a title makes it a named non-modal dialog', async () => {
    const plain = await render(Popover, { id: 'p' }, { default: 'hi' });
    expect(plain).toMatch(/<parche-popover[^>]*data-placement="bottom"[^>]*data-align="center"/);
    expect(plain).toMatch(/<div id="p" popover="auto"[^>]*data-part="surface"/);
    expect(plain).not.toMatch(/role="dialog"/);
    const titled = await render(Popover, { id: 'p', title: 'Share', placement: 'top', align: 'end' });
    expect(titled).toMatch(/popover="auto" role="dialog" aria-labelledby="p-title"/);
    expect(titled).toMatch(/data-placement="top"[^>]*data-align="end"/);
    expect(scriptCount(titled)).toBe(1);
  });
});

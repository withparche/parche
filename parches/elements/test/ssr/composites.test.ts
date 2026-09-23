import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Tabs from '../../src/tabs/Tabs.astro';
import Menu from '../../src/menu/Menu.astro';
import Tooltip from '../../src/tooltip/Tooltip.astro';
import Toast from '../../src/toast/Toast.astro';
import * as Carousel from '../../src/carousel/index';

describe('Tabs', () => {
  const items = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B', disabled: true },
    { value: 'c', label: 'C' },
  ];
  it('renders the APG pattern complete: roles, selection, controls pairs, hidden panels', async () => {
    const html = await render(Tabs, { items, label: 'Letters', syncKey: 'l' }, { a: '<p>alpha</p>', c: '<p>gamma</p>' });
    expect(html).toMatch(/<parche-tabs[^>]*data-value="a"[^>]*sync-key="l"/);
    expect(html).toMatch(/role="tablist" aria-label="Letters"/);
    const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map((m) => m[0]);
    expect(tabs.length).toBe(3);
    expect(tabs[0]).toMatch(/aria-selected="true"[^>]*aria-controls="(tabs-[a-z0-9]+)-panel-a"[^>]*tabindex="0"/);
    expect(tabs[1]).toMatch(/aria-selected="false"[^>]*tabindex="-1"[^>]*disabled/);
    const id = tabs[0].match(/id="([^"]+)-tab-a"/)![1];
    expect(html).toMatch(new RegExp(`<div role="tabpanel" id="${id}-panel-a" aria-labelledby="${id}-tab-a" tabindex="0"(?! hidden)`));
    expect(html).toMatch(new RegExp(`<div role="tabpanel" id="${id}-panel-c"[^>]* hidden="until-found"`));
    expect(html).toContain('<p>alpha</p>');
    expect(html).toContain('<p>gamma</p>');
    expect(html).toMatch(/data-part="heading"[^>]*>A</);
    expect(scriptCount(html)).toBe(1);
  });
  it('value picks the selected tab; content renders HTML', async () => {
    const html = await render(Tabs, { items: [{ value: 'x', label: 'X', content: '<em>hi</em>' }, { value: 'y', label: 'Y' }], value: 'y' });
    expect(html).toMatch(/data-value="y"/);
    expect(html).toMatch(/id="[^"]+-tab-y"[^>]*aria-selected="true"/);
    expect(html).toContain('<em>hi</em>');
  });
  it('the same items render the same ids (deterministic)', async () => {
    const a = await render(Tabs, { items });
    const b = await render(Tabs, { items });
    expect(a).toBe(b);
  });
});

describe('Menu', () => {
  const groups = [
    { title: 'Go', items: [{ label: 'Home', href: '/', current: true }, { label: 'Docs', href: '/docs', disabled: true }] },
    { items: [{ label: 'English', value: 'en', checked: true }, { label: 'Español', value: 'es', checked: false }] },
  ];
  it('is a menu button on a popover with menuitems, radios, groups and states', async () => {
    const html = await render(Menu, { id: 'm', label: 'More', groups });
    expect(html).toMatch(/<button[^>]*id="m-trigger"[^>]*popovertarget="m"[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"/);
    expect(html).toMatch(/<div id="m" popover="auto" role="menu" aria-labelledby="m-trigger"/);
    expect(html).toMatch(/role="group" aria-labelledby="m-group-0"/);
    expect(html).toMatch(/<a role="menuitem" tabindex="-1" href="\/"[^>]*aria-current="true"/);
    expect(html).toMatch(/<button role="menuitem" tabindex="-1"[^>]*aria-disabled="true"[^>]*disabled/);
    expect(html).toMatch(/<button role="menuitemradio"[^>]*aria-checked="true"[^>]*data-value="en"/);
    expect(html).toMatch(/aria-checked="false"[^>]*data-value="es"/);
    expect(html).toMatch(/data-anchored[^>]*data-placement="bottom"[^>]*data-align="start"/);
    expect(scriptCount(html)).toBe(1);
  });
  it('an icon-only trigger takes triggerLabel; a slotted trigger replaces it', async () => {
    const icon = await render(Menu, { id: 'm', icon: 'tabler:world', triggerLabel: 'Language', groups });
    expect(icon).toMatch(/<button[^>]*aria-label="Language"/);
    const slotted = await render(Menu, { id: 'm', groups }, { trigger: '<button popovertarget="m">Mine</button>' });
    expect(slotted).not.toMatch(/data-part="trigger"/);
    expect(slotted).toContain('<button popovertarget="m">Mine</button>');
  });
});

describe('Tooltip', () => {
  it('renders a manual popover with role tooltip anchored to the wrapper', async () => {
    const html = await render(Tooltip, { text: 'Copy link' }, { default: '<button>C</button>' });
    const id = html.match(/id="(tip-[a-z0-9]+)"/)![1];
    expect(html).toMatch(new RegExp(`<parche-tooltip[^>]*data-placement="top"[^>]*style="anchor-name: --${id}"`));
    expect(html).toMatch(new RegExp(`<div id="${id}" role="tooltip" popover="manual"[^>]*style="position-anchor: --${id}"[^>]*>\\s*Copy link`));
    expect(html).toContain('<button>C</button>');
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Toast', () => {
  it('renders a status region, server toasts and the template', async () => {
    const html = await render(Toast, { items: [{ title: 'Saved', description: 'Done', tone: 'success' }], duration: 0 });
    expect(html).toMatch(/<parche-toaster[^>]*data-position="bottom-right"[^>]*duration="0"/);
    expect(html).toMatch(/<div role="status" aria-label="Notifications"[^>]*>\s*<ol/);
    expect(html).toMatch(/<li[^>]*data-part="toast"[^>]*data-tone="success"[^>]*data-state="open"/);
    expect(html).toMatch(/data-part="title"[^>]*>Saved</);
    expect(html).toMatch(/<template data-part="template">/);
    expect(html).toMatch(/aria-label="Dismiss"/);
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Carousel', () => {
  it('Root is a carousel region with a focusable track, picker and controls', async () => {
    const html = await render(Carousel.Root, { count: 3, label: 'Quotes', perView: 3 }, { default: '<div>s</div>' });
    expect(html).toMatch(/<parche-carousel role="region" aria-roledescription="carousel" aria-label="Quotes"[^>]*data-per-view="3"[^>]*data-index="0"/);
    expect(html).toMatch(/role="group" aria-label="Quotes: slides" tabindex="0"/);
    expect((html.match(/data-part="dot"/g) ?? []).length).toBe(3);
    expect(html).toMatch(/aria-label="Slide 1"[^>]*aria-current="true"/);
    expect(html).toMatch(/aria-label="Previous slide"[^>]*disabled/);
    expect(scriptCount(html)).toBe(1);
  });
  it('Slide is a group named by position', async () => {
    const html = await render(Carousel.Slide, { index: 1, total: 4 }, { default: 'x' });
    expect(html).toMatch(/role="group" aria-roledescription="slide" aria-label="2 of 4"[^>]*data-index="1"[^>]*data-state="inactive"/);
    expect(scriptCount(html)).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Accordion from '../../src/accordion/Accordion.astro';
import Switch from '../../src/switch/Switch.astro';
import Slider from '../../src/slider/Slider.astro';

const items = [
  { title: 'A', content: '<p>a</p>', open: true },
  { title: 'B', content: '<p>b</p>' },
];

describe('Accordion', () => {
  it('gives every item the same deterministic name so the browser enforces exclusivity', async () => {
    const html = await render(Accordion, { items });
    const names = [...html.matchAll(/name="(acc-[a-z0-9]+)"/g)].map((m) => m[1]);
    expect(names.length).toBe(2);
    expect(new Set(names).size).toBe(1);
    expect(await render(Accordion, { items })).toContain(names[0]);
    expect(html).toMatch(/data-part="item"/);
    expect(html).toMatch(/<details[^>]*\sopen/);
  });
  it('multiple drops the name', async () => {
    const html = await render(Accordion, { items, multiple: true });
    expect(html).not.toMatch(/name="acc-/);
    expect(html).toMatch(/data-multiple/);
  });
});

describe('Switch', () => {
  it('is a checkbox with the switch role inside its label, no script', async () => {
    const html = await render(Switch, { name: 'x', label: 'Email me', checked: true });
    expect(html).toMatch(/<input[^>]*type="checkbox"[^>]*role="switch"[^>]*name="x"[^>]*checked/);
    expect(html).toMatch(/data-part="track"[^>]*aria-hidden="true"/);
    expect(html).toMatch(/data-part="label"[^>]*>Email me</);
    expect(scriptCount(html)).toBe(0);
  });
  it('disabled reaches the input', async () => {
    expect(await render(Switch, { label: 'x', disabled: true })).toMatch(/<input[^>]*disabled/);
  });
});

describe('Slider', () => {
  it('is a range input bound to an output, no element script', async () => {
    const html = await render(Slider, { name: 'v', label: 'Volume', value: 40, unit: '%' });
    expect(html).toMatch(/<input[^>]*type="range"[^>]*id="slider-v"[^>]*min="0"[^>]*max="100"[^>]*value="40"/);
    expect(html).toMatch(/<output[^>]*for="slider-v"[^>]*>40%</);
    expect(html).toMatch(/accent-primary/);
    expect(scriptCount(html)).toBe(0);
  });
  it('showValue=false drops the output and its handler', async () => {
    const html = await render(Slider, { label: 'Q', showValue: false });
    expect(html).not.toMatch(/<output/);
    expect(html).not.toMatch(/oninput/);
  });
});

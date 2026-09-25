/**
 * The Steps widget on the node model: three layouts, the media slot beside
 * the timeline, duration and owner on a step.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Steps from '../../src/widgets/Steps.astro';

let container: AstroContainer | null = null;
async function render(props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Steps, { props, slots });
}

const base = {
  title: 'How it works',
  items: [
    { title: 'Scope', description: 'A call', duration: '1 week', owner: 'you' },
    { title: 'Build', description: 'The site', icon: 'tabler:hammer' },
  ],
  actions: [{ text: 'Book a call', href: '#book' }],
};

test('timeline: a numbered line, duration and owner, the media slot or the image beside it', async () => {
  const bare = await render(base);
  expect(bare).toContain('data-layout="timeline"');
  expect(bare).toContain('1 week · you');
  expect(bare).not.toContain('parche-steps-media');
  expect(bare).toContain('href="#book"');
  const withImage = await render({ ...base, image: { src: 'https://example.com/a.png', alt: 'A' }, reversed: true });
  expect(withImage).toContain('parche-steps-media');
  expect(withImage).toContain('alt="A"');
  expect(withImage).toContain('md:flex-row-reverse');
  const withSlot = await render({ ...base, image: { src: 'https://example.com/a.png', alt: 'A' } }, { media: '<form data-form></form>' });
  expect(withSlot).toContain('<form data-form></form>');
  expect(withSlot).not.toContain('alt="A"');
});

test('grid and numbered lay the same steps out differently', async () => {
  const grid = await render({ ...base, layout: 'grid' });
  expect(grid).toContain('data-layout="grid"');
  expect(grid).toContain('lg:grid-cols-3');
  const numbered = await render({ ...base, layout: 'numbered' });
  expect(numbered).toContain('data-layout="numbered"');
  expect(numbered).toContain('space-y-10');
  expect(numbered).toContain('w-16 h-16');
});

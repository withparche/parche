import { z } from 'zod';
import type { ElementMeta } from '../../../src/integration/types.ts';

export const schema = z.object({ defaultValue: z.string().optional() });
export const parts = { Panel: { schema: z.object({ value: z.string() }) } };
export const meta: ElementMeta = {
  element: {
    label: 'Tabs',
    description: 'Fixture',
    tokens: ['color-surface'],
    tag: { name: 'parche-tabs', entry: './tabs.element.ts' },
    keyboard: { ArrowRight: 'next' },
    noJs: 'stacked',
    parts: [{ name: 'root', element: 'parche-tabs' }, { name: 'panel', element: 'div', role: 'tabpanel' }],
  },
};

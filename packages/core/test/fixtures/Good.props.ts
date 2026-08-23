// Fixture consumed only by the widgetSchemas generator's `fs.existsSync` check
// (plugin.test.ts asserts the generated module string, it never executes this).
import { z } from 'zod';

export const schema = z.object({ title: z.string() });
export const meta = { widget: { label: 'Good Widget', category: 'test' } };

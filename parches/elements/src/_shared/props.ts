import type { z } from 'zod';

/**
 * Split an element's incoming props into what its schema knows (parsed, with
 * defaults applied), the `class` to merge, and everything else — which the
 * element spreads onto its root. Forwarding the rest is what lets a consumer
 * add `id`, `aria-*` or `data-*`, and lets a composition rename a child's
 * part (`<Eyebrow data-part="tagline">` inside Heading).
 */
export function splitProps<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
  all: Record<string, unknown>,
): { props: z.infer<S>; rest: Record<string, unknown>; className: string | undefined } {
  const { class: className, ...raw } = all;
  const known = new Set(Object.keys(schema.shape));
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (!known.has(k)) rest[k] = v;
  return { props: schema.parse(raw) as z.infer<S>, rest, className: className as string | undefined };
}

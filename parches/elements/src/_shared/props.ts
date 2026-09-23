import type { z } from 'zod';

/**
 * Split an element's incoming props into what its schema knows (parsed, with
 * defaults applied), the `class` to merge, the `data-part` of the root, and
 * everything else — which the element spreads onto its root. Forwarding the
 * rest is what lets a consumer add `id`, `aria-*` or `data-*`; `part` is
 * what lets a composition rename a child's part (`<Eyebrow data-part="tagline">`
 * inside Heading). It is taken out of `rest` and rendered explicitly because
 * a static attribute and a spread with the same name would both be emitted,
 * and the browser keeps the first.
 */
export function splitProps<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
  all: Record<string, unknown>,
): { props: z.infer<S>; rest: Record<string, unknown>; className: string | undefined; part: string } {
  const { class: className, 'data-part': part, ...raw } = all;
  const known = new Set(Object.keys(schema.shape));
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (!known.has(k)) rest[k] = v;
  return { props: schema.parse(raw) as z.infer<S>, rest, className: className as string | undefined, part: (part as string | undefined) ?? 'root' };
}

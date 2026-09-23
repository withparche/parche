/**
 * Deterministic ids for server-rendered ARIA pairs (`aria-controls`,
 * `aria-labelledby`). Derived from the content, never from a counter or
 * `Math.random`, so the same input renders the same markup on every request:
 * the builder morphs the DOM in place and the tests snapshot it.
 */
export function hashId(prefix: string, input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return `${prefix}-${h.toString(36)}`;
}

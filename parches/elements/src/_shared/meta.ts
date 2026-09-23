import type { ElementMeta } from '@parche/astro/types';

export type { ElementMeta, ElementPart } from '@parche/astro/types';

/**
 * Identity helper that types an element's `meta` export and enforces the
 * contract the catalog and the docs rely on: an interactive element (one
 * with a `tag`) must document its keyboard map and its no-JS behaviour.
 */
export function defineElement(meta: ElementMeta): ElementMeta {
  const e = meta.element;
  if (e.tag && (!e.keyboard || !e.noJs)) {
    throw new Error(`[parche] element "${e.label}" declares a tag but not its keyboard map and noJs behaviour`);
  }
  return meta;
}

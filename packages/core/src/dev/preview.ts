/**
 * The preview context a development tool (the builder) opens around one
 * request: the drafts it serves instead of the files, and whether nodes
 * mark themselves for its overlay. The tool installs an AsyncLocalStorage
 * under a well-known symbol; core only reads it, so core does not depend
 * on the tool. Outside such a request — every normal page, every build —
 * there is no context, and nothing here changes a thing.
 */
export interface PreviewContext {
  /** Drafts by the file they replace (`src/content/pages/en/home.json`), as the collection would parse them. */
  drafts: Map<string, Record<string, unknown>>;
  /** Wrap each node's output in comments naming its id, for the overlay. */
  markers: boolean;
}

const KEY = Symbol.for('parche.preview');

export function previewContext(): PreviewContext | undefined {
  const als = (globalThis as { [KEY]?: { getStore(): PreviewContext | undefined } })[KEY];
  return als?.getStore();
}

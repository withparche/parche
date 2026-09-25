export { nodeSchema, nodeListSchema, walkNodes, widgetNames, MAX_NODE_DEPTH } from './node.js';
export type { Node } from './node.js';
export { validateTree } from './validate.js';
export type { Issue, ValidateContext, WidgetShape } from './validate.js';
export {
  metadataSchema,
  pageSchema,
  navigationSchema,
  layoutSchema,
  presetSchema,
  createCollections,
  collections,
} from './schemas.js';

export type { MetadataEntry, PageEntry, NavigationEntry, LayoutEntry, PresetEntry } from './schemas.js';
export { listWrapper, outletWrappers } from './wrapper.js';
export type { WrapperSpec, ListWrapper } from './wrapper.js';
export { substituteRefs, createResolver, parseEntryRef, hasRefs } from './refs.js';
export type { Ref, EntryRef, QueryRef, RefIssue } from './refs.js';

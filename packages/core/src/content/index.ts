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

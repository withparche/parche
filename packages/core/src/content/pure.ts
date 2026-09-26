/**
 * The content model's pure half: the node, the wrapper rules, the validator,
 * the pattern checks and the reference grammar, without the collections
 * (which pull in astro:content). What a browser tool — the builder's editor —
 * can import to check a tree as the renderer will.
 */
export { nodeSchema, nodeListSchema, walkNodes, widgetNames } from './node.js';
export type { Node } from './node.js';
export { metadataSchema, pageSchema, navigationSchema, layoutSchema } from './entries.js';
export { validateTree } from './validate.js';
export type { Issue, ValidateContext, WidgetShape } from './validate.js';
export { listWrapper, nodeWrapper, outletWrappers } from './wrapper.js';
export type { WrapperSpec, ListWrapper } from './wrapper.js';
export { checkTrees } from './check.js';
export type { CheckInput } from './check.js';
export {
  PATTERN_PREFIX,
  patternSchema,
  isPatternUse,
  definePattern,
  patternsFor,
  instantiate,
  placeholders,
  checkDefinition,
  checkUses,
  isPlaceholder,
  parseUse,
  usedPatterns,
  rootWidgets,
} from './patterns.js';
export type { Pattern, PatternEntry, Placeholder } from './patterns.js';
export { isEntryRef, isQueryRef, isRef, hasRefs, parseEntryRef, substituteRefs, createResolver } from './refs.js';
export type { Ref, EntryRef, QueryRef, RefIssue } from './refs.js';

/**
 * `@parche/elements/utils` — the only non-relative import an element folder
 * may use besides `@parche/elements/client`. Keeping it this small is what
 * makes a folder copyable into a project without dragging the package.
 */
export { cn, defineVariants } from './_shared/variants.js';
export type { VariantsConfig } from './_shared/variants.js';
export { splitProps } from './_shared/props.js';
export { hashId } from './_shared/id.js';
export { fieldIds } from './_shared/field.js';
export { defineElement } from './_shared/meta.js';
export type { ElementMeta, ElementPart } from './_shared/meta.js';

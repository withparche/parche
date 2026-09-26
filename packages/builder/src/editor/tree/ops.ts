import type { Node, WrapperSpec } from '@parche/astro/content/pure';
import { rootList, type Kind } from '../../shared/roots';
import { newId } from './ids';
import { locate } from './locate';
import type { Target } from './rules';

/**
 * The edits the editor makes to a document's trees. They mutate the draft
 * they are given (an immer draft in the store, which records them as
 * patches for undo). A slot or a `slots` object left empty is removed, so
 * the file stays as a person would write it.
 */

function targetList(kind: Kind, data: Record<string, any>, target: Target): Node[] {
  if ('root' in target) return rootList(data, target.root);
  const parent = locate(kind, data, target.parent);
  if (!parent) throw new Error(`no node "${target.parent}"`);
  parent.node.slots ??= {};
  return (parent.node.slots[target.slot] ??= []);
}

function prune(node: Node | undefined) {
  if (!node?.slots) return;
  for (const [slot, kids] of Object.entries(node.slots)) if (!Array.isArray(kids) || kids.length === 0) delete node.slots[slot];
  if (Object.keys(node.slots).length === 0) delete node.slots;
}

export function insertNode(kind: Kind, data: Record<string, any>, target: Target, node: Node): void {
  const list = targetList(kind, data, target);
  list.splice(Math.max(0, Math.min(target.index, list.length)), 0, node);
}

export function removeNode(kind: Kind, data: Record<string, any>, id: string): Node | null {
  const at = locate(kind, data, id);
  if (!at) return null;
  const [node] = at.list.splice(at.index, 1);
  prune(at.parent?.node);
  return node;
}

/** Put these nodes where a node is (a pattern's use for its widgets, a node for its pattern's use). */
export function replaceNode(kind: Kind, data: Record<string, any>, id: string, nodes: Node[]): void {
  const at = locate(kind, data, id);
  if (at) at.list.splice(at.index, 1, ...nodes);
}

export function moveNode(kind: Kind, data: Record<string, any>, id: string, target: Target): void {
  const from = locate(kind, data, id);
  if (!from) return;
  let index = target.index;
  // Moving down within the same list: removing it first shifts the target up.
  const sameList = 'root' in target ? !from.parent && from.root === target.root : from.parent?.node.id === target.parent && from.parent?.slot === target.slot;
  if (sameList && from.index < index) index -= 1;
  const node = removeNode(kind, data, id);
  if (node) insertNode(kind, data, { ...target, index }, node);
}

/** A deep copy with fresh ids, placed right after the original. */
export function duplicateNode(kind: Kind, data: Record<string, any>, id: string): string | null {
  const at = locate(kind, data, id);
  if (!at) return null;
  const copy = structuredClone(at.node) as Node;
  const refresh = (n: Node) => {
    n.id = newId();
    for (const kids of Object.values(n.slots ?? {})) if (Array.isArray(kids)) kids.forEach(refresh);
  };
  refresh(copy);
  at.list.splice(at.index + 1, 0, copy);
  return copy.id!;
}

/** Set a value inside a node's props by path; `undefined` removes the key (and emptied objects above it). */
export function setProp(kind: Kind, data: Record<string, any>, id: string, pointer: (string | number)[], value: unknown): void {
  const at = locate(kind, data, id);
  if (!at) return;
  if (pointer.length === 0) {
    if (value === undefined || (value && typeof value === 'object' && Object.keys(value).length === 0)) delete at.node.props;
    else at.node.props = value as Record<string, unknown>;
    return;
  }
  at.node.props ??= {};
  setIn(at.node.props, pointer, value);
  if (Object.keys(at.node.props).length === 0) delete at.node.props;
}

/** The value at a pointer, or undefined. */
export function getIn(target: unknown, pointer: (string | number)[]): unknown {
  let cur: any = target;
  for (const key of pointer) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

export function setIn(target: Record<string, any> | unknown[], pointer: (string | number)[], value: unknown): void {
  const trail: [any, string | number][] = [];
  let cur: any = target;
  for (let i = 0; i < pointer.length - 1; i++) {
    const key = pointer[i];
    trail.push([cur, key]);
    if (cur[key] === undefined || cur[key] === null || typeof cur[key] !== 'object') cur[key] = typeof pointer[i + 1] === 'number' ? [] : {};
    cur = cur[key];
  }
  const last = pointer[pointer.length - 1];
  if (value === undefined) {
    if (Array.isArray(cur) && typeof last === 'number') cur.splice(last, 1);
    else delete cur[last];
    // Remove objects the deletion emptied, from the deepest up.
    for (let i = trail.length - 1; i >= 0; i--) {
      const [parent, key] = trail[i];
      const child = parent[key];
      if (child && typeof child === 'object' && !Array.isArray(child) && Object.keys(child).length === 0) delete parent[key];
      else break;
    }
  } else {
    cur[last] = value;
  }
}

export function setWrapper(kind: Kind, data: Record<string, any>, id: string, spec: WrapperSpec | undefined): void {
  const at = locate(kind, data, id);
  if (!at) return;
  if (spec === undefined) delete at.node.wrapper;
  else at.node.wrapper = spec;
}

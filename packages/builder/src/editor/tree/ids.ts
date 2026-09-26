import type { Node } from '@parche/astro/content/pure';
import { rootsOf, type Kind } from '../../shared/roots';

/**
 * Node identity in the editor is the node's own `id` field, which the model
 * reserves for editors. A node that has none gets an ephemeral one while
 * the document is open, and loses it again on save; an id written in the
 * file is kept. A repeated id is replaced by an ephemeral one (two nodes
 * cannot be told apart otherwise) and reported.
 */
export const EPHEMERAL = 'n_';

let counter = 0;
const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
/** Every id this editor made, on opening a document or for a node it inserted: none of them is saved. */
const made = new Set<string>();
export function newId(): string {
  let s = '';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) s += alphabet[b % alphabet.length];
  const id = `${EPHEMERAL}${s}${(counter++).toString(36)}`;
  made.add(id);
  return id;
}

function* allNodes(nodes: Node[]): Generator<Node> {
  for (const n of nodes) {
    yield n;
    for (const kids of Object.values(n.slots ?? {})) if (Array.isArray(kids)) yield* allNodes(kids);
  }
}

/** A node and everything in its slots with new ids, for nodes placed in a document (a copy, a detached pattern). */
export function withNewIds(node: Node): Node {
  return {
    ...node,
    id: newId(),
    ...(node.slots ? { slots: Object.fromEntries(Object.entries(node.slots).map(([k, kids]) => [k, kids.map(withNewIds)])) } : {}),
  };
}

/** Give every node an id, in place. Returns the ids that are ephemeral, and the ones found repeated. */
export function assignIds(kind: Kind, data: Record<string, any>): { ephemeral: Set<string>; repeated: string[] } {
  const ephemeral = new Set<string>();
  const seen = new Set<string>();
  const repeated: string[] = [];
  for (const root of rootsOf(kind, data)) {
    for (const node of allNodes(root.nodes)) {
      if (typeof node.id === 'string' && node.id && !seen.has(node.id)) {
        seen.add(node.id);
        continue;
      }
      if (typeof node.id === 'string' && node.id) repeated.push(node.id);
      node.id = newId();
      ephemeral.add(node.id);
      seen.add(node.id);
    }
  }
  return { ephemeral, repeated };
}

/** A deep copy of the document without the ephemeral ids (and those of nodes inserted since): what is saved. */
export function stripIds<T extends Record<string, any>>(kind: Kind, data: T, ephemeral: ReadonlySet<string>): T {
  const copy = structuredClone(data);
  for (const root of rootsOf(kind, copy)) {
    for (const node of allNodes(root.nodes)) if (node.id && (ephemeral.has(node.id) || made.has(node.id))) delete node.id;
  }
  return copy;
}

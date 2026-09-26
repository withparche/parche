import type { Node } from '@parche/astro/content/pure';

/**
 * What kind of document a collection holds, and where its trees are: a page
 * has `sections` and named `slots`, a layout and a view `sections`, a
 * pattern a `tree`, a post a flat `sections` list. Shared by the
 * server's validation and the editor's tree, so both walk the same lists.
 */
export type Kind = 'page' | 'layout' | 'view' | 'pattern' | 'post' | 'data';

export function kindOf(collection: string): Kind {
  return ({ pages: 'page', layouts: 'layout', views: 'view', patterns: 'pattern', posts: 'post' } as Record<string, Kind>)[collection] ?? 'data';
}

/** A root list: where it lives in the document (`sections`, `slots.aside`, `tree`) and its nodes. */
export interface Root {
  base: string;
  nodes: Node[];
}

const asList = (v: unknown) => (Array.isArray(v) ? (v as Node[]) : []);

export function rootsOf(kind: Kind, data: Record<string, any>): Root[] {
  switch (kind) {
    case 'page':
      return [{ nodes: asList(data.sections), base: 'sections' }, ...Object.entries(data.slots ?? {}).map(([name, t]) => ({ nodes: asList(t), base: `slots.${name}` }))];
    case 'layout':
    case 'view':
    case 'post':
      return [{ nodes: asList(data.sections), base: 'sections' }];
    case 'pattern':
      return [{ nodes: asList(data.tree), base: 'tree' }];
    default:
      return [];
  }
}

/** The root list at `base`, created in the document when it is missing (for inserting). */
export function rootList(data: Record<string, any>, base: string): Node[] {
  if (base.startsWith('slots.')) {
    const name = base.slice('slots.'.length);
    data.slots ??= {};
    return (data.slots[name] ??= []);
  }
  return (data[base] ??= []);
}

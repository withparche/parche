import type { Node } from './node.js';

/**
 * References in props: content that lives once in a collection and is
 * pointed at from a page or a layout instead of being copied into it.
 *
 *   { "$ref": "navigation/main" }                       one entry
 *   { "$ref": "authors/marta#/name" }                   one field of an entry
 *   { "$collection": "posts", "limit": 3, "sort": "-publishDate" }   a query
 *
 * The renderer replaces each reference by its value before the widget sees
 * its props, so widget schemas stay plain and any widget can take one. This
 * file is the pure half: recognising references and substituting them.
 * Loading the collections is utils/refs.ts.
 */

/** `{ "$ref": "<collection>/<id>[#/pointer]" }`, and nothing else in the object. */
export interface EntryRef {
  $ref: string;
}

/** `{ "$collection": name, limit?, filter?, sort? }`: a list of entries. */
export interface QueryRef {
  $collection: string;
  limit?: number;
  filter?: Record<string, unknown>;
  sort?: string;
}

export type Ref = EntryRef | QueryRef;

const QUERY_KEYS = new Set(['$collection', 'limit', 'filter', 'sort']);

export function isEntryRef(v: unknown): v is EntryRef {
  return !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as any).$ref === 'string' && Object.keys(v).length === 1;
}

export function isQueryRef(v: unknown): v is QueryRef {
  return (
    !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as any).$collection === 'string' && Object.keys(v).every((k) => QUERY_KEYS.has(k))
  );
}

export const isRef = (v: unknown): v is Ref => isEntryRef(v) || isQueryRef(v);

/** Whether anything in the value is a reference. */
export function hasRefs(v: unknown): boolean {
  if (isRef(v)) return true;
  if (Array.isArray(v)) return v.some(hasRefs);
  if (v && typeof v === 'object') return Object.values(v).some(hasRefs);
  return false;
}

/**
 * `"navigation/main#/items"` → `{ collection: 'navigation', id: 'main', pointer: ['items'] }`.
 * The first segment is the collection; the rest, slashes included, the entry
 * id without its locale; after `#`, an optional JSON Pointer into the entry.
 */
export function parseEntryRef(ref: string): { collection: string; id: string; pointer?: string[] } | null {
  const [path, fragment] = ref.split('#', 2);
  const slash = path.indexOf('/');
  if (slash <= 0 || slash === path.length - 1) return null;
  const pointer = fragment?.replace(/^\//, '').split('/').filter(Boolean).map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));
  return { collection: path.slice(0, slash), id: path.slice(slash + 1), ...(pointer?.length ? { pointer } : {}) };
}

/** The collections a set of trees references, so they can be loaded once. */
export function referencedCollections(v: unknown, into = new Set<string>()): Set<string> {
  if (isEntryRef(v)) {
    const parsed = parseEntryRef(v.$ref);
    if (parsed) into.add(parsed.collection);
  } else if (isQueryRef(v)) into.add(v.$collection);
  else if (Array.isArray(v)) v.forEach((x) => referencedCollections(x, into));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => referencedCollections(x, into));
  return into;
}

/** A reference that did not resolve, with where it is and why. */
export interface RefIssue {
  path: string;
  message: string;
}

/** What a resolver returns for one reference: the value, or why there is none. */
export type Resolved = { value: unknown } | { error: string };

/**
 * Replace every reference in the nodes' props (at any depth, in every slot) by
 * `resolve(ref)`. An unresolved entry becomes `undefined` (the widget's default
 * applies), an unresolved query an empty list; both are reported with their
 * path, so the page renders in dev and the build fails on them.
 */
export function substituteRefs(nodes: Node[], resolve: (ref: Ref) => Resolved, base = 'sections'): { nodes: Node[]; issues: RefIssue[] } {
  const issues: RefIssue[] = [];
  const value = (v: unknown, path: string): unknown => {
    if (isRef(v)) {
      const r = resolve(v);
      if ('value' in r) return r.value;
      issues.push({ path, message: r.error });
      return isQueryRef(v) ? [] : undefined;
    }
    if (Array.isArray(v)) return v.map((x, i) => value(x, `${path}[${i}]`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x, `${path}.${k}`)]));
    return v;
  };
  const node = (n: Node, path: string): Node => ({
    ...n,
    ...(n.props ? { props: value(n.props, `${path}.props`) as Record<string, unknown> } : {}),
    ...(n.slots
      ? { slots: Object.fromEntries(Object.entries(n.slots).map(([name, list]) => [name, list.map((c, i) => node(c, `${path}.slots.${name}[${i}]`))])) }
      : {}),
  });
  return { nodes: nodes.map((n, i) => node(n, `${base}[${i}]`)), issues };
}

/** An entry as the resolver sees it: its id (locale prefix included) and data. */
export interface RefEntry {
  id: string;
  data: Record<string, unknown>;
}

/**
 * What a reference to an entry of a collection yields when it names no field:
 * a menu is its items, since that is the list a header or footer prop takes;
 * anything else is the entry's data.
 */
export const DEFAULT_POINTER: Record<string, string[]> = { navigation: ['items'] };

/**
 * The resolver over collections already loaded: `entries(name)` returns a
 * collection's entries, or undefined when there is no such collection.
 * Entries are looked up as `{locale}/{id}` first, then `{id}`; a query keeps
 * the page locale's entries when the collection is split by locale, leaves
 * drafts out, then filters, sorts and limits.
 */
export function createResolver(entries: (collection: string) => RefEntry[] | undefined, locale?: string): (ref: Ref) => Resolved {
  const byId = new Map<string, Map<string, RefEntry>>();
  const index = (name: string) => {
    if (!byId.has(name)) byId.set(name, new Map((entries(name) ?? []).map((e) => [e.id, e])));
    return byId.get(name)!;
  };

  return (ref) => {
    if (isEntryRef(ref)) {
      const parsed = parseEntryRef(ref.$ref);
      if (!parsed) return { error: `"${ref.$ref}" is not a reference: write "<collection>/<id>"` };
      if (!entries(parsed.collection)) return { error: `"${ref.$ref}": there is no "${parsed.collection}" collection` };
      const map = index(parsed.collection);
      const entry = (locale && map.get(`${locale}/${parsed.id}`)) || map.get(parsed.id);
      if (!entry) return { error: `"${ref.$ref}": no entry "${parsed.id}" in "${parsed.collection}"` };
      const pointer = parsed.pointer ?? DEFAULT_POINTER[parsed.collection] ?? [];
      let v: unknown = entry.data;
      for (const key of pointer) {
        if (!v || typeof v !== 'object' || !(key in (v as object))) return { error: `"${ref.$ref}": the entry has no "${pointer.join('/')}"` };
        v = (v as Record<string, unknown>)[key];
      }
      return { value: v };
    }

    const list = entries(ref.$collection);
    if (!list) return { error: `there is no "${ref.$collection}" collection` };
    const prefixed = list.some((e) => e.id.includes('/'));
    const inLocale = prefixed && locale ? list.filter((e) => e.id.startsWith(`${locale}/`)) : list;
    let out = inLocale.filter((e) => e.data.draft !== true);
    for (const [key, want] of Object.entries(ref.filter ?? {})) {
      out = out.filter((e) => {
        const got = e.data[key];
        return Array.isArray(got) ? got.includes(want) : got === want;
      });
    }
    if (ref.sort) {
      const desc = ref.sort.startsWith('-');
      const key = desc ? ref.sort.slice(1) : ref.sort;
      const rank = (v: unknown) => (v instanceof Date ? v.getTime() : v);
      out = [...out].sort((a, b) => {
        const x = rank(a.data[key]) as any;
        const y = rank(b.data[key]) as any;
        const c = x === y ? 0 : x == null ? 1 : y == null ? -1 : x < y ? -1 : 1;
        return desc ? -c : c;
      });
    }
    if (ref.limit) out = out.slice(0, ref.limit);
    const strip = (id: string) => (locale && id.startsWith(`${locale}/`) ? id.slice(locale.length + 1) : id);
    return { value: out.map((e) => ({ id: strip(e.id), ...e.data })) };
  };
}

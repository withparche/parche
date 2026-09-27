import { getCollection } from 'astro:content';
import { urlFor } from 'parche:registry/urls';
import type { Node } from '../content/node.js';
import { createResolver, hasRefs, referencedCollections, substituteRefs, type RefEntry, type RefIssue } from '../content/refs.js';

export type { RefIssue };

/**
 * Resolves `$ref` and `$collection` references in trees (see content/refs.ts)
 * against the site's content collections. Each collection a tree names is
 * loaded once; in a build the result is kept for every page. An entry of a
 * collection some parche serves pages for (the blog's posts) carries its
 * address as `href`, unless it has one of its own.
 */
const CACHE = import.meta.env.PROD;
const loaded = new Map<string, RefEntry[] | undefined>();

async function load(name: string): Promise<RefEntry[] | undefined> {
  if (CACHE && loaded.has(name)) return loaded.get(name);
  let list: RefEntry[] | undefined;
  try {
    list = (await getCollection(name as any)) as unknown as RefEntry[];
  } catch {
    list = undefined;
  }
  const url = list ? await urlFor(name) : undefined;
  if (list && url) list = list.map((e) => (e.data.href === undefined ? { ...e, data: { ...e.data, href: url(e) } } : e));
  if (CACHE) loaded.set(name, list);
  return list;
}

export async function resolveRefs(nodes: Node[], locale?: string, base = 'sections'): Promise<{ nodes: Node[]; issues: RefIssue[] }> {
  if (!hasRefs(nodes)) return { nodes, issues: [] };
  const names = [...referencedCollections(nodes)];
  const lists = new Map(await Promise.all(names.map(async (n) => [n, await load(n)] as const)));
  return substituteRefs(nodes, createResolver((n) => lists.get(n), locale), base);
}

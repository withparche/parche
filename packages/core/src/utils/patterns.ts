import { getCollection } from 'astro:content';
import { definePattern, patternsFor, type Issue, type Pattern } from '../content/patterns.js';

/**
 * Loads the `patterns` collection: every pattern a page in `locale` can use,
 * by the name it uses it with (`pattern/faq` is the locale's `en/faq` when
 * there is one), and an issue for each entry that cannot be read. A site
 * without the collection has no patterns. In a build the entries are read once.
 */
const CACHE = import.meta.env.PROD;
let _loaded: { patterns: Pattern[]; issues: Issue[] } | null = null;

async function loadAll(): Promise<{ patterns: Pattern[]; issues: Issue[] }> {
  if (CACHE && _loaded) return _loaded;
  let entries: { id: string; data: unknown }[] = [];
  try {
    entries = (await getCollection('patterns' as any)) as unknown as { id: string; data: unknown }[];
  } catch {
    entries = [];
  }
  const patterns: Pattern[] = [];
  const issues: Issue[] = [];
  for (const entry of entries) {
    const { pattern, error } = definePattern(entry.id, entry.data);
    if (pattern) patterns.push(pattern);
    else issues.push({ path: `patterns/${entry.id}`, message: error ?? 'unreadable pattern' });
  }
  const loaded = { patterns, issues };
  if (CACHE) _loaded = loaded;
  return loaded;
}

export async function loadPatterns(locale?: string): Promise<{ patterns: Record<string, Pattern>; issues: Issue[] }> {
  const all = await loadAll();
  // Each name gets its own copy, so a use's name is the one it was written with.
  const byName = Object.fromEntries(Object.entries(patternsFor(all.patterns, locale)).map(([name, p]) => [name, { ...p, name }]));
  return { patterns: byName, issues: all.issues };
}

import { definePattern, patternsFor, type Pattern } from '@parche/astro/content/pure';
import { listDocs, readDoc } from './files.js';

/**
 * The site's patterns read from disk, not from Astro's content store: one
 * the editor just saved is known at once (the store syncs it a moment
 * later). Each once, by its entry; `patternsFor` gives a locale's names.
 */
export async function readPatterns(root: string): Promise<{ patterns: Pattern[]; issues: { path: string; message: string }[] }> {
  const patterns: Pattern[] = [];
  const issues: { path: string; message: string }[] = [];
  for (const d of await listDocs(root, 'patterns')) {
    const doc = await readDoc(root, 'patterns', d.id).catch(() => null);
    if (!doc) continue;
    const { pattern, error } = definePattern(d.id, doc.data);
    if (pattern) patterns.push(pattern);
    else issues.push({ path: `patterns/${d.id}`, message: error ?? 'unreadable pattern' });
  }
  return { patterns, issues };
}

/** The patterns a document in `locale` uses, by the name it uses them with. */
export async function patternsByName(root: string, locale: string): Promise<Record<string, Pattern>> {
  const { patterns } = await readPatterns(root);
  return Object.fromEntries(Object.entries(patternsFor(patterns, locale)).map(([name, p]) => [name, { ...p, name }]));
}

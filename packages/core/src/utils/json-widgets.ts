import { getCollection } from 'astro:content';
import { defineJsonWidget, type Issue, type JsonWidget } from '../content/json-widgets.js';

/**
 * Loads the `widgets` collection: every JSON widget by name, and an issue for
 * each definition that cannot be read. A site without the collection has no
 * JSON widgets. In a build the result is kept for every page.
 */
const CACHE = import.meta.env.PROD;
let _loaded: { widgets: Record<string, JsonWidget>; issues: Issue[] } | null = null;

export async function loadJsonWidgets(): Promise<{ widgets: Record<string, JsonWidget>; issues: Issue[] }> {
  if (CACHE && _loaded) return _loaded;
  let entries: { id: string; data: unknown }[] = [];
  try {
    entries = (await getCollection('widgets' as any)) as unknown as { id: string; data: unknown }[];
  } catch {
    entries = [];
  }
  const widgets: Record<string, JsonWidget> = {};
  const issues: Issue[] = [];
  for (const entry of entries) {
    const { widget, error } = defineJsonWidget(entry.id, entry.data);
    if (widget) widgets[entry.id] = widget;
    else issues.push({ path: `widgets/${entry.id}`, message: error ?? 'unreadable definition' });
  }
  const loaded = { widgets, issues };
  if (CACHE) _loaded = loaded;
  return loaded;
}

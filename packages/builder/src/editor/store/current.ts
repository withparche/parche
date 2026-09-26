import { useDocs, type Doc } from './documents';

/** The document being edited, and edits bound to it. */
export function useCurrentDoc(): Doc | undefined {
  return useDocs((s) => (s.current ? s.docs[s.current] : undefined));
}

export function editCurrent(recipe: (data: Record<string, any>) => void, group?: string) {
  const { current, edit } = useDocs.getState();
  if (current) edit(current, recipe, group);
}

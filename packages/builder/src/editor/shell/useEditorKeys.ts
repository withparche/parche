import { useEffect } from 'react';
import { useDocs } from '../store/documents';
import { useSelection } from '../store/selection';
import { editCurrent } from '../store/current';
import { locate } from '../tree/locate';
import { duplicateNode, moveNode, removeNode } from '../tree/ops';

/**
 * The editor's keys, from the old builder: ⌘S save, ⌘Z / ⇧⌘Z undo and redo,
 * ⌘D duplicate, Delete remove, ⌘↑/⌘↓ move, Esc deselect. None of them fire
 * while typing in a field, except save and undo, which a field forwards.
 */
export function useEditorKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
      const { current, save, undo, redo, docs } = useDocs.getState();
      if (!current) return;
      const doc = docs[current];
      const { node, select } = useSelection.getState();
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // The preview is a dev page: Astro reloads it itself once the content syncs.
        void save(current);
      } else if (mod && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo(current);
        else undo(current);
      } else if (typing) {
        return;
      } else if (e.key === 'Escape') {
        select(null);
      } else if (!node) {
        return;
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        editCurrent((d) => {
          const copy = duplicateNode(doc.kind, d, node);
          if (copy) queueMicrotask(() => select(copy));
        });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        editCurrent((d) => void removeNode(doc.kind, d, node));
        select(null);
      } else if (mod && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const at = locate(doc.kind, doc.data, node);
        if (!at) return;
        const index = e.key === 'ArrowUp' ? at.index - 1 : at.index + 2;
        if (index < 0 || index > at.list.length) return;
        const target = at.parent ? { parent: at.parent.node.id!, slot: at.parent.slot, index } : { root: at.root, index };
        editCurrent((d) => moveNode(doc.kind, d, node, target));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

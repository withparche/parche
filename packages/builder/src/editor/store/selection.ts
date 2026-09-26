import { create } from 'zustand';
import type { Target } from '../tree/rules';
import { useUi } from './ui';

/**
 * What the editor points at: a node of the current document, or the
 * document itself (its settings), and where the next inserted widget goes
 * (set by the outline's "+" points; otherwise after the selected node).
 */
interface SelectionState {
  node: string | null;
  insertAt: Target | null;
  select: (node: string | null) => void;
  setInsertAt: (t: Target | null) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  node: null,
  insertAt: null,
  select: (node) => {
    // Pointing at the page replaces whatever catalog entry the inspector was showing.
    useUi.getState().inspect(null);
    set({ node, insertAt: null });
  },
  setInsertAt: (insertAt) => set({ insertAt }),
}));

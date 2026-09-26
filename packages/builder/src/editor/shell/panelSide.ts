import { createContext } from 'react';

/** Which side a panel is shown on, so its header can offer to pin or float it. None outside the shell's sides. */
export const PanelSide = createContext<'left' | 'right' | null>(null);

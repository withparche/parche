import { useCallback, useRef, useState, type PointerEvent } from 'react';

/**
 * Drag to resize a side panel, from the old builder: dragging it narrower
 * than 60% of its minimum collapses it and remembers the width it had.
 */
export function usePanelResize(initial: number, side: 'left' | 'right', min = 180, onCollapse?: () => void) {
  const [width, setWidth] = useState(initial);
  const drag = useRef<{ x: number; w: number } | null>(null);
  const onPointerDown = useCallback((e: PointerEvent) => {
    drag.current = { x: e.clientX, w: width };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [width]);
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!drag.current) return;
    const delta = e.clientX - drag.current.x;
    const next = side === 'left' ? drag.current.w + delta : drag.current.w - delta;
    if (next < min * 0.6) {
      drag.current = null;
      onCollapse?.();
      return;
    }
    setWidth(Math.max(min, Math.min(640, next)));
  }, [side, min, onCollapse]);
  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);
  return { width, handle: { onPointerDown, onPointerMove, onPointerUp } };
}

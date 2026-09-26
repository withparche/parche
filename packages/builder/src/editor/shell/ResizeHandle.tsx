import type { PointerEventHandler } from 'react';

/** The 6px grip between a panel and the preview; the hairline turns primary on hover. */
export default function ResizeHandle(props: { onPointerDown: PointerEventHandler; onPointerMove: PointerEventHandler; onPointerUp: PointerEventHandler; label: string }) {
  const { label, ...handlers } = props;
  return (
    <div {...handlers} role="separator" aria-orientation="vertical" aria-label={label} className="group flex w-1.5 shrink-0 cursor-col-resize justify-center">
      <div className="h-full w-px bg-border transition-colors group-hover:bg-primary" />
    </div>
  );
}

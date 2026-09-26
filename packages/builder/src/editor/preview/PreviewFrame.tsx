import { useUi } from '../store/ui';

const widths = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

/** The site itself, in an iframe at the chosen device width. */
export default function PreviewFrame({ src }: { src: string }) {
  const viewport = useUi((s) => s.viewport);
  return (
    <div className="flex h-full justify-center overflow-hidden bg-surface-2 p-0 data-[device=mobile]:py-4 data-[device=tablet]:py-4" data-device={viewport}>
      <iframe
        title="Preview"
        src={src}
        style={{ width: widths[viewport] }}
        className="h-full max-w-full border-0 bg-background shadow-[0_0_0_1px_var(--ds-sys-color-border)] transition-[width] duration-200"
      />
    </div>
  );
}

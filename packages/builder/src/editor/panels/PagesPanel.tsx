import PanelShell from '../shell/PanelShell';
import { useUi } from '../store/ui';

/** The site's pages by locale — the document list comes with the data layer (phase 1). */
export default function PagesPanel() {
  const close = useUi((s) => s.togglePanel);
  return (
    <PanelShell title="Pages" onClose={() => close('pages')}>
      <p className="m-3 text-xs leading-relaxed text-muted">Opening and editing pages arrives with the data layer. For now the preview shows the site as it is on disk.</p>
    </PanelShell>
  );
}

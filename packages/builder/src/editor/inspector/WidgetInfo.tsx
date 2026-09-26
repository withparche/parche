import PanelShell from '../shell/PanelShell';
import { useUi } from '../store/ui';

interface JsonSchema {
  properties?: Record<string, { description?: string; help?: string; type?: string | string[]; anyOf?: unknown[] }>;
}

/** What the catalog says about one widget: its slots and its props, as the forms will see them. */
export default function WidgetInfo() {
  const name = useUi((s) => s.inspected);
  const widget = useUi((s) => (name ? s.catalog?.widgets[name] : undefined));
  const inspect = useUi((s) => s.inspect);
  if (!name || !widget) return null;
  const props = Object.entries((widget.schema as JsonSchema | null)?.properties ?? {}).filter(([k]) => k !== 'widget');
  const slots = Object.entries(widget.slots ?? {});
  return (
    <PanelShell title={widget.label} subtitle={name !== widget.label ? name : undefined} onClose={() => inspect(null)}>
      <div className="space-y-4 p-3 text-xs">
        {widget.description && <p className="m-0 leading-relaxed text-text">{widget.description}</p>}
        {slots.length > 0 && (
          <div>
            <h3 className="m-0 mb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">Slots</h3>
            <ul className="m-0 list-none space-y-1 p-0">
              {slots.map(([slot, meta]) => (
                <li key={slot}>
                  <span className="font-mono text-heading">{slot === '*' ? 'one per option' : slot}</span>
                  {meta.max !== undefined && <span className="text-muted"> · up to {meta.max}</span>}
                  {meta.allow && <span className="text-muted"> · {meta.allow.join(', ')}</span>}
                  {meta.help && <span className="block text-muted">{meta.help}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h3 className="m-0 mb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">Props · {props.length}</h3>
          {widget.schema === null && <p className="m-0 text-warning">Its schema did not serialize to JSON Schema.</p>}
          <ul className="m-0 list-none space-y-1 p-0">
            {props.map(([key, p]) => (
              <li key={key}>
                <span className="font-mono text-heading">{key}</span>
                {(p.help ?? p.description) && <span className="block text-muted">{p.help ?? p.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}

/**
 * Where a site's menus are used, read from the trees: the props that take a
 * menu (`{ "$ref": "navigation/main" }` in a Header's links), whose schema
 * is the shape the menu's items must have. Pure, so it is tested without a
 * server.
 */

/** Where a tree's nodes hold a `{ "$ref": "navigation/…" }` (in their props, at any depth). */
export function navRefs(nodes: any[]): { widget: string; prop: (string | number)[]; ref: string }[] {
  const out: { widget: string; prop: (string | number)[]; ref: string }[] = [];
  const inProps = (widget: string, v: unknown, at: (string | number)[]) => {
    if (!v || typeof v !== 'object') return;
    const ref = (v as { $ref?: unknown }).$ref;
    if (typeof ref === 'string') {
      const [path, pointer] = ref.split('#');
      // Only a menu's own items take the shape of the prop.
      if (path.startsWith('navigation/') && (!pointer || pointer.replace(/^\//, '') === 'items')) out.push({ widget, prop: at, ref: path });
      return;
    }
    if (Array.isArray(v)) v.forEach((x, i) => inProps(widget, x, [...at, i]));
    else for (const [k, x] of Object.entries(v)) inProps(widget, x, [...at, k]);
  };
  const walk = (list: any[]) => {
    for (const n of list ?? []) {
      inProps(n?.widget, n?.props, []);
      for (const kids of Object.values(n?.slots ?? {})) walk(kids as any[]);
    }
  };
  walk(nodes);
  return out;
}

/** The JSON Schema at a path inside a widget's props schema: through properties, items, `$defs` and unions. */
export function schemaAt(root: any, path: (string | number)[]): unknown {
  const deref = (s: any): any => {
    for (let i = 0; i < 8 && s?.$ref?.startsWith?.('#/'); i++) s = s.$ref.slice(2).split('/').reduce((o: any, k: string) => o?.[k], root);
    return s;
  };
  const step = (s: any, key: string | number): any => {
    s = deref(s);
    if (!s) return null;
    for (const u of [...(s.anyOf ?? []), ...(s.oneOf ?? [])]) {
      const hit = step(u, key);
      if (hit) return hit;
    }
    if (typeof key === 'number') return s.items ? deref(s.items) : null;
    return s.properties?.[key] ? deref(s.properties[key]) : null;
  };
  let s: any = root;
  for (const key of path) {
    s = step(s, key);
    if (!s) return null;
  }
  // Carry the root's definitions so the form can resolve the item's own references.
  return s && root?.$defs ? { ...s, $defs: root.$defs } : s;
}

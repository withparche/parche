import type { Node } from './node.js';
import { isPatternUse, rootWidgets, type Pattern } from './patterns.js';

/** What the validator needs to know about a widget: read from the catalog. */
export interface WidgetShape {
  slots?: Record<string, { allow?: string[]; min?: number; max?: number }>;
  /** false when the widget is never wrapped as a root. */
  wrapper?: boolean;
}

export interface ValidateContext {
  widgets: Record<string, WidgetShape | undefined>;
  /** The registered tone names; a `Section` with another tone is reported. */
  tones?: string[];
  /** The wrapper widget, whose `tone` prop is checked against `tones`. */
  wrapper?: string | null;
  /** The patterns the tree may use, by the name it uses them with: a slot's `allow` and counts go by their roots. */
  patterns?: Record<string, Pick<Pattern, 'tree'> | undefined>;
}

export interface Issue {
  /** Where, as `sections[2].slots.media[0]`. */
  path: string;
  message: string;
}

/**
 * Checks a tree against the widget catalog: every widget exists, every slot
 * a node fills is one its widget declares, what fills it is allowed there and
 * counted within `min` and `max`, a node's own wrapper is a widget with a
 * default slot, and a wrapper's tone is a registered one. A pattern's use
 * stands for its roots: they are what a slot's `allow` and counts see (its
 * props and its own tree are checked by checkUses). Pure, so the CLI, the
 * build and the dev renderer report the same things. Depth is not limited:
 * how deep a site nests is the site's call.
 */
export function validateTree(nodes: Node[], ctx: ValidateContext, base = 'sections'): Issue[] {
  const issues: Issue[] = [];
  const patterns = ctx.patterns ?? {};
  // What a child stands for in its parent's slot: a known pattern, its roots.
  const standsFor = (widget: string) => (isPatternUse(widget) && patterns[widget] ? rootWidgets(widget, patterns) : [widget]);

  const visit = (node: Node, path: string) => {
    // The Outlet is the renderer's, not a widget: its content is validated as its own tree.
    if (node.widget === 'Outlet') return;
    // A pattern's use takes no slots; what it is made of is checked from the pattern.
    const shape: WidgetShape | undefined = isPatternUse(node.widget) ? {} : ctx.widgets[node.widget];
    if (!shape) {
      issues.push({ path, message: `unknown widget "${node.widget}"` });
      return;
    }
    const checkTone = (props: Record<string, unknown> | undefined, at: string) => {
      const tone = props?.tone;
      if (ctx.tones && typeof tone === 'string' && !ctx.tones.includes(tone)) {
        issues.push({ path: at, message: `tone "${tone}" is not registered (known: ${ctx.tones.join(', ')})` });
      }
    };
    if (ctx.wrapper && node.widget === ctx.wrapper) checkTone(node.props, path);
    // A node's own wrapper: a registered widget that has somewhere to put it.
    if (node.wrapper) {
      const at = `${path}.wrapper`;
      const name = node.wrapper.widget ?? ctx.wrapper;
      const wrapperShape = name ? ctx.widgets[name] : undefined;
      if (!name) {
        issues.push({ path: at, message: 'names no widget, and no parche registers a default wrapper' });
      } else if (!wrapperShape) {
        issues.push({ path: at, message: `unknown wrapper widget "${name}"` });
      } else if (!wrapperShape.slots?.default && !wrapperShape.slots?.['*']) {
        issues.push({ path: at, message: `"${name}" cannot wrap: it declares no default slot` });
      } else if (name === ctx.wrapper) {
        checkTone(node.wrapper.props, at);
      }
    }
    for (const [slot, children] of Object.entries(node.slots ?? {})) {
      // A widget whose slot names come from its content (a Switch, one slot
      // per option) declares `*`; any name is then accepted with that meta.
      const meta = shape.slots?.[slot] ?? shape.slots?.['*'];
      const slotPath = `${path}.slots.${slot}`;
      if (!meta) {
        const known = Object.keys(shape.slots ?? {});
        issues.push({
          path: slotPath,
          message: known.length
            ? `"${node.widget}" has no slot "${slot}" (it declares: ${known.join(', ')})`
            : `"${node.widget}" declares no slots`,
        });
        continue;
      }
      const count = children.reduce((n, child) => n + standsFor(child.widget).length, 0);
      if (meta.min !== undefined && count < meta.min) {
        issues.push({ path: slotPath, message: `needs at least ${meta.min} node(s), has ${count}` });
      }
      if (meta.max !== undefined && count > meta.max) {
        issues.push({ path: slotPath, message: `takes at most ${meta.max} node(s), has ${count}` });
      }
      children.forEach((child, i) => {
        const childPath = `${slotPath}[${i}]`;
        const refused = meta.allow ? standsFor(child.widget).filter((w) => !meta.allow!.includes(w)) : [];
        if (refused.length) {
          const what = refused[0] === child.widget ? `"${child.widget}"` : `"${child.widget}" (its ${refused.map((w) => `"${w}"`).join(', ')})`;
          issues.push({ path: childPath, message: `${what} is not allowed in "${node.widget}".${slot} (allowed: ${meta.allow!.join(', ')})` });
        }
        visit(child, childPath);
      });
    }
  };

  nodes.forEach((node, i) => visit(node, `${base}[${i}]`));
  return issues;
}

import type { Node } from './node.js';
import { MAX_NODE_DEPTH } from './node.js';

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
  maxDepth?: number;
}

export interface Issue {
  /** Where, as `sections[2].slots.media[0]`. */
  path: string;
  message: string;
}

/**
 * Checks a tree against the widget catalog: every widget exists, every slot
 * a node fills is one its widget declares, what fills it is allowed there and
 * counted within `min` and `max`, the tree stays within the depth limit, a
 * node's own wrapper is a widget with a default slot, and a wrapper's tone is
 * a registered one. Pure, so the CLI, the build and the
 * dev renderer report the same things.
 */
export function validateTree(nodes: Node[], ctx: ValidateContext, base = 'sections'): Issue[] {
  const issues: Issue[] = [];
  const maxDepth = ctx.maxDepth ?? MAX_NODE_DEPTH;

  const visit = (node: Node, path: string, depth: number) => {
    // Outlet and Preset are the renderer's, not widgets: the outlet's content
    // is validated as its own tree, a preset's tree once it is expanded.
    if (node.widget === 'Outlet' || node.widget === 'Preset') return;
    const shape = ctx.widgets[node.widget];
    if (!shape) {
      issues.push({ path, message: `unknown widget "${node.widget}"` });
      return;
    }
    if (depth > maxDepth) {
      issues.push({ path, message: `"${node.widget}" is ${depth} levels deep; the limit is ${maxDepth}` });
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
        issues.push({ path: at, message: `"${name}" cannot wrap: it declares no default slot (a JSON widget has none)` });
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
      if (meta.min !== undefined && children.length < meta.min) {
        issues.push({ path: slotPath, message: `needs at least ${meta.min} node(s), has ${children.length}` });
      }
      if (meta.max !== undefined && children.length > meta.max) {
        issues.push({ path: slotPath, message: `takes at most ${meta.max} node(s), has ${children.length}` });
      }
      children.forEach((child, i) => {
        const childPath = `${slotPath}[${i}]`;
        if (meta.allow && !meta.allow.includes(child.widget)) {
          issues.push({ path: childPath, message: `"${child.widget}" is not allowed in "${node.widget}".${slot} (allowed: ${meta.allow.join(', ')})` });
        }
        visit(child, childPath, depth + 1);
      });
    }
  };

  nodes.forEach((node, i) => visit(node, `${base}[${i}]`, 0));
  return issues;
}

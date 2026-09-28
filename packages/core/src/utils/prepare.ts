/**
 * Getting trees ready to render, and checking them: what NodeRenderer does
 * before it hands roots to Node, as functions, so the render and the build's
 * content check (routes/check.ts) prepare a page the same way.
 *
 * Preparing resolves references (`$ref`, `$collection`) in the trees, the
 * outlets' trees and the definitions of the patterns they use, collects the
 * wrappers the lists declare, and names every widget the render will need.
 * It does not load widgets or resolve asset paths: the render does that, and
 * a check needs neither.
 */
import { wrapper as wrapperName } from 'parche:config/layout';
import { resolveRefs, type RefIssue } from './refs.js';
import { loadPatterns } from './patterns.js';
import { span } from './profile.js';
import { isPatternUse, usedPatterns, type Pattern } from '../content/patterns.js';
import type { Node } from '../content/node.js';
import { walkNodes, widgetNames } from '../content/node.js';
import { listWrapper, outletWrappers, type WrapperSpec } from '../content/wrapper.js';
import { checkTrees } from '../content/check.js';
import type { Issue } from '../content/validate.js';

export interface PrepareInput {
  nodes: Node[];
  /** Page trees by outlet name (`default` is the page's sections), and the page's own wrappers over the layout's. */
  outlets?: { nodes: Record<string, Node[]>; wrappers?: Record<string, WrapperSpec> };
  /** The wrapper of these roots as a list, as an Outlet would declare it. */
  wrapper?: WrapperSpec;
  /** Where these nodes sit, for issue paths: `sections` for page content, `layout` for a layout. */
  base?: string;
  locale?: string;
}

export interface Prepared {
  base: string;
  nodes: Node[];
  outlets?: { nodes: Record<string, Node[]>; wrappers?: Record<string, WrapperSpec> };
  definitions: Record<string, Pattern>;
  /** Wrappers the lists declare, with their paths, for the check. */
  declared: { path: string; wrapper: ReturnType<typeof listWrapper> }[];
  /** Every widget the render will import: the trees', the definitions', the wrappers'. */
  widgets: string[];
  refIssues: RefIssue[];
  patternIssues: Issue[];
  definitionIssues: RefIssue[];
}

export async function prepareTrees(input: PrepareInput): Promise<Prepared> {
  const { locale, wrapper: rootSpec } = input;
  const expand = (tree: Node[], base: string) => span('refs', () => resolveRefs(tree, locale, base));
  const base = input.base ?? (input.outlets ? 'layout' : 'sections');

  // References first: a `$ref` or `$collection` value becomes the content it names.
  const root = await expand(input.nodes, base);
  const outletResults = input.outlets
    ? await Promise.all(Object.entries(input.outlets.nodes).map(async ([k, v]) => [k, await expand(v, k === 'default' ? 'sections' : `slots.${k}`)] as const))
    : [];
  const outlets = input.outlets ? { nodes: Object.fromEntries(outletResults.map(([k, r]) => [k, r.nodes])), wrappers: input.outlets.wrappers } : undefined;
  const refIssues = [...root.issues, ...outletResults.flatMap(([, r]) => r.issues)];

  // The wrappers the lists declare: each Outlet's (or the page's over it), and
  // the one given for these roots.
  const declared = [
    ...outletWrappers(root.nodes).map((o) => ({ path: `${o.path}.props.wrapper`, wrapper: listWrapper(outlets?.wrappers?.[o.name] ?? o.spec, wrapperName) })),
    ...(rootSpec !== undefined ? [{ path: 'wrapper', wrapper: listWrapper(rootSpec, wrapperName) }] : []),
  ];

  // The patterns the trees use (and the ones inside those), each definition
  // made ready like a page: references resolved. The collection is read only
  // when a tree uses a pattern, so a site without them never touches it.
  const outletTrees = Object.values(outlets?.nodes ?? {}).flat();
  const usesPatterns = widgetNames([...root.nodes, ...outletTrees]).some(isPatternUse);
  const loaded = usesPatterns ? await span('patterns.load', () => loadPatterns(locale)) : { patterns: {} as Record<string, Pattern>, issues: [] as Issue[] };
  const used = [...usedPatterns([...root.nodes, ...outletTrees], loaded.patterns)];
  const definitionRefs = await Promise.all(
    used.map(async (name) => {
      const p = loaded.patterns[name];
      const r = await expand(p.tree, `patterns/${p.entry}.tree`);
      return [name, { ...p, tree: r.nodes }, r.issues] as const;
    }),
  );
  const definitions: Record<string, Pattern> = Object.fromEntries(definitionRefs.map(([n, d]) => [n, d]));
  const definitionTrees = Object.values(definitions).flatMap((d) => d.tree);

  // Everything the render will touch: the trees, the outlet trees, the
  // patterns' trees and the wrappers. Widgets not named are never imported.
  const all = [...root.nodes, ...outletTrees, ...definitionTrees];
  const widgets = widgetNames(all).filter((n) => !isPatternUse(n));
  for (const d of declared) if (d.wrapper) widgets.push(d.wrapper.name);
  // A node that asks for the default wrapper by props alone needs it loaded too.
  if (wrapperName && [...walkNodes(all)].some(({ node }) => node.wrapper && !node.wrapper.widget)) widgets.push(wrapperName);

  return {
    base,
    nodes: root.nodes,
    outlets,
    definitions,
    declared,
    widgets: [...new Set(widgets)],
    refIssues,
    patternIssues: loaded.issues,
    definitionIssues: definitionRefs.flatMap(([, , issues]) => issues),
  };
}

/**
 * The prepared trees against the catalog: slots a widget does not declare,
 * widgets a slot does not allow, counts, tones, patterns, and the references
 * that did not resolve. `widgetMeta` and `tones` come from the catalog
 * (parche:registry/widgetSchemas, parche:config/layout), which the caller
 * loads: it imports every widget's schema, so a request never should.
 */
export function checkPrepared(p: Prepared, catalog: { widgetMeta: Record<string, unknown>; tones: { name: string }[] }): (Issue | RefIssue)[] {
  return [
    ...p.refIssues,
    ...p.patternIssues,
    ...span('check', () =>
      checkTrees({
        roots: [
          { nodes: p.nodes, base: p.base },
          ...Object.entries(p.outlets?.nodes ?? {}).map(([name, tree]) => ({ nodes: tree, base: name === 'default' ? 'sections' : `slots.${name}` })),
        ],
        definitions: p.definitions,
        definitionIssues: p.definitionIssues,
        widgetMeta: catalog.widgetMeta as any,
        tones: catalog.tones.map((t) => t.name),
        wrapper: wrapperName,
        declared: p.declared,
      }),
    ),
  ];
}

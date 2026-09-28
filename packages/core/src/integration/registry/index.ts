import fs from 'node:fs';
import path from 'node:path';
import type { ParcheUserConfig, ResolvedRegistry, ParcheManifest, ResolvedElement, HeadLink } from '../types.js';
import type { SiteConfig } from '../../types/config.js';
import { BASE_NAMED_EXPORTS, CORE_MODULES, CORE_TONES, DEFAULT_THEME, corePath, declaresNoWrapper, dedupeThemes } from './core.js';
import { overrideKeyToVirtualId, resolveElement, resolveOverridePath } from './elements.js';
import { checkRequires } from './requires.js';

export { satisfiesVersion } from './versions.js';

/**
 * Build the complete resolved registry from user config: what every parche
 * contributes, merged in order (later wins where two give the same thing),
 * the site's overrides on top, the requirements checked, and the settings
 * the generated modules read.
 */
export function createRegistry(
  userConfig: ParcheUserConfig,
  rootDir: string,
  astroI18n?: { locales?: Array<string | { path: string; codes: string[] }>; defaultLocale?: string },
  inlineSiteConfig?: SiteConfig,
  /** Astro's `srcDir`, absolute; defaults to `<root>/src`. */
  srcDirAbs: string = path.join(rootDir, 'src'),
  options: {
    /** Where a problem that does not stop the build is reported: Astro's logger, from the integration; the console on its own. */
    warn?: (message: string) => void;
  } = {},
): ResolvedRegistry {
  const warn = options.warn ?? ((message: string) => console.warn(`[parche] ${message}`));
  const modules: Record<string, string> = { ...CORE_MODULES };

  // Site config: `parche({ site })` passes it inline (served as parche:config by
  // the vite plugin); otherwise parche:config points at the user's config file,
  // or at its home in the site's srcDir.
  if (!inlineSiteConfig) {
    modules['parche:config'] = userConfig.config ? path.resolve(rootDir, userConfig.config) : path.join(srcDirAbs, 'parche.config.json');
  }

  // Modules that use named exports — instance-local, seeded from the frozen base
  // so registrations don't bleed between createRegistry calls in one process.
  const namedExportModules = new Set<string>(BASE_NAMED_EXPORTS);

  // Surface silent last-wins collisions and bad parche paths with attribution,
  // instead of an opaque "Unknown virtual module" / ESM error much later.
  const collisions: string[] = [];
  const badPaths: string[] = [];
  const setModule = (parcheName: string, kind: string, virtualId: string, absPath: string) => {
    if (!path.isAbsolute(absPath)) {
      badPaths.push(`"${parcheName}" ${kind} "${virtualId}" → not an absolute path: ${absPath}`);
    } else if (!fs.existsSync(absPath)) {
      badPaths.push(`"${parcheName}" ${kind} "${virtualId}" → file not found: ${absPath}`);
    }
    const prev = modules[virtualId];
    if (prev && prev !== absPath) {
      collisions.push(`${virtualId} — "${parcheName}" overwrites ${prev}`);
    }
    modules[virtualId] = absPath;
  };

  // Register parches (order = precedence: later wins). Each parche contributes
  // elements / widgets / templates / routes / config to the system.
  const parches = userConfig.parches ?? [];
  const providedElements = new Set<string>();
  const elements: Record<string, ResolvedElement> = {};
  const providedWidgets = new Set<string>();
  const providedTemplates = new Set<string>();
  const apps: ParcheManifest[] = [];
  const contributedStyles: string[] = [];
  const contributedFonts: any[] = [];
  const headLinks: HeadLink[] = [];
  let siteSearch: string | undefined;
  const buildDone: ResolvedRegistry['buildDone'] = [];
  const contributedThemes: Array<{ label: string; value: string }> = [];
  const contentGlobs: string[] = [];
  let wrapper: string | null = null;
  const tones: Array<{ name: string; label: string }> = [...CORE_TONES];
  const unwrapped: string[] = [];

  for (const parche of parches) {
    if (parche.styles) contributedStyles.push(...parche.styles);
    if (parche.fonts) contributedFonts.push(...parche.fonts);
    if (parche.hooks?.['astro:build:done']) buildDone.push({ name: parche.name, run: parche.hooks['astro:build:done'] });
    if (parche.siteSearch) siteSearch = parche.siteSearch;
    for (const link of parche.head?.links ?? []) {
      if (!headLinks.some((l) => l.rel === link.rel && l.href === link.href)) headLinks.push(link);
    }
    if (parche.themes) contributedThemes.push(...parche.themes);
    if (parche.content) contentGlobs.push(...parche.content);
    if (parche.wrapper) wrapper = parche.wrapper;
    // A tone is one name: the first to declare it (core's, then the parches in order) keeps it.
    for (const tone of parche.tones ?? []) if (!tones.some((t) => t.name === tone.name)) tones.push(tone);
    if (parche.elements) {
      for (const [name, value] of Object.entries(parche.elements)) {
        const prim = resolveElement(parche.name, name, value);
        const virtualId = `parche:elements/${name}`;
        setModule(parche.name, 'element', virtualId, prim.entry);
        // A compound element's entry is an index.ts with named parts.
        if (prim.compound) namedExportModules.add(virtualId);
        else namedExportModules.delete(virtualId);
        for (const [part, partPath] of Object.entries(prim.parts)) {
          setModule(parche.name, 'element part', `${virtualId}/${part}`, partPath);
        }
        if (prim.style) contributedStyles.push(prim.style);
        elements[name] = prim;
        providedElements.add(name);
      }
    }
    if (parche.widgets) {
      for (const [name, absPath] of Object.entries(parche.widgets)) {
        setModule(parche.name, 'widget', `parche:widgets/${name}`, absPath);
        providedWidgets.add(name);
      }
    }
    if (parche.templates) {
      for (const [name, absPath] of Object.entries(parche.templates)) {
        setModule(parche.name, 'template', `parche:templates/${name}`, absPath);
        providedTemplates.add(name);
      }
    }
    if (parche.namedExportModules) {
      for (const id of parche.namedExportModules) namedExportModules.add(id);
    }
    // A parche that injects routes / resolves slugs / exposes config is an "app".
    if (parche.routes || parche.resolver || parche.config) {
      apps.push(parche);
    }
  }

  // A component supplied through `overrides` satisfies a `requires` just as a
  // parche's does — it resolves to the same virtual module. Counting it here,
  // before the check below, is what lets a project meet a contract with its own
  // components instead of having to wrap them in a manifest first.
  if (userConfig.overrides) {
    for (const key of Object.keys(userConfig.overrides)) {
      const [kind, ...rest] = key.split(':');
      if (!rest.length) continue;
      const name = rest.join('/');
      if (kind === 'elements') providedElements.add(name);
      else if (kind === 'widgets') providedWidgets.add(name);
      else if (kind === 'templates') providedTemplates.add(name);
    }
  }

  if (badPaths.length) {
    warn('Parche path problems (these modules will fail to load):\n  - ' + badPaths.join('\n  - '));
  }
  if (collisions.length) {
    warn(
      'Duplicate registrations — the last parche wins. If this is intentional, use `overrides` to make it explicit:\n  - ' +
        collisions.join('\n  - '),
    );
  }

  // Add user-defined templates
  if (userConfig.routes?.templates) {
    for (const [name, userPath] of Object.entries(userConfig.routes.templates)) {
      modules[`parche:templates/${name}`] = path.resolve(rootDir, userPath);
      providedTemplates.add(name);
    }
  }

  // Add user-defined layouts
  if (userConfig.routes?.layouts) {
    for (const [name, userPath] of Object.entries(userConfig.routes.layouts)) {
      modules[`parche:layouts/${name}`] = path.resolve(rootDir, userPath);
    }
  }

  // Themes the site lists itself (themes.available) count as provided too.
  const providedThemes = new Set<string>(['', ...contributedThemes.map((t) => t.value), ...(userConfig.themes?.available ?? []).map((t) => t.value)]);
  const widgetPropRequirements = checkRequires({ parches, providedElements, elements, providedWidgets, providedTemplates, providedThemes });

  // Apply user overrides (these take priority). A directory resolves to its
  // index.ts / index.astro; a compound element stays a named-export module,
  // so an ejected folder must keep the same named exports (the generated
  // catalog checks that where the module actually loads). Missing targets are
  // reported with attribution here rather than as a Vite resolve error later.
  const overridden: ResolvedRegistry['overridden'] = {};
  const badOverrides: string[] = [];
  if (userConfig.overrides) {
    for (const [key, overridePath] of Object.entries(userConfig.overrides)) {
      const virtualId = overrideKeyToVirtualId(key);
      const resolved = resolveOverridePath(rootDir, overridePath);
      if (!resolved) {
        badOverrides.push(`"${key}" → ${overridePath}: not found (a directory needs an index.ts or index.astro)`);
        modules[virtualId] = path.resolve(rootDir, overridePath);
        continue;
      }
      overridden[virtualId] = { original: modules[virtualId], override: resolved };
      modules[virtualId] = resolved;
      if (key.startsWith('elements:')) {
        const name = key.slice('elements:'.length).replace(/:/g, '/');
        const prim = resolveElement('override', name, { entry: resolved, parts: elements[name]?.parts });
        elements[name] = { ...prim, parts: elements[name]?.parts ?? {} };
        if (prim.compound) namedExportModules.add(virtualId);
        else namedExportModules.delete(virtualId);
      }
    }
  }
  if (badOverrides.length) {
    warn('Override path problems (these modules will fail to load):\n  - ' + badOverrides.join('\n  - '));
  }

  // The widgets that take no wrapper, read from the module each name finally
  // resolves to: an override may change it either way.
  for (const name of providedWidgets) {
    const file = modules[`parche:widgets/${name}`];
    if (file && declaresNoWrapper(file)) unwrapped.push(name);
  }

  // Resolve i18n config from Astro's official i18n settings
  const resolvedLocales = (astroI18n?.locales ?? ['en']).map((loc) =>
    typeof loc === 'string' ? loc : loc.codes[0],
  );
  const i18n = {
    locales: resolvedLocales,
    defaultLocale: astroI18n?.defaultLocale ?? 'en',
  };

  // Resolve themes: the base look plus whatever the imported parches contribute.
  // `themes.available` still overrides explicitly, for full manual control.
  const themes = userConfig.themes?.available ?? dedupeThemes([DEFAULT_THEME, ...contributedThemes]);
  const showPanel = userConfig.themes?.showPanel ?? themes.length > 1;
  const defaultTheme = userConfig.themes?.default;
  if (defaultTheme && !themes.some((t) => t.value === defaultTheme)) {
    throw new Error(
      `[parche] themes.default is "${defaultTheme}", which no imported parche provides. ` +
        `Available: ${themes.map((t) => t.value || '(base)').join(', ')}. ` +
        `Import the theme parche that contributes it, or list it in themes.available.`,
    );
  }

  // Aggregate the CSS to bundle: what the parches contribute (e.g. themes) plus
  // an optional user entry. A site ships only the CSS of the parches it imports.
  // Fonts: whatever the parches (typically themes) ask for, then the site's own.
  // Core contributes none — a typeface belongs to a visual identity, so a project
  // with no theme downloads nothing and renders in the system stack. Later wins
  // per cssVariable, so a site can replace a theme's choice. Two parches giving
  // one variable different families is said, since only the last one shows (a
  // site that imports several themes sees them all in the last theme's face);
  // the site's own choice is the fix, and is never warned about.
  const fontsByVariable = new Map<string, { font: any; from: string }>();
  const declared = [
    ...parches.flatMap((p) => (p.fonts ?? []).map((font) => ({ font, from: p.name }))),
    ...((inlineSiteConfig as any)?.fonts ?? []).map((font: any) => ({ font, from: '' })),
  ];
  for (const { font, from } of declared) {
    const prev = fontsByVariable.get(font.cssVariable);
    if (prev && from && prev.from !== from && prev.font.name !== font.name) {
      warn(
        `"${prev.from}" and "${from}" both set the font ${font.cssVariable}, with different families (${prev.font.name}, ${font.name}); ` +
          `the last one, ${font.name}, applies everywhere. Set \`fonts\` in the site config to choose.`,
      );
    }
    fontsByVariable.set(font.cssVariable, { font, from });
  }
  const fonts = [...fontsByVariable.values()].map((f) => f.font);

  const styleEntries = [...contributedStyles];
  if (userConfig.styles?.entry) {
    styleEntries.push(path.resolve(rootDir, userConfig.styles.entry));
  }

  // The parches' modules for development tools.
  const devTools: Record<string, string> = {};
  for (const parche of parches) if (parche.dev) devTools[parche.name] = parche.dev;
  // Where routed collections' entries are served; a later parche overrides an earlier one.
  const entryUrls: Record<string, string> = {};
  for (const parche of parches) Object.assign(entryUrls, parche.urls ?? {});
  // The site's own collections with pages (`collections` in the site config),
  // which core serves. A collection an app already serves cannot have both.
  const collectionPages = Object.keys(inlineSiteConfig?.collections ?? {});
  for (const name of collectionPages) {
    const owner = parches.find((p) => p.urls?.[name]);
    if (owner) {
      throw new Error(
        `[parche] collections.${name} in the site config: "${owner.name}" already serves the "${name}" collection's pages. ` +
          `Remove it from collections, or configure its pages in that parche.`,
      );
    }
    entryUrls[name] = corePath('utils/collection-urls.ts');
  }

  // Collect app resolvers
  const resolvers: Array<{ appName: string; entrypoint: string }> = [];
  for (const app of apps) {
    if (app.resolver) {
      resolvers.push({ appName: app.name, entrypoint: app.resolver.entrypoint });
    }
  }
  if (collectionPages.length) resolvers.push({ appName: 'collections', entrypoint: corePath('utils/collections.ts') });

  return {
    modules,
    namedExportModules,
    wrapper,
    tones,
    unwrapped,
    widgetPropRequirements,
    elements,
    overridden,
    inlineSiteConfig,
    i18n,
    themes,
    showPanel,
    transitions: userConfig.transitions ?? true,
    defaultTheme,
    fonts,
    headLinks,
    siteSearch,
    buildDone,
    styleEntries,
    tokenOverridesPath: path.join(srcDirAbs, 'parche.tokens.json'),
    srcDir: path.relative(rootDir, srcDirAbs).split(path.sep).join('/') || '.',
    contentGlobs,
    apps,
    resolvers,
    devTools,
    entryUrls,
  };
}

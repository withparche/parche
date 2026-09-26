/**
 * Where the project and its site config live, recorded by the integration
 * under `astro dev` only, on a global: the integration runs in Astro's
 * process and tools' routes in Vite's module runner — the same process,
 * different module graphs. Pure, so the integration can import it.
 */
export interface DevInfo {
  /** The project root, absolute. */
  root: string;
  /** The site config file, absolute, or null when the identity lives inline in `parche({ … })`. */
  siteConfigPath: string | null;
  /** 'json' when the site config is a JSON file a tool may edit; 'inline' when it lives in astro.config. */
  siteConfigMode: 'json' | 'inline';
}

const KEY = Symbol.for('parche.dev');

/** Recorded by the integration during `astro:config:setup` under `astro dev`. */
export function setDevInfo(info: DevInfo): void {
  (globalThis as { [KEY]?: DevInfo })[KEY] = info;
}

/** The project's dev info, or null outside `astro dev`. */
export function getDevInfo(): DevInfo | null {
  return (globalThis as { [KEY]?: DevInfo })[KEY] ?? null;
}

const RELOAD = Symbol.for('parche.dev.tokens');

/** Recorded by the Vite plugin under `astro dev`: reloads the token overrides CSS module. */
export function setTokenOverridesReloader(fn: () => void): void {
  (globalThis as { [RELOAD]?: () => void })[RELOAD] = fn;
}

/** A tool that wrote src/parche.tokens.json reloads its CSS now, not when the watcher gets to it. */
export function reloadTokenOverrides(): void {
  (globalThis as { [RELOAD]?: () => void })[RELOAD]?.();
}

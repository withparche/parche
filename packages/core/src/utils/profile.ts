/**
 * Where a build's time goes, for measuring Parche itself (bench/). Off unless
 * the build runs with PARCHE_PROFILE=1: `import.meta.env.PARCHE_PROFILE` is a
 * build constant, so with it off `span` is a direct call and the rest is
 * dropped as dead code. Totals are kept on a process-wide symbol, which the
 * integration prints when the build is done (it reads the symbol itself: this
 * module needs Vite's `import.meta.env`, the integration runs without it).
 */
type Totals = Map<string, { calls: number; ms: number }>;
const KEY = Symbol.for('parche.profile');
const on = import.meta.env.PARCHE_PROFILE === '1';

function totals(): Totals {
  const g = globalThis as unknown as Record<symbol, Totals | undefined>;
  return (g[KEY] ??= new Map());
}

function add(name: string, started: number) {
  const t = totals().get(name) ?? { calls: 0, ms: 0 };
  t.calls++;
  t.ms += performance.now() - started;
  totals().set(name, t);
}

/** Runs `fn` and, when profiling, adds its time (sync or awaited) to `name`. */
export function span<T>(name: string, fn: () => T): T {
  if (!on) return fn();
  const started = performance.now();
  const out = fn();
  if (out instanceof Promise) return out.finally(() => add(name, started)) as T;
  add(name, started);
  return out;
}

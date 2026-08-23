/**
 * Resolve `@/assets/...` references to built, optimized asset URLs.
 *
 * Content in Parche is data, so an image is a plain string like
 * `@/assets/images/hero.svg`. Turning that into a hashed, optimized URL needs
 * Vite, which is why it happens at render time rather than in the schema.
 *
 * `DynamicRenderer` applies this to every section's props. Anything that does
 * NOT flow through the renderer — a blog post's frontmatter image, for
 * instance — has to call this itself, or the raw string reaches the browser and
 * 404s.
 */

/**
 * Lazy glob: a loader exists for every image under `src/assets/images`, but a
 * module (and its build-time optimization) is only produced for the ones a page
 * actually references.
 */
const imageLoaders = import.meta.glob<{ default: { src: string } }>(
  '/src/assets/images/**/*.{png,jpg,jpeg,gif,svg,webp,avif}',
);

/** Plain objects and arrays are the only things worth recursing into — Dates and
 *  class instances never hold asset paths and must not be flattened. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Gather every '@/assets/…' string found at any depth. */
function collectAssetPaths(value: unknown, acc: Set<string>): void {
  if (typeof value === 'string') {
    if (value.startsWith('@/assets/')) acc.add(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectAssetPaths(item, acc);
  } else if (isPlainObject(value)) {
    for (const item of Object.values(value)) collectAssetPaths(item, acc);
  }
}

/**
 * Replace every `@/assets/…` string in `value` with its built URL.
 *
 * Structure-preserving: a subtree with no asset paths is passed through by
 * reference rather than deep-cloned, so calling this on props that contain no
 * images costs one walk and no allocation. Unknown paths are left as they are.
 */
export async function resolveAssets<T>(value: T): Promise<T> {
  const paths = new Set<string>();
  collectAssetPaths(value, paths);
  if (paths.size === 0) return value;

  const resolved = new Map<string, string>();
  await Promise.all(
    [...paths].map(async (src) => {
      const loader = imageLoaders[src.replace('@/', '/src/')];
      if (loader) {
        const mod = await loader();
        resolved.set(src, mod.default.src);
      }
    }),
  );

  function walk(input: unknown): unknown {
    if (typeof input === 'string') return resolved.get(input) ?? input;

    if (Array.isArray(input)) {
      let changed = false;
      const out = input.map((item) => {
        const next = walk(item);
        if (next !== item) changed = true;
        return next;
      });
      return changed ? out : input;
    }

    if (isPlainObject(input)) {
      let changed = false;
      const out: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(input)) {
        const next = walk(item);
        if (next !== item) changed = true;
        out[key] = next;
      }
      return changed ? out : input;
    }

    return input;
  }

  return walk(value) as T;
}

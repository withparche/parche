import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { text, isCancel } from '@clack/prompts';

/**
 * Adapting a scaffolded project to its new name.
 *
 * There are no `{{placeholders}}`: a template is a project that already runs, so
 * `npm create astro -- --template <repo>/templates/<name>` — the official path,
 * which knows nothing about Parche — produces something that builds. Renaming is
 * an enhancement this CLI adds on top, and if it fails the project still works,
 * just called what the template was called.
 *
 * The rename works by replacing the template's *own* identity, read from the one
 * file that is always readable and never TypeScript:
 *
 *   package.json name  "hello-parche"  → the old slug
 *   titleCase of it    "Hello Parche"  → the old display name
 *
 * Replacing two known strings is safer than matching structure: a regex like
 * `name:\s*'…'` would have to guess where in a config the site name lives, and
 * would break the moment the shape changed. This only needs the template to keep
 * its package name the slug of its brand name — a convention we own and test.
 */

const TEXT_SKIP = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.woff', '.woff2',
  '.ttf', '.otf', '.mp4', '.webm', '.pdf', '.lock', '.zip',
]);
const DIR_SKIP = /(^|[/\\])(node_modules|dist|\.astro|\.git)([/\\]|$)/;

export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';
}
export function titleCase(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim() || 'App';
}

export interface ProjectNames {
  /** Package name, e.g. 'my-blog'. */
  packageName: string;
  /** Display name, e.g. 'My Blog'. */
  siteName: string;
}

/** Ask what the project should be called. Returns null if cancelled. */
export async function runPrompts(
  ctx: { projectName: string; yes: boolean },
): Promise<ProjectNames | null> {
  const defaults: ProjectNames = {
    packageName: slug(ctx.projectName),
    siteName: titleCase(ctx.projectName),
  };
  if (ctx.yes) return defaults;

  const answer = await text({
    message: 'Site name',
    defaultValue: defaults.siteName,
    placeholder: defaults.siteName,
  });
  if (isCancel(answer)) return null;

  const siteName = (answer as string)?.trim() || defaults.siteName;
  return { siteName, packageName: slug(siteName) };
}

/** The identity a template ships with, derived from its package.json. */
export function readTemplateNames(dir: string): ProjectNames | null {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    const name = JSON.parse(readFileSync(pkgPath, 'utf8')).name;
    if (typeof name !== 'string' || !name) return null;
    return { packageName: name, siteName: titleCase(name) };
  } catch {
    return null;
  }
}

function walk(dir: string, fn: (file: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (DIR_SKIP.test(full)) continue;
    if (statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}

/** Replace every occurrence of `from` with `to`. Longest first, so a display
 *  name containing the slug cannot be half-replaced. */
function rename(text: string, pairs: Array<[string, string]>): string {
  let out = text;
  for (const [from, to] of [...pairs].sort((a, b) => b[0].length - a[0].length)) {
    if (from && from !== to) out = out.split(from).join(to);
  }
  return out;
}

/**
 * Rename a scaffolded project from the template's identity to the user's.
 *
 * Returns false when the template's own name could not be read — the caller
 * should carry on rather than fail, since an unrenamed project still runs.
 */
export function adaptProject(dir: string, names: ProjectNames): boolean {
  const from = readTemplateNames(dir);
  if (!from) return false;

  const pairs: Array<[string, string]> = [
    [from.siteName, names.siteName],
    [from.packageName, names.packageName],
  ];

  walk(dir, (file) => {
    if (TEXT_SKIP.has(extname(file).toLowerCase())) return;
    const before = readFileSync(file, 'utf8');
    const after = rename(before, pairs);
    if (after !== before) writeFileSync(file, after);
  });

  // package.json is patched as data rather than text: its `name` must end up
  // exactly right even if the template's differed from the convention.
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.name = names.packageName;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  return true;
}

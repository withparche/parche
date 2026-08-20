import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { text, isCancel } from '@clack/prompts';

export interface TemplateManifest {
  name?: string;
  type?: string;
  description?: string;
  prompts?: Array<{ key: string; message: string; default?: string }>;
}

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

export function readManifest(dir: string): TemplateManifest | null {
  const p = join(dir, 'parche.template.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as TemplateManifest;
  } catch {
    return null;
  }
}

/** Smart default for a known key, else the manifest's default. */
function defaultFor(key: string, manifestDefault: string | undefined, projectName: string): string {
  if (key === 'packageName') return slug(projectName);
  if (key === 'siteName') return titleCase(projectName);
  return manifestDefault ?? '';
}

/** Run the template's prompts. Returns the answers, or null if cancelled. */
export async function runPrompts(
  manifest: TemplateManifest | null,
  ctx: { projectName: string; yes: boolean },
): Promise<Record<string, string> | null> {
  const prompts = manifest?.prompts ?? [{ key: 'packageName', message: 'Package name' }];
  const values: Record<string, string> = {};

  for (const p of prompts) {
    const def = defaultFor(p.key, p.default, ctx.projectName);
    if (ctx.yes) {
      values[p.key] = def;
      continue;
    }
    const ans = await text({ message: p.message, defaultValue: def, placeholder: def });
    if (isCancel(ans)) return null;
    values[p.key] = (ans as string)?.trim() || def;
  }

  if (!values.packageName) values.packageName = slug(ctx.projectName);
  return values;
}

function walk(dir: string, fn: (file: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (DIR_SKIP.test(full)) continue;
    if (statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}

/** Replace `{{key}}` placeholders across text files, patch package.json name, delete the manifest. */
export function applyValues(dir: string, values: Record<string, string>, projectName: string): void {
  walk(dir, (file) => {
    if (TEXT_SKIP.has(extname(file).toLowerCase())) return;
    const before = readFileSync(file, 'utf8');
    const after = before.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => values[k] ?? m);
    if (after !== before) writeFileSync(file, after);
  });

  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.name = values.packageName ?? slug(projectName);
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  const manifest = join(dir, 'parche.template.json');
  if (existsSync(manifest)) rmSync(manifest);
}

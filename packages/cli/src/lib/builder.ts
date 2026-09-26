import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * What `parche astro builder` needs from the project it edits: its own Astro
 * and its own @parche/builder, resolved from the project's package.json so
 * the versions are the project's, never the CLI's.
 */
export interface BuilderProject {
  root: string;
  astro: string;
  builder: string;
}

export class BuilderSetupError extends Error {}

export function resolveBuilderProject(rootArg: string | undefined, cwd = process.cwd()): BuilderProject {
  const root = path.resolve(cwd, rootArg ?? '.');
  const pkg = path.join(root, 'package.json');
  if (!existsSync(pkg)) throw new BuilderSetupError(`No package.json in ${root}: point --root at a Parche project.`);
  const require = createRequire(pkg);
  const find = (name: string, hint: string) => {
    try {
      return pathToFileURL(require.resolve(name)).href;
    } catch {
      throw new BuilderSetupError(`${name} is not installed in ${root}. ${hint}`);
    }
  };
  return {
    root,
    astro: find('astro', 'Install the project\'s dependencies first.'),
    builder: find('@parche/builder', 'Add it as a dev dependency: `npm i -D @parche/builder` (or pnpm, yarn, bun).'),
  };
}

/** The session secrets: one for the editor's API calls, one for the preview's URLs. */
export function builderTokens(): { token: string; previewToken: string } {
  return { token: randomBytes(24).toString('base64url'), previewToken: randomBytes(18).toString('base64url') };
}

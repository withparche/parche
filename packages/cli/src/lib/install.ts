import { execSync } from 'node:child_process';
import { installDependencies } from 'nypm';

export type PM = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** Detect the package manager that invoked us (npm_config_user_agent). */
export function detectPM(): PM {
  const ua = process.env.npm_config_user_agent ?? '';
  const name = ua.split(' ')[0]?.split('/')[0];
  if (name === 'pnpm' || name === 'yarn' || name === 'bun' || name === 'npm') return name;
  return 'npm';
}

export async function installDeps(dir: string, pm: PM): Promise<void> {
  await installDependencies({ cwd: dir, packageManager: pm, silent: true });
}

export function gitInit(dir: string): void {
  try {
    execSync('git init -q && git add -A && git commit -q -m "Initial commit from Parche"', {
      cwd: dir,
      stdio: 'ignore',
    });
  } catch {
    /* git optional — ignore */
  }
}

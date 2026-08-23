import { existsSync, readdirSync } from 'node:fs';
import { resolve, basename, relative } from 'node:path';
import { intro, outro, text, select, confirm, isCancel, cancel, spinner, note } from '@clack/prompts';
import pc from 'picocolors';
import { resolveSource } from './resolve-source.js';
import { fetchTemplate } from './fetch-template.js';
import { readManifest, runPrompts, applyValues } from './template.js';
import { detectPM, installDeps, gitInit, type PM } from './install.js';

export type { PM } from './install.js';

export interface ScaffoldOptions {
  template?: string;
  dir?: string;
  pm?: PM;
  ref?: string;
  install?: boolean;
  git?: boolean;
  force?: boolean;
  yes?: boolean;
}

const bail = (msg = 'Cancelled.'): void => {
  cancel(pc.red(msg));
  process.exitCode = 1;
};

/** The shared scaffolder used by `parche astro new` and `create-parche`. */
export async function scaffold(opts: ScaffoldOptions): Promise<void> {
  intro(`${pc.bgMagenta(pc.white(' parche '))} ${pc.dim('create a Parche project')}`);

  // 1. template
  let template = opts.template;
  if (!template) {
    if (opts.yes) {
      template = 'hello-parche';
    } else {
      const picked = await select({
        message: 'Pick a template',
        options: [{ value: 'hello-parche', label: 'Hello Parche', hint: 'minimal starter' }],
      });
      if (isCancel(picked)) return bail();
      template = picked as string;
    }
  }

  // 2. target directory
  let dir = opts.dir;
  if (!dir) {
    if (opts.yes) {
      dir = `./${template.replace(/[^a-z0-9-]+/gi, '-')}`;
    } else {
      const answer = await text({
        message: 'Project directory',
        placeholder: './my-parche-site',
        defaultValue: './my-parche-site',
      });
      if (isCancel(answer)) return bail();
      dir = (answer as string) || './my-parche-site';
    }
  }
  const target = resolve(process.cwd(), dir);
  const projectName = basename(target);

  if (existsSync(target) && readdirSync(target).length > 0 && !opts.force) {
    if (opts.yes) return bail(`Directory ${dir} is not empty. Use --force to overwrite.`);
    const ok = await confirm({ message: `${pc.yellow(dir)} is not empty. Continue?`, initialValue: false });
    if (isCancel(ok) || !ok) return bail();
  }

  // 3. fetch
  const source = resolveSource(template);
  const s1 = spinner();
  s1.start('Fetching template');
  try {
    await fetchTemplate(source, target, { ref: opts.ref, force: opts.force });
  } catch (err) {
    s1.stop(pc.red('Failed to fetch template'));
    return bail(err instanceof Error ? err.message : String(err));
  }
  s1.stop('Fetched template');

  // 4. prompts (from the template's manifest)
  const values = await runPrompts(readManifest(target), { projectName, yes: !!opts.yes });
  if (values === null) return bail();

  // 5. adapt
  applyValues(target, values, projectName);

  // 6. install + git
  const pm = opts.pm ?? detectPM();
  let installed = opts.install === false ? null : false;
  if (opts.install !== false) {
    const s2 = spinner();
    s2.start(`Installing dependencies (${pm})`);
    try {
      await installDeps(target, pm);
      s2.stop('Installed dependencies');
      installed = true;
    } catch (err) {
      s2.stop(pc.yellow('Skipped install — run it yourself'));
      note(err instanceof Error ? err.message : String(err), 'install');
    }
  }
  if (opts.git !== false) gitInit(target);

  // 7. next steps
  const rel = relative(process.cwd(), target) || '.';
  // npm needs `run` for a script; the others take the name directly.
  const dev = pm === 'npm' ? 'npm run dev' : `${pm} dev`;
  const install = pm === 'npm' ? 'npm install' : `${pm} install`;
  const steps = [`${pc.cyan('cd')} ${rel}`];
  if (installed === false) steps.push(pc.cyan(install));
  steps.push(pc.cyan(dev));
  note(steps.join('\n'), 'Next steps');

  // Saying "Done!" after a step failed is how a broken project looks finished.
  outro(
    installed === false
      ? `${pc.yellow('Done, with one step left.')} Install the dependencies and you are set.`
      : `${pc.green('Done!')} Happy building with Parche.`,
  );
}

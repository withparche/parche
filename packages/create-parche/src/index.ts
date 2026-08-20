import { scaffold } from '@parche/cli/scaffold';
import type { PM } from '@parche/cli/scaffold';

// `npm create parche@latest [template] [dir] [flags]`
const argv = process.argv.slice(2);
const positionals = argv.filter((a) => !a.startsWith('-'));
const has = (f: string) => argv.includes(f);
const flag = (name: string): string | undefined => {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

await scaffold({
  template: positionals[0],
  dir: positionals[1],
  pm: flag('--pm') as PM | undefined,
  ref: flag('--ref'),
  install: !has('--no-install'),
  git: !has('--no-git'),
  force: has('--force'),
  yes: has('--yes') || has('-y'),
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { attempts, fetchTemplate } from '../src/lib/fetch-template.ts';
import { resolveSource } from '../src/lib/resolve-source.ts';

const tmp = () => mkdtempSync(join(tmpdir(), 'parche-fetch-'));

test('a local source is copied, minus the directories nobody wants', async () => {
  const from = tmp();
  writeFileSync(join(from, 'package.json'), '{}');
  mkdirSync(join(from, 'node_modules'));
  writeFileSync(join(from, 'node_modules', 'junk.js'), '');
  mkdirSync(join(from, 'dist'));

  const to = join(tmp(), 'out');
  await fetchTemplate({ type: 'local', path: from }, to);

  const got = readdirSync(to);
  assert.deepEqual(got, ['package.json']);
});

test('a missing local source fails instead of leaving an empty project', async () => {
  const to = join(tmp(), 'out');
  await assert.rejects(() => fetchTemplate({ type: 'local', path: join(tmp(), 'nope') }, to));
});

// The remote path is what regressed: giget resolves the repository, not the
// subdirectory, so a template name that does not exist downloads the tarball,
// extracts nothing and reports success. These assert the shape of the failure
// without going to the network — a name with no possible source at all.
test('an unresolvable template reports every source it tried', async () => {
  const to = join(tmp(), 'out');
  await assert.rejects(
    () => fetchTemplate(resolveSource('definitely-not-a-real-template-xyz'), to, { ref: 'no-such-ref' }),
    (err: Error) => {
      assert.match(err.message, /Could not fetch a template/);
      assert.match(err.message, /gh:withparche\/parche\/templates\/definitely-not-a-real-template-xyz/);
      // The likeliest cause is the two positional arguments being swapped.
      assert.match(err.message, /template first/);
      return true;
    },
  );
});

// The curated templates are versioned by the CLI's own release tag: a 0.7 CLI
// gets the 0.7 templates even after main has moved on. Before that tag exists
// (a checkout ahead of a release) the default branch is the fallback; a ref
// given by the user wins outright; community sources have no tag of ours.
test('curated templates are fetched at the CLI version tag, then the default branch', () => {
  assert.deepEqual(attempts('gh:withparche/parche/templates/portfolio', undefined, '0.7.0'), [
    'gh:withparche/parche/templates/portfolio#v0.7.0',
    'gh:withparche/parche/templates/portfolio',
  ]);
  assert.deepEqual(attempts('gh:withparche/parche/templates/portfolio', 'next', '0.7.0'), ['gh:withparche/parche/templates/portfolio#next']);
  assert.deepEqual(attempts('gh:withparche/templates/blog', undefined, '0.7.0'), ['gh:withparche/templates/blog']);
  assert.deepEqual(attempts('gh:withparche/parche/templates/portfolio', undefined, '0.0.0'), ['gh:withparche/parche/templates/portfolio']);
});

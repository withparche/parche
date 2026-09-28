#!/usr/bin/env node
/**
 * Two results of the same kind (build or ssr), side by side, with the change:
 *
 *   node compare.mjs results/<before>.json results/<after>.json
 */
import { readFileSync } from 'node:fs';

const [a, b] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
if (!a || !b) throw new Error('usage: node compare.mjs <before.json> <after.json>');
if (a.kind !== b.kind) throw new Error(`Different kinds: ${a.kind} vs ${b.kind}`);

const delta = (x, y) => (typeof x === 'number' && typeof y === 'number' && x !== 0 ? `${y - x >= 0 ? '+' : ''}${(((y - x) / x) * 100).toFixed(1)}%` : '');
const row = (name, x, y) => ({ metric: name, before: x, after: y, change: delta(x, y) });

const rows = [];
if (a.kind === 'build') {
  rows.push(row('wall ms', a.wallMs, b.wallMs), row('peak RSS MB', a.peakRssMb, b.peakRssMb), row('pages', a.pages, b.pages));
  for (const k of ['p50', 'p95', 'max', 'sum']) rows.push(row(`page ${k} ms`, a.pageMs[k], b.pageMs[k]));
  rows.push(row('ms per page', a.msPerPage, b.msPerPage));
} else {
  rows.push(row('cold start ms', a.cold.ms, b.cold.ms), row('first request ms', a.cold.firstRequestMs, b.cold.firstRequestMs), row('RSS MB', a.rssMb, b.rssMb));
  for (const t of Object.keys(a.targets)) {
    if (!b.targets[t]) continue;
    rows.push(row(`${t} status`, a.targets[t].status, b.targets[t].status));
    for (const k of ['p50', 'p95', 'p99']) rows.push(row(`${t} ${k} ms (1)`, a.targets[t].sequential[k], b.targets[t].sequential[k]));
    rows.push(row(`${t} p95 ms (8)`, a.targets[t].concurrent8.p95, b.targets[t].concurrent8.p95));
  }
}
console.log(`${a.kind}: ${a.sha}${a.label ? ` (${a.label})` : ''} → ${b.sha}${b.label ? ` (${b.label})` : ''}`);
console.table(rows);

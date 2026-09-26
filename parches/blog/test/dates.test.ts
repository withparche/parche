import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../src/utils/dates.ts';

// A frontmatter date without a time is UTC midnight. Formatted in the build
// machine's zone it slips a day west of Greenwich; formatted in UTC it reads
// as written. The machine is put west of Greenwich for this file.
process.env.TZ = 'America/Los_Angeles';
const date = new Date('2026-08-01');

test('the machine is west of Greenwich, so a local format would slip a day', () => {
  assert.equal(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), '31 Jul');
});

test('a date-only frontmatter date reads as written, whatever the machine zone', () => {
  assert.equal(formatDate(date, 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }), '1 Aug 2026');
  assert.equal(formatDate(date, 'es', { year: 'numeric', month: 'long', day: 'numeric' }), '1 de agosto de 2026');
});

test("a site's own time zone wins", () => {
  assert.equal(formatDate(new Date('2026-08-01T02:00:00Z'), 'en-GB', { day: 'numeric', month: 'short', timeZone: 'America/New_York' }), '31 Jul');
});

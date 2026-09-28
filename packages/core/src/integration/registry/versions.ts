/** Parse "1.2.3" (ignoring build/prerelease suffix) into a numeric tuple. */
function parseVersion(v: string): [number, number, number] | null {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v.trim().replace(/^v/, ''));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function cmpVersion(a: [number, number, number], b: [number, number, number]): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Minimal semver range check for peer requirements: `*`/``/`latest` = any;
 * caret `^x.y.z` (npm semantics, incl. 0.x pinning); tilde `~x.y.z`;
 * `>=x.y.z`; anything else is treated as an exact match. Exported for testing.
 */
export function satisfiesVersion(actual: string, range: string): boolean {
  const r = range.trim();
  if (!r || r === '*' || r === 'latest') return true;
  const a = parseVersion(actual);
  if (!a) return false;
  if (r.startsWith('>=')) {
    const b = parseVersion(r.slice(2));
    return !!b && cmpVersion(a, b) >= 0;
  }
  if (r.startsWith('^')) {
    const b = parseVersion(r.slice(1));
    if (!b || cmpVersion(a, b) < 0) return false;
    if (b[0] > 0) return a[0] === b[0];
    if (b[1] > 0) return a[0] === 0 && a[1] === b[1];
    return a[0] === 0 && a[1] === 0 && a[2] === b[2];
  }
  if (r.startsWith('~')) {
    const b = parseVersion(r.slice(1));
    return !!b && a[0] === b[0] && a[1] === b[1] && cmpVersion(a, b) >= 0;
  }
  const b = parseVersion(r);
  return !!b && cmpVersion(a, b) === 0;
}

export interface Source {
  type: 'local' | 'giget';
  /** local folder path (type: 'local') */
  path?: string;
  /** primary giget input (type: 'giget') */
  spec?: string;
  /** fallback giget input, tried if the primary 404s (community templates) */
  fallbackSpec?: string;
}

const REPO = 'withparche/parche';
const COMMUNITY = 'withparche/templates';

/**
 * Resolve a user-provided `[template]` value into a fetchable source.
 *   ./x, /x, ~x         → local folder
 *   examples/<name>     → gh:withparche/parche/examples/<name>
 *   templates/<name>    → gh:withparche/parche/templates/<name>
 *   gh:.., owner/repo   → giget passthrough
 *   <bare>              → gh:withparche/parche/templates/<bare>  (fallback: community)
 */
export function resolveSource(input: string): Source {
  const v = input.trim();

  if (v.startsWith('.') || v.startsWith('/') || v.startsWith('~')) {
    return { type: 'local', path: v };
  }
  if (v.startsWith('examples/') || v.startsWith('templates/')) {
    return { type: 'giget', spec: `gh:${REPO}/${v}` };
  }
  if (/^(gh|github|gitlab|bitbucket|https?):/.test(v) || /^[\w.-]+\/[\w.-]+/.test(v)) {
    return { type: 'giget', spec: v };
  }
  // bare name → curated repo templates, falling back to the community repo
  return {
    type: 'giget',
    spec: `gh:${REPO}/templates/${v}`,
    fallbackSpec: `gh:${COMMUNITY}/${v}`,
  };
}

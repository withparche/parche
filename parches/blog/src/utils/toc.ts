export interface TOCItem {
  depth: number;
  text: string;
  slug: string;
  children: TOCItem[];
}

/**
 * Generate a slug from heading text (same algorithm as Astro's rehype-slug).
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract a table of contents tree from rendered HTML.
 * Parses h2–h4 headings into a nested structure.
 */
export function extractTOC(html: string): TOCItem[] {
  // The id is read from the attributes wherever it sits: the anchor must be
  // the one the Markdown renderer gave the heading, not a slug of our own.
  const headingRegex = /<h([2-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const flat: { depth: number; text: string; slug: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const depth = parseInt(match[1], 10);
    const id = decodeEntities(/\bid="([^"]*)"/.exec(match[2] ?? '')?.[1] ?? '');
    const text = decodeEntities(match[3].replace(/<[^>]+>/g, '')).trim();
    const slug = id || slugify(text);
    flat.push({ depth, text, slug });
  }

  return buildTree(flat);
}

/** The few entities a heading's text carries (&amp;, &#x27;, &quot;…). */
function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, code: string) => {
    if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
    return named[code.toLowerCase()] ?? m;
  });
}

/**
 * Convert a flat heading list into a nested tree.
 */
function buildTree(headings: { depth: number; text: string; slug: string }[]): TOCItem[] {
  const root: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const heading of headings) {
    const item: TOCItem = { ...heading, children: [] };

    // Find the right parent
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  }

  return root;
}

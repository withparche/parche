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
  const headingRegex = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  const flat: { depth: number; text: string; slug: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const depth = parseInt(match[1], 10);
    const id = match[2] || '';
    // Strip HTML tags from heading content
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    const slug = id || slugify(text);
    flat.push({ depth, text, slug });
  }

  return buildTree(flat);
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

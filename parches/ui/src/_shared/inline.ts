/**
 * Inline Markdown for the short texts in page content: a title, a subtitle,
 * an item's description. Enough that an author never writes HTML to stress a
 * word or put a command in a sentence:
 *
 *   **strong**  *emphasis* or _emphasis_  `code`  [link](/path)  ==highlight==
 *   a line break as a newline ("\n" in JSON)
 *
 * No blocks (headings, lists, paragraphs): a field that needs them is a Prose
 * body, not a heading. HTML already in the text passes through untouched, so
 * existing content keeps working; the Markdown is only read between tags.
 * Pure and dependency-free: it runs in every widget render.
 */

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s: string) => escapeHtml(s).replace(/"/g, '&quot;');

/** Only these URL schemes become links; anything else stays as text. */
const safeHref = (href: string) => /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/)/i.test(href) || !/^[a-z][a-z0-9+.-]*:/i.test(href);

function transform(text: string): string {
  let s = text.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, label: string, href: string) =>
    safeHref(href) ? `<a href="${escapeAttr(href)}">${label}</a>` : whole,
  );
  s = s.replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?=\S)([^*\n]*?\S)\*(?![*\w])/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_\w])_(?=\S)([^_\n]*?\S)_(?![_\w])/g, '$1<em>$2</em>');
  s = s.replace(/==(?=\S)([^=\n]*?\S)==/g, '<mark class="parche-mark">$1</mark>');
  return s.replace(/\r?\n/g, '<br />');
}

/** Renders a content string for `set:html`: inline Markdown between any HTML tags it already has. */
export function inline(text: string | undefined | null): string | undefined {
  if (text == null || text === '') return undefined;
  if (!/[*_`[=\n]/.test(text)) return text;
  // Code first, across the whole text: nothing inside backticks is Markdown or a tag.
  const codes: string[] = [];
  const held = text.replace(/`([^`\n]+)`/g, (_, code: string) => `\u0000${codes.push(code) - 1}\u0000`);
  return held
    .split(/(<[^>]*>)/)
    .map((part, i) => (i % 2 === 1 ? part : transform(part)))
    .join('')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => `<code class="parche-code">${escapeHtml(codes[Number(i)])}</code>`);
}

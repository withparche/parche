/**
 * Block Markdown for longer texts in page content (a docs section, a legal
 * page, an article body in JSON): headings, paragraphs, lists, fenced code,
 * quotes and rules, with inline Markdown inside (see inline.ts). Headings get
 * ids from their text, so a table of contents can link to them.
 *
 * Deliberately small and dependency-free: no tables (that is the Table
 * widget), no raw HTML blocks, no nested lists. Anything it does not know is a
 * paragraph.
 */
import { inline } from './inline';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** "Install the CLI" → "install-the-cli". */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>|[*_`=[\]()]/g, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

/** Renders block Markdown to HTML and returns the headings it found. */
export function blocks(source: string | undefined | null): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  if (!source) return { html: '', headings };
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const text = (s: string) => inline(s) ?? '';

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++;
      const lang = fence[1];
      out.push(`<pre${lang ? ` data-lang="${lang}"` : ''}><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const depth = heading[1].length;
      const raw = heading[2];
      const id = slug(raw);
      headings.push({ depth, text: raw.replace(/[*_`=]/g, ''), slug: id });
      out.push(`<h${depth} id="${id}">${text(raw)}</h${depth}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr />');
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${text(quote.join(' '))}</p></blockquote>`);
      continue;
    }
    const bullet = /^[-*]\s+/;
    const numbered = /^\d+[.)]\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const marker = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        let item = lines[i++].replace(marker, '');
        // A continuation line is indented under its item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${text(item)}</li>`);
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|>|[-*]\s|\d+[.)]\s|-{3,}\s*$)/.test(lines[i])) para.push(lines[i++].trim());
    out.push(`<p>${text(para.join('\n').replace(/\n/g, ' '))}</p>`);
  }
  return { html: out.join('\n'), headings };
}

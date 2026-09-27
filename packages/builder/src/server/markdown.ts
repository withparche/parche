import { session } from './session.js';

/**
 * The site's own Markdown renderer, made once, as the content layer makes
 * it: a post's unsaved body renders exactly as the saved one will. Making it
 * loads Shiki, which takes a moment, so the integration starts it with the
 * server; a draft's first render then does not wait for it.
 */
export function markdownRenderer() {
  const s = session();
  const { markdown, image } = s;
  if (!markdown?.processor) return null;
  s.renderer ??= markdown.processor.createRenderer({
    image,
    syntaxHighlight: markdown.syntaxHighlight,
    shikiConfig: markdown.shikiConfig,
    gfm: markdown.gfm,
    smartypants: markdown.smartypants,
  });
  return s.renderer;
}

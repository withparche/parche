/** Where an ad may go in a blog view: pure, so it is tested without Astro. */

const HEADINGS = new Set(['blog/PageHeader', 'blog/ArticleHeader']);

/**
 * The placement rules for ads, checked on every view the blog renders: an
 * ad never comes before the page's title (in reading order), and never
 * between an article's title and its first paragraph (ArticleBody's
 * `before`). The in-feed slot is never first by construction (PostList
 * places it after `inFeedAfter` posts, at least one). Returns the problems.
 */
export function checkPlacements(view: { sections: any[] }): string[] {
  const problems: string[] = [];
  const hasHeading = JSON.stringify(view.sections).match(/"blog\/(PageHeader|ArticleHeader)"/) !== null;
  let seenHeading = false;
  const visit = (nodes: any[], where: string) => {
    for (const node of nodes ?? []) {
      if (HEADINGS.has(node.widget)) seenHeading = true;
      if (node.widget === 'AdSlot') {
        if (hasHeading && !seenHeading) problems.push(`${where}: an AdSlot comes before the page's title; ads never go above the H1`);
        if (where.endsWith('ArticleBody.before')) problems.push(`${where}: an AdSlot between the title and the first paragraph; place it in inArticle, after the first section`);
      }
      for (const [slot, kids] of Object.entries(node.slots ?? {})) visit(kids as any[], `${where} › ${node.widget}.${slot}`);
    }
  };
  visit(view.sections, 'sections');
  return problems;
}

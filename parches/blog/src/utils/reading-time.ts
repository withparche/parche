export interface ReadingTime {
  minutes: number;
  words: number;
}

/**
 * Strip markdown/MDX syntax to get plain text word count.
 */
function stripMarkdown(content: string): string {
  return (
    content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]*`/g, '')
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove frontmatter
      .replace(/^---[\s\S]*?---/m, '')
      // Remove MDX imports/exports
      .replace(/^(import|export)\s.*$/gm, '')
      // Remove headings markup
      .replace(/^#{1,6}\s+/gm, '')
      // Remove emphasis markers
      .replace(/[*_~]+/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Calculate reading time for markdown/MDX content.
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): ReadingTime {
  const plainText = stripMarkdown(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return { minutes, words };
}

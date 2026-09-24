import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheManifest } from '@parche/astro';

/**
 * The ui parche: the widget library. Section widgets are authored in page
 * content (`sections: [{ widget, props }]`); blog widgets are consumed by the
 * blog parche. Provides them as `parche:widgets/*`; requires elements.
 */
export default function createUI(): ParcheManifest {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const w = (file: string) => path.resolve(dir, 'widgets', file);
  const layout = (file: string) => path.resolve(dir, 'layout', file);
  return {
    name: 'ui',
    // Let Tailwind scan these components' classes, even installed from npm.
    content: [path.resolve(dir, '**/*.astro')],
    // Every page root is wrapped in Section unless the widget's meta says
    // `wrapper: false`; the tones are the values Section's `tone` accepts.
    wrapper: 'Section',
    tones: [
      { name: 'glow', label: 'Glow' },
      { name: 'gradient', label: 'Gradient' },
      { name: 'dots', label: 'Dots' },
    ],
    styles: [path.resolve(dir, 'styles/tones.css')],
    widgets: {
      Section: w('Section.astro'),
      // Layout chrome (Header/Footer), consumed by page layouts
      'layout/Header': layout('Header.astro'),
      'layout/Footer': layout('Footer.astro'),
      // Section widgets
      Announcement: w('Announcement.astro'),
      Hero: w('Hero.astro'),
      Hero2: w('Hero2.astro'),
      HeroText: w('HeroText.astro'),
      Features: w('Features.astro'),
      Features2: w('Features2.astro'),
      Features3: w('Features3.astro'),
      Content: w('Content.astro'),
      Projects: w('Projects.astro'),
      // Portfolio (resume-style, single narrow column)
      ProfileHero: w('ProfileHero.astro'),
      Prose: w('Prose.astro'),
      ResumeList: w('ResumeList.astro'),
      SkillsPills: w('SkillsPills.astro'),
      CallToAction: w('CallToAction.astro'),
      Stats: w('Stats.astro'),
      Testimonials: w('Testimonials.astro'),
      Pricing: w('Pricing.astro'),
      Steps: w('Steps.astro'),
      Steps2: w('Steps2.astro'),
      Brands: w('Brands.astro'),
      FAQs: w('FAQs.astro'),
      Contact: w('Contact.astro'),
      Note: w('Note.astro'),
      BlogLatestPosts: w('BlogLatestPosts.astro'),
      BlogHighlightedPosts: w('BlogHighlightedPosts.astro'),
      // Blog presentational widgets (consumed by the blog parche)
      'blog/AuthorCard': w('blog/AuthorCard.astro'),
      'blog/BlogList': w('blog/BlogList.astro'),
      'blog/BlogPostCard': w('blog/BlogPostCard.astro'),
      'blog/BlogPostCardGrid': w('blog/BlogPostCardGrid.astro'),
      'blog/BlogPostHeader': w('blog/BlogPostHeader.astro'),
      'blog/Breadcrumbs': w('blog/Breadcrumbs.astro'),
      'blog/CategoryNav': w('blog/CategoryNav.astro'),
      'blog/Pagination': w('blog/Pagination.astro'),
      'blog/RelatedPosts': w('blog/RelatedPosts.astro'),
      'blog/SeriesNav': w('blog/SeriesNav.astro'),
      'blog/ShareButtons': w('blog/ShareButtons.astro'),
      'blog/TOC': w('blog/TOC.astro'),
      'blog/TagCloud': w('blog/TagCloud.astro'),
      'blog/ToBlogLink': w('blog/ToBlogLink.astro'),
    },
    requires: {
      elements: ['Accordion', 'Avatar', 'Badge', 'Banner', 'Breadcrumb', 'Button', 'Card', 'Carousel', 'Checkbox', 'Collapsible', 'Container', 'Divider', 'Heading', 'Icon', 'Image', 'Input', 'Link', 'Menu', 'Pagination', 'Popover', 'Section', 'Share', 'Sheet', 'Stat', 'Tag', 'Textarea', 'Toc'],
    },
  };
}

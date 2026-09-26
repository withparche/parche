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
    // The widget a list's wrapper uses when it names none: a layout's outlet
    // declares `wrapper: { widget: 'Section', props }` to wrap its items. The
    // tones are the values Section's `tone` accepts.
    wrapper: 'Section',
    tones: [
      { name: 'glow', label: 'Glow' },
      { name: 'gradient', label: 'Gradient' },
      { name: 'dots', label: 'Dots' },
      { name: 'band', label: 'Band' },
      { name: 'surface', label: 'Surface' },
      { name: 'ruled', label: 'Ruled' },
      { name: 'ink', label: 'Ink' },
    ],
    styles: [path.resolve(dir, 'styles/tones.css'), path.resolve(dir, 'styles/text.css')],
    widgets: {
      Section: w('Section.astro'),
      Table: w('Table.astro'),
      Callout: w('Callout.astro'),
      Gallery: w('Gallery.astro'),
      SideNav: w('SideNav.astro'),
      PageHeader: w('PageHeader.astro'),
      Code: w('Code.astro'),
      OnThisPage: w('OnThisPage.astro'),
      PrevNext: w('PrevNext.astro'),
      Releases: w('Releases.astro'),
      Products: w('Products.astro'),
      Heading: w('Heading.astro'),
      StickyBar: w('StickyBar.astro'),
      Countdown: w('Countdown.astro'),
      Compare: w('Compare.astro'),
      Calculator: w('Calculator.astro'),
      Columns: w('Columns.astro'),
      Column: w('Column.astro'),
      Switch: w('Switch.astro'),
      Screenshot: w('Screenshot.astro'),
      Command: w('Command.astro'),
      Showcase: w('Showcase.astro'),
      Cases: w('Cases.astro'),
      Team: w('Team.astro'),
      Timeline: w('Timeline.astro'),
      Newsletter: w('Newsletter.astro'),
      // Layout chrome (Header/Footer), consumed by page layouts
      Header: layout('Header.astro'),
      Footer: layout('Footer.astro'),
      // Section widgets
      Announcement: w('Announcement.astro'),
      Hero: w('Hero.astro'),
      Features: w('Features.astro'),
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
      Brands: w('Brands.astro'),
      FAQs: w('FAQs.astro'),
      Contact: w('Contact.astro'),
      Note: w('Note.astro'),
      BlogLatestPosts: w('BlogLatestPosts.astro'),
      BlogHighlightedPosts: w('BlogHighlightedPosts.astro'),
      // Blog presentational widgets (consumed by the blog parche)
      'blog/BlogPostCardGrid': w('blog/BlogPostCardGrid.astro'),
      'blog/Breadcrumbs': w('blog/Breadcrumbs.astro'),
      'blog/Pagination': w('blog/Pagination.astro'),
      'blog/PostList': w('blog/PostList.astro'),
      'blog/PageHeader': w('blog/PageHeader.astro'),
      'blog/Featured': w('blog/Featured.astro'),
      'blog/TaxonomyNav': w('blog/TaxonomyNav.astro'),
      'blog/ArticleHeader': w('blog/ArticleHeader.astro'),
      'blog/ArticleBody': w('blog/ArticleBody.astro'),
      'blog/SeriesBox': w('blog/SeriesBox.astro'),
      'blog/AuthorBox': w('blog/AuthorBox.astro'),
      'blog/ReadNext': w('blog/ReadNext.astro'),
      'blog/SeriesParts': w('blog/SeriesParts.astro'),
      'blog/AuthorProfile': w('blog/AuthorProfile.astro'),
      'blog/Writers': w('blog/Writers.astro'),
      'blog/TOC': w('blog/TOC.astro'),
    },
    requires: {
      elements: ['Accordion', 'Tabs', 'Command', 'Frame', 'Placeholder', 'List', 'Table', 'Callout', 'Gallery', 'Filter', 'StickyBar', 'Countdown', 'Compare', 'Calculator', 'LoadMore', 'Form', 'Select', 'RadioGroup', 'Avatar', 'Badge', 'Banner', 'Breadcrumb', 'Button', 'Card', 'Carousel', 'Checkbox', 'Collapsible', 'Container', 'Divider', 'Heading', 'Icon', 'Image', 'Input', 'Link', 'Menu', 'Pagination', 'Popover', 'Section', 'Share', 'Sheet', 'Stat', 'Tag', 'Textarea', 'Toc'],
    },
  };
}

---
title: "Markdown elements demo post"
excerpt: "How a Markdown file becomes a post on this blog, written with every element the prose styles cover so you can check them in one place."
publishDate: "2026-04-02T00:00:00Z"
category: "Documentation"
tags:
  - markdown
  - blog
authors:
  - jane
authorName: Jane Doe
featured: false
---

A post on this blog is one Markdown file in `src/content/posts/en/`. You write
it in a text editor, and the build turns it into a page with a table of
contents, a reading time, related posts and a place in the search index. This
post explains how that happens. It also uses *every element the prose styles
cover*, once each, so it doubles as a test page: if something here looks
wrong, the styles need work, **not the content**. For the Markdown syntax
itself, the [Astro guide to Markdown](https://docs.astro.build/en/guides/markdown-content/)
is the reference.

## Start with the frontmatter

The block between the two `---` lines at the top of the file is the
frontmatter. It is data about the post, not part of the text, and the blog
checks it against a schema when the site builds. A misspelled field or a date
that is not a date stops the build with the field's name, which is better than
a post that silently disappears.

This is the frontmatter of the post you are reading:

```yaml
title: "Markdown elements demo post"
publishDate: "2026-04-02T00:00:00Z"
category: "Documentation"
tags:
  - markdown
  - blog
authors:
  - jane
featured: false
```

The fields each have one job:

| Field | What it decides |
| --- | --- |
| `title` | The heading of the page and the text of every link to it |
| `excerpt` | The summary under the title and on the post's card |
| `publishDate` | The order of the lists and the archive month |
| `category` | The one category page the post belongs to |
| `tags` | The tag pages it appears on, and part of what "Read next" compares |
| `featured` | Whether the post can take the featured spot on the index |
| `image` | The picture under the title, on the card and when the post is shared |

Only `title` and `publishDate` are required. Everything else has a sensible
default, and a post without an image, like this one, still gets a card.

## Headings become the outline

The page already has a title, rendered as the only `h1`. So the text of a post
starts at `##`, and each `##` is a section. The build reads the rendered
headings and builds the table of contents beside the text from them.

### How deep the outline goes

The table of contents takes levels two to four and nests them the way you
wrote them:

- A `##` heading is an entry at the top level.
- A `###` heading is nested under the `##` before it.
  - A `####` heading goes one level deeper still.
  - Anything below that stays in the text but out of the outline.
- The table of contents only appears when a post has at least two top-level
  sections. One section needs no map.

#### Links to a section

Astro's Markdown renderer gives each heading an `id` made from its text, and
the table of contents links to that id. Rename a heading and its link changes
with it, so an old link to that section stops landing on it. Choose section
names you will not need to change, and keep them short: they sit in a narrow
sidebar.

## Reading time is counted, not guessed

The reading time next to the date is computed from the body at build time. The
blog strips the Markdown, counts the words and divides by 200 words per minute,
then rounds.[^1] Some parts of a post do not count as reading:

1. Code blocks and inline code are removed before counting, since nobody reads
   code at the pace of prose.
2. Images are removed, alt text included.
3. Links keep their text and lose their address, so a URL does not add words.

If a post is mostly code or diagrams and the estimate feels wrong, set
`readingTime` in the frontmatter to the number of minutes you want shown, and
the blog uses yours instead.

## Images and quotes carry their own weight

An image in the body is written like a link with an exclamation mark in front.
Point it at a file in `src/assets/` with a relative path, and Astro optimizes it
at build time: it converts it to a lighter format and writes the width and
height into the markup,
so the text does not jump when the image arrives.

![An astronaut drawn in blue and orange ink, floating among drops of paint](../../../assets/images/hero-image.png)

The alt text is the image for anyone who cannot see it. Describe what is in the
picture and why it is there, not the file name. If an image is only
decoration, it probably belongs in the design rather than in the post.

Quotes work the same way: use them for words that are not yours, and say whose
they are. A blockquote is not a callout box for your own sentence.

> Write the post for the reader who arrives from a search, halfway through,
> with one question. Headings are how they find the answer.

## What happens after you publish

Once the file is saved and the site is built, the post shows up in several
places without any extra work. It is listed on the blog index and on its
category and tag pages, newest first. It goes into the RSS feed. Its body is
added to the search index, so a phrase from the middle of the text finds it.
And it appears under other posts in "Read next", where the blog scores every
pair of posts by what they share: the same category counts most, then a shared
series, then each shared tag and a shared author.

---

That is the whole path from file to page. The fastest way to learn it is to
copy this post, change the frontmatter, delete half the sections and build.
Then look at what moved.

[^1]: A very short post never shows zero: the minimum is one minute.

---
title: "Mastering landing pages: a practical guide"
excerpt: "A landing page has one job, and picking the right kind of page for that job matters more than any headline trick."
publishDate: "2026-06-15T00:00:00Z"
category: "Guides"
tags:
  - landing-pages
  - front-end
authors:
  - mark
authorName: Mark Rivera
featured: false
image:
  src: "https://images.unsplash.com/photo-1561069934-eee225952461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  alt: "Mastering landing pages: a practical guide"
---

A homepage has to serve everyone: new visitors, returning customers, job
seekers, the person looking for your phone number. A landing page serves one
visitor who arrived for one reason, usually from an ad, an email or a search
result, and asks them to do one thing. Most of what makes a landing page work
follows from taking that single job seriously.

## A landing page has one job, so remove everything else

The first decision is what to take away. AstroWind's landing pages use their
own layout: a header with the logo and nothing to navigate to, the page itself,
and a minimal footer with the legal links. No menu, no footer full of
categories, no chat widget. Every link that is not the call to action is a
way to leave.

This is also why a landing page is not a shorter homepage. It is a different
kind of page, with a different measure of success. A homepage does well when
people find what they came for. A landing page does well when people take the
one action it exists for.

## Two questions pick the page type

People argue about headlines and button colors before they have decided what
kind of page they are building. The type decides far more: whether there is a
form, whether the price is on the page, how long it runs. The landing index in
this template gets there with two questions.

1. Do you need the visitor's contact details?
2. Is the thing available today?

| Contact details? | Available today? | Build this |
| --- | --- | --- |
| Yes | Yes | [Lead generation](/landing/lead-generation): trade something concrete for an email |
| Yes | Not yet | [Pre-launch](/landing/pre-launch): one field, three honest facts, a date you will not reset |
| No | Yes | [Long-form sales](/landing/sales), [product details](/landing/product) or [subscription](/landing/subscription) |
| No | Not yet | [Click-through](/landing/click-through): supply the context the destination lacks, then hand over |

The answer is not always comfortable. If you need an email but the product
ships in three months, a lead generation page with a "download" that is really
a waitlist will feel dishonest to the visitor. A pre-launch page says what is
coming, when, and why they should care now.

## The five types the classic list leaves out

The usual list of six landing page types was written before self-serve
signup, calendar embeds and comparison pages. The template adds five more,
each built as a working page:

- **[Free trial](/landing/trial)**: the conversion is an account, not an email.
  Say up front whether a card is needed and what happens when the trial ends.
- **[Book a demo](/landing/demo)**: the only type where the form qualifies the
  visitor. Real time slots, two questions and a real person.
- **[Webinar](/landing/webinar)**: a dated page with a timezone problem. After
  the event, the same URL becomes the recording.
- **[Comparison](/landing/comparison)**: high intent from search, and strict
  honesty rules. Every claim carries a date, and the competitor wins a row.
- **[Thank-you](/landing/thank-you)**: the half of the funnel most sites skip.
  Deliver what was promised, say what comes next, ask for one more thing.

The thank-you page deserves a second look. It is where the fields you left
off the form belong. Once the conversion is safe, asking "what are you
building?" costs the visitor nothing, and it no longer stands between them
and the thing they wanted.

## The parts every type shares

The types differ in their form, their price and their length. Three things
hold across all of them.

### Message match

Visitors arrive with the words of the ad or email still in their head. The
headline should repeat them. If the ad said "Get the landing page checklist",
the page should not open with "Resources for modern marketers". Different
words feel like a wrong turn, and it is the cheapest fix there is.

### Proof you did not invent

Logos, numbers or quotes, and only real ones. The template's pages ship with
placeholders labelled as placeholders on purpose.

> Never publish invented testimonials. Ask three customers for one sentence
> each: what was hard before, what changed, and a number.

One specific sentence from a named customer does more than three generic ones.
If you have no customers yet, show partners, press or certifications instead.

### One action, repeated

Give the visitor the same action more than once: in the first screen for
those who arrive convinced, after the proof for those who needed it, and at
the end. Same destination, same label. A new offer at the bottom of the page
is a second job, and the page only has one.

## Building one from the template

Each landing page in the demo is a JSON file under
`src/content/pages/en/landing/`, a list of widgets with their props. To make
your own, copy the closest type, keep the order of its sections and replace
the copy. The closing call to action on the lead generation page looks like
this:

```json
{
  "widget": "CallToAction",
  "props": {
    "layout": "card",
    "title": "Build your own lead generation page",
    "actions": [
      { "variant": "primary", "text": "Get the template", "href": "https://github.com/arthelokyo/astrowind" }
    ]
  }
}
```

The page sets `"layout": "landing"` at the top level, which gives it the
stripped-down header and footer. The forms are templates: point them at
Netlify Forms, Formspree or your own endpoint, and the fields, consent box and
success message stay as they are.

## Measuring the one number that matters

Each type has one metric that tells you whether it works, and it is rarely
page views. A lead generation page is judged by form completions. A
click-through page by the click rate to its destination, and better, by how
the destination converts for visitors who came through it. A demo page by
booked calls that were actually attended. A trial page by signups that
became active users.

There is no universal "good" conversion rate. Cold paid traffic and a warm
email list behave very differently, so compare each page against its own
baseline. Change one thing at a time, give each change enough traffic to mean
something, and write down what you tried. After a few rounds, the notes are
worth more than any list of best practices, this one included.

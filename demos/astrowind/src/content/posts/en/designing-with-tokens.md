---
title: "Designing with tokens instead of classes"
excerpt: "A design system is a contract. Tokens are how you write it down, so a theme can change the look without touching a component."
publishDate: "2026-02-20T00:00:00Z"
category: "Guides"
tags:
  - design
  - design-system
authors:
  - jane
authorName: Jane Doe
featured: false
image:
  src: "@/assets/images/default.png"
  alt: "Designing with tokens instead of classes"
---

A button that says `bg-blue-600` has made a decision it should not have made. It chose a colour, but what it meant was "the main action". The day the brand moves from blue to green, every component that picked a shade has to be found and changed, and the ones that are missed stay blue. Tokens are the way out: a component names what a colour is for, and one place decides what that is.

This template is built that way from the ground up. Here is how the layers fit, and what it means when you change the look of a site.

## Name the role, not the colour

A token is a named value with a job. `--ds-sys-color-primary` is the colour of the main action. `--ds-sys-color-muted` is the colour of secondary text. `--ds-sys-color-surface` is the background of a card. None of those names says blue, grey or white, and that is the point: the component asks for a role and gets whatever the current theme says the role is.

In the markup this reads almost like Tailwind you already know:

```html
<a class="bg-primary text-on-primary rounded-md px-4 py-2">Get the template</a>
```

`bg-primary` is not a Tailwind palette colour. It is a bridge to the role, generated next to the tokens, so the class stays short and the decision stays in one place.

## Four layers, each with one job

The tokens are written in the W3C Design Tokens format, in three JSON files, and the CSS is generated from them. Each layer only talks to the one below it.

| Layer | Prefix | Holds |
|---|---|---|
| Reference | `--ds-ref-*` | The raw material: OKLCH colour ramps, radii, shadows, font stacks. |
| System | `--ds-sys-*` | The roles: primary, surface, border, muted, with a light and a dark value, and the type styles. |
| Component | `--ds-comp-*` | One element's own knobs, each defaulting to a system token. |
| Configuration | `--ds-conf-*` | The radius scale, motion durations, measures and section rhythm. |

Components are styled from the system layer only. They never name a reference colour, and a contract test fails the build if one does. That rule is what makes a theme possible: replace a ramp or a role, and everything that uses it follows.

## Light and dark are one decision

Each role carries both of its values. The primary text colour on a card is one token with a light value and a dark value, not two classes that every component has to remember to pair. When the page switches to dark, the roles switch, and a component written once is right in both modes.

This also keeps contrast honest. The pairs are chosen together (`primary` and `on-primary`, `surface` and `on-surface`), so the text that sits on a colour is decided by whoever decided the colour. The accessibility checks in the test suite run in both modes for that reason.

## A theme is a small file

Because components only read roles, a theme is a list of overrides scoped to an attribute:

```css
:root[data-theme="product"] {
  --ds-sys-color-surface: oklch(1 0 0);
  --ds-sys-color-primary: oklch(0.53 0.2 262);
  --ds-sys-color-border: oklch(0.905 0.008 265);
}
```

This demo ships several (Product is the default, and there is an Editorial one with a serif for reading). Each one changes surfaces, the accent, the type and the radius scale without a single component file in the diff. A theme that needs to move one element on its own can set that element's component tokens, and nothing else notices.

Colours are written in OKLCH, which is why the ramps behave. Lightness in OKLCH tracks what the eye sees, so the 600 step of every hue sits at about the same perceived weight, and swapping a blue ramp for a green one does not suddenly make the buttons harder to read.

## Where tokens stop

Tokens are not the whole design system. They say what the values are; they do not say how a pricing table is laid out or how many cards sit in a row. That lives in the widgets, which are built from elements, which are styled from tokens. Keep that order in mind when you change something:

1. To change how everything looks, change a theme.
2. To change how one element looks everywhere, change its component tokens.
3. To change what a section contains, change the page's content, not the CSS.

> If a change needs you to open more than one component file, the value you are changing probably wants to be a token.

## How to try it

In the demo's `astro.config.mjs`, change `themes.default` from `'product'` to `'editorial'` and reload: the same pages, the same content, a different system underneath. Then open `parches/themes/src/product.css`, change `--ds-sys-color-primary`, and reload. Every button, link, focus ring and chip moves with it, which is the whole argument for tokens in one edit.

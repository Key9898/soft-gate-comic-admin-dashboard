---
title: Brand color tokens (logo-aligned)
type: convention
date: 2026-07-20
tags: [brand, theme, tailwind, colors]
---

# Brand color tokens

Source of truth: website logo [`public/logo/logo.jpg`](../../public/logo/logo.jpg) + tokens in [`tailwind.config.js`](../../tailwind.config.js) / [`global.css`](../../global.css).

## Mapping

| Brand role            | Token family | Hero stop                                       | Hex                   |
| --------------------- | ------------ | ----------------------------------------------- | --------------------- |
| Letter fill / main UI | `primary-*`  | `primary-400` (logo match), `primary-600` (CTA) | `#64c8c8` / `#0e9494` |
| Burst / highlight     | `burst-*`    | `burst-600`                                     | `#e63264`             |

> **Naming:** Magenta tokens are `burst-*`, **not** `accent-*`. Tailwind v3 reserves the `accent-*` prefix for form `accent-color` utilities; a custom color named `accent` breaks `@apply` / class generation.

## Do

- Use `primary-600` / `primary-700` for buttons, links, focus rings, active nav.
- Use `burst-*` sparingly for **notification dots**, **content/promo highlights**, and `Button variant="burst"`.
- Soft washes: `bg-burst-50` / `bg-burst-100`.
- Keep default CTAs teal (`variant="primary"`).

## Don't

- Do not name a Tailwind color scale `accent` in this project.
- Do not use purple / indigo / violet / fuchsia as brand chrome.
- Do not make magenta the default CTA fill.
- Do not replace focus rings or nav active states with burst.
- Do not `@apply` opacity-modifier utilities (e.g. `bg-*/15`) in `global.css`.
- Semantic red/danger and chart secondary hues may remain.
- Do not use `logo-v2.jpg` in Admin UI — website mark is `logo.jpg`.

---
title: Brand color tokens (logo-aligned)
type: convention
date: 2026-07-20
tags: [brand, theme, tailwind, colors]
---

# Brand color tokens

Source of truth: website logo [`public/logo/logo.svg`](../../public/logo/logo.svg) + tokens in [`tailwind.config.js`](../../tailwind.config.js) / [`global.css`](../../global.css).

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
- **Light chrome:** section icon chips use `bg-primary-50 text-primary-600` (not rainbow greens/blues/yellows). Light AA floors on `--sg-*`: secondary `#374151`, muted `#4b5563`, border `#d1d5db`, border-strong `#6b7280`. Prefer `text-fg` / `text-fg-secondary` / `text-fg-muted` over raw `gray-*` + `dark:text-*` pairs.
- **Theme surfaces:** use semantic Tailwind aliases `bg-canvas`, `bg-surface`, `text-fg`, `text-fg-secondary`, `text-fg-muted`, `border-line` (backed by `--sg-*` on `html.light` / `html.dark`). Do **not** add `dark:bg-gray-*` on shell surfaces — that re-arms Chrome Auto Dark on Light.
- **Dark pastel chrome (Impl 14):** under `html.dark`, `@layer utilities` bridges remap Light `*-50/100` washes, `.badge-*`, `gray-200/300`, related hovers/rings/toast borders to dark-scale fills + light text. Prefer this over adding `dark:bg-*` pairs on every feature page. Avoid opacity washes like `bg-blue-50/50` when a plain `bg-blue-50` can be bridged.
- **Sidebar active (Light):** `bg-nav-active text-nav-active-fg` + `bg-nav-active-bar` via `--sg-nav-active-*`. Light fill = **`#64c8c8` (primary-400)** with **`#042d2d` (primary-950)** text — logo teal, visible on white. Do **not** use near-invisible `primary-50`/`primary-100` washes alone, or `dark:bg-primary-950` on the same class string (Auto Dark → near-black pill). Dark nav-active values are intentional (near-teal pill); do not “fix” them as part of pastel-bridge work.
- In `global.css` component rules, prefer `border-color: var(--sg-border)` over `@apply border-line` — Vite PostCSS can reject `@apply` of CSS-variable colors even when the utilities work in JSX.

## Don't

- Do not name a Tailwind color scale `accent` in this project.
- Do not use purple / indigo / violet / fuchsia as brand chrome.
- Do not make magenta the default CTA fill.
- Do not replace focus rings or nav active states with burst.
- Do not `@apply` opacity-modifier utilities (e.g. `bg-*/15`) in `global.css`.
- Semantic red/danger and chart secondary hues may remain.
- Do not use `logo-v2.jpg` / `logo.jpg` in Admin UI — active mark is `logo.svg`.

---
title: Brand logo theme alignment (Admin Phase 6)
type: note
date: 2026-07-20
tags: [brand, theme, tailwind, colors, logo, burst]
---

# Brand Logo Theme Alignment — Phase 6

## Context

Admin Dashboard used `logo-v2.jpg` and a **purple** primary scale — misaligned with Soft-Gate Comic website brand. Phase 6 aligns Admin to the **website logo** [`public/logo/logo.jpg`](../../public/logo/logo.jpg): teal letter fill + magenta burst, pop-art comic vibe, with Tailwind-safe token names.

## Logo color anchors

| Role                    | Sample hex | RGB                |
| ----------------------- | ---------- | ------------------ |
| Letter fill (SOFT GATE) | `#64c8c8`  | `rgb(100 200 200)` |
| Burst / starburst       | `#e63264`  | `rgb(230 50 100)`  |
| Hot pink highlight      | `#fa326e`  | `rgb(250 50 110)`  |
| Ink / outline           | `#000000`  | black              |
| Ground                  | `#ffffff`  | white              |

Theme vibe: **pop-art comic burst** — high contrast, playful.

## Canonical tokens

| Role     | Family      | Hero stop     | Hex       |
| -------- | ----------- | ------------- | --------- |
| Teal CTA | `primary-*` | `primary-600` | `#0e9494` |
| Magenta  | `burst-*`   | `burst-600`   | `#e63264` |

> Magenta is **`burst-*`**, not `accent-*`. Tailwind v3 reserves `accent-*` for form `accent-color`; a custom color named `accent` breaks `@apply` / class generation.

## Actions completed

1. Sidebar + Login → `/logo/logo.jpg`.
2. Teal `primary-50…950` in `tailwind.config.js` + `global.css` (`primary-400` = `#64c8c8`).
3. Magenta `burst-50/100/500/600/700`; `.badge-burst`; Button `variant="burst"`.
4. Purple chart/UI chrome → teal/burst.
5. Burst on notification dots + content badges.
6. No opacity modifiers inside `@apply` (use `bg-burst-100`).
7. Convention: [brand-color-tokens.md](../conventions/brand-color-tokens.md).
8. Tailwind compile verified clean.

## Related

- Phases: [implementation-phases.md](../architecture/implementation-phases.md)
- Asset: `public/logo/logo.jpg` (active); `logo-v2.jpg` unused in Admin `src/`

---
title: Light AA contrast polish (Impl 13)
type: note
date: 2026-08-11
tags: [theme, light, contrast, aa, semantic-tokens, sidebar]
---

# Impl 13 — Light AA contrast polish

## Goal

Raise Light theme readability to WCAG AA without redesigning Dark/System.

## Changes

1. **Light token floors** (`:root` / `html.light` only): secondary `#374151`, muted `#4b5563`, border `#d1d5db`, border-strong `#6b7280`.
2. **Semantic text** on feature pages: `text-fg` / `text-fg-secondary` / `text-fg-muted` instead of `text-gray-*` + `dark:text-white` pairs.
3. **Charts**: `readSgVar('--sg-border' | '--sg-text-muted')` for grid/ticks/tooltips (Dashboard + Analytics).
4. **Depth**: toolbar/table borders → `border-line` / `border-line-strong`.
5. **Pills/badges**: page-local pastels use `text-*-800`; avatar initials `text-primary-700`.
6. **Sidebar active (CSS vars, no `dark:bg-primary-950` pair):**
   - Light: `--sg-nav-active-bg: #64c8c8` (`primary-400`), fg `#042d2d` (`primary-950`), bar `#0e9494` (`primary-600`), left bar `w-1`.
   - Dark: bg `#042d2d`, fg `#5eeae6`, bar `#64c8c8`.
   - Classes: `bg-nav-active text-nav-active-fg` + `bg-nav-active-bar`.

## Correction history

1. Soft `primary-50` / `primary-100` washes were too faint on white — looked like “no active state”.
2. User requested **`primary-400`** (logo teal `#64c8c8`) so active is clearly visible and brand-matched (not near-black pill).

## Non-goals

- Dark/System full visual redesign.
- No gray `dark:bg-*` surface pairs on shell.

## Verify

- Light: active nav shows clear **primary-400** teal fill + dark text + left bar.
- Dark: active still readable on dark sidebar.
- `npm run check`

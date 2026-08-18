---
title: CSS variable theme surfaces (Impl 12)
type: note
date: 2026-08-11
tags: [theme, css-variables, light, auto-dark]
---

# Impl 12 — Semantic CSS variables for Light that stays light

## Problem

Restoring Tailwind `dark:*` surface pairs made Light look dark again under OS Dark (Chrome Auto Dark), even with `html.light` and `color-scheme: only light`.

## Solution

Theme paints through CSS variables only:

- `:root` / `html.light` → light `--sg-*` values + `color-scheme: only light`
- `html.dark` → dark `--sg-*` values + `color-scheme: dark`
- Shell/Card/Input/Header/Sidebar/Modal use `bg-canvas`, `bg-surface`, `text-fg`, `border-line` (no `dark:bg-gray-*` on those surfaces)
- MediaPicker + Analytics date chips also off gray `dark:bg` / `dark:border` pairs
- `html.dark` bridges remap common `bg-white` / `text-gray-*` for feature pages
- FOUC-first + `applyResolvedTheme` still set meta/`colorScheme` and light canvas lock
- **Vite PostCSS pitfall:** do **not** `@apply border-line` / `text-fg` in `global.css` — Vite can throw “class does not exist” even when CLI/build generate the utilities. Component classes in `global.css` use `var(--sg-*)` directly; JSX still uses `border-line` / `bg-surface` etc.

Dark/System preference API unchanged. Primary accent `dark:bg-primary-*` tints remain (not canvas/surface).

## Key files

- `global.css`, `tailwind.config.js`, `index.html`, `src/lib/theme.ts`
- Shell: AdminLayout, Sidebar, Header, Card, Input, Modal, ConfirmDialog, ProfileDropdown, LoginPage
- Convention: `wiki/conventions/brand-color-tokens.md`

## Verify

- Fresh Vite: `http://127.0.0.1:5190/global.css` → 200 (no PostCSS overlay)
- Login page paints light; OS Dark + Settings Light → light canvas/surfaces (not gray-950)
- Dark / System still switch correctly
- `npm run check` — 109 tests + build pass

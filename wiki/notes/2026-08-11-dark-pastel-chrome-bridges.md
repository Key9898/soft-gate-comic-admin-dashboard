---
title: Dark/System pastel chrome bridges (Impl 14)
type: note
date: 2026-08-11
tags: [theme, dark, system, pastel, css-bridges, badges]
---

# Impl 14 — Dark/System pastel chrome bridges

## Problem

Impl 12–13 made shell surfaces and Light text AA-safe via `--sg-*`. Feature pages still used Light pastel utilities (`bg-primary-50/100`, `bg-blue-50`, status `*-100` badges, etc.). Under `html.dark` (Dark preference or System + OS Dark) those paints stayed literal light colors → glowing chips, Schedule “today” cell almost white, Notifications All tab / badges washed out.

`html.dark` base bridges only remapped `bg-white` / `bg-gray-50/100` / gray text — not brand/status pastels.

## Solution

Extend bridges in `@layer utilities` (wins over Tailwind utilities) under `html.dark` only:

- Pastel backgrounds: `primary|blue|green|yellow|red|orange|burst` 50/100 → dark-scale fills
- Companion text: `text-*-700/800` → light tint for AA on dark washes
- Hovers: `hover:bg-primary-50`, `red/yellow/green-50`, `gray-200`
- Tracks: `bg-gray-200` / `bg-gray-300` → `--sg-border` / `--sg-border-strong`
- `ring-primary-200` → primary-600 ring
- Toast borders `border-*-200`
- `.badge-success|warning|danger|info|primary|burst` dark fills + light text

Surgical JSX: Notifications unread `bg-blue-50/50` → `bg-blue-50` so the bridge applies.

**No new `dark:*` pairs on feature JSX** (preserves Chrome Auto Dark safety on Light). **Sidebar / `--sg-nav-active-*` unchanged.**

## Key files

- [`global.css`](../../global.css) — `@layer utilities` Impl 14 block
- [`src/features/notifications/NotificationsPage.tsx`](../../src/features/notifications/NotificationsPage.tsx)

## Verify

- Dark / System (OS Dark): Schedule today cell, Notifications All + badges + unread, Dashboard chips, status badges — no light pastel blobs
- Light / System (OS Light): pastels unchanged; sidebar active still primary-400
- `npm run check`

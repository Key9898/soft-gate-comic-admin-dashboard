---
title: Default theme preference System (Impl 18)
type: note
date: 2026-08-21
tags: [theme, system, default, preference]
---

# Impl 18 — Default theme preference System

## Change

First-run and invalid/missing preference fallback is **`system`** (was `light` in Impl 15). FOUC in `index.html` matches `migrateThemePreferenceV2` in `src/lib/theme.ts`.

## Unchanged

- Light / Dark / System remain selectable.
- When `softgate_admin_theme_pref_v2=1` and a valid preference is stored, that value is kept (`light` / `dark` / `system`).
- No v3 reset. `resolveTheme`, Auto Dark, `--sg-*`, pastel bridges, sidebar nav-active untouched.

## Verify

- Cleared theme keys → Settings System; resolved appearance follows OS.
- Stored `light` / `dark` still honored.
- `npm run check`

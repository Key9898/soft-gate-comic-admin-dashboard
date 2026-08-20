---
title: Default theme preference Light (Impl 15)
type: note
date: 2026-08-19
tags: [theme, light, default, preference]
---

# Impl 15 — Default theme preference Light

## Change

First-run and invalid/missing preference fallback is **`light`** (was `system`). FOUC in `index.html` matches `migrateThemePreferenceV2` in `src/lib/theme.ts`.

## Unchanged

- Light / Dark / System remain selectable.
- When `softgate_admin_theme_pref_v2=1` and a valid preference is stored, that value is kept (`system` / `dark` included).
- No v3 reset. `resolveTheme`, Auto Dark, `--sg-*`, pastel bridges, sidebar nav-active untouched.

## Verify

- Cleared theme keys → Settings Light, `html.light`.
- Stored `system` / `dark` still honored.
- `npm run check`

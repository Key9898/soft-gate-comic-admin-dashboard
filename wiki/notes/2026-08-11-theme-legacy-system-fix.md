---
title: Theme legacy lock fix + resolved UX (Impl 10.1)
type: note
date: 2026-08-11
tags: [theme, legacy, system, ux]
---

# Impl 10.1 — Theme legacy + resolved UX

## Root causes fixed

1. Legacy `softgate_admin_theme` (old resolved auto-write) was promoted to explicit preference — users never landed on System.
2. Dark vs System with OS dark resolve identically — UI looked “broken” without explaining active appearance.

## Fix

- One-shot migration flag `softgate_admin_theme_pref_v2`: reset preference to `system`, clear legacy.
- FOUC script in `index.html` aligned.
- Settings + Profile show live `resolvedTheme` copy (“Following device (currently Dark)”, “Using Dark”).

## Key files

- `src/lib/theme.ts`, `src/lib/theme.test.ts`
- `index.html`
- `src/features/settings/SettingsPage.tsx`
- `src/components/ProfileDropdown/ProfileDropdown.tsx`

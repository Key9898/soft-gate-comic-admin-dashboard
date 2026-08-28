---
title: Theme preference Light/Dark/System (Impl 10)
type: note
date: 2026-08-11
tags: [theme, dark-mode, settings, profile, prefers-color-scheme]
---

# Impl 10 — Theme preference (Light / Dark / System)

## Decision

- Brand colors stay fixed to SoftGate logo tokens (`primary-*` / `burst-*`). Settings **Primary Color** removed.
- Theme preference is a single store: `light` | `dark` | `system` (default **system**; Impl 18, was Light in Impl 15).
- Settings Appearance select and Profile Theme options both call `setPreference` — change either updates both UIs and the live `html` class.
- System mode uses `matchMedia('(prefers-color-scheme: dark)')` and listens for OS changes.

## Storage

| Key                               | Value                         |
| --------------------------------- | ----------------------------- |
| `softgate_admin_theme_preference` | `light` \| `dark` \| `system` |
| Legacy `softgate_admin_theme`     | Migrated once, then removed   |

Resolved class (`light`/`dark` on `<html>`) is **not** written back as preference (fixes OS-follow sticky bug).

## Key files

- `src/lib/theme.ts` (+ `theme.test.ts`)
- `index.html` FOUC script
- `src/features/settings/SettingsPage.tsx`
- `src/components/ProfileDropdown/ProfileDropdown.tsx`
- `src/components/Header/Header.tsx`
- `src/lib/DataContext.tsx` (dropped `defaultTheme` / `primaryColor`)

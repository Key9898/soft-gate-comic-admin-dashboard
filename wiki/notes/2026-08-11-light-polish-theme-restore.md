---
title: Light polish + theme restore (Impl 11)
type: note
date: 2026-08-11
tags: [theme, light, contrast, brand, color-scheme]
---

# Impl 11 — Light polish + theme restore

## What shipped

1. **Light polish** — stronger contrast (`gray-600+` secondary, `gray-500` muted floor, `border-gray-400` inputs), bordered Header search, Settings section chips all `primary-50/600`, Sidebar active left bar + `primary-50`.
2. **Diagnostics removed** — `FORCE_LIGHT_ONLY`, yellow DIAG banner, `!important` paint hacks, never-match `darkMode` selector.
3. **Theme restore** — `darkMode: 'class'`; dark: pairs on shell/Card/Input/`global.css`; Settings + Profile Light/Dark/System again.
4. **Durable Auto Dark opt-out** — `html.light { color-scheme: only light }`, `html.dark { color-scheme: dark }`; FOUC + `applyResolvedTheme` sync class + meta + `style.colorScheme` (no background `!important`).

## Root cause reminder

Preference/`html.light` were correct; browser Auto Dark + dark alternate CSS made Light look dark. Fix is color-scheme opt-out + proper class darkMode, not forcing Light-only.

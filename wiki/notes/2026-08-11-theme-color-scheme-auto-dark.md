---
title: Opt out Chrome Auto Dark via color-scheme (Impl 10.2)
type: note
date: 2026-08-11
tags: [theme, color-scheme, auto-dark, chrome]
---

# Impl 10.2 — color-scheme (Light stays light)

## Problem

With `html.class=light` and correct Tailwind `dark:` gating, the UI still looked dark under OS Dark. Preference/JS were fine. Browser Auto Dark was recoloring the light page because the app never declared `color-scheme`.

## Fix

- `html.light { color-scheme: only light; }` / `html.dark { color-scheme: dark; }`
- `applyResolvedTheme()` sets `documentElement.style.colorScheme` + updates `<meta name="color-scheme">`
- FOUC script in `index.html` applies the same before paint

Light/Dark/System preference logic unchanged.

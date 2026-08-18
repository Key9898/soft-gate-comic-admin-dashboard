---
title: Light Auto Dark race fix (Impl 11.1)
type: note
date: 2026-08-11
tags: [theme, color-scheme, auto-dark, fouc]
---

# Impl 11.1 — Light stays light after Dark/System restore

## Problem

After Impl 11 restored `dark:` pairs + Dark/System, Light looked dark again under OS Dark. Preference/`html.light` were fine; Chrome Auto Dark re-engaged.

## Cause

`index.html` advertised `<meta name="color-scheme" content="light dark">` **before** FOUC resolved. Auto Dark could arm early. `color-scheme: only light` alone was not enough on this browser once dark alternate CSS existed.

## Fix

- FOUC script is the **first** executable in `<head>`; creates/updates `color-scheme` meta to `only light` or `dark` immediately (never ship static `light dark` first).
- `applyResolvedTheme` + FOUC reinforce light canvas (`#f3f4f6`) when resolved light; clear when dark.
- `html.light` / `html.light body` light canvas in CSS; Dark/System preference API unchanged.

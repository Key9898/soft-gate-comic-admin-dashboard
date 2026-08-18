---
title: Theme preference system default (brand fixed)
type: decision
date: 2026-08-11
tags: [theme, brand, adr]
---

# ADR — Theme preference vs brand color

## Context

Settings exposed Primary Color swatches and a Default Theme field that did not sync with Profile or follow the OS correctly.

## Decision

1. **Brand color** is fixed in code (logo teal / burst magenta). No runtime Primary Color picker.
2. **Theme preference** is user comfort only: Light / Dark / System, default System, single ThemeProvider store shared by Settings and Profile.

## Consequences

- White-label multi-tenant theming is out of scope until needed.
- Dark UI coverage is incremental (`dark:` on shell + shared + page titles); deeper page polish can follow.

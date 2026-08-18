---
title: SoftGate Comic display name and logo.svg (Impl 7)
type: note
date: 2026-08-10
tags: [brand, logo, naming]
---

# SoftGate Comic display name + logo.svg — Impl 7

## Display name

Human-facing brand string updated from **Soft-Gate Comic** to **SoftGate Comic** (no hyphen in SoftGate).

Kept as-is (technical identifiers): package/repo slugs (`soft-gate-comic-admin`, `@softgate/shared`), domains (`softgatecomic.com`), localStorage keys (`softgate_*`).

## Logo

- Active UI asset: [`public/logo/logo.svg`](../../public/logo/logo.svg)
- Wired in Sidebar + Login (`object-contain`, `rounded-full`)
- Transparency: SVG has **no** full-bleed white/background `rect`; fills are ink `#010101`, teal `#69c9ca`, magenta `#ee3968`, accent red `#ef4124` — background is transparent
- JPG variants (`logo.jpg`, `logo-v2.jpg`) remain in folder but unused in Admin UI

## Related

- Convention: [brand-color-tokens.md](../conventions/brand-color-tokens.md)
- Follow-up: [2026-08-10-brand-display-vs-seo-title.md](./2026-08-10-brand-display-vs-seo-title.md)

---
title: Favicon and OG head alignment with website (Impl 16)
type: note
date: 2026-08-19
tags: [brand, favicon, seo, logo]
---

# Impl 16 — Favicon and OG head alignment

Match SoftGate Comic website (`soft-gate-comic/index.html`) head wiring. No extra PWA/manifest/JSON-LD. Sidebar/Login stay on `/logo/logo.svg`.

## Head

- `rel="icon"` SVG → `/favicon/favicon.svg` (was `/vite.svg`, file missing)
- `rel="icon"` 32×32 → `/favicon/favicon-32.png`
- `rel="apple-touch-icon"` → `/favicon/apple-touch-icon.png`
- `og:image` / `twitter:image` → `/logo/logo.png` (was `/og-image.png`, file missing)

`icon-512.png` stays on disk for press/parity; not linked in `<head>` (website Press page only).

## Files

- `index.html`, `src/components/SEO/SEO.tsx`

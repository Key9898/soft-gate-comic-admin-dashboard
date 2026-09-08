---
title: Media Library square thumbs (Impl 40)
type: note
date: 2026-09-01
tags: [admin, media, ui, impl-40]
---

# Impl 40 — Media Library square thumbs

Media Library (and MediaPicker / loading skeleton) thumbs use `aspect-square` instead of a fixed `h-32` strip so five-column cards stay wide but the preview is tall enough for hover actions and covers.

## What landed

- [`src/features/media/MediaLibraryPage.tsx`](../../src/features/media/MediaLibraryPage.tsx) — thumb `aspect-square`; `object-cover` kept; footer `p-3`.
- [`src/components/MediaPicker/MediaPicker.tsx`](../../src/components/MediaPicker/MediaPicker.tsx) — same thumb + footer. Grid stays `grid-cols-4`.
- [`src/features/media/components/MediaLibraryPageSkeleton.tsx`](../../src/features/media/components/MediaLibraryPageSkeleton.tsx) — bone `aspect-square`.

Preview modal `h-64` unchanged. Upload/search/filters/checkbox unchanged.

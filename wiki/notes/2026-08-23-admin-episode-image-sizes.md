---
title: Episode imageSizes persist (Impl 27)
type: note
date: 2026-08-23
tags: [admin, episode, images, catalog, cls]
impl: 27
---

# Impl 27 — Episode `imageSizes` persist (wiki item 21)

The plan draft numbered this **Impl 26** while HEAD was Team (25). Staff roles already occupied **26**, so this batch is **Impl 27**. Wiki **item 21** is the product row; it is not Admin Impl 21 (Author CRUD).

Admin measures panel pixels on upload and writes optional `imageSizes` beside `Episode.images: string[]`. Schema stays **13**. Website repo not edited.

## Persist

- Field: `imageSizes?: Array<{ width: number; height: number } | null>`. If present, length matches `images`. Unmeasured slot = `null`. If every slot is unmeasured, **omit** the field.
- Measure `naturalWidth` / `naturalHeight` via `Image` in `src/lib/episodeImages.ts`. Failure or 0 → `null`. No staff-typed px. No fake seed px.
- Mock `mockEpisodes` keep empty `images: []` and omit `imageSizes`.
- Add/edit/bulk file path persist via `toImageSizes`. Edit deletes a prior `imageSizes` when the new list is all unmeasured.
- Reorder/remove keep width/height on the slot. No extra form UI.

## Honest portal note

Portal consume is already Impl **166**. Do not claim CLS ≤ 0.1 from this Admin persist alone.

## Out of scope

Item 13 (URL `images[]` + MM title). Coin packages. Team/RBAC. Schema 14.

---
title: In-page episode editor
type: convention
date: 2026-09-10
tags: [admin, episodes, media, catalog]
---

# In-page episode editor

Add and edit episode on dedicated desk pages, not a nested modal.

- Routes: list `/episodes`; create `/episodes/new`; edit `/episodes/:episodeId/edit`. Palette `episode.new` is `/episodes/new`. `/episodes?new=1` replaces to the create page.
- Primary ingest: on-page multi-select JPEG/PNG (`image/jpeg`, `image/jpg`, `image/png`, or those extensions when MIME is empty). 2MB each (`MAX_IMAGE_UPLOAD_BYTES`). Sequential `POST /api/media` with category `episodes` when `VITE_USE_MOCK_API=false`; mock uses `readImageAsMediaFile` data URLs. Live Media stores JPEG/PNG as same-pixel WebP (Impl 56); the display name can stay `page.png` while the object key and URL end in `.webp`. Mock keeps the original data URL.
- Number pages 1, 2, 3. Reorder and remove. Persist into `images[]` only after a durable URL returns. Never save `blob:`. Existing blob slots block Save until removed or replaced.
- Media Library stays the warehouse. **From Media** is optional (`accept="image"`). Do not make the nested picker the only upload path.
- Catalog still stores URL strings + `imageSizes`. No episode-row file column. Website repo untouched. `imageSizes` still come from `measureImageSize` on the returned URL (same pixels after ingest).
- PDF slot is gone (it never persisted). Bulk Upload (PDF split) stays mock-desk-only.

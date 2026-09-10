---
title: Live media ingest stores same-pixel WebP
type: convention
date: 2026-09-10
tags: [admin, media, webp, backend]
impl: 56
---

# Live media ingest stores same-pixel WebP

`POST /api/media` transcodes new still images to lossy WebP. Pixels stay; bytes usually shrink. Inbound 2MB is unchanged. Old R2/disk objects are not migrated. The website repo is untouched.

- After `inspectUpload` succeeds, JPEG / PNG / still WebP become `sharp(buffer).webp({ quality: 80 })` with **no** `.resize()`. Object key is `{uuid}.webp`. `MediaAsset.contentType` is `image/webp`. `size` is the transcoded byte length.
- Display **name** stays the upload name (`dot.png`). JSON `file.type` stays `'image'` (kind). There is no MIME field on the JSON `file`.
- PDF and GIF store original bytes. Animated input (`metadata.pages > 1`, including animated WebP) stores original bytes. Do not flatten.
- Sharp throw or output width/height mismatch → 400. Never persist the original JPEG labeled as WebP.
- Mock desk still stores original data URLs. Help copy must say that. SPA episode upload stays JPEG/PNG in, durable URL out; `imageSizes` still come from `measureImageSize` on that URL (same pixels).
- `sharp` lives in `backend/package.json` only, not the Vite root.

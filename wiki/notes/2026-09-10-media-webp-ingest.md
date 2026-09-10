---
title: Impl 56 same-pixel WebP ingest
type: note
date: 2026-09-10
tags: [admin, media, webp, backend, impl]
impl: 56
---

# Impl 56 — WebP ingest (same pixels)

Website repo untouched. No Prisma migrate. Inbound 2MB unchanged. No client canvas. No resolution downscale. New uploads only. Leftover Impl 51 files were not part of this work.

## Contract

Live `POST /api/media` stores JPEG/PNG/still WebP as lossy WebP at the **same pixel width/height** (`sharp` quality 80, no `.resize()`). Object key is `{uuid}.webp`. Display name stays the upload name. JSON `file.type` stays `'image'`. GIF, PDF, and animated (`pages > 1`) store original bytes. Sharp throw or dimension mismatch is 400.

Mock desk still stores original data URLs. Help copy says that.

## Backend

- `backend/src/media/transcodeUpload.ts` after `inspectUpload`.
- `sharp` in `backend/package.json` only.
- `MediaAsset.contentType` / `key` / `size` already exist.

## SPA

Episode editor and Media Library still upload JPEG/PNG. Live response URL is `.webp`. `imageSizes` still come from `measureImageSize` on that URL (same pixels).

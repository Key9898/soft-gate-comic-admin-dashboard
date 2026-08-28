---
title: SPA Media Library API wire (Impl 35)
type: note
date: 2026-08-24
tags: [admin, spa, media, api, mock]
impl: 35
---

# Impl 35 — SPA Media Library → local `/api/media`

Dormant until `.env.local` `VITE_USE_MOCK_API=false`. **Daily driver stays mock** (catalog seeds + data-URL Media Library). Do not delete mock seeds. No R2/Brevo SDK. Website untouched. No git commit in this Impl.

## Flag

- Default **`true`**: `readFileAsMediaFile` data-URLs; Vitest/e2e unchanged.
- `false`: `GET/POST/DELETE /api/media` with cookie `sg_staff`. Multipart field `file`. URLs are absolute `MEDIA_PUBLIC_BASE_URL/uploads/<uuid>.ext`. API-mode `mediaFiles` starts empty (not mock data-URLs).

## Client

- [`src/lib/api/media.ts`](../../src/lib/api/media.ts) + `apiUpload` (no JSON `Content-Type` on FormData).
- `AdminLayout` `reloadCatalog()` also `listMedia()` in one `Promise.all`.
- Media Library / MediaPicker / Profile avatar: mock path unchanged; API path uses REST. Viewer writes 403. Staff avatar is session-only (`StaffUser` has no avatar column).

## Honest leftovers

R2 driver waits on vendor keys. Settings/coins/community stay mock. Bulk episode upload mock-only. Website does not consume `/uploads`. Banana panels must stay ≤2MB JPEG/WebP. Flip the flag only after real series exist.

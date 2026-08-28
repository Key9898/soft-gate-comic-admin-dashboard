---
title: Media storage adapter (Impl 34)
type: note
date: 2026-08-24
tags: [backend, media, storage, prisma, local-disk]
impl: 34
---

# Impl 34 — Media storage adapter (local now, remote TBD)

`backend/` only. Admin SPA Media Library / MediaPicker / Profile avatar stay mock data-URL. Website repo untouched. No coins/unlock. No reader auth. **Do not implement Cloudinary or R2/S3 SDKs** — vendor is not locked; existing fake `R2_*` stay unread. The `ObjectStore` interface is the later swap point.

## Bytes vs metadata

- Bytes: `ObjectStore.put` / `delete`. Local disk under `MEDIA_UPLOAD_DIR` (default `./uploads`; `npm run dev:api` cwd is `backend/`). Keys are server-generated UUID + safe extension. Reject `..`. Public URL = `${MEDIA_PUBLIC_BASE_URL}/uploads/${key}` (default `http://localhost:3000`).
- Metadata: Prisma `MediaAsset` (`id`, unique `key`, `url`, `name`, `contentType`, enum `kind` image|pdf, `size`, `category`, `createdAt`). Never store file bytes in Postgres. No FKs from catalog columns this Impl.
- Factory `createObjectStore()` is **always local** this Impl. Do not branch on `R2_*` or Cloudinary env.

## HTTP

- `GET /api/media` — any staff; `{ files }` with `type` mapped from DB `kind`.
- `POST /api/media` — `canWriteCatalog`; multipart field `file`; optional `category`. Allowlist jpeg/png/webp/gif (max 2MB) and PDF (max 10MB). No SVG. Put object then row; if the row insert fails, delete the object.
- `DELETE /api/media/:id` — `canWriteCatalog`; delete object then row; missing object is OK; 404 only if the row is missing.
- `GET /uploads/*` — `express.static` of the local dir **only when the local-disk driver is used**. No cookie. UUID keys; anyone with the URL can fetch (local-dev tradeoff).
- No media inject → `/api/media` **503**. Catalog inject is independent; tests use `{ store, media }`.

Multer `^2` `memoryStorage` (Express 5). Do not let multer write a second copy on disk.

## Env (non-secret)

```
MEDIA_UPLOAD_DIR=./uploads
MEDIA_PUBLIC_BASE_URL=http://localhost:3000
```

No `CLOUDINARY_*`. No `VITE_*` secrets. `R2_*` / `BREVO_API_KEY` remain unread stubs.

## Admin SPA

Unchanged. `VITE_USE_MOCK_API` default true still uses data-URL Media Library. No `src/lib/api/media.ts`. DataContext does not call `/api/media`.

## Honest leftovers

- SPA still data-URL uploads.
- Catalog image fields (`Author.avatar`, `Webtoon.coverImage`, `Episode.images`) are still free strings — staff can paste a `/uploads/...` URL by hand in API mode.
- Website does not consume `/uploads`.
- Vite proxy is `/api` only, so stored URLs must stay absolute `:3000/uploads/...`.
- Remote driver waits on team lock (Cloudinary vs R2 vs S3).

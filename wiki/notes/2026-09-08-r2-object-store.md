---
title: R2 ObjectStore + public URL from key (Impl 41)
type: note
date: 2026-09-08
tags: [backend, media, r2, object-store]
impl: 41
---

# Impl 41 — R2 ObjectStore + public URL from key

`backend/` only. Admin SPA unchanged. Website repo untouched. No CORS, Brevo, Prisma schema, or live bucket. Fake `.env.example` stubs still mean **local disk**.

## Driver

- [`createObjectStore()`](../../backend/src/media/createObjectStore.ts) uses Cloudflare R2 when `isR2Configured()` is true; otherwise local disk (same as Impl 34).
- Real R2: non-empty `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` that are not `fake` (case-insensitive), plus `R2_BUCKET`, `R2_PUBLIC_BASE_URL`, and **either** `R2_ACCOUNT_ID` **or** `R2_ENDPOINT`.
- Bucket object name is `{prefix}/{uuid}{ext}` with `R2_KEY_PREFIX` default `admin`. DB `MediaAsset.key` stays `{uuid}{ext}` (no slash) so local disk `assertSafeKey` still works.
- S3 client: `region: 'auto'`, account endpoint, `requestChecksumCalculation` / `responseChecksumValidation` `WHEN_REQUIRED`. Tests mock `send`; this Impl does not prove a live bucket.
- `GET /uploads` mounts only in disk mode via [`createMediaServicesFromEnv()`](../../backend/src/media/fromEnv.ts) (used by `app.ts` fallback and `index.ts` production inject).

## Public URL

[`publicMediaFile`](../../backend/src/media/serialize.ts) rebuilds `url` from `key` + env:

- Disk: `{MEDIA_PUBLIC_BASE_URL}/uploads/{key}`
- R2: `{R2_PUBLIC_BASE_URL}/{prefix}/{key}` (no `/uploads`)

`MediaAsset.url` is still written on create (NOT NULL). Changing `R2_PUBLIC_BASE_URL` (r2.dev → custom domain) does not require a row rewrite. Catalog `Episode.images[]` strings are not migrated.

## Leftovers

- Switching an existing disk catalog to R2 does not copy bytes.
- Portal prefix / shared-bucket policy beyond `admin/` is not this Impl.
- Brevo, CORS, SPA flag, staging deploy: later Impls.

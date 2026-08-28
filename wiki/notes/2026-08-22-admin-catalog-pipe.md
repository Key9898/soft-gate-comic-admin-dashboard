---
title: Admin catalog pipe + settings blob (Impl 19)
type: note
date: 2026-08-22
tags: [admin, catalog, shared, settings, schedule, spotlight]
---

# Impl 19 — Catalog pipe + settings blob

Admin-only work from [website-integration.md](../references/website-integration.md) items **1–5, 6–13, 17–19**. Item **20** stays a ban (no `viewCount` / public `followerCount` editors). No `uploadDay`.

## Pipe

- `@softgate/shared` catalog fields match the portal: `contentRating`, `spotlight` / `spotlightOrder`, `weeklyViewCount`, `Episode.scheduledAt` / `freeAt`.
- Storage key **`softgate-shared-data`**, wrapper `{ schemaVersion: 14, data }` (was 13 at Impl 19; bumped in Impl 36). Admin no longer writes `softgate-comic-shared-data`. Load portal key first; if missing, one-shot read the old catalog key + `softgate_admin_settings`, then write the portal key.
- Portal-safe `settings` on the blob: `maintenanceMode`, `allowRegistration`, `contactEmail`, `defaultLanguage` (`en` | `mm`, never `my`). Theme, `requireEmailVerification`, and admin notification toggles stay out of that slice.

## Forms

- Webtoon modal: separate EN/MM title + description (never copy EN into `*.mm`), spotlight on/off + unique order 1–5 (cap 5 non-draft), required `contentRating`, integer `weeklyViewCount`, ISO `createdAt` / `updatedAt`, tags persist. Table stays 9 columns.
- Episode modal writes `scheduledAt` when status is `scheduled`, optional `freeAt` when premium (cleared when premium is unchecked), separate MM title, `images[]` unchanged.
- Schedule page reads/writes **episodes** only (Yangon wall clock → UTC ISO). Unschedule → `draft` + clear `scheduledAt`. `scheduledEpisodes[]` remains on `SharedData` but is unused by the UI.

## Not this Impl

Author CRUD (wiki 14) is **Impl 21+**. Genre CRUD (15) and coin packages (16) come after. Do not edit the website repo. Portal must still stop `applyCatalogSeed` and read this blob on its side.

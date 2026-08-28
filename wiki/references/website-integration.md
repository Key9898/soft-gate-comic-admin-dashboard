---
title: Website–Admin integration (pre-backend)
type: reference
date: 2026-08-21
tags: [admin, website, catalog, shared, integration, softgate]
---

# Website–Admin integration (pre-backend)

Contract for **this Admin repo** so the reader portal can consume Admin edits **before** a real backend.

Sibling portal: `soft-gate-comic` (same SNS folder).

Admin already found **7** control gaps. Portal scan confirmed those **7** and added pipe + extra fields. The numbered list below is **what Admin must do**. Items marked **(orig 1–7)** are the original seven.

## Out of scope (do not fake-merge)

- Reader comments (`softgate_comments_v1`) vs Admin comments mock
- Contact mailto vs Admin Reports queue
- Reader accounts vs Admin Users
- Real API / live payouts / fabricated MAU
- Admin theme driving the portal (portal is light-only)
- `requireEmailVerification` (portal has no verify flow)
- Hand-editing `viewCount` or public `followerCount`
- Guessed portal strip height (`h-[60vh]` / fake `aspect-ratio`)
- Required `{ src, width, height }[]` until both repos migrate `images` together later

## Website must match (not Admin UI)

Portal agents: same storage key + schema; **stop** `applyCatalogSeed` from replacing Admin catalog; **read** shared settings (`maintenanceMode`, `allowRegistration`, `contactEmail`).

---

## Admin work list (21)

### Pipe

1. Align `@softgate/shared` with the **portal** catalog types: `spotlight`, `spotlightOrder`, `weeklyViewCount`, `contentRating`, `Episode.scheduledAt`, `Episode.freeAt`, optional `Episode.imageSizes?` (item 21), bilingual `title` / `description` / author / genre names.
2. Persist catalog under portal key **`softgate-shared-data`** with the same `schemaVersion`. Stop `softgate-comic-shared-data`.
3. **(orig 7)** Put platform settings **inside** that shared blob, not only `softgate_admin_settings`.
4. **(orig 2)** Daily source of truth is **`Episode.scheduledAt`** + `status: 'scheduled'`. Do not drive the portal Daily rail from `scheduledEpisodes[]`. Do not revive series `uploadDay`.
5. Never copy English into `*.mm`. Separate EN and MM inputs.

### Webtoon form

6. **(orig 1)** Spotlight on/off + `spotlightOrder` 1–5 (unique). Portal Hero uses this (cap 5). Do not fill Hero from `viewCount` except as a last-resort empty fallback on the portal.
7. **(orig 3)** `contentRating`: `all | 13 | 16 | 18` (required). Portal age-gates **18** on Reader only.
8. `weeklyViewCount` (integer). Portal **Trending** reads this, not lifetime `viewCount`.
9. `createdAt` / `updatedAt` (ISO). Portal **New** / **Updated** sort on these. Stamp on create/publish if the editor leaves them blank.
10. Tags: already in the form — persist onto `Webtoon.tags[]` in shared data (portal hub chips → search).

### Episode form

11. **(orig 2)** When status is `scheduled`, **write `scheduledAt` onto the Episode object**. Today the datetime UI does not save onto `Episode`.
12. **(orig 4)** When premium: `coinPrice` plus optional **`freeAt`**. Portal wait-for-free: after `freeAt` the episode is actually free (guests too). No `freeAt` = coins-only.
13. Separate MM episode title. Persist `images[]` on the Episode (Reader strip). URLs stay `string[]`. Do not hide panel sizes in this item.

**21.** Optional per-panel sizes for Reader CLS. Keep `Episode.images: string[]`. Add `imageSizes?: Array<{ width: number; height: number } | null>` (same length as `images`, or omit). Measure `naturalWidth` / `naturalHeight` on upload (`Image` / `createImageBitmap`). Persist `imageSizes` beside `images`. Omit on Admin seed and old episodes whose files are gone. Do not let staff type guessed pixels. Do not required-object `{ src, width, height }[]`. Copy `imageSizes?` onto Admin `@softgate/shared` `Episode` when implementing (item 1). Admin Impl 27 persist shipped; portal consume is 166.

### New pages

14. **(orig 5)** **Authors CRUD**: `id`, `name.en`, `name.mm`, `bio`, `avatar`, `active | inactive`. Portal `/author/:id`.
15. **(orig 5)** **Genres CRUD**: `id`, `name.en`, `name.mm`, **`slug`**. Portal `/categories/:slug`. Unknown slug is genre 404.
16. **(orig 6)** **Coin packages** editor: coins, MMK, bonus, popular / bestValue. Admin editor is Impl 24. Portal `/coins` is still hardcoded (`coinData.ts`) until a website follow-up reads this list.

### Settings (toggles already exist — persist in shared)

17. **(orig 7)** Save `maintenanceMode` and `allowRegistration` in shared settings so the portal can close the site / `/register`.
18. Save `contactEmail` in shared settings (portal Contact is hardcoded `support@softgatecomic.com` until it reads this).
19. Default language code **`mm`**, not `my`. Do not send Admin theme or email-verification flags to the portal.
20. **Do not** ship editors that let staff type `viewCount` or public `followerCount` as live stats.

---

## Orig 7 → this list

| Orig                         | Admin items |
| ---------------------------- | ----------- |
| 1 Spotlight                  | 6           |
| 2 `scheduledAt` only         | 4, 11       |
| 3 Content rating             | 7           |
| 4 `freeAt`                   | 12          |
| 5 Author / Genre             | 14, 15      |
| 6 Coin packages              | 16          |
| 7 Maintenance / registration | 3, 17       |

---

## Portal already eats (no new Admin control — pipe only)

Title, cover, series/episode `status`, `isPremium`, episode `coinPrice`, genre/author **pickers** (CRUD is 14–15). After items 1–2, these show on the website without new buttons.

### Panel sizes — do not mix these three

**Portal already shipped (do not redo)**

- Impl **162**: catalog `isLoading` Reader chrome-only skeleton. No guessed strip `h-[60vh]` / fake `aspect-ratio`.
- Impl **165**: live panel 0 `eager` + `fetchPriority=high`; panel 1 eager without high; 2+ `lazy`; all successful imgs `decoding=async` + `h-auto`. Demo `/read/1/1` is 4 URL-only panels. `Episode.images` stays `string[]`.

**Portal 166 (website consume — shipped)**

- Optional `Episode.imageSizes?`. Reader sets `<img width height>` only when both values are finite integers **> 0** and the array length matches `images`. Demo **omits** the field. Catalog-wait skeleton still has no strip height.

**Admin persist (item 21 — Impl 27 shipped)**

- Measure on upload and persist `imageSizes`. Schema version stays **13** for an omitted optional field. Portal consume remains 166.

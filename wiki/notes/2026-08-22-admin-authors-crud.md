---
title: Admin Authors CRUD (Impl 21)
type: note
date: 2026-08-22
tags: [admin, authors, catalog, crud]
---

# Impl 21 — Author CRUD (wiki 14)

Admin CMS for catalog creators so portal `/author/:id` can consume bilingual name/bio, optional avatar, and `active` | `inactive` from the existing schema-13 blob. Genre CRUD, coin packages, website `applyCatalogSeed`, and social-proof editors are out of scope.

Staff auth landed in parallel as **Impl 20**, so this batch is **Impl 21**. Next catalog item is Genre CRUD (**Impl 22**).

## Surface

- Route `/authors` (eager), Sidebar after Webtoons with `PenTool` (Users stays `Users`). No keyboard shortcut (`Ctrl+A` is Analytics).
- List: EN name, MM name, status, derived series count, avatar thumb (letter fallback + sheen).
- Form: `name.en` / `name.mm`, `bio.en` / `bio.mm` (MM optional, never copy EN), optional MediaPicker avatar (`accept="image"`), status. Submit requires `name.en`.
- Helpers in `src/lib/authors.ts`: `nextAuthorId` (max numeric id + 1; ignore non-numeric), `assignedSeriesCount` (drafts count), `derivedWebtoonCount` (non-draft), `canDeleteAuthor`, `cascadeAuthor`, `syncAuthorWebtoonCounts`, `authorsForPicker`.

## Locked rules

- Edit never changes `id`. Mock `"1"`…`"5"` stay.
- Delete disabled when any series is assigned (including drafts). Staff sets `inactive`. Empty authors may be deleted. Series are not cascade-deleted.
- No `followerCount` / `viewCount` editors. Create stamps `followerCount: 0`. Edit preserves it. `webtoonCount` is derived and recomputed on Author save and on Webtoons add/edit/delete.
- Webtoons picker lists active authors plus the current series author if inactive (Ko Myint stays selectable on existing titles).
- `ActivityLog.targetType` includes `'author'`. Schema remains **13**.

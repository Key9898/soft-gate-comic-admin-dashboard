---
title: Admin Coin packages editor (Impl 24)
type: note
date: 2026-08-23
tags: [admin, coin-packages, catalog, crud]
---

# Impl 24 — Coin packages editor (wiki 16)

Admin CMS for shop SKUs so a later portal `/coins` follow-up can read `coinPackages` from the schema-13 blob. Website repo not edited. Payments, episode `coinPrice`, user `coinBalance`, and Revenue are out of scope.

## Surface

- Route `/coin-packages` (eager). Sidebar after Genres with `Coins`. No keyboard shortcut.
- List: coins, MMK, bonus, Popular / Best value badge.
- Form: integer coins ≥ 1, price ≥ 1, bonus ≥ 0 (omit when 0). Popular and Best value toggles are mutually exclusive on the row; saving clears the same flag on every other pack.
- Helpers in `src/lib/coinPackages.ts`: `nextCoinPackageId`, `parsePackInt`, validators, `withExclusiveBadges`, `toPersistedPackage`, `packageLabel`.

## Locked rules

- Persist only `id`, `coins`, `price`, `bonus?`, `popular?`, `bestValue?`. Never persist `metalClass` / `glowClass`.
- Edit never changes `id`. Mock `"1"`…`"6"` stay. New id = `String(max numeric ids + 1)`.
- Hard delete. No `inactive`. No cascade to wallets, episode prices, or Revenue.
- `ensureCoinPackages`: missing array → seed 6 packs and persist. Existing array (including empty) is kept. Schema stays **13**.
- `ActivityLog.targetType` `'coin-package'`. `targetName` is `{ en: '300 coins', mm: '' }` — never a string (string copies into both `en` and `mm`).

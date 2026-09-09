---
title: Coin packages REST + SPA
type: note
date: 2026-09-09
tags: [backend, coins, spa, impl]
impl: 44
---

# Impl 44 — Coin packages REST + SPA

Staff cookie API for shop SKUs. `VITE_USE_MOCK_API=false` uses `/api/coin-packages`. Mock seeds stay for the default desk.

- Prisma `CoinPackage` (`coins`, `price`, optional `bonus` / `popular` / `bestValue`). No `metalClass`.
- Write: Super Admin and Admin (`canWriteBusiness`). Member/Viewer GET only.
- `popular` and `bestValue` cannot both be true; setting one clears the flag on other rows.
- API ids are UUIDs. Mock ids stay numeric strings.
- Empty Railway table is success. Mock SKUs are not seeded into the shared DB.
- Website `/coins` and reader wallet are out of this Impl.

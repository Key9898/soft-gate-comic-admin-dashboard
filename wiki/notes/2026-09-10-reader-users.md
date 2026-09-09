---
title: Moderate portal ReaderUser
type: note
date: 2026-09-10
tags: [backend, users, spa, prisma, impl]
impl: 54
---

# Impl 54 — Moderate `ReaderUser` (Admin only)

Website repo untouched. No `banned`/`suspended` column. No Admin `prisma migrate` CREATE. Mock Users (ban/suspend) stay. Team `/api/staff` is not this Impl. Password reset and POST new readers are out.

## Contract

Portal readers live on shared Postgres `ReaderUser`. Coins are **read** `Wallet.balance` only. Profile PATCH is `displayName` / `email` / `bio` / `avatar` only. Takedown that leaves the portal is **hard delete** (same child order as website `deleteReaderUser`).

Copied models (no `ReaderComment.user` / `ReaderCommentLike.user` FKs): `ReaderUser`, `Wallet`, `RefreshToken`, `ReaderPasswordReset`, wallet tx/unlock, library rows, reader notifications/push/prefs. Delete comments/likes with existing `prisma.readerComment*` by `userId` / `commentId` scalars.

Empty table is `[]`. A missing table is ops (website owns CREATE), not a new Admin migrate.

## API

`GET /api/users` staff required; newest-first. `PATCH /:id` profile subset only (`trim().toLowerCase()` on email; unique clash → 400 `Email taken`). `DELETE /:id` hard delete, 404 if missing. No POST. Envelope `{ users }` / `{ user }` / `{ ok: true }`. Write = Super Admin / Admin. Never `passwordHash`. Ignore `status`.

## SPA

Mock Users ban/suspend/coins-on-user unchanged. API mode stores `readerUsers` separately (does not leak mock `User[]` via `emptyApiCatalog`). Search email + username + displayName. Dashboard mock still `${activeUsers} active`; API uses `readerUsers.length` and does not call `.status`. Live Comments labels `displayName` when the reader is loaded.

Help: live Users are portal `ReaderUser`; delete removes the reader; coins are wallet read-only; Team is still staff; Reports stay mock; staff inbox is still not the reader inbox. Ban/suspend stay mock-only.

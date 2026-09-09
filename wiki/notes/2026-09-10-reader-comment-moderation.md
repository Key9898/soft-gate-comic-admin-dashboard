---
title: Moderate portal ReaderComment
type: note
date: 2026-09-10
tags: [backend, comments, spa, prisma, impl]
impl: 53
---

# Impl 53 — Moderate `ReaderComment` (Admin only)

Website repo untouched. No `hidden` column. No Admin `prisma migrate` CREATE. Impl 54 / `ReaderUser` on the desk is out. Staff `Comment` (Impl 45) stays in schema but is not what `/api/comments` reads.

## Contract

Portal comments live on shared Postgres `ReaderComment`. Website report sets `reported: true` and still returns the row on public GET. Admin-only takedown that removes it from the portal is **hard delete** (likes cascade). Queue is **`reported` true/false**.

Copied models (no `ReaderUser` relations): `id`, `episodeKey`, `userId`, `content`, `parentId?`, `spoiler`, `reported`, `isEdited`, `createdAt`, `likes`. `ReaderCommentLike` `@@id([commentId, userId])` with `onDelete: Cascade`.

Empty table is `[]`. A missing table is ops (website owns CREATE), not a new Admin migrate.

## API

`GET /api/comments` staff required; newest-first; optional `?reported=true|false`. `PATCH /:id` `{ reported: boolean }` only. `DELETE /:id` hard delete, 404 if missing. No POST. Envelope `{ comments }` / `{ comment }` / `{ ok: true }`. Write = Super Admin / Admin.

Public record has no user snapshot JSON. List `userId` only.

## SPA

Mock Comments hide / soft-delete unchanged. API mode stores `readerComments` separately (does not assign portal rows onto mock `Comment[]`). Default filter is reported. Delete copy says permanent. Dashboard mock still says “visible comments”; API uses `readerComments.length` and does not call `.status`.

Help: live comments are portal `ReaderComment`; delete removes the reader thread; Users/Reports stay mock; staff inbox is still not the reader inbox.

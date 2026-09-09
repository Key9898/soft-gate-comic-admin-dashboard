---
title: Staff notifications inbox REST + SPA
type: note
date: 2026-09-09
tags: [backend, notifications, spa, impl]
impl: 46
---

# Impl 46 — Staff notifications inbox REST + SPA

Staff cookie API for the Admin notifications inbox (list / mark-read / mark-all-read / hard-delete). `VITE_USE_MOCK_API=false` uses `/api/notifications`. Mock seeds stay for the default desk.

- Prisma `StaffNotification` (`type`, bilingual `title`/`message`, `isRead`, optional `actionUrl`). No FKs. Table name is Prisma default `"StaffNotification"`, not website `"ReaderNotification"`.
- Write: Super Admin and Admin (`canWriteBusiness`). Member/Viewer GET only.
- Delete is hard (row gone). Second DELETE is 404. No `POST /api/notifications`.
- `PATCH /read-all` is registered before `PATCH /:id`. One-row PATCH body is `{ isRead: true }` only.
- API ids are UUIDs. Mock ids stay `n1`….
- Empty Railway table is success. Mock notifications are not seeded into the shared DB.
- Mark-read/delete on this desk does not change reader `softgate_notifications_v1` or website `/api/notifications/me`. Website repo untouched.

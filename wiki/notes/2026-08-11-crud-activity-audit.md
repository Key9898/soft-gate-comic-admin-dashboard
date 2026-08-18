---
title: CRUD activity audit coverage
type: note
date: 2026-08-11
tags: [activity-log, crud, audit, admin]
---

# Impl 9 — CRUD activity audit coverage

Admin-facing mutations now append authenticated activity entries through the shared `appendActivityLog` helper.

## Coverage

- Webtoons: create, update, and delete.
- Episodes: create, update, delete, and summarized bulk creation.
- Users: ban, unban, suspend, and unsuspend status updates.
- Comments: hide, show, and soft-delete moderation.
- Settings: platform settings save.
- Media Library: successful uploads and single/bulk deletes, one log per file.
- Profile: profile information save (`auth`) and avatar upload (`media`).

Each feature gets `setActivityLogs` from `useData()` and supplies the current authenticated admin from `useAuth()`. Target types stay within the shared `ActivityLog` union.

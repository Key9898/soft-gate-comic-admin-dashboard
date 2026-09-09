---
title: Comments moderation REST + SPA
type: note
date: 2026-09-09
tags: [backend, comments, spa, impl]
impl: 45
---

# Impl 45 — Comments moderation REST + SPA

Staff cookie API for comment hide/show/soft-delete. `VITE_USE_MOCK_API=false` uses `/api/comments`. Mock seeds stay for the default desk.

- Prisma `Comment` (`userId`, user snapshot JSON, `webtoonId`, `episodeId`, bilingual `content`, `likeCount`, `status`). No FKs to catalog or reader users.
- Write: Super Admin and Admin (`canWriteCommunity`). Member/Viewer GET only.
- Delete is soft (`status: deleted`). GET still returns deleted rows. No `POST /api/comments`.
- API ids are UUIDs. Mock ids stay numeric strings.
- Empty Railway table is success. Mock comments are not seeded into the shared DB.
- Hide/delete on this desk does not change reader `softgate_comments_v1`. Website repo untouched.

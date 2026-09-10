---
title: Impl 59 Admin About History CMS
type: note
date: 2026-09-10
tags: [admin, about, cms, impl]
impl: 59
---

# Impl 59 — Admin About History CMS

Admin-only timeline CMS. Prisma `AboutHistory` + `/api/about/history` + desk `/about`. Write is Super Admin / Admin (`canWriteSettings`). Member/Viewer GET only.

Fields: `year`, `month` (1–12), bilingual `title` and `description` (both languages trimmed non-empty; never copy EN into MM), `sortOrder`, `published`, optional `photoUrl`. A photo is allowed only on the **first published row of that year** (month ASC, then sortOrder ASC, then id). Server 400 if a photo is set on a non-first row. After a write that changes year/month/published/sortOrder, `photoUrl` is stripped from any row in that year that is no longer first.

Desk order is year ASC, then month ASC, then sortOrder (oldest at top). No fake `NEXT` year. Modal add/edit/delete (Authors pattern), not an in-page editor. Palette `history.new` is `/about?new=1` and requires settings write.

Mock seed: four current About copy lines, all 2026, months 1, 3, 6, 12, Founded first (photo-eligible), `photoUrl` null. Dedicated localStorage key `softgate_admin_about_history_v1`. Catalog `SHARED_DATA_SCHEMA_VERSION` stays 14. Live Postgres stays empty until staff saves.

This desk does **not** change reader `/about` until website 205–206. Team CMS is Impl 60. Website repo untouched.

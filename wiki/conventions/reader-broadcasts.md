---
title: Staff inbox vs reader broadcasts
type: convention
date: 2026-09-10
tags: [notifications, broadcasts, api]
impl: 51
---

# Staff inbox vs reader broadcasts

- Staff ops inbox: `/api/notifications` (Impl 46). List / mark-read / hard-delete. Not a reader send API. Do not add `POST` here.
- Reader campaigns: `/api/reader-broadcasts` (Impl 51). Staff cookie. Write = Super Admin / Admin. Delivery is the website service, not this Prisma table of reader rows.
- Proposed website contract (paths live in `backend/src/broadcasts/websiteBroadcastClient.ts` only): `GET /api/internal/readers`, `POST /api/internal/broadcasts/preview`, `POST /api/internal/broadcasts` with bilingual `title`/`message` and `campaignId`.

---

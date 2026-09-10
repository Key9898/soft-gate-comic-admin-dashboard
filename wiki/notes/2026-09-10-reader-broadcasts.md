---
title: Impl 51 reader broadcasts
type: note
date: 2026-09-10
tags: [notifications, broadcasts, impl]
impl: 51
---

# Impl 51 — Reader broadcasts on `/notifications`

Staff inbox stays Impl 46 (`GET|PATCH|DELETE /api/notifications`). Reader send is a separate prefix.

- `/notifications` keeps the staff inbox and adds compose + campaign log on the same page. Header bell stays staff unread.
- Super Admin / Admin compose bilingual EN+MM (`system` or `promotion`), pick all readers or explicit ids, preview, then send. No unsend, schedule, or draft.
- Admin stores `ReaderBroadcast` and proxies to the website service (`WEBSITE_API_BASE_URL` + `WEBSITE_SERVICE_TOKEN`). `fake`/blank is 503. Admin never writes reader inbox rows.
- Mock desk cannot send to readers. Member / Viewer may look at the campaign log only.

---

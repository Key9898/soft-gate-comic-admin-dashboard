---
title: In-page webtoon editor
type: convention
date: 2026-09-10
tags: [admin, webtoons, media, catalog]
impl: 58
---

# In-page webtoon editor

Add and edit a series on dedicated desk pages, not a nested modal.

- Routes: list `/webtoons`; create `/webtoons/new`; edit `/webtoons/:webtoonId/edit`. Palette `webtoon.new` is `/webtoons/new`. `/webtoons?new=1` replaces to the create page after auth is ready.
- Cover is **Choose from Media** (nested picker). No on-page JPEG upload on this form. Never persist `blob:` on `coverImage`. Mock picker data URLs stay allowed. Live ingest is still Impl 56 WebP when the file went through `/api/media`.
- Write path, spotlight rules, author/genre pickers, and catalog API body stay the same. After save, go back to the list.
- Delete confirm stays a modal on the list. `View Details` stays a no-op.
- Authors and genres stay list + `?new=1` modal. Episode editor is Impl 55. Website repo untouched.

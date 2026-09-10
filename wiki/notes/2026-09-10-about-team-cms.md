---
title: Impl 60 Admin About Team CMS
type: note
date: 2026-09-10
tags: [admin, about, cms, team, impl]
impl: 60
---

# Impl 60 — Admin About Team CMS

Admin-only Team CMS on the same `/about` desk, stacked under History (no tabs). Prisma `AboutTeamMember` + singleton `AboutTeamMeta` (`id=about-team`) + `/api/about/team`. Write is Super Admin / Admin (`canWriteSettings`). Member/Viewer GET only. Staff `/team` invite is unchanged. `team` palette go stays staff invite.

Members: bilingual `name` and `role` (both languages trimmed non-empty; never copy EN into MM), `sortOrder`, `published`, optional `photoUrl`. Every member may have a photo (not History first-of-year). Reject `blob:`.

Meta (done in 60): bilingual `deck` (portal `about.teamDeck`), bilingual `standInNote` (portal `about.teamStandInNote`), `standInVisible`. Bilingual required on write. GET fail-open to current portal copy until the first PATCH. No SQL seed.

Create query: History stays `/about?new=1`. Add member is `/about?new=member`. `useOpenCreateQuery` third arg defaults to `'1'` so Authors/Genres/Media/Coins/Staff invite stay intact. Palette `member.new` requires settings write.

Mock seed: four current portal people, `photoUrl` null; deck + stand-in from current EN/MM i18n; `standInVisible: true`. Key `softgate_admin_about_team_v1`. Catalog schema stays 14.

This desk does **not** change reader `/about` until website 205–207. Website repo untouched. `GET /api/about` stays website 205.

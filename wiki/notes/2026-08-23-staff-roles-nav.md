---
title: Staff roles and grouped sidebar (Impl 26)
type: note
date: 2026-08-23
tags: [admin, auth, rbac, sidebar, staff]
impl: 26
---

# Impl 26 — Staff roles + grouped sidebar

Real staff RBAC plus labeled sidebar groups (no accordions). Mail, theme, public `/register`, and the website repo stay unchanged.

## Roles

`AdminUser.role` is `super_admin | admin | member | viewer`. Catalog / auth / invite `schemaVersion` values are not bumped.

| Capability                            | Super Admin                  | Admin                                | Member | Viewer               |
| ------------------------------------- | ---------------------------- | ------------------------------------ | ------ | -------------------- |
| Catalog write                         | yes                          | yes                                  | yes    | no                   |
| Community / business / settings write | yes                          | yes                                  | no     | no                   |
| Team                                  | full except Super Admin lock | invite/remove Member and Viewer only | view   | view                 |
| Routes                                | all                          | all                                  | all    | all (learn the desk) |

Viewer mutate chrome is hidden and handlers early-return. `ProtectedRoute` stays login-only.

## Invite

Team Role `<select>` is enabled. Super Admin sees Admin / Member / Viewer. Admin sees Member / Viewer. Super Admin is never an option. `acceptInvite` writes `invite.role`. `resendInvite` copies the original role and checks the **current actor**, not `inviterId`. Copy-link honesty unchanged.

Helpers live in `src/lib/auth/staffAccess.ts`.

## Sidebar

`SIDEBAR_SECTIONS` in `src/config/index.ts`. Labels Catalog / Community / Business / Admin are non-clickable; omitted when the rail is collapsed (80px). `SIDEBAR_ITEMS` is `flatMap` of section items so Header search does not index labels. Order: Dashboard (unlabeled), then Catalog (Webtoons, Authors, Genres, Episodes, Media, Coin packages, Schedule), Community, Business, Admin (Team, Settings). 80/256 and the edge toggle are unchanged.

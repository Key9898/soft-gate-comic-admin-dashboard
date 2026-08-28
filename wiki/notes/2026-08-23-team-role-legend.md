---
title: Team Roles legend and invite confirm copy (Impl 28)
type: note
date: 2026-08-23
tags: [admin, auth, staff, team, roles]
impl: 28
---

# Impl 28 — Team Roles legend + invite confirm copy

Read-only Roles card on Team so every staff role can see what Super Admin / Admin / Member / Viewer can do, without opening Invite. Copy-link step names the invited email and role. No SMTP. No sticky CSS. No Settings permissions matrix. No role tooltips.

## Surface

- Team order: Members → Pending invites → **Roles**.
- Roles card is always in document flow. Visible to Viewer and Member (not gated on `canManageTeam`). Invite button stays Super Admin / Admin only.
- Four static rows from `STAFF_ROLE_GUIDE` in `src/lib/auth/staffAccess.ts`. Super Admin line: `Full desk, including inviting Admins. Cannot be invited or removed.` Invite-form blurbs stay `ROLE_BLURBS`.
- Copy-link: `Inviting {email} as {Role}.` above the honesty sentence. Email and role come from the persisted invite record (normalized), including Resend (`setInviteRole`).

## Out of scope

SMTP, `position: sticky`, Settings matrix, hover tooltips, accordion, theme/`dark:bg-gray-*`, website repo, invite-rule changes, unlocking `/register`.

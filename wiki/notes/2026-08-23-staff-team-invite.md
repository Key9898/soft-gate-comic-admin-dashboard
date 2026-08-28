---
title: Staff Team invites (Impl 25)
type: note
date: 2026-08-23
tags: [admin, auth, staff, invite]
impl: 25
---

# Impl 25 — Staff Team invites

Dedicated Team page so a Super Admin can invite Admin staff without reopening public `/register`. The plan draft numbered this **Impl 24**; coin packages already occupied that slot, so this batch is **Impl 25**.

## Surface

- Sidebar **Team** (`UserPlus`) immediately before Settings. Route `/team`. Not merged with Users or Settings.
- Invite modal: email + disabled Role Admin + Cancel / Invite.
- Super Admin row is permanent (no remove, not in the invite role list). Super Admin may remove an `admin`.
- Accept at `/invite/:token` (AuthLayout card, not login/register split). Password min 8. English.

## Mock-honest mail

No SMTP. Store invite token **hash** only (`softgate_admin_invites_v1`, 48h TTL). Copy the link in the modal after create/resend. Pending table has Resend / Revoke only. Copy never says “email sent.”

## Auth

- `register()` stays `STAFF_LOCKED` once any staff account exists.
- `acceptInvite` creates `role: 'admin'` with `nextStaffId`.
- Theme files untouched. Website repo untouched. Reader Users untouched. Catalog schema still 13. `ActivityLog.targetType` `'staff'` (union only).

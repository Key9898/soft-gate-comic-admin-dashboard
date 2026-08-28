---
title: Staff auth API cookie + bcrypt (Impl 31)
type: note
date: 2026-08-24
tags: [backend, auth, staff, cookie, bcrypt, impl]
impl: 31
---

# Impl 31 — Staff auth API

`backend/` only. Admin Vite mock (`sgmock:`, localStorage) is unchanged until Impl 33. Website repo untouched.

## API

- Cookie `sg_staff`: httpOnly JWT (`JWT_SECRET` fake in `.env.example`). `Secure` only when `NODE_ENV=production`.
- Passwords: bcryptjs cost 12. Invite tokens: SHA-256 hash in DB; raw token returned once (copy-link). No Brevo.
- First `POST /api/staff/register` creates `super_admin`. Later register 403. Invites: Super Admin cannot be invited or removed. RBAC matches `staffAccess.ts`.
- `.env.example` also has unused `R2_*` / `BREVO_API_KEY` stubs. Code does not read them.
- Tests use in-memory `StaffStore`. `npm run check` does not need Docker.

## Out of this Impl

Catalog CRUD (now Impl 32), Admin SPA wire, reader accounts, forgot/reset mail, field-encrypt email.

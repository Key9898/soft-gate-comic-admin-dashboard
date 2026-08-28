---
title: Staff auth (mock-honest)
type: convention
date: 2026-08-22
tags: [auth, staff, localStorage, demo]
impl: 33
---

# Staff auth (mock-honest)

Reader portal accounts (`softgate_user`, `softgate_accounts_v1`) are **not** this store. Settings `allowRegistration` is for the website, not staff signup.

## Storage

- Invites: `softgate_admin_invites_v1` (`schemaVersion` 1)
- Session: `softgate_admin_user`
- Credentials map (legacy dual-write): `softgate_admin_credentials`
- Accounts: `softgate_admin_accounts_v1` `{ schemaVersion: 1, byEmail }`
- Login verifies `account.passwordHash` (`sgmock:` digest). Missing hash = fail. Do not create a user from any email.

## Rules

- First `/register` creates `super_admin` id `1` and a session. Later `/register` is locked. Further staff join via **Team** invite (`/invite/:token`), not public register.
- Roles: `super_admin | admin | member | viewer`. Super Admin is permanent (cannot invite, demote, or delete that role). Invite dropdown: Super Admin may assign Admin / Member / Viewer; Admin may assign Member / Viewer only.
- Capability helpers: `src/lib/auth/staffAccess.ts`. Viewer can open every AdminLayout route; mutate chrome is hidden and handlers no-op. Member can write catalog only. `ProtectedRoute` is login-only.
- Invites: `softgate_admin_invites_v1`, token hash only, 48h TTL, rotate on resend. Persist chosen `admin | member | viewer`. This demo does not send email — copy the link from the modal. Copy-link names `Inviting {email} as {Role}.` from the persisted invite.
- Team **Roles** card (after Pending invites) lists Super Admin / Admin / Member / Viewer for every signed-in staff role. Not sticky. Invite form still shows one `ROLE_BLURBS` line under the Role select.
- Password minimum **8** on Register, Login form, Invite accept, Forgot/Reset forms, and Profile Security.
- Forgot: email → demo OTP `000000` (not emailed) → new password UI. **Does not** write hash. Reset token route is a shell.
- English only. No OAuth. Theme follows `html.light` / `html.dark` ops-desk photos in `public/auth/`.
- `safeReturnTo` for `state.from`. AuthLayout logo → `/login`.

## API (Impl 31 + 33)

Real staff auth lives on `backend/` (`POST /api/staff/login`, httpOnly `sg_staff` cookie, bcrypt). Catalog REST is Impl 32. The Admin SPA uses the cookie session and Team `/api/staff/*` when `VITE_USE_MOCK_API=false` (Impl 33). Media Library uses `/api/media` on that same flag (Impl 35). Default mock stays localStorage. Forgot/reset stay mock. See [notes/2026-08-24-staff-auth-api.md](../notes/2026-08-24-staff-auth-api.md) and [notes/2026-08-24-spa-catalog-api.md](../notes/2026-08-24-spa-catalog-api.md).

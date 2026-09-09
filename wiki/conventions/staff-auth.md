---
title: Staff auth (mock-honest)
type: convention
date: 2026-09-09
tags: [auth, staff, localStorage, demo, totp, sso]
impl: 48
---

# Staff auth (mock-honest)

Reader portal accounts (`softgate_user`, `softgate_accounts_v1`) are **not** this store. Settings `allowRegistration` is for the website, not staff signup.

This desk is Sign in + invite. There is no public Sign up.

## Storage

- Invites: `softgate_admin_invites_v1` (`schemaVersion` 1)
- Session: `softgate_admin_user`
- Credentials map (legacy dual-write): `softgate_admin_credentials`
- Accounts: `softgate_admin_accounts_v1` `{ schemaVersion: 1, byEmail }`
- Login verifies `account.passwordHash` (`sgmock:` digest). Missing hash = fail. Do not create a user from any email.

## Rules

- Empty staff only: `/setup` titled **Create the first Super Admin**. Success = `super_admin` id `1` and a session. Later `/setup` redirects to `/login`.
- `/register` stays as a route and redirects to `/login`. Login has no Sign Up. Empty-state CTA is **Create the first Super Admin** → `/setup`.
- Further staff join via **Team** invite (`/invite/:token`), not public register.
- Roles: `super_admin | admin | member | viewer`. Super Admin is permanent (cannot invite, demote, or delete that role). Invite dropdown: Super Admin may assign Admin / Member / Viewer; Admin may assign Member / Viewer only.
- Capability helpers: `src/lib/auth/staffAccess.ts`. Viewer can open every AdminLayout route; mutate chrome is hidden and handlers no-op. Member can write catalog only. `ProtectedRoute` is login-only.
- Invites: `softgate_admin_invites_v1`, token hash only, 48h TTL, rotate on resend. Persist chosen `admin | member | viewer`. This demo does not send email — copy the link from the modal. Copy-link names `Inviting {email} as {Role}.` from the persisted invite.
- Team **Roles** card (after Pending invites) lists Super Admin / Admin / Member / Viewer for every signed-in staff role. Not sticky. Invite form still shows one `ROLE_BLURBS` line under the Role select.
- Password minimum **8** on Setup, Login form, Invite accept, Forgot/Reset forms, and Profile Security.
- Forgot (mock): email → demo OTP `000000` (not emailed) → new password **is written**. API mode emails a reset link when mail is configured; always generic 200. `/reset-password/:token` calls `POST /api/staff/reset`.
- Optional TOTP in Profile. If enabled, Sign in asks for a 6-digit code (or backup code) before the session. Not required on first setup.
- SSO: **Continue with SSO** only when OIDC env is real. Callback logs in an existing staff email only — no JIT create. Hidden when `OIDC_*` is missing or `fake`.
- English only. Theme follows `html.light` / `html.dark` ops-desk photos in `public/auth/`.
- `safeReturnTo` for `state.from`. AuthLayout logo → `/login`.
- Split card (Impl 49): `/login` and `/setup` share one card (photo slides; card height follows the setup form). `/register` is **not** split so the login redirect can render. See [notes/2026-09-09-auth-split-setup.md](../notes/2026-09-09-auth-split-setup.md).

## API (Impl 31 + 33 + 48)

Real staff auth lives on `backend/` (`POST /api/staff/login`, httpOnly `sg_staff` cookie, bcrypt). Public `GET /api/staff/auth-options` returns `{ setupRequired, ssoEnabled }`. Canonical bootstrap is `POST /api/staff/setup`; `POST /api/staff/register` is the same alias. Catalog REST is Impl 32. The Admin SPA uses the cookie session and Team `/api/staff/*` when `VITE_USE_MOCK_API=false` (Impl 33). Media Library uses `/api/media` on that same flag (Impl 35). Default mock stays localStorage. See [notes/2026-08-24-staff-auth-api.md](../notes/2026-08-24-staff-auth-api.md), [notes/2026-08-24-spa-catalog-api.md](../notes/2026-08-24-spa-catalog-api.md), and [notes/2026-09-09-staff-setup-signin.md](../notes/2026-09-09-staff-setup-signin.md).

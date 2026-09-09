---
title: Staff Sign in, setup, invite
type: note
date: 2026-09-09
tags: [auth, staff, setup, totp, sso, impl]
impl: 48
---

# Impl 48 — Staff Sign in, setup, invite (no public Sign up)

Internal staff console: one bootstrap, then Sign in + Team invite. Reader `allowRegistration` stays portal-only. Website repo untouched. `VITE_USE_MOCK_API` stays default `true`.

- Empty staff: `/setup` **Create the first Super Admin**. After that `/setup` and `/register` go to `/login`. Login has no Sign Up.
- Public `GET /api/staff/auth-options` → `{ setupRequired, ssoEnabled }`. Canonical write `POST /api/staff/setup`; `POST /api/staff/register` is an identical alias.
- Optional env seed on API process start: `BOOTSTRAP_ADMIN_EMAIL` + `BOOTSTRAP_ADMIN_PASSWORD` (skip missing/`fake`; never reset an existing password).
- Forgot: mock OTP `000000` persists the new hash. API emails `staff-forgot.html` with `{{resetUrl}}` when Brevo is configured; always 200. `POST /api/staff/reset` consumes `StaffPasswordReset`.
- Optional TOTP on `StaffUser`. Login returns `MFA_REQUIRED` + `sg_staff_mfa` until `POST /api/staff/login/mfa`. Profile enrolls via `/api/staff/me/totp/*`. Not required on setup.
- SSO button only when `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` are real. Existing staff email only; no JIT create.
- Split card Sign in ↔ `/setup` layout is [Impl 49](2026-09-09-auth-split-setup.md).

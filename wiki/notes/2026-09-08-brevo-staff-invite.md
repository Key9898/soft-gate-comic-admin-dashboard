---
title: Brevo staff invite mail (Impl 43)
type: note
date: 2026-09-08
tags: [backend, mail, brevo, invite]
impl: 43
---

# Impl 43 — Brevo mailer + staff invite HTML

`backend/` mailer plus Help copy. Website untouched. No live Brevo in tests. No `VITE_BREVO_*`. No Brevo `templateId`.

## Send

After persist, [`createStaffRouter`](../../backend/src/auth/staffRoutes.ts) awaits `mailer.sendStaffInvite`. Response stays `{ invite, token }` (create 201, resend 200). Mail failure never 5xx.

[`isMailerConfigured`](../../backend/src/mail/mailer.ts) is true only when `BREVO_API_KEY` is non-empty and not `fake` (trim, case-insensitive) **and** `BREVO_SENDER_EMAIL` is non-empty. Otherwise skip fetch.

HTTP: `POST https://api.brevo.com/v3/smtp/email`, header `api-key`, JSON `{ sender, to, subject, htmlContent }`. Subject: `You're invited to SoftGate Comic Admin`. Sender name: `BREVO_SENDER_NAME` or `SoftGate Comic`.

Invite URL: `{ADMIN_APP_URL}/invite/{token}`. Default `ADMIN_APP_URL=http://localhost:5173` (local). Production must set the real Admin origin — never API `:3000`. Team copy-link still uses `window.location.origin`.

## HTML vs dist

Real files under [`backend/src/mail/templates/`](../../backend/src/mail/templates/). `tsc` does not copy them. Build runs [`backend/scripts/copy-mail-templates.mjs`](../../backend/scripts/copy-mail-templates.mjs) (Node `fs`, Windows-safe) after `tsc`. `staff-forgot.html` / `staff-reset.html` are placeholders only (no routes).

## Tests

Vitest pins `BREVO_API_KEY=fake`. Mailer tests mock `fetch` and restore `afterEach`. Do not log the raw token or invite URL.

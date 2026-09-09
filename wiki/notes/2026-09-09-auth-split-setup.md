---
title: Impl 49 Sign in setup split card
type: note
date: 2026-09-09
tags: [auth, ui, split, setup, impl]
impl: 49
---

# Impl 49 — Sign in ↔ `/setup` split card

Layout and motion only. Impl 48 product rules stay: no public Sign Up; `/register` still redirects to `/login`. Auth API, TOTP, SSO, forgot/reset, and invite are unchanged.

- Split card mounts Sign in (left) and Create the first Super Admin (right). The ops-desk photo slides between them (1.6s). Card height follows the setup form.
- Photo is full-bleed on one half so the covered form does not show in a gutter. The covered pane is `aria-hidden` plus `pointer-events-none` (React 18 DOM types do not include `inert`).
- After staff exists, the setup pane is not mounted; `/setup` still redirects to `/login`.
- `/register` is **not** split, so `App.tsx` `<Navigate to="/login" />` still runs via `<Outlet />`.

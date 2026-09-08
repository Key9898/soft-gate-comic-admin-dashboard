---
title: development branch split from main
type: note
date: 2026-09-08
tags: [git, branches, development]
---

# `development` branch (not an Impl)

Admin git now has a long-lived **`development`** line for leader **dev** cloud integration. See [ADR 004](../decisions/004-development-branch.md).

- `main` — Vercel Production / GitHub default. Fail-soft R2 / CORS / Brevo adapters live here (fake env stays disk / skip mail).
- `development` — same committed code at the split. Local `backend/.env` may point at Railway / R2 / Brevo. No secrets in git.
- Website `development` is a different repo. Do not merge across remotes.
- `playwright-report/` and `test-results/` are gitignored. Session logs stay in gitignored `docs/sessions/`.

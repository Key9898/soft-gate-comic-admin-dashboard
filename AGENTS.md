# AGENTS.md — SoftGate Comic Admin Operating Rules

This file is the mandatory operating contract for AI agents (and human collaborators) working on the SoftGate Comic Admin Dashboard. Read it before doing anything. These rules are **non-negotiable**.

Antigravity mirror: [`.agents/AGENTS.md`](.agents/AGENTS.md) (keep in sync with this file).

## 1. Documentation dual-track — update EVERY change

Every code edit (feature, fix, refactor, convention change — anything beyond a typo) MUST be mirrored in BOTH documentation tracks. Do not let them drift.

### Track A — `wiki/` (committed knowledge base)

Update when the change is structural, fact-based, or reusable:

- `wiki/architecture/implementation-phases.md` — append / check off the new Impl work.
- `wiki/notes/YYYY-MM-DD-short-slug.md` — dated note per change session (English slug).
- `wiki/references/` — external contracts / links when added.
- `wiki/decisions/` — ADR if a non-obvious decision was made (`NNN-short-slug.md`).
- `wiki/conventions/` — if a new UI/code convention is established.
- `wiki/README.md` — update the index when notes or sections are added.
- `wiki/03-folder-map.md` — update if a new folder/module was created or removed.

### Track B — `docs/sessions/` (gitignored session log)

After every work block create or update:

- `docs/sessions/YYYY-MM-DD-session-summary.md` — what was done, files changed, verify steps, follow-ups.

The `wiki/notes/` file is the cleaned-up committed mirror; `docs/sessions/` is the local hand-off artifact.

**Do not commit one without the other.** If a change is too small to be worth a session note, it is too small to push.

## 2. Lark Task hand-off — emit on every summary

At the end of every work summary, produce a **copy-ready** block for the Lark Task tracker:

1. A concise **Title** (one line).
2. A **Notes** body — what changed, verification, follow-ups.

Use plain `-` bullets only (no `[x]` / `[ ]` checkboxes).

```
=== LARK TASK — COPY FROM BELOW THIS LINE ===
Title: <short summary>

Notes:
- <what changed>
- <files / areas touched>
- Verify: `npm run check`
- Follow-up: <next step or none>
=== LARK TASK — COPY UNTIL ABOVE THIS LINE ===
```

Never skip the Lark block. The user pastes it into Lark manually.

## 3. Quality bar

- **`npm run check` must pass** before declaring done (lint + format:check + vitest run + build). Do not skip with `--no-verify` casually.
- Strict TypeScript / ESLint as configured in the repo.
- Prefer brand tokens (`primary-*`, `burst-*`) — see `wiki/conventions/brand-color-tokens.md`. Do not name a Tailwind color scale `accent` (clashes with form `accent-color`).
- Theme surfaces: JSX may use `bg-canvas` / `border-line` / `text-fg`; in `global.css` `@apply`, use `var(--sg-*)` instead (Vite PostCSS can reject `@apply border-line`).
- No comments that restate the code. Wiki carries rationale.
- Never commit secrets. `.env.example` stays stub-only.
- **Never push or amend unless explicitly asked** (this git-hygiene task is an explicit push of `main` and `development`).

## Git branches

- `main` — GitHub default and Vercel Production.
- `development` — long-lived leader **dev** cloud integration line (same committed code as `main` at the split). Not GitFlow `develop`. Secrets only in gitignored `backend/.env`. See [ADR 004](wiki/decisions/004-development-branch.md).
- Short-lived `feat|fix|chore/<scope>`. Cloud work forks from `development`; mock-only UI may fork from `main`.
- Do not edit the website/reader-portal repo. Do not merge Admin `development` with the website repo.

## Quick orientation

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx` → `ProtectedRoute` → `AdminLayout` → feature pages.
- Features: `src/features/<name>/` (webtoons, episodes, users, comments, …).
- Shared mocks/types: `@softgate/shared` → `packages/shared/src`.
- API: sibling `backend/` (npm workspace). `npm run dev:api` needs `DATABASE_URL` and `JWT_SECRET`. Staff routes `/api/staff` (Impl 31 + 48): public `GET /auth-options`, bootstrap `POST /setup` (`/register` alias), cookie login, forgot/reset, optional TOTP, env-gated SSO (existing email only). Catalog REST `/api/authors|genres|webtoons|episodes`. Coin packages REST `/api/coin-packages` (Impl 44; write = super*admin/admin). Comments REST `/api/comments` (Impl 45; write = super_admin/admin; soft-delete). Notifications REST `/api/notifications` (Impl 46; write = super_admin/admin; hard-delete). Platform settings REST `/api/settings` (Impl 47; write = super_admin/admin; four portal-safe fields). Media REST `/api/media` (Impl 34 local disk; Impl 41 Cloudflare R2 when real env is set; `R2*\*=fake`stays disk). CORS/cookie from env (Impl 42):`CORS_ORIGINS`, `COOKIE_SAMESITE`, `COOKIE_SECURE`. Invite mail (Impl 43): in-repo HTML via Brevo when real env is set; `BREVO_API_KEY=fake`skips send;`ADMIN_APP_URL`for email links (default`http://localhost:5173`). Admin SPA mock by default; `VITE_USE_MOCK_API=false`uses cookie + catalog REST (Impl 33), media REST (Impl 35), coin packages REST (Impl 44), comments REST (Impl 45), notifications REST (Impl 46), and settings REST (Impl 47). Empty staff uses`/setup`; `/register`redirects to`/login`; no public Sign up. Auth split (Impl 49): `/login`and`/setup`share the split card (photo slides);`/register`is not split. Do not put Express in Vite`src/`. Do not edit the website/reader-portal repo.
- Data: `DataContext` + localStorage mock by default. When `VITE_USE_MOCK_API=false`, catalog + staff + media + coin packages + comments + notifications + the four portal-safe settings go through `src/lib/api/` (`credentials: 'include'`). Users/reports stay mock. Theme and other Settings controls stay local.
- Brand mark: `public/logo/logo.svg` (UI). Favicon head: `public/favicon/favicon.svg` + `favicon-32.png` + `apple-touch-icon.png`. OG: `public/logo/logo.png`.

## Verification commands

| Check                | Command                                               |
| -------------------- | ----------------------------------------------------- |
| Full gate (pre-push) | `npm run check` (includes `npm run check -w backend`) |
| Dev server           | `npm run dev`                                         |
| API health process   | `npm run dev:api`                                     |
| Lint + fix           | `npm run lint:fix`                                    |
| Format               | `npm run format`                                      |
| Test run             | `npm run test:run`                                    |
| Build                | `npm run build`                                       |

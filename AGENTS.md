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
- Do not merge Admin `development` with the website repo. Website Press public read is `GET /api/press` (website 211). Website Privacy/Terms public read is `GET /api/legal/privacy` and `GET /api/legal/terms` (website 212), not Admin Express.

## Quick orientation

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx` → `ProtectedRoute` → `AdminLayout` → feature pages.
- Features: `src/features/<name>/` (webtoons, episodes, users, comments, …).
- Shared mocks/types: `@softgate/shared` → `packages/shared/src`.
- API lives in sibling `backend/` (`npm run dev:api` needs `DATABASE_URL` and `JWT_SECRET`). Do not put Express in Vite `src/`. Do not merge Admin git with the website/reader-portal repo.
- Staff routes `/api/staff` (Impl 31 + 48): public `GET /auth-options`, bootstrap `POST /setup` (`/register` alias), cookie login, forgot/reset, optional TOTP, env-gated SSO (existing email only). Empty staff uses `/setup`; `/register` redirects to `/login`; no public Sign up.
- Catalog REST `/api/authors|genres|webtoons|episodes`. Coin packages `/api/coin-packages` (Impl 44). Comments `/api/comments` (Impl 53; portal `ReaderComment`; reported queue; hard-delete). Reader users `/api/users` (Impl 54; portal `ReaderUser`; profile PATCH; hard-delete; wallet read-only). Notifications `/api/notifications` (Impl 46; hard-delete). Reader broadcasts `/api/reader-broadcasts` (Impl 51; website service). Settings `/api/settings` (Impl 47; four portal-safe fields). About history `/api/about/history` (Impl 59; photo first-of-year). About team `/api/about/team` (Impl 60; members + meta). Press CMS `/api/press` (Impl 63; meta + news + stills; first GET upserts kit copy with an empty news table). FAQ CMS `/api/faq` (Impl 66; first GET seeds `q1`–`q20`). Cookie Policy CMS `/api/cookies` (Impl 66; first GET seeds meta + 16 rows; backend folder `cookiePolicy`). Privacy + Terms CMS `/api/legal` (Impl 67; first GET upserts today’s copy). Writes on coin packages, comments, users, notifications, broadcasts, settings, about history, about team, press, FAQ, cookies, and legal are super_admin or admin.
- Media REST `/api/media` (Impl 34 local disk; Impl 41 Cloudflare R2 when real env is set; Impl 56 same-pixel WebP ingest for JPEG/PNG/still WebP; GIF/PDF/animated passthrough). A fake R2 key stays on disk. Live R2 URL shape was proved in Impl 50 (`{R2_PUBLIC_BASE_URL}/admin/{key}`, not `/uploads/`). Impl 57 purged that live smoke graph; do not leave ops smoke `ongoing`/`published` on the shared reader DB (see `wiki/conventions/live-catalog-smoke.md`).
- CORS/cookie from env (Impl 42): `CORS_ORIGINS`, `COOKIE_SAMESITE`, `COOKIE_SECURE`. Invite mail (Impl 43): in-repo HTML via Brevo when real env is set; a fake Brevo key skips send; `ADMIN_APP_URL` for email links (default `http://localhost:5173`).
- Admin SPA mock by default. `VITE_USE_MOCK_API=false` uses cookie + catalog REST (Impl 33), media REST (Impl 35), coin packages (Impl 44), comments (Impl 53), reader users (Impl 54), notifications (Impl 46), settings (Impl 47), reader broadcasts (Impl 51), about history (Impl 59), about team (Impl 60), press (Impl 63; page-local `/press`, not DataContext), FAQ (Impl 66; page-local `/faq`), cookies (Impl 66; page-local `/cookies`), and legal (Impl 67; page-local `/legal`). Episode add/edit is `/episodes/new` and `/episodes/:id/edit` (Impl 55); JPEG/PNG pages go through `/api/media` (live stored as same-pixel WebP, Impl 56). Webtoon add/edit is `/webtoons/new` and `/webtoons/:id/edit` (Impl 58); cover from Media. About desk is `/about` (Impl 59 History + Impl 60 Team); reader `/about` unchanged until website 205–207. Press desk is `/press`; reader `/press` can show saved copy when the portal persist is on (website 211). FAQ desk is `/faq` and Cookies desk is `/cookies`; reader `/faq` `/cookies` can show saved copy when the portal persist is on (website 213). Legal desk is `/legal`; reader `/privacy` `/terms` can show saved copy when the portal persist is on (website 212). Staff clickwrap `/privacy` `/terms` stay public stubs. Auth split (Impl 49): `/login` and `/setup` share the split card; `/register` is not split. Live join desk (Impl 52): `/setup` when staff is empty; four portal settings and coin SKUs can reach the reader when the portal persist is on.
- Data: `DataContext` + localStorage mock by default. When `VITE_USE_MOCK_API=false`, catalog + staff + media + coin packages + comments + reader users + notifications + reader broadcasts + the four portal-safe settings + about history + about team go through `src/lib/api/` (`credentials: 'include'`). Press uses `src/lib/api/press.ts` on `/press` only (not a 7th `reloadCatalog` lane). FAQ uses `src/lib/api/faq.ts` on `/faq` only. Cookies use `src/lib/api/cookies.ts` on `/cookies` only. Legal uses `src/lib/api/legal.ts` on `/legal` only. Live desk load (Impl 61 + 62): catalog (authors/genres/webtoons/episodes) is the core lane for CatalogStatus; media, coins, comments, users, notifications, and about settle separately. A comments or about API failure does not clear catalog or show Catalog request failed. GET `/api/comments` and GET `/api/about/history` return `[]` on Prisma `P2021` (missing table); GET `/api/press`, GET `/api/faq`, GET `/api/cookies`, and GET `/api/legal/privacy` fail-open to seed on `P2021`; do not Admin-migrate `ReaderComment`. About history mock uses `softgate_admin_about_history_v1` (not catalog schema 14). About team mock uses `softgate_admin_about_team_v1` (not catalog schema 14). Press mock uses `softgate_admin_press_v1` (not catalog schema 14). FAQ mock uses `softgate_admin_faq_v1` (not catalog schema 14). Cookies mock uses `softgate_admin_cookies_v1` (not catalog schema 14). Legal mock uses `softgate_admin_legal_v1` (not catalog schema 14). Campaigns are not stuffed into `DataContext.notifications`. Live Dashboard/Analytics/Revenue (Impl 64) keep `revenueData` / `userGrowthData` / `popularWebtoons` / `transactions` empty; they are not portal money. Live Reports / Activity Log (Impl 65) keep `reports` / `activityLogs` empty; Reports is not a reports API; Activity Log is this browser’s trail. Theme and other Settings controls stay local.
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

# Implementation track — SoftGate Comic Admin

> Numbering is sequential **Impl 1–52** (Lark-aligned). SoftGate name + logo = Impl 7; Profile polish + media-backed avatar = Impl 8.
> Terminology: work batches are labeled **Impl N** (not “Phase N”).

## Impl 1 — Documentation, architecture & SoftGate branding

- [x] Create wiki/ directory (2026-07-14)
- [x] Create docs/sessions/ directory (2026-07-14)
- [x] Move pages to features/ directory (2026-07-14)
- [x] Relocate core hooks & utility libraries to lib/ (2026-07-14)
- [x] Relocate config/ constants & data/ mocks (2026-07-14)
- [x] Rename WebPad to SoftGate Comic in HTML & configurations (2026-07-14)

## Impl 2 — Configuration alignment

- [x] Rename package name, configure check scripts, and establish Husky Git hooks (2026-07-15)
- [x] Align formatting with strict Prettier rules (2026-07-15)
- [x] Map VS Code recommendations and custom agent rules/skills (2026-07-15)

## Impl 3 — UI/UX & code logic polish

- [x] Establish global DataContext React context to support persistent mutations (2026-07-15)
- [x] Hook up all feature pages to DataContext for LocalStorage updates (2026-07-15)
- [x] Integrate brand logos into Sidebar and Login layouts (2026-07-15)
- [x] Introduce Framer Motion page transitions on route navigations (2026-07-15)
- [x] Configure visual custom scrollbars and premium animations in styles (2026-07-15)

## Impl 4 — Package & meta rename

- [x] Rename `@webpad/shared` package to `@softgate/shared` (2026-07-15)
- [x] Update path aliases in configs (`tsconfig.json`, `vite.config.ts`, and `.storybook/main.ts`) (2026-07-15)
- [x] Update all import statements from `@webpad/shared` to `@softgate/shared` (2026-07-15)
- [x] Rename reference instructions document to `SOFTGATE_INSTRUCTIONS.md` (2026-07-15)
- [x] Clean up old links inside crawler files `robots.txt` and `sitemap.xml` (2026-07-15)
- [x] Verify complete system compiles and executes unit checks successfully (2026-07-15)

## Impl 5 — Brand theme alignment

> Logo teal / `burst-*` magenta theme. Includes Tailwind-safe token naming (no `accent-*` color scale).

- [x] Switch Sidebar + Login logo from `logo-v2.jpg` to website mark `logo.jpg` (2026-07-20)
- [x] Recalibrate Tailwind `primary-*` to logo teal (`#64c8c8` / CTA `#0e9494`) (2026-07-20)
- [x] Add magenta `burst-*` tokens for logo starburst (`#e63264`); do not use Tailwind `accent-*` name (2026-07-20)
- [x] Remove purple/violet brand chrome from charts and feature pages (2026-07-20)
- [x] Wire burst to notification dots / content badges; add Button `burst` variant (2026-07-20)
- [x] Fix invalid `@apply` opacity / broken color utilities in `global.css` (2026-07-20)
- [x] Document brand tokens in `wiki/conventions/brand-color-tokens.md` (2026-07-20)
- [x] Verify Tailwind CSS compiles cleanly (2026-07-20)

## Impl 6 — Company scaffold alignment

> SoftGate Admin scaffold: structure + git/docs hygiene (patterns only — no external product code).

- [x] Add root `.gitattributes` (`* text=auto eol=lf`) for Prettier / Windows Git parity (2026-08-10)
- [x] Create wiki taxonomy dirs: `decisions/`, `references/`, `snippets/` (2026-08-10)
- [x] Add root `AGENTS.md` + sync `.agents/AGENTS.md`; update `00-project-context` (2026-08-10)
- [x] Expand `wiki/02-workflow.md` and `wiki/03-folder-map.md` to company depth (2026-08-10)
- [x] Untrack legacy `docs/sessions` files still in git index (2026-08-10)
- [x] Verify husky hooks unchanged (`lint-staged` / `npm run check`) (2026-08-10)

## Impl 7 — SoftGate display name + logo.svg

- [x] Rename display brand `Soft-Gate Comic` → `SoftGate Comic` across UI/docs (2026-08-10)
- [x] Switch Sidebar + Login to transparent `public/logo/logo.svg` (2026-08-10)
- [x] Update brand convention / folder-map / AGENTS logo path (2026-08-10)
- [x] Renumber Impl 1–7 sequentially in wiki/session indexes (2026-08-10)
- [x] Split UI brand `APP_NAME` vs SEO `APP_TITLE` (Sidebar/Login without “Admin”) (2026-08-10)

## Impl 8 — My Profile polish + media-backed avatar

- [x] Fix Profile heading contrast (strip premature `dark:` utilities) (2026-08-10)
- [x] Deduplicate role UI; humanize `super_admin` → Super Admin (2026-08-10)
- [x] Password card collapsed helper; outline Edit/Change actions (2026-08-10)
- [x] Migrate legacy `@webpad.com` → `@softgatecomic.com` in auth (2026-08-10)
- [x] Persist profile Save via `updateUser`; avatar upload → DataContext Media (`avatars`) (2026-08-10)
- [x] Wire Media Library to `useData` + working Upload (data URL images) (2026-08-10)
- [x] Fix Profile SEO (`PageSEO.Profile`) (2026-08-10)

## Impl 9 — Mock fully wired (9A–9E)

- [x] Activity log helper + CRUD appends across features (2026-08-11)
- [x] MediaPicker → DataContext `mediaFiles` (2026-08-11)
- [x] Schedule / Reports → DataContext persistence (2026-08-11)
- [x] Notifications in SharedData + page + Header Bell (2026-08-11)
- [x] Activity Log page reads shared `activityLogs` (2026-08-11)
- [x] Revenue → `transactions` + derived KPIs / payouts (2026-08-11)
- [x] Password hash trust; Header Search; Help modal (2026-08-11)
- [x] Theme `darkMode: 'class'` shell; Settings colors + siteName on Sidebar (2026-08-11)
- [x] Dashboard / Analytics derived counts + date chips (2026-08-11)

## Impl 10 — Theme preference (Light / Dark / System)

- [x] Single ThemeProvider preference store (`light` | `dark` | `system`; first-run default was system — superseded by Impl 15 Light) (2026-08-11)
- [x] Settings + Profile both control same preference (live sync) (2026-08-11)
- [x] OS `prefers-color-scheme` + change listener when System (2026-08-11)
- [x] Remove Settings Primary Color; brand stays logo tokens (2026-08-11)
- [x] FOUC inline script + bounded dark: coverage (2026-08-11)

## Impl 10.1 — Theme legacy lock + resolved UX

- [x] One-shot v2 migration → System default; ignore legacy as preference (2026-08-11)
- [x] Settings + Profile show live resolved appearance copy (2026-08-11)

## Impl 10.2 — color-scheme opt-out (Chrome Auto Dark)

- [x] `color-scheme: only light` on `html.light`; `dark` on `html.dark` (2026-08-11)
- [x] FOUC + ThemeProvider sync meta/`style.colorScheme` (2026-08-11)

## Impl 11 — Light polish + theme restore

- [x] Light contrast floors, bordered search, primary-only Settings chips, sidebar active bar (2026-08-11)
- [x] Remove FORCE_LIGHT / DIAG / !important paints; restore Dark/System UI (2026-08-11)
- [x] `darkMode: 'class'` + shell/Card/Input/global dark: pairs; durable `only light` | `dark` color-scheme (2026-08-11)

## Impl 11.1 — Light Auto Dark race fix

- [x] FOUC-first head; never advertise `light dark` before resolve (2026-08-11)
- [x] Light canvas reinforce in FOUC + `applyResolvedTheme` when resolved light (2026-08-11)

## Impl 12 — CSS variable theme surfaces

- [x] Semantic `--sg-*` on `html.light` / `html.dark`; Tailwind `canvas|surface|fg|line` aliases (2026-08-11)
- [x] Shell/Card/Input/Header/Sidebar/Modal off `dark:*` surfaces; dark bridges for feature pages (2026-08-11)
- [x] Card tests + `npm run check` (109 tests) (2026-08-11)

## Impl 13 — Light AA contrast polish

- [x] Light `--sg-*` AA floors (secondary/muted/border) (2026-08-11)
- [x] Feature pages → `text-fg` / `text-fg-secondary` / `text-fg-muted` (no `dark:text-white`) (2026-08-11)
- [x] Charts via `readSgVar`; toolbar borders `border-line*`; pills `*-800` (2026-08-11)
- [x] Soft sidebar via `--sg-nav-active-*` (no `dark:bg-primary-950` pair) (2026-08-11)
- [x] Light nav active bg = `primary-400` (`#64c8c8`) + `primary-950` text (2026-08-11)

## Impl 14 — Dark/System pastel chrome bridges

- [x] `@layer utilities` `html.dark` bridges for `*-50/100` washes, badge classes, `gray-200/300`, hovers, rings, toast borders (2026-08-11)
- [x] Notifications unread `bg-blue-50/50` → `bg-blue-50` (bridgeable) (2026-08-11)
- [x] Sidebar / `--sg-nav-active-*` unchanged (2026-08-11)

## Impl 15 — Default theme preference Light

- [x] First-run + invalid/missing preference fallback `'system'` → `'light'` in `theme.ts` + `index.html` FOUC (2026-08-19)
- [x] Keep Light/Dark/System options; keep stored `light`/`dark`/`system` when v2 is set (2026-08-19)
- [x] Theme tests + dual-track docs (2026-08-19)

## Impl 16 — Favicon and OG head alignment

- [x] Head icons match website: `favicon.svg` + `favicon-32.png` + `apple-touch-icon` (2026-08-19)
- [x] OG/Twitter image → `/logo/logo.png` (2026-08-19)
- [x] No `icon-512` in head; Sidebar/Login `logo.svg` unchanged (2026-08-19)

## Impl 17 — Admin production skeleton contract

- [x] Eager page imports; remove `PageLoader` / Routes `Suspense` splash (2026-08-21)
- [x] `skeleton-sheen` + reduced-motion; layout-faithful 14 page skeletons inside AdminLayout (2026-08-21)
- [x] `DataContext` `isLoading` / `error` / `retry`; CatalogStatus banner; empty ≠ loading ≠ error (2026-08-21)
- [x] Cover/avatar sheen (default loaded true); Media upload `Button isLoading` (2026-08-21)

## Impl 18 — First-run theme default System

- [x] First-run + invalid/missing preference fallback `'light'` → `'system'` in `theme.ts` + `index.html` FOUC (2026-08-21)
- [x] Keep Light/Dark/System options; keep stored `light`/`dark`/`system` when v2 is set (no v3 mass-migrate) (2026-08-21)
- [x] Theme tests + dual-track docs (2026-08-21)

## Impl 19 — Catalog pipe + settings blob

- [x] Align `@softgate/shared` with portal catalog fields (`contentRating`, `spotlight` / `spotlightOrder`, `weeklyViewCount`, `Episode.scheduledAt` / `freeAt`) (2026-08-22)
- [x] Persist `{ schemaVersion: 13, data }` under `softgate-shared-data`; one-shot migrate from `softgate-comic-shared-data` (2026-08-22)
- [x] Portal-safe settings on the blob (`maintenanceMode`, `allowRegistration`, `contactEmail`, `defaultLanguage` `en`|`mm`) (2026-08-22)
- [x] Webtoon form: EN/MM split, spotlight cap 5, content rating, weekly views, ISO timestamps, tags (2026-08-22)
- [x] Episode form writes `scheduledAt` / `freeAt`; Schedule page uses episodes (Yangon wall clock → UTC ISO) (2026-08-22)
- [x] No `uploadDay`; no Author/Genre/coin CRUD; no `viewCount` / public `followerCount` editors (2026-08-22)

## Impl 20 — Admin staff auth (website parity)

- [x] Staff accounts store `softgate_admin_accounts_v1`; login requires hash; first register is `super_admin` then lock (2026-08-22)
- [x] Themed split login/register + ops-desk photos; forgot OTP `000000` does not persist password (2026-08-22)
- [x] `/reset-password/:token?`, `/terms` `/privacy` stubs; English-only; Profile password min 8 (2026-08-22)
- [x] Playwright seed helper; Author CRUD is Impl 21 (2026-08-22)

## Impl 21 — Author CRUD (wiki 14)

- [x] Authors page + skeleton + `/authors` nav after Webtoons (`PenTool`) (2026-08-22)
- [x] EN/MM name/bio, optional MediaPicker avatar, `active` | `inactive`; no follower/view editors (2026-08-22)
- [x] Stable numeric ids; delete guard when series exist; cascade nested `webtoon.author`; derived `webtoonCount` (2026-08-22)
- [x] Webtoons picker uses `authorsForPicker`; `syncAuthorWebtoonCounts` on series add/edit/delete (2026-08-22)
- [x] `ActivityLog.targetType` `'author'`; schema 13 unchanged (2026-08-22)

## Impl 22 — Genre CRUD (wiki 15)

- [x] Genres page + skeleton + `/genres` nav after Authors (`LayoutGrid`) (2026-08-22)
- [x] EN/MM names; create-only kebab slug; `all` sentinel locked; no description/inactive editors (2026-08-22)
- [x] Delete guard when series exist; token cascade on rename except `all`; derived `webtoonCount` (2026-08-22)
- [x] Webtoons chips store slugs and display EN; Analytics pie skips `all` (2026-08-22)
- [x] `ActivityLog.targetType` `'genre'`; schema 13 unchanged (2026-08-22)

## Impl 23 — Sidebar edge collapse toggle

- [x] Collapse chip straddles the sidebar right border (header midline); `overflow-visible` (2026-08-22)
- [x] `primary-600` / `rounded-lg`; true left/right chevrons (no rotate-180 cancel) (2026-08-22)
- [x] `aria-expanded` + labels; collapsed logo centered; 80/256 widths unchanged (2026-08-22)

## Impl 24 — Coin packages editor (wiki 16)

- [x] Coin packages page + skeleton + `/coin-packages` nav after Genres (`Coins`) (2026-08-23)
- [x] Persist `id`, `coins`, `price`, optional `bonus` / `popular` / `bestValue`; never `metalClass` / `glowClass` (2026-08-23)
- [x] Seed ids `"1"`…`"6"`; edit keeps `id`; new id = max numeric + 1; hard delete with no wallet cascade (2026-08-23)
- [x] Badge XOR: at most one `popular`, at most one `bestValue`, never both on the same pack (2026-08-23)
- [x] Missing blob array hydrates seed; existing array (including empty) kept; schema **13**; `ActivityLog.targetType` `'coin-package'` (2026-08-23)

## Impl 25 — Staff Team invites

- [x] Sidebar Team (`/team`, `UserPlus` before Settings); Super Admin invite modal (email + Admin) (2026-08-23)
- [x] Invite store `softgate_admin_invites_v1` (hash only, 48h); `/invite/:token` accept; `/register` stays locked (2026-08-23)
- [x] Super Admin lock; Admin remove; no SMTP (copy-link in modal); `ActivityLog.targetType` `'staff'` (2026-08-23)

## Impl 26 — Staff roles + grouped sidebar

- [x] Roles `super_admin | admin | member | viewer`; `staffAccess` helpers; Viewer sees all routes, mutate chrome hidden (2026-08-23)
- [x] Team invite select Admin/Member/Viewer (Admin actor: Member/Viewer only); `acceptInvite` persists `invite.role` (2026-08-23)
- [x] Sidebar section labels (Catalog / Community / Business / Admin); collapsed rail hides labels; no accordion (2026-08-23)

## Impl 27 — Episode `imageSizes` persist (wiki item 21)

- [x] Optional `Episode.imageSizes?` beside `images: string[]`; omit on mock seed; schema stays **13** (2026-08-23)
- [x] Measure `naturalWidth` / `naturalHeight` on file, MediaPicker, and bulk image add; no staff-typed px (2026-08-23)
- [x] Persist parallel `{ width, height } | null`; omit the field when every slot is unmeasured (2026-08-23)
- [x] Edit hydrate + reorder/remove keep sizes on the slot; portal consume remains 166 (2026-08-23)

## Impl 28 — Team Roles legend + invite confirm copy

- [x] Team Roles card after Pending invites; Super Admin / Admin / Member / Viewer blurbs; visible to all staff roles (2026-08-23)
- [x] Copy-link `Inviting {email} as {Role}.` from persisted invite; Resend sets `inviteRole`; no sticky / SMTP / Settings matrix (2026-08-23)

## Impl 29 — Sibling `backend/` + `GET /health`

- [x] npm workspace `backend/`; Express not mixed into Vite `src/`; `GET /health` (2026-08-24)
- [x] `createApp()` + supertest; root `check` includes `-w backend` (2026-08-24)
- [x] Do not edit website repo; Admin SPA unwired (2026-08-24)

## Impl 30 — PostgreSQL + Prisma (connect only)

- [x] Prisma 6 + `DATABASE_URL`; `Meta` table only (2026-08-24)
- [x] Health `db: "up" | "down"`; tests without Docker (2026-08-24)
- [x] Init SQL via `migrate diff`; docker-compose Postgres 16 (2026-08-24)

## Impl 31 — Staff auth API (cookie + bcrypt)

- [x] `StaffUser` + `StaffInvite`; bcrypt; SHA-256 invite hashes; httpOnly JWT cookie `sg_staff` (2026-08-24)
- [x] RBAC matches Admin mock; first register only; Super Admin locked (2026-08-24)
- [x] Fake `JWT_SECRET`; Admin SPA still mock; website untouched (2026-08-24)

## Impl 32 — Catalog CRUD APIs

- [x] Prisma Author / Genre / Webtoon / Episode + WebtoonGenre; third migration from Staff+Meta (not `--from-empty`) (2026-08-24)
- [x] REST `/api/authors|genres|webtoons|episodes`; staff cookie; `canWriteCatalog`; no `PUT /api/data` (2026-08-24)
- [x] Server rules: genre/author delete guards, spotlight cap 5, UTC `scheduledAt`, webtoon DELETE 409 if episodes exist (2026-08-24)
- [x] In-memory `CatalogStore` tests without Docker; Admin SPA still mock; website untouched (2026-08-24)

## Impl 33 — Point Admin SPA at staff + catalog APIs

- [x] `VITE_USE_MOCK_API` default true; `false` uses cookie session + REST catalog (no blob `PUT /api/data`) (2026-08-24)
- [x] Vite `/api` proxy; `credentials: 'include'`; staff login/register/me/logout + Team invites (2026-08-24)
- [x] Catalog load from AdminLayout `reloadCatalog()`; page writes via REST; genre PATCH omits slug; bulk upload mock-only (2026-08-24)
- [x] Vitest pins mock flag; e2e stays localStorage seed; website untouched (2026-08-24)

## Impl 34 — Media storage adapter (local now, remote TBD)

- [x] `ObjectStore` + local-disk driver (`MEDIA_UPLOAD_DIR`, default `./uploads`); memory store for tests; factory always local — no Cloudinary/R2 SDK (2026-08-24)
- [x] Prisma `MediaAsset` (url + key, never bytes); fourth migration from catalog schema (2026-08-24)
- [x] Staff `/api/media` GET/POST/DELETE; `canWriteCatalog` on write; multer memory; jpeg/png/webp/gif 2MB, PDF 10MB, no SVG; public `GET /uploads` for local disk only (2026-08-24)
- [x] Admin SPA Media Library stays mock data-URL; website untouched; remote vendor TBD (2026-08-24)

## Impl 35 — SPA Media Library → local `/api/media`

- [x] Default mock unchanged; `VITE_USE_MOCK_API=false` uses `/api/media` + `backend/uploads` (FormData, no JSON Content-Type) (2026-08-24)
- [x] API-mode `mediaFiles` starts empty (not mock data-URLs); load with catalog; Library/Picker/Profile REST (2026-08-24)
- [x] Mock seeds kept; Vitest/e2e stay mock; no R2/Brevo; website untouched; no commit (2026-08-24)

## Impl 36 — Catalog titles + schema 14 (website 177 parity)

- [x] `SHARED_DATA_SCHEMA_VERSION` 13 → 14 so Admin load/save matches portal envelope (2026-08-25)
- [x] Demo series titles aligned with website Impl 177 (Latin cover-brand MM + literary kept; Love in Seoul MM + Seoul desc/tags); cover paths unchanged (2026-08-25)
- [x] Admin-only; website untouched; Lark follow-up to website Impl 178 (2026-08-25)

## Impl 37 — Command palette (Ctrl+K)

- [x] Replace Header page-search with Ctrl+K / Cmd+K overlay; go slugs + `.new` create (`?new=1`); System help/theme/logout (2026-08-31)
- [x] Role-hide Create/invite; no record prefixes; no `/commands` docs page; unused `globalShortcuts` left unmounted (2026-08-31)
- [x] Admin-only; website untouched (2026-08-31)

## Impl 38 — Staff Help page + palette chrome

- [x] Replace Help dialog with `/help`; Profile + sidebar Help + palette `help` go there (2026-08-31)
- [x] Palette footer keys; Header `kbd` Ctrl+K / ⌘K; staff desk copy (not “reach the SoftGate team”); no `/commands` page (2026-08-31)
- [x] Admin-only; website untouched (2026-08-31)

## Impl 39 — Staff Help desk handbook

- [x] `/help` category tabs under the h1 only (Overview, Catalog, Community, Business, Admin, Commands); `?tab=` omit for overview (2026-08-31)
- [x] Must-say copy (mock vs API, catalog order, community/business honesty, roles); Commands list has no Contact block (2026-08-31)
- [x] Admin-only; website untouched (2026-08-31)

## Impl 40 — Media Library square thumbs

- [x] Library thumbs `aspect-square` (keep `lg:grid-cols-5` + `object-cover`); filename footer `p-3` (2026-09-01)
- [x] MediaPicker + Media Library skeleton match; preview modal `h-64` unchanged (2026-09-01)
- [x] Admin-only; website untouched (2026-09-01)

## Impl 41 — R2 ObjectStore + public URL from key

- [x] Factory uses R2 when real env is set; `fake` / missing stays local disk; no live R2 in tests (2026-09-08)
- [x] DB key stays `{uuid}{ext}`; R2 object name `{prefix}/{key}` (`R2_KEY_PREFIX` default `admin`); public URL rebuilt from key + env (2026-09-08)
- [x] `GET /uploads` disk-only via `createMediaServicesFromEnv` in `app.ts` and `index.ts`; website untouched (2026-09-08)

## Impl 42 — CORS + cookie from env

- [x] `CORS_ORIGINS` exact allowlist (default `http://localhost:5173`); no wildcards; unknown Origin is 200 without ACAO (2026-09-08)
- [x] `COOKIE_SAMESITE` / `COOKIE_SECURE` from env; `none` forces Secure; clearCookie omits maxAge (2026-09-08)
- [x] SPA proxy unchanged; website untouched (2026-09-08)

## Impl 43 — Brevo mailer + staff invite HTML

- [x] Fail-soft invite/resend mail via in-repo HTML; `fake`/missing key or throw still returns the token (2026-09-08)
- [x] Configured only when `BREVO_API_KEY` is real and `BREVO_SENDER_EMAIL` is set; `ADMIN_APP_URL` for email links (default `http://localhost:5173`); no `templateId`; no `VITE_BREVO_*` (2026-09-08)
- [x] Forgot/reset HTML placeholders only; Team copy-link unchanged; website untouched (2026-09-08)

## Impl 44 — Coin packages REST + SPA

- [x] Prisma `CoinPackage` + `GET|POST|PATCH|DELETE /api/coin-packages`; write = `canWriteBusiness` (2026-09-09)
- [x] `VITE_USE_MOCK_API=false` loads SKUs from REST; mock seeds kept; empty API catalog does not leak mock packs (2026-09-09)
- [x] Admin-only; website `/coins` untouched (2026-09-09)

## Impl 45 — Comments moderation REST + SPA

- [x] Prisma `Comment` + `GET|PATCH|DELETE /api/comments`; write = `canWriteCommunity`; delete is soft (2026-09-09)
- [x] `VITE_USE_MOCK_API=false` loads comments from REST; mock seeds kept; empty API catalog does not leak mock comments (2026-09-09)
- [x] Admin-only; website `softgate_comments_v1` untouched (2026-09-09)

## Impl 46 — Staff notifications inbox REST + SPA

- [x] Prisma `StaffNotification` + `GET|PATCH|DELETE /api/notifications` and `PATCH /read-all`; write = `canWriteBusiness`; delete is hard (2026-09-09)
- [x] `VITE_USE_MOCK_API=false` loads inbox from REST; mock seeds kept; empty API catalog does not leak mock notifications (2026-09-09)
- [x] Admin-only; website `ReaderNotification` / `/api/notifications/me` untouched (2026-09-09)

## Impl 47 — Platform settings REST + SPA

- [x] Prisma `PlatformSettings` + `GET|PATCH /api/settings`; write = `canWriteSettings`; four portal-safe fields only (2026-09-09)
- [x] `VITE_USE_MOCK_API=false` loads those fields from REST; theme and other Settings controls stay local; empty table returns fail-open defaults (2026-09-09)
- [x] Admin-only; website `GET /api/settings` stub untouched (2026-09-09)

## Impl 48 — Staff Sign in, setup, invite (no public Sign up)

- [x] Empty-only `/setup` Super Admin; login has no Sign Up; `/register` redirects to `/login`; Team invite unchanged (2026-09-09)
- [x] `GET /api/staff/auth-options`; `POST /setup` (+ `/register` alias); forgot/reset persist; optional TOTP; env-gated SSO, no JIT (2026-09-09)
- [x] Admin-only; website reader registration untouched (2026-09-09)

## Impl 49 — Sign in ↔ `/setup` split card

- [x] AuthLayout `isSplit` = `/login` or `/setup`; `/register` stays Outlet so it still redirects to login (2026-09-09)
- [x] AuthSplitCard mounts Setup as the right pane; photo full-bleed slides 1.6s; card height follows the setup form (2026-09-09)
- [x] After staff exists, the setup pane is not mounted; no public Sign Up (2026-09-09)

## Impl 50 — Live R2 smoke + published title

- [x] Live `isR2Configured` desk: `POST /api/media` writes `{R2_PUBLIC_BASE_URL}/{prefix}/{uuid}{ext}` (default prefix `admin`); not `/uploads/` (2026-09-10)
- [x] One non-draft webtoon (`ongoing`) + `published` episode using those public URLs on the shared DB (2026-09-10)
- [x] No new API or Prisma models; website repo untouched (2026-09-10)

## Impl 51 — Reader broadcasts on `/notifications`

- [x] Prisma `ReaderBroadcast` + `/api/reader-broadcasts` (list, reader search, preview, send); write = `canWriteBusiness`; staff inbox API unchanged (2026-09-10)
- [x] Same `/notifications` page: bilingual compose + campaign log; mock desk cannot send; header bell stays staff unread (2026-09-10)
- [x] Admin proxies the website service; does not write reader inbox rows; website repo untouched (2026-09-10)

## Impl 52 — Live join desk (ops + honesty)

- [x] Empty staff graph so `/setup` is available; catalog / media / coins / settings rows kept (2026-09-10)
- [x] `PlatformSettings` `id=platform` present; at least one `CoinPackage`; Help copy: four settings can reach the reader when portal persist is on (2026-09-10)
- [x] No new API or Prisma models; website repo untouched (2026-09-10)

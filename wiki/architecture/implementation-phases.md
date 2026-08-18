# Implementation track — SoftGate Comic Admin

> Numbering is sequential **Impl 1–9** (Lark-aligned). SoftGate name + logo = Impl 7; Profile polish + media-backed avatar = Impl 8.
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

- [x] Single ThemeProvider preference store (`light` | `dark` | `system`, default system) (2026-08-11)
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

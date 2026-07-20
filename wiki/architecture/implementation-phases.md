# Implementation Phases - Soft-Gate Comic Admin

## Documentation Phase

- [x] Create wiki/ directory (2026-07-14)
- [x] Create docs/sessions/ directory (2026-07-14)

## Architecture Restructuring

- [x] Move pages to features/ directory (2026-07-14)
- [x] Relocate core hooks & utility libraries to lib/ (2026-07-14)
- [x] Relocate config/ constants & data/ mocks (2026-07-14)

## Branding Phase

- [x] Rename WebPad to Soft-Gate Comic in HTML & configurations (2026-07-14)

## Configuration Alignment (Phase 2)

- [x] Rename package name, configure check scripts, and establish Husky Git hooks (2026-07-15)
- [x] Align formatting with strict Prettier rules (2026-07-15)
- [x] Map VS Code recommendations and custom agent rules/skills (2026-07-15)

## UI/UX & Code Logic Polish (Phase 3)

- [x] Establish global DataContext React context to support persistent mutations (2026-07-15)
- [x] Hook up all feature pages to DataContext for LocalStorage updates (2026-07-15)
- [x] Integrate brand logos into Sidebar and Login layouts (2026-07-15)
- [x] Introduce Framer Motion page transitions on route navigations (2026-07-15)
- [x] Configure visual custom scrollbars and premium animations in styles (2026-07-15)

## Package & Meta Rename (Phase 4)

- [x] Rename `@webpad/shared` package to `@softgate/shared` (2026-07-15)
- [x] Update path aliases in configs (`tsconfig.json`, `vite.config.ts`, and `.storybook/main.ts`) (2026-07-15)
- [x] Update all import statements from `@webpad/shared` to `@softgate/shared` (2026-07-15)
- [x] Rename reference instructions document to `SOFTGATE_INSTRUCTIONS.md` (2026-07-15)
- [x] Clean up old links inside crawler files `robots.txt` and `sitemap.xml` (2026-07-15)
- [x] Verify complete system compiles and executes unit checks successfully (2026-07-15)

## Brand Theme Alignment (Phase 6)

> Logo + teal/`burst-*` magenta theme (website mark). Includes token naming fix so Tailwind compiles cleanly. (Former draft Phase 5 work folded here.)

- [x] Switch Sidebar + Login logo from `logo-v2.jpg` to website mark `logo.jpg` (2026-07-20)
- [x] Recalibrate Tailwind `primary-*` to logo teal (`#64c8c8` / CTA `#0e9494`) (2026-07-20)
- [x] Add magenta `burst-*` tokens for logo starburst (`#e63264`); do not use Tailwind `accent-*` name (2026-07-20)
- [x] Remove purple/violet brand chrome from charts and feature pages (2026-07-20)
- [x] Wire burst to notification dots / content badges; add Button `burst` variant (2026-07-20)
- [x] Fix invalid `@apply` opacity / broken color utilities in `global.css` (2026-07-20)
- [x] Document brand tokens in `wiki/conventions/brand-color-tokens.md` (2026-07-20)
- [x] Verify Tailwind CSS compiles cleanly (2026-07-20)

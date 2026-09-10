---
title: Command palette
type: convention
date: 2026-08-31
tags: [admin, commands, keyboard, navigation]
---

# Command palette

`Ctrl+K` / `Cmd+K` (also Header **Search or jump…**) opens an overlay on AdminLayout only. Registry lives in `src/lib/commands/registry.ts`. Header `kbd` shows `⌘K` on Apple UA, otherwise `Ctrl+K`.

- **Go** slugs navigate to this Admin’s routes (`webtoons`, `packages` → `/coin-packages`, `help` → `/help`, …).
- **Create** slugs append `?new=1`. List pages call `useOpenCreateQuery` to open the existing Add modal (media clicks the hidden file input; team opens invite). Strip the query after open. A module-level pending key (`pathname::kind`) keeps the open across React Strict Mode remount. Default kind is `'1'` so Authors, genres, media, coins, and staff invite stay intact. Viewer / no-write: no-op. **Exceptions:** Add Episode (`episode.new`) goes to `/episodes/new` (Impl 55). Add Webtoon (`webtoon.new`) goes to `/webtoons/new` (Impl 58). `/episodes?new=1` and `/webtoons?new=1` still replace to those create pages. Authors, genres, and About history (`history.new` → `/about?new=1`) stay modal. About member (`member.new` → `/about?new=member`) uses kind `member` so History does not strip it. Press news (`press.news` → `/press?new=1`) stays modal. Add FAQ (`faq.new` → `/faq?new=1`) stays modal. `history.new`, `member.new`, `press.news`, and `faq.new` require settings write, not catalog write. `team` go stays staff invite. `press` go is `/press`. `faq` go is `/faq`. `cookies` go is `/cookies` (no create slug).
- **System:** `theme.light|dark|system`, `logout`. `commands` keeps the palette open (clears the query). `help` is an Admin **go**, not a system action.
- Overlay footer: `Type to filter · ↑↓ to move · Enter to run · Esc to close` (do not put Ctrl+K in the footer).
- Do not mount `src/lib/useKeyboardShortcuts.ts` `globalShortcuts`.
- Record prefixes (`w:`, `e:`) and a dedicated `/commands` docs page are out of scope. Staff how-to lives on `/help` (Commands tab is the palette index) — see [`staff-help.md`](staff-help.md).

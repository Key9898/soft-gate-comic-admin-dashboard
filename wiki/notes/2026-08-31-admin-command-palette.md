---
title: Command palette Ctrl+K (Impl 37)
type: note
date: 2026-08-31
tags: [admin, commands, palette, navigation, impl-37]
---

# Impl 37 — Command palette (Ctrl+K)

Admin-only overlay that replaces Header title search. Staff jump to this desk’s pages, open existing Add/invite/upload flows via `?new=1`, and run help / theme / logout. Reference command-docs screenshot is pattern only.

## What landed

- Registry: `src/lib/commands/registry.ts` (go / create / system).
- Overlay: `Ctrl+K` / `Cmd+K` on AdminLayout; Header button `Search or jump…`.
- Create consume: `useOpenCreateQuery` on webtoons, episodes, authors, genres, coin packages, media (file input), team invite. Pending-path set so `?new=1` still opens after Strict Mode remount.
- Help copy shared via `HelpSupportModal`.
- Viewer sees no `.new` / `invite.new`. Unused `globalShortcuts` stays unmounted.

## Out of scope

Record prefixes (`w:`), `/commands` docs page, foreign dashboard slugs, `cmdk`/`kbar`.

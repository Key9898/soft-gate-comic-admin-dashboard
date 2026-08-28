---
title: Sidebar edge collapse toggle (Impl 23)
type: note
date: 2026-08-22
tags: [admin, sidebar, ui]
impl: 23
---

# Impl 23 — Sidebar edge collapse toggle

Move the rail collapse control onto the sidebar’s right border (header midline). Alair placement and chevron meaning only. Brand teal `primary-600` + `rounded-lg` (not a circle).

The plan draft numbered this **Impl 22**. Genre CRUD already occupied that slot, so this batch is **Impl 23**. Next catalog item remains coin packages (**Impl 24**).

## Behavior

- Chip straddles the aside border: `right-0 top-1/2 -translate-y-1/2 translate-x-1/2`, `h-8 w-8`.
- Expanded: `ChevronLeft`, `aria-expanded="true"`, label Collapse sidebar.
- Collapsed: `ChevronRight`, `aria-expanded="false"`, label Expand sidebar. No rotate-180 on a swapped icon (that cancelled the glyph).
- Aside `overflow-visible` so the half-outside chip is not clipped. Nav keeps `overflow-y-auto`.
- Collapsed logo is centered in the 80px rail. Widths stay 80 / 256. Collapse is not persisted.

## Files

- `src/components/Sidebar/Sidebar.tsx`
- `src/components/Sidebar/Sidebar.test.tsx`

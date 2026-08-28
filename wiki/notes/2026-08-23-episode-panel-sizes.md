---
title: Episode panel sizes contract (wiki item 21)
type: note
date: 2026-08-23
tags: [admin, website, integration, episode, images, cls, softgate]
---

# Episode panel sizes contract (wiki item 21)

Portal Impl **166** consume is on the website. This note first recorded the Admin wiki insert only. Admin persist is **Impl 27**.

Canonical list is now **21** items: [references/website-integration.md](../references/website-integration.md).

## Admin persist (Impl 27)

Measure `naturalWidth` / `naturalHeight` on episode image upload. Persist optional `imageSizes?: Array<{ width: number; height: number } | null>` beside `images: string[]`. Omit on seed and old episodes. Do not guess pixels. Do not required `{ src, width, height }[]`. Plan draft said Impl 26; staff roles already used 26. Schema stays 13. Portal consume remains 166. Do not claim CLS ≤ 0.1 from this Admin persist.

## Portal already shipped

- 162 chrome-only Reader skeleton (no guessed strip height)
- 165 LCP hints (`fetchPriority` high on panel 0, async decode, `h-auto`)
- 166 optional `imageSizes?` consume when both integers > 0

---
title: Full Package and Meta Metadata Rename
type: note
date: 2026-07-15
tags: [package, configuration, metadata, renaming]
---

# Full Package and Meta Metadata Rename

## Overview

Renamed the shared package namespace and static XML details from "WebPad" to "Soft-Gate Comic" across the repository configurations.

## Details

- **Package rename**: Updated the package identifier inside `packages/shared/package.json` to `@softgate/shared`.
- **Config mappings**: Modified paths alias settings in `tsconfig.json`, `vite.config.ts`, and `.storybook/main.ts` to map `@softgate/shared` to the packages directory.
- **Source refactoring**: Updated import links from `@webpad/shared` to `@softgate/shared` inside core dashboard data wrappers (`src/data/index.ts`, `src/data/mockData.ts`), auth custom hook (`src/features/auth/useAuth.tsx`), media viewer (`src/features/media/MediaLibraryPage.tsx`), persistence controller (`src/lib/DataContext.tsx`), and central model definitions (`src/types/index.ts`).
- **Metadata files**: Renamed the instruction text file to `packages/shared/SOFTGATE_INSTRUCTIONS.md` and modernized domain configurations inside `public/robots.txt` and `public/sitemap.xml` to route to `admin.softgatecomic.com`.

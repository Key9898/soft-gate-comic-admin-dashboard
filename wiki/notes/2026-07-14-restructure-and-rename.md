# Restructure and Rename to Soft-Gate Comic

## Overview

Reorganized the `webpad-admin-dashboard` to match `ai-poc-frontend` layout and renamed branding resources to **Soft-Gate Comic**.

## Directory Setup

- Created `wiki/` and `docs/sessions/` structure.
- Moved flat page folders under `src/features/`.
- Moved core state hooks, SidebarContext, and formatters under `src/lib/` (deleting `src/context/`).
- Consolidated constants into `src/config/` and mock database references into `src/data/`.

## Branding Updates

- Replaced WebPad text templates in metadata configurations, title tags, default settings, and session token names.

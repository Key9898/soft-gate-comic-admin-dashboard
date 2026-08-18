# Restructure and Rename to SoftGate Comic

## Overview

Reorganized the `webpad-admin-dashboard` to match the company scaffold layout and renamed branding resources to **SoftGate Comic**.

## Directory Setup

- Created `wiki/` and `docs/sessions/` structure.
- Moved flat page folders under `src/features/`.
- Moved core state hooks, SidebarContext, and formatters under `src/lib/` (deleting `src/context/`).
- Consolidated constants into `src/config/` and mock database references into `src/data/`.

## Branding Updates

- Replaced WebPad text templates in metadata configurations, title tags, default settings, and session token names.

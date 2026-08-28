# Project Overview

SoftGate Comic Admin is the central dashboard for managing the SoftGate Comic platform. It handles user management, content moderating (comments and reports), webtoon and episode publishing schedules, analytics tracking, and revenue payouts.

Before a full catalog API, Admin must write the catalog fields the reader portal already consumes. Canonical work list: [references/website-integration.md](references/website-integration.md). Sibling `backend/` has staff cookie auth (Impl 31), catalog CRUD APIs (Impl 32), and a local media adapter (Impl 34). The Admin SPA uses staff + catalog APIs when `VITE_USE_MOCK_API=false` (Impl 33), and Media Library/Picker when that same flag is `false` (Impl 35). Daily driver stays mock until real series exist. The website repo is still not edited.

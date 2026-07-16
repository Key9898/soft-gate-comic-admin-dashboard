---
name: wiki
description: Project wiki curator. Persist any project knowledge (decisions, notes, conventions, snippets, references, architecture) into the project's `wiki/` folder. Use this skill when the user asks to remember, note, save, record, or capture knowledge for future sessions.
---

# Wiki Skill (Antigravity)

This skill is the **single entry point** for persisting project knowledge into [`wiki/`](wiki/) at the repo root.

## When to invoke

Invoke automatically when the user expresses intent to remember or save something:

- "မှတ်ထားစမ်း" / "wiki ထဲ save လုပ်ပါ"
- "decision တစ်ခုယူထား" / "ADR ရေးပါ"
- "remember this" / "save to wiki" / "note this down"
- "convention သတ်မှတ်ထား"
- "snippet သိမ်းထား"
- "reference attach လုပ်ပါ"
- "architecture diagram သိမ်းထားပါ"

## Wiki folder layout

```
wiki/
├── README.md                  ← entry point & how-to
├── 00-overview.md             ← project overview
├── 01-stack.md                ← tech stack
├── 02-workflow.md             ← git workflow & hooks
├── 03-folder-map.md           ← codebase structure
├── architecture/              ← system design, diagrams
├── decisions/                 ← ADRs (NNN-title.md)
├── conventions/               ← coding standards, patterns
├── snippets/                  ← copy-paste code (markdown only)
├── notes/                     ← loose notes, ideas
└── references/                ← external links, docs
```

## Required frontmatter

Every saved entry **must** start with YAML frontmatter:

```markdown
---
title: <Human-readable title>
type: <decision | convention | architecture | snippet | note | reference>
date: YYYY-MM-DD
tags: [<tag1>, <tag2>]
---
```

## Critical rules

- **Never** skip the frontmatter — future AI agents rely on `type` / `tags` for retrieval.
- **Never** save **wiki skill entries** into `src/`, `docs/` (outside wiki), or repo root — always `wiki/<section>/`.
- **Always** absolute paths in tool calls.
- **Always** markdown `.md` for snippets.
- Burmese/Myanmar text OK inside content, but filename slug must be English.

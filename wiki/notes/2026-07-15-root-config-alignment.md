# Root-level Configuration Alignment & Agent Customizations

## Overview

Aligned the configuration of the dashboard workspace with the structure of `ai-poc-frontend` by introducing git hooks, formatting standards, recommended IDE extensions, and agent-specific rules and skills.

## Configuration Updates

- **Husky & lint-staged**: Configured commit checks (eslint + prettier on staged files) and pre-push validations.
- **Prettier**: Switched to strict Prettier configurations (`.prettierrc.json`) and added automatic Tailwind class sorting.
- **IDE**: Added VS Code recommendations (`.vscode/extensions.json`) and `.env.example`.
- **Agents rules/skills**: Populated `.cursor/rules/` (`00` to `06`), `.trae/skills/wiki/SKILL.md`, and `.agents/` custom instructions to establish automatic context matching and documentation hygiene rules.
- **Git Hosting & Deployment**: Remapped local codebase remote origin URL to the renamed GitHub repository `https://github.com/Key9898/soft-gate-comic-admin-dashboard.git` and matched the Vercel project name to `soft-gate-comic-admin-dashboard`.

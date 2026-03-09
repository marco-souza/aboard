---
name: markdown-linter
description: "Automatically formats and lints markdown (.md) files using prettier and markdownlint. Use whenever modifying or creating documentation."
---

# Markdown Linter Skill

Ensures all markdown documentation (`.md` files) across the project meets structural and formatting standards.

## Triggers

Run this skill whenever you:

- Create or update `.md` files (like `README.md`, `AGENTS.md`, or anything in `docs/`).
- Create or update agent configuration files in `.opencode/agent/`.
- Create or update skill files in `.agents/skills/`.

## Standard Workflow

After creating or modifying a markdown file, execute the following to automatically format the text and fix common structural linting issues:

1. **Run the auto-fix command**:

   ```bash
   bun run fix:md
   ```

2. **Run the lint command to verify everything passes**:

   ```bash
   bun run lint:md
   ```

3. **Check results**:
   - ✅ Zero issues: Markdown is clean and formatted.
   - ❌ Errors: You must manually fix any remaining `markdownlint-cli2` errors that weren't auto-fixed (e.g., missing language in fenced code blocks).

## Common Fixes

- **Line Length (`MD013`)**: Disabled by default in `.markdownlint-cli2.jsonc` so you don't need to break up long sentences.
- **Fenced Code Blocks (`MD040`)**: Always specify a language when using triple backticks (e.g., ` ```bash ` instead of just ` ``` `).
- **Blank lines around fences (`MD031`)**: Ensure there is an empty line before and after your code blocks.

## Related

- Built for deep compatibility with `opencode` agents.
- See `package.json` for the `lint:md` and `fix:md` scripts.

# Contributor Guidance

This repo packages lightweight OpenCode extensions as copyable Markdown prompts, agent definitions, instruction files, and example config snippets.

## Project Shape

- Keep the project explicit and copy-based.
- Do not add plugins, installers, hidden config mutation, subprocess harnesses, automatic model routing, or runtime state machines unless the user explicitly chooses that direction.
- Prefer native OpenCode agents, commands, instruction files, and README documentation.
- Each package should be understandable and usable on its own after copying files into `~/.config/opencode/` or a project `.opencode/` directory.

## Current Packages

- `commands/`: reusable slash command prompts.
- `architect/`: primary agent for architecture alignment before planning, implementation, and review.
- `oracle/`: read-only second-opinion subagent preset.
- `librarian/`: GitHub research subagent preset and command.

## File Conventions

- Agent files live under `<package>/agents/*.md`.
- Package-level routing/delegation instructions use uppercase names such as `ORACLE_INSTRUCTIONS.md`.
- Example OpenCode config snippets are named `opencode.<package>.example.json`.
- Package READMEs should include what the package provides, non-goals, install steps, config snippets, usage, model defaults, and restart requirements.
- Command files live in `commands/*.md` and should use only supported OpenCode command frontmatter used in this repo, such as `description` and `agent`.

## OpenCode Config Rules

- OpenCode config is strict; preserve `"$schema": "https://opencode.ai/config.json"` in example JSON files.
- Use an `agent` object keyed by agent name, not an array.
- Use `permission.task` objects for agent-to-subagent delegation.
- Permission rule order matters: broad deny rules go first, specific allow rules go later.
- Remind users to restart OpenCode after changing agent, command, instruction, or config files because OpenCode loads them at startup.

## Contribution Style

- Make the smallest correct change.
- Preserve the repo's copy-based, reversible setup style.
- Keep prompts direct, operational, and scoped to what the agent or command owns.
- Do not add backward-compatibility layers unless there is a concrete need.
- Avoid duplicating detailed package docs in multiple places; use root guidance for repo-wide rules and package READMEs for package-specific details.
- Keep files ASCII unless an existing file already needs non-ASCII.

## Verification

- There is no automated test suite for these prompt/config docs right now.
- Use `git` for repository checks.
- Run `git diff --check` for tracked changes.
- For new untracked files, use `git diff --check --no-index -- /dev/null <file>` and treat exit code `1` as normal for a no-index diff if there is no whitespace-error output.
- Validate example JSON with `jq empty <file>`.
- Re-read changed Markdown prompts before finalizing to catch stale command names, unsupported frontmatter, or copied instructions that do not fit OpenCode.

## Git Hygiene

- The worktree may contain user or other-agent changes. Do not revert unrelated changes.
- Before committing, inspect status, diff, and recent log.
- Stage only intended files.
- Do not amend, force-push, or use destructive git commands unless the user explicitly asks.

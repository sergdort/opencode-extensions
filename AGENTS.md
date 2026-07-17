# Contributor Guidance

This repo packages lightweight agent extensions for two harnesses — OpenCode (`opencode/`) and Claude Code (`claude/`) — as file-based Markdown prompts, agent definitions, instruction files, and example config snippets. `README.md` at the root maps the packages and compares the two configurations; package READMEs hold the per-package details.

## Project Shape

- Keep the project explicit and file-based. Packages remain independently copyable; `opencode/link-global.sh` is the opt-in helper for a complete global symlink setup.
- Do not add plugins, installers, hidden config mutation, subprocess harnesses, automatic model routing, or runtime state machines unless the user explicitly chooses that direction.
- Each package should be understandable and usable on its own after copying its files into the harness config directory (`~/.config/opencode/` / `.opencode/` for OpenCode; `~/.claude/` / `.claude/` for Claude Code).
- The two trees are siblings, not mirrors: they share the architect-first, plan-artifact workflow idea, but each is written for its harness's native mechanisms. When changing shared concepts (e.g. the plan format or oracle's charter), check whether the counterpart tree needs an equivalent change — and adapt rather than copy.

## Current Packages

OpenCode packages live under `opencode/`:

- `opencode/link-global.sh`: opt-in global symlink helper for the complete OpenCode setup.
- `opencode/commands/`: reusable slash command prompts.
- `opencode/agents/architect/`: persistent primary orchestrator plus developer and contrarian agents for ticket-driven feature work; local discovery uses OpenCode's built-in Explore agent.
- `opencode/agents/oracle/`: read-only second-opinion subagent preset.
- `opencode/agents/librarian/`: GitHub research subagent preset and command.

The Claude Code package lives under `claude/`:

- `claude/agents/` + `claude/commands/`: the ticket-driven architect/developer harness. See `claude/README.md` for the workflow, execution model, and model/effort allocation.

## File Conventions — OpenCode (`opencode/`)

- Agent packages live under `opencode/agents/<package>/`; the agent definition itself is at `opencode/agents/<package>/agents/*.md`.
- The Architect package's routing instruction is named `ARCHITECT_INSTRUCTIONS.md`.
- Example OpenCode config snippets are named `opencode.<package>.example.json`.
- Package READMEs should include what the package provides, non-goals, install steps, any required config, usage, model defaults, and restart requirements.
- Command files live in `opencode/commands/*.md` and should use only supported OpenCode command frontmatter used in this repo, such as `description` and `agent`.

## File Conventions — Claude Code (`claude/`)

- Subagents live in `claude/agents/*.md` with `name`, `description`, `tools`, `model`, and `effort` frontmatter. The `description` drives automatic delegation — keep it precise about when the agent should and should not be invoked. Read-only agents must omit `Edit`/`Write` from `tools`.
- Commands live in `claude/commands/*.md`; they run in the main session (no `agent:` binding), so any role instructions belong in the command body itself.
- The workflow's durable artifacts are `decision-brief.md`, `plan.md`, and `tickets/*.md`; ticket state is derived from git `Ticket:` trailers, not stored. Do not introduce hidden session state.
- Keep `claude/README.md` in sync when changing agents, commands, or the loop mechanics — it is the package's contract.

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
- Re-read changed Markdown prompts before finalizing to catch stale command names, unsupported frontmatter, or copied instructions that do not fit the target harness.

## Git Hygiene

- The worktree may contain user or other-agent changes. Do not revert unrelated changes.
- Before committing, inspect status, diff, and recent log.
- Stage only intended files.
- Do not amend, force-push, or use destructive git commands unless the user explicitly asks.

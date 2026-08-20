# Contributor Guidance

This repo packages lightweight agent extensions for four harnesses — OpenCode (`opencode/`), Claude Code (`claude/`), Codex (`codex/`), and The Last Harness (`tlh/`) — as file-based Markdown prompts, agent definitions, instruction files, and example config snippets. `README.md` at the root maps the packages and compares the three full workflow configurations; package READMEs hold the per-package details.

## Project Shape

- Keep the project explicit and file-based. Packages remain independently copyable; `opencode/link-global.sh`, `codex/link-global.sh`, and `tlh/link-global.sh` are opt-in helpers for global symlink setups.
- Do not add plugins, installers, hidden config mutation, subprocess harnesses, automatic model routing, or runtime state machines unless the user explicitly chooses that direction.
- Each package should be understandable and usable on its own after copying its files into the harness config directory (`~/.config/opencode/` / `.opencode/` for OpenCode; `~/.claude/` / `.claude/` for Claude Code; `~/.agents/skills` + `~/.codex/agents` / project `.agents/skills` + `.codex/agents` for Codex; `~/.the-last-harness/agent/prompts/` / project `.pi/prompts/` for The Last Harness).
- The harness trees are siblings, not mirrors: `opencode/`, `claude/`, and `codex/` share the architect-first, plan-artifact workflow idea, but each is written for its harness's native mechanisms. When changing shared concepts (e.g. the plan format or oracle's charter), check whether the counterpart trees need equivalent changes — and adapt rather than copy.
- `tlh/` is deliberately not a fourth workflow tree. The Last Harness ships its own architect, ticket loop, and subagents; that package only adds optional steps on top and must stay additive.

## Current Packages

OpenCode packages live under `opencode/`:

- `opencode/link-global.sh`: opt-in global symlink helper for the core OpenCode setup.
- `opencode/commands/`: reusable slash command prompts.
- `opencode/agents/architect/`: persistent primary orchestrator plus Terra and Luna developer profiles and a contrarian agent for plan-driven feature work; local discovery uses OpenCode's built-in Explore agent.
- `opencode/agents/oracle/`: read-only second-opinion subagent preset.
- `opencode/agents/librarian/`: GitHub research subagent preset and command.

The Claude Code package lives under `claude/`:

- `claude/agents/` + `claude/commands/`: the ticket-driven architect/developer harness. See `claude/README.md` for the workflow, execution model, and model/effort allocation.

The Codex package lives under `codex/`:

- `codex/link-global.sh`: opt-in global symlink helper for the core Codex setup, with an explicit optional Librarian flag.
- `codex/skills/`: manual-only Architect workflow skills.
- `codex/agents/`: custom Developer, Oracle, and Contrarian spawned-session profiles.
- `codex/optional/librarian/`: optional GitHub research skill and custom agent.
- `codex/README.md`: install, workflow, execution, permission limits, model defaults, and non-goals.

The Last Harness package lives under `tlh/`:

- `tlh/prompts/`: prompt templates installed into the isolated TLH profile as slash commands.
- `tlh/link-global.sh`: opt-in symlink helper for those prompt templates.
- `tlh/README.md`: what the package provides, non-goals, install, usage, and undo.

Shared skills live under `skills/`:

- `skills/grill-me-architecture/`: the canonical copy of the visual-first architecture grilling skill, consumed by OpenCode's Architect, Claude Code's `/architect`, and Codex's `$architect`. `opencode/link-global.sh` links it into `~/.agents/skills/grill-me-architecture/`.

## File Conventions — Shared Skills (`skills/`)

- Shared skills live in `skills/<skill>/SKILL.md` with valid skill frontmatter (`name`, `description`).
- Keep shared skill bodies harness-agnostic: no OpenCode-, Claude Code-, or Codex-specific workflow references.
- `skills/` holds the only canonical copy; do not mirror a shared skill into a harness tree or an external repository.

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

## File Conventions — Codex (`codex/`)

- Core custom agents live in `codex/agents/*.toml` with `name`, `description`, and `developer_instructions`. Model, reasoning effort, and sandbox defaults may be set with normal Codex config keys.
- Core skills live in `codex/skills/<skill>/SKILL.md` and use valid skill frontmatter. Each bundled workflow skill has `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
- Keep skill descriptions explicit about manual invocation and scope. Do not add an implicit router in `AGENTS.md`.
- Use Codex's built-in `explorer` for routine discovery instead of adding a duplicate Repo Scout.
- Keep optional packages under `codex/optional/` and make absence non-blocking unless a core skill declares the dependency required. `$architect` requires the separately installed `grill-me-architecture` skill; this repository's `skills/` directory is its canonical source.
- Keep `codex/link-global.sh` limited to named global skill and agent symlinks. It must not install dependencies, edit config, or change unrelated files.
- Treat `decision-brief.md`, `plan.md`, and `tickets/*.md` as temporary uncommitted Codex workflow state. The workflow never removes them; cleanup belongs to the user.
- Codex custom-agent sandbox defaults are not a universal per-agent command policy because parent live permission choices propagate. Do not claim that Developer's no-git boundary is mechanically enforced. Keep the prompt contract and Architect's pre/post Git invariant checks aligned.
- Keep `codex/README.md` in sync when changing skills, custom agents, lifecycle rules, permissions, or model defaults.
- Remind users to reload Codex after changing skills or custom agents.

## File Conventions — The Last Harness (`tlh/`)

- Prompt templates live in `tlh/prompts/*.md` and must stay flat; Pi's prompt discovery is not recursive.
- Use only supported prompt template frontmatter: `description` and `argument-hint`. The filename becomes the slash command name.
- Use the documented argument forms (`$1`, `$@`, `$ARGUMENTS`, `${@:-default}`) rather than inventing placeholders.
- Do not add skills to this package. A skill's description is injected into every system prompt and invites model-initiated invocation, which would change TLH's default architect behavior; prompt templates run only when the user types them.
- Keep the package out of profile-owned state: no `settings.json` edits, no agents, no extensions, no packages.
- Keep `tlh/link-global.sh` limited to named prompt template symlinks into `$PI_CODING_AGENT_DIR/prompts` (default `~/.the-last-harness/agent/prompts`).
- Prompt bodies should defer to TLH's own rules — architect's approval gate, `tk` ticket creation, and its consent-gated `oracle` and `contrarian` — rather than restating or overriding them.
- Remind users to run `/reload` in TLH after changing prompt templates.

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
- Validate Codex TOML and YAML with available parsers.
- Check shell helpers with `bash -n <file>`, and `shellcheck` when it is available.
- Re-read changed Markdown prompts before finalizing to catch stale command names, unsupported frontmatter, or copied instructions that do not fit the target harness.

## Git Hygiene

- The worktree may contain user or other-agent changes. Do not revert unrelated changes.
- Before committing, inspect status, diff, and recent log.
- Stage only intended files.
- Do not amend, force-push, or use destructive git commands unless the user explicitly asks.

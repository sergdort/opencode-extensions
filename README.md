# opencode-extensions

File-based agent extensions for two coding harnesses: **OpenCode** and **Claude Code**. Everything here is plain Markdown prompts, agent definitions, instruction files, example config snippets, and one explicit OpenCode symlink helper. There are no plugins or hidden config mutations; every installed file remains visible and reversible.

## Repository Layout

```
opencode/               OpenCode packages
  link-global.sh         opt-in global symlink setup for the complete package set
  agents/               agent packages, each self-contained (README, instructions, example config)
    architect/           primary orchestrator plus developer and contrarian
    oracle/               read-only second-opinion subagent
    librarian/            GitHub research subagent
  commands/             reusable slash commands (/plan-feature, /decompose, /start-work, ...)

claude/                 Claude Code package
  agents/               subagents (developer, repo-scout, oracle, contrarian, github-librarian)
  commands/             slash commands (/architect, /plan-feature, /decompose, /start-work, ...)
```

Each package directory has its own README with install steps, config snippets, and usage. `opencode/link-global.sh` can link the complete OpenCode setup globally when you want repository edits reflected without copying again.

## The Two Configurations

Both trees implement the same ticket-driven workflow, adapted to each harness's native agent and command model.

| | OpenCode (`opencode/`) | Claude Code (`claude/`) |
|---|---|---|
| Architect role | Persistent `mode: primary` orchestrator you switch into | `/architect` slash command (no persistent primary-agent switch in Claude Code) |
| Where role instructions live | Agent definition files; commands can bind an `agent:` in frontmatter | In each command body — commands run in the current session |
| Delegation wiring | Explicit `permission.task` rules in agent frontmatter or `opencode.json` | Automatic — Claude Code picks subagents by their `description` field |
| Workflow depth | Select Architect → `/plan-feature` → `/decompose` → `/start-work` | `/architect` → `/plan-feature` → `/decompose` → `/start-work` |
| Implementation | A `developer` subagent implements one ticket at a time; Architect reviews and commits | A `developer` subagent implements one ticket at a time; the main session reviews and commits |
| Review | Inline agent review, planned human checkpoints, and required final human review; `/review-work` is an optional outside pass | Inline agent review, planned human checkpoints, and required final human review; built-in `/review` is optional |
| Subagents | `developer`, built-in `explore`, `contrarian`, plus optional `oracle` and `github-librarian` | `developer`, `repo-scout`, `contrarian`, `oracle`, `github-librarian` |
| Default models | Per-agent: Sol for architect/oracle/contrarian, Terra for developer/explore/librarian | Per-agent Claude models: Sonnet for developer/librarian, Haiku for repo-scout, Fable for oracle/contrarian |
| Config format | `opencode.json` (strict schema, restart required) | Markdown frontmatter only; no JSON config needed |
| Install target | `~/.config/opencode/` or project `.opencode/` | `~/.claude/` or project `.claude/` |

In both trees, the main session orchestrates a ticket queue and durable state lives in Markdown plus git. OpenCode uses a selectable primary Architect and explicit Task permissions; Claude Code installs the role into the current session through `/architect` and routes subagents by description.

## How the Workflows Run

**OpenCode** — switch to `architect`; it inspects the repository, settles product intent and system architecture, chooses a workflow profile, and writes `decision-brief.md`. `/plan-feature` records the reviewed program design and change map. `/decompose` starts with the smallest runnable tracer and creates later vertical slices; a contract-only predecessor is optional and must be justified. `/start-work` dispatches each ticket, applies agent review, pauses at planned human checkpoints, and commits accepted work. Completion is derived from `Ticket:` trailers. `oracle` and `github-librarian` are optional delegation targets.

**Claude Code** — `/architect` settles product intent, system architecture, risk, and review cadence in `decision-brief.md`; `/plan-feature` turns the brief and repository evidence into `plan.md`; `/decompose` cuts a runnable tracer followed by dependency-ordered vertical slices; `/start-work` dispatches one ticket, reviews design fit, tests, correctness, and maintainability, pauses at planned human checkpoints, and commits on approval. Ticket completion is derived from `Ticket:` trailers, so a fresh session reconstructs queue state from the repository; ambiguous interrupted review rounds require user confirmation. See `claude/README.md` for the full mechanics.

## Install

Pick a tree and installation style:

- OpenCode package-by-package: follow the README under `opencode/agents/` or `opencode/commands/` and copy only the pieces you want.
- OpenCode complete global setup: run `opencode/link-global.sh --dry-run`, then `opencode/link-global.sh --force` if existing differing copies should be replaced. The script links only repository-owned agents, commands, and instructions; it does not edit `opencode.json` or unrelated files.
- Claude Code: follow `claude/README.md` — copy `claude/agents/*.md` and `claude/commands/*.md` into `~/.claude/` (global) or `.claude/` (per project). No restart or JSON config needed.

Restart OpenCode after linking or changing files because it loads agents, commands, and instructions at startup.

Packages are independent: you can install just `oracle`, just the librarian, or the full workflow.

## Shared Principles

- **File-based and reversible.** Install by copying selected packages or using the explicit OpenCode symlink helper. No hidden config mutation, subprocess harnesses, or runtime state machines.
- **Durable artifacts over hidden state.** Decisions live in `decision-brief.md` / `plan.md` / `tickets/` and git, not in the session.
- **Proportional process.** Small work can bypass the artifact flow; standard and high-risk work receive explicit design and review cadence.
- **Runnable feedback early.** The first behavior ticket is a touchable end-to-end tracer, not a behaviorless layer of speculative stubs.
- **Humans own maintainability judgment.** Agent review raises the floor, but selected code checkpoints and final review remain human decisions.
- **Additive.** Outside the workflow your session behaves normally; nothing is enforced globally.

## Contributing

See `AGENTS.md` for contributor guidance: file conventions, OpenCode config rules, verification steps, and git hygiene.

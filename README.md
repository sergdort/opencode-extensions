# opencode-extensions

Copy-based agent extensions for two coding harnesses: **OpenCode** and **Claude Code**. Everything here is plain Markdown prompts, agent definitions, instruction files, and example JSON config snippets. There are no plugins or installers — you copy the files you want into your harness config directory, and every change is visible and reversible.

## Repository Layout

```
opencode/               OpenCode packages
  agents/               agent packages, each self-contained (README, instructions, example config)
    architect/           primary orchestrator plus developer, repo-scout, and contrarian
    oracle/               read-only second-opinion subagent
    librarian/            GitHub research subagent
  commands/             reusable slash commands (/plan-feature, /decompose, /start-work, ...)

claude/                 Claude Code package
  agents/               subagents (developer, repo-scout, oracle, contrarian, github-librarian)
  commands/             slash commands (/architect, /plan-feature, /decompose, /start-work, ...)
```

Each package directory has its own README with install steps, config snippets, and usage. This file is the map.

## The Two Configurations

Both trees implement the same ticket-driven workflow, adapted to each harness's native agent and command model.

| | OpenCode (`opencode/`) | Claude Code (`claude/`) |
|---|---|---|
| Architect role | Persistent `mode: primary` orchestrator you switch into | `/architect` slash command (no persistent primary-agent switch in Claude Code) |
| Where role instructions live | Agent definition files; commands can bind an `agent:` in frontmatter | In each command body — commands run in the current session |
| Delegation wiring | Explicit `permission.task` rules in agent frontmatter or `opencode.json` | Automatic — Claude Code picks subagents by their `description` field |
| Workflow depth | Select Architect → `/plan-feature` → `/decompose` → `/start-work` | `/architect` → `/plan-feature` → `/decompose` → `/start-work` |
| Implementation | A `developer` subagent implements one ticket at a time; Architect reviews and commits | A `developer` subagent implements one ticket at a time; the main session reviews and commits |
| Review | Inline per-ticket review; `/review-work` is an optional outside pass | Inline per-ticket review; Claude Code's built-in `/review` is optional |
| Subagents | `developer`, `repo-scout`, `contrarian`, plus optional `oracle` and `github-librarian` | `developer`, `repo-scout`, `contrarian`, `oracle`, `github-librarian` |
| Default models | `openai/gpt-5.5` (`xhigh`) | Per-agent Claude models: Sonnet for developer/librarian, Haiku for repo-scout, Fable for oracle/contrarian |
| Config format | `opencode.json` (strict schema, restart required) | Markdown frontmatter only; no JSON config needed |
| Install target | `~/.config/opencode/` or project `.opencode/` | `~/.claude/` or project `.claude/` |

In both trees, the main session orchestrates a ticket queue and durable state lives in Markdown plus git. OpenCode uses a selectable primary Architect and explicit Task permissions; Claude Code installs the role into the current session through `/architect` and routes subagents by description.

## How the Workflows Run

**OpenCode** — switch to `architect`; it inspects the repository, grills the design, and writes `decision-brief.md`. `/plan-feature` freezes the executable plan, `/decompose` creates dependency-ordered tickets, and `/start-work` dispatches each ticket to Developer, reviews the diff, and commits accepted work. Completion is derived from `Ticket:` trailers. `oracle` and `github-librarian` are optional delegation targets.

**Claude Code** — `/architect` grills the design and emits `decision-brief.md`; `/plan-feature` turns brief + repo into `plan.md`; `/decompose` cuts the plan into dependency-ordered `tickets/`; `/start-work` drives the loop: dispatch one ticket to the `developer` subagent, review the diff, commit on approval, repeat. Ticket completion is derived from `Ticket:` trailers in git, so a fresh session can resume from the repo state alone. See `claude/README.md` for the full mechanics (2-round review cap, escalation, contract-change handling).

## Install

Pick a tree, pick the pieces you want, and copy:

- OpenCode: follow the README in each package under `opencode/agents/` (`architect/`, `oracle/`, `librarian/`) or `opencode/commands/`. Config snippets go into `opencode.json`; restart OpenCode afterwards — it loads agents, commands, and instructions at startup.
- Claude Code: follow `claude/README.md` — copy `claude/agents/*.md` and `claude/commands/*.md` into `~/.claude/` (global) or `.claude/` (per project). No restart or JSON config needed.

Packages are independent: you can install just `oracle`, just the librarian, or the full workflow.

## Shared Principles

- **Copy-based and reversible.** No installers, hidden config mutation, subprocess harnesses, or runtime state machines.
- **Durable artifacts over hidden state.** Decisions live in `decision-brief.md` / `plan.md` / `tickets/` and git, not in the session.
- **Additive.** Outside the workflow your session behaves normally; nothing is enforced globally.

## Contributing

See `AGENTS.md` for contributor guidance: file conventions, OpenCode config rules, verification steps, and git hygiene.

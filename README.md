# opencode-extensions

Copy-based agent extensions for two coding harnesses: **OpenCode** and **Claude Code**. Everything here is plain Markdown prompts, agent definitions, instruction files, and example JSON config snippets. There are no plugins or installers — you copy the files you want into your harness config directory, and every change is visible and reversible.

## Repository Layout

```
opencode/               OpenCode packages
  architect/            primary agent for settling architecture before planning
  commands/             reusable slash commands (/plan-feature, /start-work, /review-work, ...)
  oracle/               read-only second-opinion subagent
  librarian/            GitHub research subagent + command

claude/                 Claude Code package
  agents/               subagents (developer, repo-scout, oracle, contrarian, github-librarian)
  commands/             slash commands (/architect, /plan-feature, /decompose, /start-work, ...)
```

Each package directory has its own README with install steps, config snippets, and usage. This file is the map.

## The Two Configurations

Both trees implement the same core idea — settle the architecture in conversation first, produce a durable plan artifact, then implement and review against it — but they are adapted to how each harness actually works, and the Claude Code version has grown into a deeper ticket-driven loop.

| | OpenCode (`opencode/`) | Claude Code (`claude/`) |
|---|---|---|
| Architect role | `mode: primary` agent you switch into | `/architect` slash command (no persistent primary-agent switch in Claude Code) |
| Where role instructions live | Agent definition files; commands can bind an `agent:` in frontmatter | In each command body — commands run in the current session |
| Delegation wiring | Explicit `permission.task` rules in `opencode.json` | Automatic — Claude Code picks subagents by their `description` field |
| Workflow depth | 3 steps: `/plan-feature` → `/start-work` → `/review-work`, one `plan.md` artifact | 4 steps: `/architect` → `/plan-feature` → `/decompose` → `/start-work`; tickets, per-ticket commits, review inline in the loop |
| Implementation | Your `build` agent works from `plan.md` | A `developer` subagent implements one ticket at a time; the main session reviews and commits |
| Review | Separate `/review-work` command | Inline per-ticket review by the orchestrator; no separate command |
| Subagents | `oracle`, `github-librarian` | `oracle`, `contrarian`, `github-librarian`, `developer`, `repo-scout` |
| Default models | `openai/gpt-5.5` (`xhigh`) | Per-agent Claude models: Sonnet for developer/librarian, Haiku for repo-scout, Fable for oracle/contrarian |
| Config format | `opencode.json` (strict schema, restart required) | Markdown frontmatter only; no JSON config needed |
| Install target | `~/.config/opencode/` or project `.opencode/` | `~/.claude/` or project `.claude/` |

In short: the OpenCode tree is a set of small, independent presets you compose through config; the Claude Code tree is a single coherent harness where the main session orchestrates a ticket queue and all state lives in markdown files and git.

## How the Workflows Run

**OpenCode** — start feature work in the `architect` agent; it interviews you and settles the approach in conversation. Then `/plan-feature` writes `plan.md` (an executable sketch with a Gherkin behavioral contract), `/start-work` implements from it, and `/review-work` checks the implementation against it. `oracle` and `github-librarian` are optional delegation targets along the way.

**Claude Code** — `/architect` grills the design and emits `decision-brief.md`; `/plan-feature` turns brief + repo into `plan.md`; `/decompose` cuts the plan into dependency-ordered `tickets/`; `/start-work` drives the loop: dispatch one ticket to the `developer` subagent, review the diff, commit on approval, repeat. Ticket completion is derived from `Ticket:` trailers in git, so a fresh session can resume from the repo state alone. See `claude/README.md` for the full mechanics (2-round review cap, escalation, contract-change handling).

## Install

Pick a tree, pick the pieces you want, and copy:

- OpenCode: follow the README in each package under `opencode/` (`architect/`, `oracle/`, `librarian/`, `commands/`). Config snippets go into `opencode.json`; restart OpenCode afterwards — it loads agents, commands, and instructions at startup.
- Claude Code: follow `claude/README.md` — copy `claude/agents/*.md` and `claude/commands/*.md` into `~/.claude/` (global) or `.claude/` (per project). No restart or JSON config needed.

Packages are independent: you can install just `oracle`, just the librarian, or the full workflow.

## Shared Principles

- **Copy-based and reversible.** No installers, hidden config mutation, subprocess harnesses, or runtime state machines.
- **Durable artifacts over hidden state.** Decisions live in `decision-brief.md` / `plan.md` / `tickets/` and git, not in the session.
- **Additive.** Outside the workflow your session behaves normally; nothing is enforced globally.

## Contributing

See `AGENTS.md` for contributor guidance: file conventions, OpenCode config rules, verification steps, and git hygiene.

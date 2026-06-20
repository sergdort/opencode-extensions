# Claude Code Extensions

A copy-based Claude Code harness for taking a medium/large feature from architecture through a ticket-driven implement-and-review loop. The main session orchestrates; all state lives in markdown files and git. There is no installer — copy the files you want.

## The Workflow

Four commands, one durable artifact each, each pointing to the next:

```
(optional spike in a plain session — just prototype)
        |
/architect      grill the design        -> decision-brief.md   -> "run /plan-feature"
        |
/plan-feature   brief + repo            -> plan.md             -> "run /decompose"
                (Gherkin contract +
                 frozen interface sketch)
        |
/decompose      plan.md                 -> tickets/*.md         -> "run /start-work"
                (ticket-0 = compiling
                 contract stubs; 1..N =
                 vertical slices; you
                 approve the cut)
        |
/start-work     tickets/ (the loop)     -> local commits        -> done
                (dispatch one ticket ->
                 developer implements +
                 verifies -> architect
                 reviews -> accept /
                 re-dispatch(<=2) /
                 escalate -> repeat)
```

Per-ticket review happens inline in the loop, so there is no `/review-work`; use Claude Code's built-in `/review` for an outside pass.

## What This Provides

Subagents (`claude/agents/`):

- `developer.md` (Sonnet): implements exactly one ticket, writes and verifies its own tests, returns a structured report. Does not commit.
- `repo-scout.md` (Haiku): fast read-only codebase discovery, spawned by the developer when a ticket's seeds run dry.
- `oracle.md` (Opus): read-only second opinion on high-risk architecture, security, refactors, and plans.
- `github-librarian.md` (Sonnet): GitHub research scout that uses `gh` to find and cite exact upstream code locations.

Slash commands (`claude/commands/`):

- `/architect`: enter Architect mode to grill a design; emits `decision-brief.md`.
- `/plan-feature`: produce `plan.md` — Gherkin behavioral contract plus a frozen interface sketch.
- `/decompose`: cut `plan.md` into dependency-ordered `tickets/`, starting with a contract-materialization ticket zero.
- `/start-work`: drive the implement-and-review loop over `tickets/`.
- `/handoff`: write repo-local handoff documents for a fresh agent.
- `/github-librarian`: delegate a GitHub research query to the `github-librarian` subagent.

## How The Loop Works

- **Architect = orchestrator + reviewer.** It dispatches each ticket to the `developer` subagent, reviews the working-tree diff (contract fit, test faithfulness, correctness), and commits on approval. It never writes product code within the flow.
- **State is derived, not stored.** Ticket files are immutable specs. A ticket is *done* when a commit with a `Ticket: <id>` trailer exists; *ready* when its deps are done. A fresh session resumes from git plus the dependency graph. The only mutation is a `blocked` marker on an escalated ticket.
- **Per-ticket local commits** are the completion ledger and your review surface — never pushed. Review the commit series at the end (`git show`, `/review`) and squash before pushing if you like.
- **2-round cap.** If a ticket fails review twice it escalates to you at the requirements level — usually a sign the ticket or contract is wrong, not the developer.
- **Contract changes are a re-decompose event:** bounce back to `/plan-feature` then `/decompose`; the compiler enumerates the blast radius; corrections move forward as new tickets (old commits are never rewritten).

## Non-Goals

- No plugins, installers, hidden config mutation, or runtime state machines. Copy the files you want.
- The harness is additive: outside the flow your session is vanilla Claude Code (spikes, bugfixes, prototyping are all first-class). Enforcement is prompt-scoped, not a global hook.

## Install

Global (all projects):

```bash
CLAUDE_DIR=/path/to/opencode-extensions/claude
mkdir -p ~/.claude/agents ~/.claude/commands
cp "$CLAUDE_DIR"/agents/*.md ~/.claude/agents/
cp "$CLAUDE_DIR"/commands/*.md ~/.claude/commands/
```

One project:

```bash
CLAUDE_DIR=/path/to/opencode-extensions/claude
mkdir -p .claude/agents .claude/commands
cp "$CLAUDE_DIR"/agents/*.md .claude/agents/
cp "$CLAUDE_DIR"/commands/*.md .claude/commands/
```

Copy only the pieces you want — for example just `agents/oracle.md`, or the workflow without `/architect`.

## Model & Effort Defaults

Each subagent pins both a model and a reasoning `effort` (which overrides the session effort while that subagent runs):

- `developer`: `sonnet` / `high` — correctness of delegated code matters; `high` is Sonnet's ceiling below `max`.
- `repo-scout`: `haiku` / `low` — stays cheap even when the session runs hot.
- `oracle`: `opus` / `xhigh` — stays deep even when the session runs low.
- `github-librarian`: `sonnet` / `medium` — locate-and-cite tool work, not analysis.
- Commands inherit the session model and `/effort` — the grilling, decomposition, and inline review are your reasoning under your control.

Edit the `model:` / `effort:` frontmatter to taste. Note `xhigh` is not available on Sonnet, and available levels depend on the model.

## Execution Model & Limits

- **Sequential by default.** Tickets run one at a time. Parallel execution is a future opt-in, gated on no dependency edges, disjoint file scopes, and a concurrency-safe build toolchain — iOS projects (XcodeGen/Tuist project regeneration, shared DerivedData) do not qualify and stay sequential.
- **Grounded on verified runtime facts:** subagents are one-shot (no mid-task back-and-forth, no sibling channel), can nest up to 5 levels deep, and inherit project `CLAUDE.md` but not the parent conversation. The developer's BLOCKED protocol exists because it cannot ask a question mid-task.

## Relationship To The OpenCode Extensions

This package began as a mirror of the OpenCode `architect/`, `oracle/`, `librarian/`, and `commands/` packages and grew into a fuller ticket-driven harness. Notable translation points:

- Claude Code slash commands run in the current session (no per-command `agent:` binding), so role instructions live in each command body.
- Architect is a `/architect` command, not a `mode: primary` agent — Claude Code has no persistent primary-agent switch, and Architect is interactive.
- Claude Code auto-delegates to subagents by `description`; no `permission.task` wiring is needed. Read-only agents drop `Edit`/`Write` from their `tools`.
- Models are remapped from OpenCode's `openai/gpt-5.5` to Claude models above.

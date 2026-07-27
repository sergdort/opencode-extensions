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
                  reviewed program design +
                  file change map)
        |
/decompose      plan.md                 -> tickets/*.md         -> "run /start-work"
                 (first behavior = runnable
                  tracer; optional narrow
                  contract predecessor;
                  you approve the cut)
        |
/start-work     tickets/ (the loop)     -> local commits        -> done
                 (dispatch one ticket ->
                  developer implements +
                  verifies -> architect
                  reviews -> human checkpoint
                  where planned -> accept /
                  re-dispatch(<=2) /
                  escalate -> repeat)
```

Per-ticket agent review happens inline in the loop, so there is no `/review-work`; use Claude Code's built-in `/review` for an optional outside pass. Neither replaces the planned human checkpoints or final human review.

## What This Provides

Subagents (`claude/agents/`):

- `developer.md` (Sonnet): implements exactly one ticket, writes and verifies its own tests, returns a structured report. Does not commit.
- `repo-scout.md` (Haiku): fast read-only codebase discovery, spawned by the Architect session for pre-question recon and by the developer when a ticket's seeds run dry.
- `oracle.md` (Fable): read-only second opinion on high-risk architecture, security, refactors, and plans.
- `contrarian.md` (Fable): adversarial stress-test of one specific decision — steelmans the strongest opposing case and reports confirmed vs. speculative objections. Gated to uncertain, hard-to-undo, or broad-blast-radius calls.
- `github-librarian.md` (Sonnet): GitHub research scout that uses `gh` to find and cite exact upstream code locations.

Slash commands (`claude/commands/`):

- `/architect`: enter Architect mode to settle product intent, system architecture, risk, workflow profile, and review cadence; emits `decision-brief.md`.
- `/plan-feature`: produce `plan.md` - Gherkin behavioral contract, reviewed execution sketch, call flow, file change map, verification, and human checkpoints.
- `/decompose`: cut `plan.md` into a runnable tracer and dependency-ordered vertical slices; add a narrow contract-only predecessor only when justified.
- `/start-work`: drive the implement-and-review loop over `tickets/`.
- `/handoff`: write repo-local handoff documents for a fresh agent.
- `/github-librarian`: delegate a GitHub research query to the `github-librarian` subagent.

## How The Loop Works

- **Architect = orchestrator + agent reviewer.** It dispatches each ticket to `developer`, reviews design/scope fit, test faithfulness, correctness/verification, and maintainability, pauses at declared human checkpoints, and commits on approval. It never writes product code within the flow.
- **The role survives the queue.** Draining the tickets ends the loop, not the orchestration: bugs found during manual testing become micro-briefs dispatched to `developer` (committed with a `Fix:` trailer), not direct edits by the main session.
- **State is derived, not stored.** Completed tickets are immutable specs. Open or blocked tickets change only through approved escalation resolution or re-decomposition. A ticket is *done* when a commit with a `Ticket: <id>` trailer exists; *ready* when its deps are done. A fresh session reconstructs queue state from git plus the dependency graph; an ambiguous interrupted review round requires user confirmation.
- **Single writer, closed event set.** The loop is a feedback system over that externalized state. State changes only through the orchestrator — a commit, or an approved artifact edit (the `blocked` marker, an escalation resolution). Everything else is an event proposing a transition: a developer report (`DONE`/`BLOCKED`), a review verdict, a user decision, a manual-test bug report. A move not triggered by one of these is not a move — there is no partial accept and no silent spec drift. Advisors (oracle, contrarian, repo-scout, github-librarian) inform judgment but never transition state; only a developer dispatch returns a completion event to the loop.
- **Per-ticket local commits** are the completion ledger and stay local. The runnable tracer is a human checkpoint, as are load-bearing high-risk slices. Human review of the final series is required before merge or release and may happen locally or in the pull request; `/review` is only supporting evidence.
- **2-round cap.** If a ticket fails review twice it escalates to you at the requirements level — usually a sign the ticket or contract is wrong, not the developer.
- **Program-design changes are a re-decompose event:** bounce back to `/plan-feature` then `/decompose`; corrections move forward as new tickets and old commits are never rewritten. Replaced open tickets are removed, and uncommitted work against a replaced spec is not reviewed or committed.

## Workflow Profiles

- **Small:** direct implementation for obvious edits and bugs with a clear path; `/architect` creates no artifact and sends the user to a fresh normal Claude session for the implementation request.
- **Standard:** the normal artifacts, a runnable tracer first, human review before accepting that tracer, and final human review before merge or release.
- **High-risk:** the standard flow plus independent plan review when available and human checkpoints for load-bearing, migration, security, persistence, or hard-to-reverse slices.

The artifacts map cleanly to the design phases: `decision-brief.md` owns product intent and system architecture, `plan.md` owns program design and the change map, and `tickets/` owns vertical delivery slices. Bug fixes and `test-first` tickets report fail-before/pass-after evidence when meaningful.

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
- `oracle`: `fable` / `xhigh` — the deepest model, in a bounded burst: fresh context in, short report out.
- `contrarian`: `fable` / `xhigh` — same shape as oracle; adversarial reasoning is where the top model earns its cost.
- `github-librarian`: `sonnet` / `medium` — locate-and-cite tool work, not analysis.
- Commands inherit the session model and `/effort` — the grilling, decomposition, and inline review are your reasoning under your control.

The allocation principle: the main session is a long-lived context replayed every turn, so run it on Opus (`/model opus`) — `/architect` will suggest this if it notices the session is on Fable. Fable lives only in `oracle`/`contrarian` bursts, where its cost is bounded by construction. If Opus-in-main still proves too expensive, the next lever is a `code-reviewer` subagent so the orchestrator stops reading full diffs — deliberately not adopted yet.

Edit the `model:` / `effort:` frontmatter to taste. Note `xhigh` is not available on Sonnet, and available levels depend on the model.

## Execution Model & Limits

- **The ticket loop is intentionally serial.** Ticket-level parallelism is a non-goal: declared scopes are predictions, shared generated files (`project.pbxproj`, `Package.resolved`, codegen output) conflict even across "disjoint" modules, and interleaved diffs break per-ticket review attribution. Parallelize at the **feature level** instead — one git worktree and one architect session per feature.
- **Grounded on verified runtime facts:** subagents are one-shot (no mid-task back-and-forth, no sibling channel), can nest up to 5 levels deep, and inherit project `CLAUDE.md` but not the parent conversation. The developer's BLOCKED protocol exists because it cannot ask a question mid-task.

## Relationship To The OpenCode Extensions

This package began as a mirror of the OpenCode `opencode/agents/architect/`, `opencode/agents/oracle/`, `opencode/agents/librarian/`, and `opencode/commands/` packages and grew into a fuller ticket-driven harness. Notable translation points:

- Claude Code slash commands run in the current session (no per-command `agent:` binding), so role instructions live in each command body.
- Architect is a `/architect` command, not a `mode: primary` agent — Claude Code has no persistent primary-agent switch, and Architect is interactive.
- Claude Code auto-delegates to subagents by `description`; no `permission.task` wiring is needed. Read-only agents drop `Edit`/`Write` from their `tools`.
- Models are remapped from OpenCode's per-agent OpenAI/Anthropic mix to the Claude models above.

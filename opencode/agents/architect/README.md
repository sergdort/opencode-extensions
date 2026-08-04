# OpenCode Architect Orchestrator

Architect is a persistent OpenCode primary agent that carries non-trivial feature work from architecture through a resumable, ticket-driven implementation loop.

You switch to the top-level `architect` agent once. There is no `/architect` command. Architect remains accountable for planning, decomposition, dispatch, review, escalation, and local commits while fresh Developer subagents write product code.

## Workflow

```text
select architect
  -> inspect repository and settle architecture
  -> decision-brief.md
  -> /plan-feature
  -> plan.md
  -> /decompose
  -> tickets/*.md
  -> /start-work
  -> dispatch Developer, review, commit, repeat
```

Inline per-ticket agent review is the normal review mechanism. Selected tickets pause for human review before acceptance, and the final series requires human review before merge or release. `/review-work` remains available as an optional independent agent pass; it does not replace either human check.

## What It Provides

Agents in `agents/`:

- `architect.md`: primary orchestrator and reviewer
- `developer.md`: Terra-high Developer for standard, ambiguous, cross-boundary, or high-risk tickets and focused post-queue fixes; never commits
- `developer-luna.md`: Luna-max Developer for bounded behavior tickets with settled interfaces and credible automated verification; never commits
- `contrarian.md`: read-only adversarial review of one load-bearing decision

Architect and both Developers use OpenCode's built-in Explore agent for focused read-only codebase discovery.

Commands in `../../commands/`:

- `plan-feature.md`: turns the decision brief and repository evidence into reviewed program design, a change map, behavior, verification, and review checkpoints
- `decompose.md`: cuts the plan into a runnable tracer and dependency-ordered vertical slices, then assigns and surfaces each ticket's Developer route for approval; a narrow contract-only predecessor is optional
- `start-work.md`: dispatches each ticket to its approved Developer, reviews it, and commits accepted work one at a time
- `review-work.md`: optional outside review after the inline loop

Optional sibling packages add `oracle` and `github-librarian` delegation.

## Durable State

- `decision-brief.md`: product intent, system architecture, settled decisions, workflow profile, risks, and review cadence
- `plan.md`: reviewed execution sketch, call flow, change map, behavioral contract, verification, and human checkpoints
- `tickets/*.md`: approved work-unit specifications, Developer routes, and dependency graph
- Git trailers: `Ticket: <id>` records completion and `Fix: <slug>` records accepted post-queue fixes

Ready and done state is derived from git plus ticket dependencies. A fresh or compacted Architect session can reconstruct the queue; an ambiguous interrupted review round requires user confirmation rather than hidden runtime state.

The workflow is a feedback loop over this externalized state, with a closed event set: a Developer report (`DONE` or `BLOCKED`), Architect's review verdict, a human checkpoint decision, or a post-queue bug report. Only Architect writes state through a commit or approved artifact edit; Developer diffs are proposals until reviewed. Explore, Contrarian, Oracle, and GitHub Librarian inform judgment but never transition state.

## Workflow Profiles

- **Small:** direct implementation for obvious edits and bugs with a clear path; Architect sends the user to the normal `build` agent instead of creating artifacts.
- **Standard:** the normal artifacts, a runnable tracer first, human review before accepting that tracer, and final human review before merge or release.
- **High-risk:** the standard flow plus independent plan review when available and human checkpoints for load-bearing, migration, security, persistence, or hard-to-reverse slices.

The artifacts map to the design phases without adding files: the brief owns product intent and system architecture, the plan owns program design and the file change map, and tickets own vertical delivery slices. Bug fixes and `test-first` tickets report fail-before/pass-after evidence when meaningful.

## Boundaries

- Architect researches the repository directly before asking design questions.
- Architect may edit workflow artifacts but does not write product code during the workflow.
- The assigned Developer edits product code and tests but cannot stage, commit, push, or discard worktree changes.
- Architect reviews each ticket, pauses at declared human checkpoints, and creates local commits; it cannot push or run destructive cleanup commands.
- A ticket receives at most two Developer rounds before requirements-level escalation.
- Shared-interface or program-design changes return to `/plan-feature` and `/decompose`; accepted commits are not rewritten.

These boundaries use both prompts and OpenCode permissions. Architect edits are allowed without per-file approval, while its prompt limits direct writes to workflow artifacts, temporary drafting files, and specific edits explicitly requested by the user. Named subagents and the built-in Explore agent are allowed; unlisted Task delegation still requires approval. Architect and Developer may run routine repository commands without confirmation, while direct and RTK-wrapped Git operations that publish, rewrite history, switch branches, stash, or discard work are denied. Explore has no Bash access; Contrarian allows only read-only Git inspection through Bash.

## Non-Goals

- No plugin, installer, custom tool, subprocess harness, hidden config mutation, or runtime state machine
- No parallel ticket execution — the loop is intentionally serial; parallelize at the feature level with one git worktree and one Architect session per feature
- No automatic push, squash, or history rewriting
- No requirement that Oracle, GitHub Librarian, or Plannotator be installed

## Global Install

For the complete Architect, Oracle, Librarian, and command set, run the repository-level `opencode/link-global.sh` helper. It creates global symlinks without changing `opencode.json`; use the copy instructions below when installing only this package.

```bash
ARCHITECT_DIR=/path/to/opencode-extensions/opencode/agents/architect
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p ~/.config/opencode/agents ~/.config/opencode/commands
cp "$ARCHITECT_DIR"/agents/*.md ~/.config/opencode/agents/
cp "$ARCHITECT_DIR/ARCHITECT_INSTRUCTIONS.md" ~/.config/opencode/ARCHITECT_INSTRUCTIONS.md
cp "$COMMANDS_DIR/plan-feature.md" ~/.config/opencode/commands/plan-feature.md
cp "$COMMANDS_DIR/decompose.md" ~/.config/opencode/commands/decompose.md
cp "$COMMANDS_DIR/start-work.md" ~/.config/opencode/commands/start-work.md
```

Optionally copy `review-work.md` if a `review` agent is installed:

```bash
cp "$COMMANDS_DIR/review-work.md" ~/.config/opencode/commands/review-work.md
```

Optionally append the routing policy to global `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["/Users/you/.config/opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

Use an absolute path globally and merge it with existing instructions.

## Project Install

```bash
ARCHITECT_DIR=/path/to/opencode-extensions/opencode/agents/architect
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p .opencode/agents .opencode/commands
cp "$ARCHITECT_DIR"/agents/*.md .opencode/agents/
cp "$ARCHITECT_DIR/ARCHITECT_INSTRUCTIONS.md" .opencode/ARCHITECT_INSTRUCTIONS.md
cp "$COMMANDS_DIR/plan-feature.md" .opencode/commands/plan-feature.md
cp "$COMMANDS_DIR/decompose.md" .opencode/commands/decompose.md
cp "$COMMANDS_DIR/start-work.md" .opencode/commands/start-work.md
```

Optionally copy `review-work.md` if a `review` agent is installed:

```bash
cp "$COMMANDS_DIR/review-work.md" .opencode/commands/review-work.md
```

Optionally add the project routing instruction:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [".opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

## Optional Agents

Install the sibling Oracle or Librarian packages if desired. Architect's bundled Task policy already allows `oracle` and `github-librarian` by name; unavailable agents simply cannot be invoked.

The bundled delegation graph is:

```text
architect -> developer, developer-luna, explore, contrarian, oracle, github-librarian
developer -> explore
developer-luna -> explore
```

All other programmatic delegation requires user approval. A hard parent-level Task denial would propagate into child sessions and prevent Developer from invoking Explore. Users can also invoke visible subagents manually with `@` according to OpenCode's normal behavior.

## Models

Defaults:

- Architect: `openai/gpt-5.6-sol`, `high`
- Standard Developer: `openai/gpt-5.6-terra`, `high`
- Bounded Developer: `openai/gpt-5.6-luna`, `max`
- Explore: OpenCode built-in; recommended override is `openai/gpt-5.6-terra`, `low`
- Contrarian: `openai/gpt-5.6-sol`, `xhigh`

Built-in Explore does not declare its own model and otherwise inherits the caller's model. Merge the `agent.explore` block from `opencode.architect.example.json` into your global or project config to keep discovery on the cheaper model.

The lead seat runs with sustained high reasoning. `/decompose` assigns Luna only when a behavior ticket has unambiguous acceptance criteria, settled shared interfaces, predictable local scope, credible automated verification, direct observable proof, and no architectural judgment or hard-to-reverse risk. Terra remains the safe default when any of that evidence is missing. Contrarian and the sibling Oracle package run in fresh, bounded `xhigh` contexts with distinct review roles; their independence comes from context and charter, not a different model family.

Edit copied agent frontmatter to match available provider models and variants.

## Usage

1. Switch to the top-level `architect` agent.
2. Describe the feature or decision. Architect inspects the repository before grilling the design.
3. After `decision-brief.md` is agreed, run `/plan-feature`.
4. Review the plan, then run `/decompose` and approve the ticket cut and Developer routes.
5. Run `/start-work`. Architect drains the queue, pausing at declared human checkpoints, or stops on an escalation.
6. Complete final human review locally or in the pull request before merge or release. The user decides whether to squash or push.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.

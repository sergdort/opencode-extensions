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

Inline per-ticket review is the normal review mechanism. `/review-work` remains available as an optional independent final pass.

## What It Provides

Agents in `agents/`:

- `architect.md`: primary orchestrator and reviewer
- `developer.md`: implements and verifies one ticket or focused fix; never commits
- `repo-scout.md`: hidden read-only local discovery helper available only to Developer
- `contrarian.md`: read-only adversarial review of one load-bearing decision

Commands in `../../commands/`:

- `plan-feature.md`: turns the decision brief and repository evidence into a frozen executable plan
- `decompose.md`: cuts the plan into dependency-ordered vertical slices with a contract ticket zero
- `start-work.md`: dispatches, reviews, and commits tickets one at a time
- `review-work.md`: optional outside review after the inline loop

Optional sibling packages add `oracle` and `github-librarian` delegation.

## Durable State

- `decision-brief.md`: settled architecture, meaningful rejected options, risks, and review focus
- `plan.md`: frozen interface sketch, call flow, behavioral contract, and verification strategy
- `tickets/*.md`: approved work-unit specifications and dependency graph
- Git trailers: `Ticket: <id>` records completion and `Fix: <slug>` records accepted post-queue fixes

Ready and done state is derived from git plus ticket dependencies. A fresh or compacted Architect session can reconstruct the queue without hidden runtime state.

## Boundaries

- Architect researches the repository directly before asking design questions.
- Architect may edit workflow artifacts but does not write product code during the workflow.
- Developer edits product code and tests but cannot stage, commit, push, or discard worktree changes.
- Architect reviews each ticket and creates local commits; it cannot push or run destructive cleanup commands.
- A ticket receives at most two Developer rounds before requirements-level escalation.
- Contract changes return to `/plan-feature` and `/decompose`; accepted commits are not rewritten.

These boundaries use both prompts and OpenCode permissions. Unlisted Task delegation and non-artifact edits require approval; named subagents and workflow artifacts are allowed. Architect and Developer may run routine repository commands without confirmation, while direct and RTK-wrapped Git operations that publish, rewrite history, switch branches, stash, or discard work are denied. Repo Scout and Contrarian allow only read-only Git inspection through Bash.

## Non-Goals

- No plugin, installer, custom tool, subprocess harness, hidden config mutation, or runtime state machine
- No automatic parallel ticket execution
- No automatic push, squash, or history rewriting
- No requirement that Oracle, GitHub Librarian, or Plannotator be installed

## Global Install

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
architect -> developer, contrarian, oracle, github-librarian
developer -> repo-scout
```

All other programmatic delegation requires user approval. A hard parent-level Task denial would propagate into child sessions and prevent Developer from invoking Repo Scout. Users can also invoke visible subagents manually with `@` according to OpenCode's normal behavior.

## Models

Defaults:

- Architect: `openai/gpt-5.5`, `xhigh`
- Developer: `openai/gpt-5.5`, `high`
- Repo Scout: `openai/gpt-5.5`, `low`
- Contrarian: `openai/gpt-5.5`, `xhigh`

Edit copied agent frontmatter to match available provider models and variants.

## Usage

1. Switch to the top-level `architect` agent.
2. Describe the feature or decision. Architect inspects the repository before grilling the design.
3. After `decision-brief.md` is agreed, run `/plan-feature`.
4. Review the plan, then run `/decompose` and approve the ticket cut.
5. Run `/start-work`. Architect drains the queue or stops on an escalation.
6. Review the local commit series and decide whether to squash or push.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.

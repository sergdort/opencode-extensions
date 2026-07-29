# Codex Architect Workflow

A file-based, tracer-first feature workflow for local Codex clients. The main
Codex thread acts as Architect, custom subagents implement and advise, and
temporary Markdown artifacts carry state across context boundaries.

The package targets the Codex desktop app, CLI, and IDE extension. It does not
provide a custom top-level primary mode; Codex custom agents are spawned
sessions.

## What It Provides

- Four explicit skills:
  - `$architect` settles product intent, architecture, risk, and review cadence.
  - `$plan-feature` writes the reviewed program design in `plan.md`.
  - `$decompose` creates a runnable tracer followed by dependency-ordered
    vertical tickets.
  - `$start-work` runs the serial implementation, review, checkpoint, and local
    commit loop.
- Three custom agents:
  - `developer` implements one ticket or focused fix and leaves it uncommitted.
  - `oracle` gives a broad read-only second opinion.
  - `contrarian` attacks one specific architectural claim.
- Codex's built-in `explorer` for narrow read-heavy discovery.
- An optional GitHub Librarian package under `optional/librarian/`.
- Optional Plannotator assistance during plan review when its skill is already
  installed.

Every bundled skill is manual-only. Matching prose does not activate it.

## Requirements

- A current local Codex desktop, CLI, or IDE client with subagents enabled.
- Git for ticket completion and local commits.
- The separate `grill-me-architecture` skill installed where Codex can discover
  it. `$architect` stops before writing artifacts when it is missing.
- A session permission mode that allows the required repository reads, product
  edits, tests, and local commits. Codex may still prompt for Git writes.

This package does not install dependencies or edit Codex configuration.

## Install

Choose global or project-local installation. For a global setup, use the
opt-in symlink helper or copy the files manually.

### Global

Preview and link the core package:

```sh
codex/link-global.sh --dry-run
codex/link-global.sh
```

Use `--force` to replace existing differing copies or directories. Add
`--with-librarian` to link the optional Librarian package too. The helper
changes only the named skill and agent destinations; it does not install
`grill-me-architecture`, edit Codex configuration, or touch unrelated files.

Override the destination roots with `CODEX_SKILLS_DIR` and `CODEX_AGENTS_DIR`
when needed.

For a manual installation, copy the four skill directories into:

```text
~/.agents/skills/architect/
~/.agents/skills/plan-feature/
~/.agents/skills/decompose/
~/.agents/skills/start-work/
```

Copy the custom agents into:

```text
~/.codex/agents/developer.toml
~/.codex/agents/oracle.toml
~/.codex/agents/contrarian.toml
```

### Project-local

Copy the four skill directories into:

```text
<project>/.agents/skills/architect/
<project>/.agents/skills/plan-feature/
<project>/.agents/skills/decompose/
<project>/.agents/skills/start-work/
```

Copy the custom agents into:

```text
<project>/.codex/agents/developer.toml
<project>/.codex/agents/oracle.toml
<project>/.codex/agents/contrarian.toml
```

Trust the project when Codex asks so project configuration can load. Reload
Codex after installing or changing skills or custom agents.

To add the optional Librarian, copy its skill and agent from
`codex/optional/librarian/` to the corresponding skill and agent directories.
Its README documents the `gh` and network requirements.

## Use

Start in a Git checkout with no workflow artifacts from another feature:

```text
$architect <feature or problem>
$plan-feature
$decompose
$start-work
```

The first invocation establishes Architect in the main thread for the active
workflow. The other skills are explicit phase transitions. A new thread needs a
new `$architect` invocation.

If `decision-brief.md`, `plan.md`, or `tickets/` already exists, `$architect`
stops and asks whether to resume. A different workflow waits for the user to
remove those files. Use a separate branch or worktree for a concurrent feature.

## Workflow Profiles

- **Small:** no artifacts or subagents. Continue the direct change in a fresh
  vanilla Codex thread.
- **Standard:** tracer-first implementation, human review before accepting the
  tracer, and final human review.
- **High-risk:** standard flow plus checkpoints for load-bearing, migration,
  security, persistence, and hard-to-reverse slices.

Agent review and Codex's built-in `/review` never replace human checkpoints or
final human review.

## Artifacts And State

The workflow uses:

```text
decision-brief.md
plan.md
tickets/*.md
```

These files are temporary, uncommitted session-lifecycle state. The workflow
never stages, commits, overwrites, backs up, or cleans them up. The user removes
them when they are no longer needed.

Ticket completion is derived only from a full commit-message line:

```text
Ticket: <id>
```

Post-queue fixes use:

```text
Fix: <short-stable-id>
```

Artifacts can resume a workflow in the same checkout. They do not make the
workflow portable to a fresh clone because they are not committed.

## Execution Model

- Product writes are serial.
- A fresh `developer` handles one ticket or fix at a time.
- The Developer receives artifact paths rather than the Architect conversation.
  Strict context isolation is requested when the active Codex surface exposes
  that control; artifacts remain authoritative either way.
- Developer may use only built-in `explorer` for a narrow read-only question.
- Architect reviews the complete diff on design and scope, test faithfulness,
  correctness and verification, and maintainability and program-design fit.
- The tracer and declared high-risk tickets pause for human review before
  staging.
- Architect creates one local commit per accepted ticket and never pushes.
- One fresh correction round is allowed. Another failure or a load-bearing
  ambiguity blocks the ticket and returns the decision to the user.
- Manual-test bugs use focused fresh Developer passes and `Fix:` trailers. Each
  fix makes final human review pending again.

Architect normally does not write product code. It may make one narrowly
specified edit only when the user explicitly asks it to do so; that edit
consumes the ticket's correction budget.

## Dirty Worktree And Git Safety

Unrelated dirty product changes may remain if they do not overlap the next
ticket. Architect snapshots Git and file ownership before every Developer
dispatch and checks it again before review.

The custom Developer is instructed never to stage, commit, change branches,
rewrite history, stash, reset, restore, clean, or discard work. Codex does not
currently document an OpenCode-style per-agent command deny that can enforce
this boundary without affecting ordinary Codex work. The Architect therefore
checks `HEAD`, branch, index, status, untracked files, and pre-existing dirty
content after every dispatch. It stops without auto-repair when an invariant
changes.

Subagents inherit live parent permission and sandbox choices. This package does
not weaken them or install global command rules. Local commits may require a
Codex approval prompt.

## Models

Defaults:

- Main Architect: inherits the selected session model; GPT-5.6 at high or above
  is recommended.
- Developer: `gpt-5.6-terra`, high.
- Oracle: `gpt-5.6`, xhigh.
- Contrarian: `gpt-5.6`, xhigh.
- Optional Librarian: `gpt-5.6-terra`, high.

Edit or remove the `model` and `model_reasoning_effort` fields in the TOML files
when those model ids are unavailable or you prefer inherited defaults. Reload
Codex after changes.

## Non-goals

- No plugin, installer, hidden config mutation, hook, runtime state machine, or
  persistent `AGENTS.md` router.
- No deprecated custom prompts.
- No custom primary-agent emulation.
- No parallel ticket writers.
- No automatic artifact cleanup.
- No remote Git operations or history rewriting.
- No claim of mechanically enforced per-agent Git permissions.

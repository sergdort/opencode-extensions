# OpenCode Architect Orchestrator

Architect is a persistent OpenCode primary agent for non-trivial feature work. It grills the design, records settled decisions, creates a working plan, and directs Developer subagents through implementation, final review, and QA.

Switch to the top-level `architect` agent once. There is no `/architect` command. Architect remains accountable while fresh Developer subagents write product code.

## Workflow

```text
select architect
  -> inspect repository and grill the design
  -> decision-brief.md
  -> /plan-feature
  -> plan.md
  -> /start-work
  -> choose next coherent phase
  -> route Terra or Luna just in time
  -> integrate and repeat
  -> full review and QA
  -> final human acceptance
```

The plan's architecture is binding; its provisional details are not. Developers adapt provisional details when repository evidence disagrees with the predicted implementation, and escalate a settled rule they cannot meet. Architect returns to the user only for product conflicts, hard-to-reverse decisions, material scope changes, or safety risks.

## What It Provides

Agents in `agents/`:

- `architect.md`: primary orchestrator, integrator, reviewer, and local committer
- `developer.md`: Terra-high Developer for uncertain, cross-layer, stateful, debugging-heavy, or weakly verified work
- `developer-luna.md`: Luna-max Developer for bounded work with stable behavior and direct automated verification

Both Developers run in two modes: plan mode inside `/start-work`, where the plan's architecture rules bind them, and direct mode, where a self-contained brief is the contract. Direct mode supports follow-up sessions, QA findings, and ad hoc fixes dispatched from Architect or any other agent, with the same verdict protocol and Git limits.
- `contrarian.md`: read-only adversarial review of one load-bearing decision

Architect and both Developers use OpenCode's built-in Explore agent for focused read-only repository discovery.

Commands in `../../commands/`:

- `plan-feature.md`: turns the decision brief and repository evidence into a program design and test strategy
- `start-work.md`: selects coherent phases, routes a Developer just in time, integrates results, and runs final review and QA
- `review-work.md`: optional independent review of the completed implementation

Optional sibling packages add `oracle` and `github-librarian` delegation.

## Durable State

- `decision-brief.md`: product intent, system boundaries, external constraints, hard-to-reverse decisions, risks, and review needs
- `plan.md`: program design, test strategy, phases, review baseline, regression gate, and the gate failures already present at that baseline
- Git history: coherent integrated milestones
- Working tree: active implementation

There is no ticket queue or separate progress ledger. A fresh or compacted Architect inspects the artifacts, Git, code, tests, and runtime evidence before selecting the next phase. The plan's `Review baseline` SHA survives compaction, so the final comparison range does not have to be re-derived.

## Program Design

`plan.md` is written for a reader who skims: tables, real interface code, and at most three Mermaid diagrams. Tables are normative and diagrams are explanatory.

The core artifact is a component table with `Owns`, `Does not own`, and a closed `May depend on` allowlist, plus settled interfaces, state transition ownership with effects and cancellations, and a test strategy table keyed by stable behavior IDs.

What is **settled** binds Developers: component responsibility, allowed dependencies, transition and effect ownership, crossing-boundary contract semantics, persistence and migration behavior, concurrency isolation, error shape, and module placement. What is **provisional** may be adapted and reported: private helper signatures, internal names, file placement inside a chosen module, test names and fixtures, and local dependency-injection mechanics.

Settled means no silent change, not immutable. When implementation evidence disproves a settled rule, Architect updates the plan before any later phase depends on it.

## Implementation Loop

Architect selects the next phase from the plan and current code. It chooses the Developer immediately before dispatch:

- Use Luna only when behavior, ownership, scope, and verification are bounded and predictable.
- Use Terra when any boundary is uncertain or the work needs broad reasoning.
- If either Developer returns retryable `INCOMPLETE`, Architect changes the brief, strategy, or tool path without creating workflow state. Architect stops and reports a non-retryable technical blocker after one credible alternate path fails.
- If Luna returns `NEEDS_TERRA`, Architect sends the evidence directly to Terra.
- If a Developer returns `NEEDS_DECISION`, Architect validates that a real user decision is required.

Every phase brief carries the architecture slice for the components in scope, not just the goal. After each phase, Architect runs an integration check that verifies architecture conformance against the diff, and confirms that no earlier proof regressed. Regression cadence is tiered: focused plus earlier proofs per phase, the affected module suite at milestones, the full suite at final review.

Architect does not run a formal review or request user approval for a phase. The loop runs uninterrupted until the required behavior works, then full code review, QA, and final human acceptance begin. Mid-implementation, Architect asks the user only about a blocking product or hard-to-reverse decision, unrelated dirty worktree changes, an unusable review baseline, or evidence that the product intent itself is wrong.

## Workflow Profiles

- **Small:** use the normal `build` agent directly. Do not create workflow artifacts.
- **Standard:** use a decision brief and working plan. Build useful behavior early, run the phase loop uninterrupted, then run full review, QA, and final human acceptance.
- **High-risk:** add focused independent plan review before implementation, and widen final review and QA around security, persistence, migration, public API, broad refactor, or another hard-to-reverse boundary.

## Boundaries

- Architect inspects the repository before asking design questions.
- Architect edits `decision-brief.md` and `plan.md` freely. Any other Architect file edit asks for user approval through the edit permission. Architect does not write product code.
- Developers edit product code and tests but cannot stage, commit, push, rewrite history, or discard worktree changes.
- Developers may adapt provisional details and must report them. A settled architecture rule they cannot meet is a `NEEDS_DECISION`, never a silent change or a workaround.
- Every Developer report includes an architecture-conformance section naming real paths, which Architect verifies against the diff.
- Architect performs integration checks, creates useful local milestone commits, directs final fixes, and never pushes.
- There is no fixed correction-round limit. Architect changes strategy after repeated failure instead of forcing a requirements escalation.
- Final human acceptance remains required before merge or release.

These boundaries use prompts and OpenCode permissions. Architect's edit permission allows only `plan.md` and `decision-brief.md` and asks for every other path. Architect can invoke named subagents and built-in Explore. Unlisted Task delegation still requires approval. Direct and RTK-wrapped Git operations that publish, rewrite history, switch branches, stash, or discard work remain denied.

Loop mechanics live in the commands: `/plan-feature` carries the program-design rules and `/start-work` carries the delegation, integration, and review rules. The agent file stays minimal; to resume an interrupted implementation, re-run `/start-work`.

## Non-Goals

- No tickets, dependency queue, workflow trailers, plugin, installer, hidden state, or runtime state machine
- No automatic push, squash, history rewriting, or destructive worktree cleanup
- No automatic model routing outside Architect's explicit phase-by-phase judgment
- No requirement that Oracle, GitHub Librarian, Review, or Plannotator is installed

## Global Install

For Architect, Oracle, Librarian, and the core command set, run `opencode/link-global.sh`. It creates global symlinks without changing `opencode.json`. Install `review-work.md` separately when a read-only `review` agent is available.

To copy only this package:

```bash
ARCHITECT_DIR=/path/to/opencode-extensions/opencode/agents/architect
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p ~/.config/opencode/agents ~/.config/opencode/commands
cp "$ARCHITECT_DIR"/agents/*.md ~/.config/opencode/agents/
cp "$ARCHITECT_DIR/ARCHITECT_INSTRUCTIONS.md" ~/.config/opencode/ARCHITECT_INSTRUCTIONS.md
cp "$COMMANDS_DIR/plan-feature.md" ~/.config/opencode/commands/plan-feature.md
cp "$COMMANDS_DIR/start-work.md" ~/.config/opencode/commands/start-work.md
```

Optionally copy `review-work.md` when a read-only `review` agent is installed:

```bash
cp "$COMMANDS_DIR/review-work.md" ~/.config/opencode/commands/review-work.md
```

If you installed an older copy-based version, remove its obsolete command:

```bash
rm -f ~/.config/opencode/commands/decompose.md
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
cp "$COMMANDS_DIR/start-work.md" .opencode/commands/start-work.md
```

Optionally copy `review-work.md`:

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

Install the sibling Oracle or Librarian packages if desired. Architect's Task policy already allows `oracle` and `github-librarian`. Unavailable optional agents do not block normal work.

The Task allowlist is:

```text
architect -> developer, developer-luna, explore, contrarian, oracle, github-librarian
architect -> review when an optional read-only review agent is installed
developer -> explore
developer-luna -> explore
```

## Models

Agent definitions omit `model` and `variant`. Configure role routing in global `~/.config/opencode/opencode.json` or project `opencode.json`.

Recommended routes:

- Architect: `openai/gpt-5.6-sol`, `high`
- Terra Developer: `openai/gpt-5.6-terra`, `high`
- Luna Developer: `openai/gpt-5.6-luna`, `max`
- Explore: OpenCode built-in, with `openai/gpt-5.6-terra`, `low` as the recommended override
- Contrarian: `openai/gpt-5.6-sol`, `xhigh`

Merge the `agent` block from `opencode.architect.example.json` into your global or project config. Edit routes to match available models and variants.

Architect chooses Luna only for a bounded immediate phase with direct verification. Terra remains the default when evidence is incomplete. Routing is not fixed in `plan.md` and can change between phases.

## Usage

1. Switch to the top-level `architect` agent.
2. Describe the feature or decision. Architect inspects the repository before grilling the design.
3. Agree on `decision-brief.md`.
4. Run `/plan-feature`.
5. Run `/start-work`. Architect implements the plan through dynamic Developer delegation.
6. Complete final review, QA, and human acceptance before merge or release.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.

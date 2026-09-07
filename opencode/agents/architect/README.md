# OpenCode Architect Orchestrator

Architect is a persistent OpenCode primary agent for non-trivial feature work. It grills the design, records settled decisions, creates a working plan, and directs Developer subagents through implementation, final review, and QA.

Switch to the top-level `architect` agent once. There is no `/architect` command. Developers submit local task commits. Architect reviews them and resumes the same Developer for corrections when available.

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
  -> Developer focused proof and local task commit
  -> Architect submission review, corrections, and acceptance
  -> full review and QA
  -> final human acceptance
```

The plan's architecture is binding; its provisional details are not. Developers adapt provisional details when repository evidence disagrees with the predicted implementation, and escalate a settled rule they cannot meet. Architect returns to the user only for product conflicts, hard-to-reverse decisions, material scope changes, or safety risks.

## What It Provides

Generated agents in `generated/current/opencode/agents/`:

- `architect.md`: primary orchestrator, integrator, and reviewer
- `developer.md`: Terra-high Developer for uncertain, cross-layer, stateful, debugging-heavy, or weakly verified work
- `developer-luna.md`: Luna-max Developer for bounded work with stable behavior and direct automated verification

Both Developers run in two modes: plan mode inside `/start-work`, where the plan's architecture rules bind them, and direct mode, where a self-contained brief is the contract. Direct mode supports follow-up sessions, QA findings, and ad hoc fixes dispatched from Architect or any other agent, with the same verdict protocol and Git limits.
- `contrarian.md`: read-only adversarial review of one load-bearing decision

Architect and both Developers use OpenCode's built-in Explore agent for focused read-only repository discovery.

Generated commands in `generated/current/opencode/commands/`:

- `plan-feature.md`: turns the decision brief and repository evidence into a program design and test strategy
- `start-work.md`: selects coherent phases, routes a Developer just in time, integrates results, and runs final review and QA
- `review-work.md`: optional independent review of the completed implementation

Oracle is required for plan review. GitHub Librarian is optional. The shared `grill-me-architecture` skill is required for design.

## Durable State

- `decision-brief.md`: product intent, system boundaries, external constraints, hard-to-reverse decisions, risks, and review needs
- `plan.md`: program design, proof strategy, review baseline, and compact execution evidence, including exact known baseline failures
- Git history: task submissions and correction commits; acceptance is recorded separately in the plan
- Working tree: active implementation

There is no ticket queue or separate progress ledger. A fresh or compacted Architect inspects the artifacts, Git, code, tests, and runtime evidence before selecting the next phase. The plan's `Review baseline` SHA survives compaction, so the final comparison range does not have to be re-derived.

## Program Design

`plan.md` uses tables, real interfaces, and diagrams only where they explain a necessary relationship. Tables are normative and diagrams are explanatory.

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

Every task brief carries the architecture slice, not just the goal. Developers run focused proof and affected regression checks. Architect reviews correctness, tests, and design for every submission, then reviews corrections incrementally. Development, builds, tests, and runtime actions run sequentially. Independent read-only research and reviews may run concurrently.

Architect does not ask the user to approve each submission. It resolves combined-review findings before delegating the final full gate to the repository verifier when available. Valid evidence is reused while relevant inputs remain unchanged. Gate or QA failures return to the correction and review loop. Blocking user questions concern product decisions, protected-content conflicts, or an unusable baseline, not ordinary implementation failures.

## Workflow Profiles

- **Small:** use the normal `build` agent directly. Do not create workflow artifacts.
- **Standard:** use a decision brief, an Oracle-reviewed plan, Developer submissions, combined review, final verification, and human acceptance.
- **High-risk:** add focused Contrarian review of an uncertain load-bearing claim and widen proof around the actual risk.

## Boundaries

- Architect inspects the repository before asking design questions.
- Architect edits `decision-brief.md` and `plan.md` freely. Any other Architect file edit asks for user approval through the edit permission. Architect does not write product code.
- Developers submit task-only local commits after focused proof when repository policy permits. They preserve unrelated worktree content and staged entries.
- Developers may adapt provisional details and must report them. A settled architecture rule they cannot meet is a `NEEDS_DECISION`, never a silent change or a workaround.
- Every Developer report includes an architecture-conformance section naming real paths, which Architect verifies against the diff.
- Architect reviews submissions and directs fixes. It never stages or commits product changes.
- There is no fixed correction-round limit. Architect changes strategy after repeated failure instead of forcing a requirements escalation.
- Final human acceptance remains required before merge or release.

These are prompt rules with partial permission guardrails, not a shell sandbox. Architect's edit tool allows `plan.md` and `decision-brief.md` and asks for other paths. Selected Git command forms are denied. Broad shell access still requires the agent to respect ownership and mutation rules; permission patterns do not prevent every alternate command form.

Loop mechanics live in the commands: `/plan-feature` carries the program-design rules and `/start-work` carries the delegation, integration, and review rules. The agent file stays minimal; to resume an interrupted implementation, re-run `/start-work`.

## Non-Goals

- No tickets, dependency queue, workflow trailers, plugin, installer, hidden state, or runtime state machine
- No automatic push, squash, history rewriting, or destructive worktree cleanup
- No automatic model routing outside Architect's explicit phase-by-phase judgment
- No requirement that GitHub Librarian, Review, or Plannotator is installed; Oracle and the grill skill are required

## Install

Requires Node.js 22 or newer. Run from the checkout:

```bash
npm ci
./opencode/link-global.sh --dry-run
./opencode/link-global.sh
```

The helper generates both native payloads, then links OpenCode core agents, commands, routing instructions, Librarian, and the shared grill skill. It does not edit `opencode.json`. Add `--with-review` only when an optional read-only `review` agent is installed.

After source updates, rerun the helper. Restart OpenCode and reload any Codex installation linked to this checkout. Selection limits link edits, not shared content publication.

Destination overrides are `OPENCODE_CONFIG_DIR` (default `$XDG_CONFIG_HOME/opencode`, or `~/.config/opencode`) and `AGENTS_SKILLS_DIR` (default `~/.agents/skills`).

See the root [migration and recovery rules](../../../README.md#migration-and-recovery) before replacing an existing installation. The helper migrates owned legacy links and removes owned obsolete decomposition links. It preserves foreign links and directories even with `--force`.

### Copy Native Files

Generate with `npm run generate` first. From the destination project, set the checkout path:

```bash
EXTENSIONS_DIR=/path/to/opencode-extensions
NATIVE_DIR="$EXTENSIONS_DIR/generated/current/opencode"
mkdir -p .opencode/agents .opencode/commands .agents/skills/grill-me-architecture
cp "$NATIVE_DIR/agents/"*.md .opencode/agents/
cp "$NATIVE_DIR/commands/"{bro,handoff,plan-feature,start-work}.md .opencode/commands/
cp "$NATIVE_DIR/ARCHITECT_INSTRUCTIONS.md" .opencode/ARCHITECT_INSTRUCTIONS.md
cp "$EXTENSIONS_DIR/skills/grill-me-architecture/SKILL.md" .agents/skills/grill-me-architecture/SKILL.md
```

Inspect destination conflicts before copying. For global copies, use `~/.config/opencode/` and `~/.agents/skills/` instead. Copy optional `review-work.md` only when its `review` agent is available. Install Librarian separately if needed.

### Optional Routing Config

Merge the instruction path into existing config. For a project:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [".opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

For global config, use an absolute path to the installed `ARCHITECT_INSTRUCTIONS.md`. The helper never changes these settings.

## Agent Dependencies

Install Oracle for mandatory plan review. Install Librarian if needed for GitHub research. Architect's Task policy allows both. Missing Oracle blocks plan completion; missing optional agents do not.

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
5. Review disclosed plan changes, then run `/start-work` to approve the current plan and begin implementation. Revise existing plans directly with Architect, not by repeating `/plan-feature`.
6. Complete final review, QA, and human acceptance before merge or release.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.

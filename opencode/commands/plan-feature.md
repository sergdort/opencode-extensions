---
description: Have Architect turn decision-brief.md and repository evidence into a reviewed, executable plan.md
agent: plan
---
Create or update the implementation plan for the current feature.

Command arguments are optional:

`$ARGUMENTS`

## Resolve The Plan File

- If command arguments name a Markdown file, accept it only when its basename is `plan.md`; otherwise stop and ask for a directory or a `plan.md` path.
- If command arguments name a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If the target plan already exists, read it before updating it.
- Read `decision-brief.md` next to the plan when it exists. It is the durable architecture source of truth.
- Do not look for or require `handoffs/`, `decision.md`, ADRs, or other handoff artifacts.

## Planning Inputs

- Use `decision-brief.md` plus the current Architect conversation as the architecture source of truth.
- Inspect the repository when needed to turn the agreed approach into realistic implementation steps.
- Do not invent architecture decisions. If the context is missing, ambiguous, or conflicts with repository reality, stop and ask the user.
- Keep rationale minimal. Capture only constraints that materially guide implementation.

## Output Artifact

- Create or update exactly one artifact: the resolved `plan.md` file.
- Do not create `behavior.md`, `.feature` files, extra ADRs, or additional planning artifacts unless the user explicitly asks.
- Keep `plan.md` concise, executable, and action-oriented.
- Do not turn `plan.md` into a full design document or paste the whole architecture discussion into it.

Use this shape unless the work clearly needs a small adjustment:

```md
# Plan: <feature>

## Goal

One or two sentences describing the intended outcome.

## Constraints

Only implementation-relevant constraints. Omit this section if there are none.

## Execution Sketch

Pseudo-code-level structure showing key types, interfaces, functions, ownership boundaries, and how pieces compose.

## Call Flow

Representative happy path and important failure path call stacks.

## Work Steps

Small ordered implementation steps.

## Behavioral Contract

Gherkin scenarios for observable behavior.

## Verification

How the important scenarios and risks will be checked.

## Review Notes

Review status, useful feedback incorporated, or why independent review was unnecessary or unavailable.
```

The `Execution Sketch` should be mostly pseudo-code, types, interfaces, function boundaries, and composition notes. The `Call Flow` should show the path through entrypoints, modules, state/data changes, and result handling. Do not enumerate every branch; include the paths that clarify ownership or implementation risk.

The Execution Sketch is the frozen contract. `/decompose` materializes its interfaces as compiling stubs in ticket zero, and later tickets build against them. Make shared interface seams explicit and stable here.

## Behavioral Contract

Include a `## Behavioral Contract` section inside `plan.md` with Gherkin scenarios.

Use the Gherkin contract as a pragmatic implementation constraint, not as dogmatic TDD. Capture observable behavior derived from the agreed approach.

Prefer these tags where useful:

```text
@must          implement now
@edge          edge case
@failure       failure path
@migration     compatibility/data migration behavior
@observability logging/metrics/tracing expectation
@manual        cannot be meaningfully automated
@deferred      explicitly out of scope
@tdd           write failing test first where practical
```

For each `@must` scenario, include or imply a verification mode:

```text
test-first
implementation-first
characterization-first
manual-verification
```

Choose the cheapest reliable verification strategy. Prefer test-first when behavior is pure, local, risky, or easy to assert. Use implementation-first for exploratory, UI-heavy, integration-heavy, or high-scaffolding work. Use characterization tests when changing existing behavior. Use manual verification notes when automation would be wasteful.

Do not create elaborate test infrastructure just to satisfy TDD. Do not mock the world. Do not keep expanding the test plan without producing an implementable plan.

## Plan Review

- Self-review the plan against the decision brief, repository evidence, goal, constraints, and behavioral contract.
- For high-risk architecture, security, migration, persistence, or broad refactor work, delegate a read-only plan review to `oracle` when available.
- When one load-bearing interface seam remains meaningfully debatable and was not already stress-tested, delegate that specific claim to `contrarian` before freezing it.
- Use Plannotator when available and useful, but do not make it a hard dependency.
- Incorporate material feedback into `plan.md` and record the outcome in `## Review Notes`.
- Do not build a rigid approval state machine. The user decides when to proceed.

## Final Response

Report:

- The plan file used
- Whether `plan.md` was created or updated
- Whether self-review or an independent review changed the plan
- Any open planning questions
- The next command: `/decompose` or `/decompose <plan-path>` if a non-default plan path was used

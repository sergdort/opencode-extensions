---
description: Create a Plannotator-reviewed executable implementation plan
agent: plan
---
Create or update the implementation plan for the current feature.

Command arguments are optional:

`$ARGUMENTS`

## Resolve The Plan File

- If command arguments name a Markdown file, use that file as the plan path.
- If command arguments name a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If the target plan already exists, read it before updating it.
- Do not look for or require `handoffs/`, `decision.md`, ADRs, or any other handoff artifact.

## Planning Inputs

- Use the current conversation context, especially the recent Architect discussion, as the architecture source of truth.
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

## Plannotator Notes

Review status, useful feedback incorporated, or why review was unavailable.
```

The `Execution Sketch` should be mostly pseudo-code, types, interfaces, function boundaries, and composition notes. The `Call Flow` should show the path through entrypoints, modules, state/data changes, and result handling. Do not enumerate every branch; include the paths that clarify ownership or implementation risk.

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

## Plannotator Review

- Submit `plan.md` to Plannotator using the plan agent's available planning review capability.
- Incorporate Plannotator feedback into `plan.md` when it improves correctness, scope, clarity, or verification.
- If Plannotator is unavailable or cannot review the plan, say so clearly in the final response and leave `plan.md` with visible review notes.
- Do not build a rigid approval state machine. The user decides when to proceed.

## Final Response

Report:

- The plan file used
- Whether `plan.md` was created or updated
- Whether Plannotator review was completed, revised from feedback, or unavailable
- Any open planning questions
- The next command: `/start-work` or `/start-work <plan-path>` if a non-default plan path was used

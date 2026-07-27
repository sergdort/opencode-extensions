---
description: Have Architect turn decision-brief.md and repository evidence into a reviewed, executable plan.md
agent: architect
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

## Change Map

A compact file-tree diff of expected additions, modifications, and removals, with key symbols or ownership noted where useful.

## Work Steps

Ordered vertical slices. The first slice must produce the smallest runnable or otherwise directly observable end-to-end path.

## Behavioral Contract

Gherkin scenarios for observable behavior.

## Verification

How the important scenarios and risks will be checked, including runtime touchpoints and fail-before/pass-after evidence where required.

## Human Review

Workflow profile, reviewer, and required checkpoints. For standard and high-risk work, the first runnable tracer requires review before acceptance and the final series requires review before merge or release.

## Review Notes

Review status, useful feedback incorporated, or why independent review was unnecessary or unavailable.
```

The `Execution Sketch` should be mostly pseudo-code, types, interfaces, function boundaries, and composition notes. The `Call Flow` should show the path through entrypoints, modules, state/data changes, and result handling. Do not enumerate every branch; include the paths that clarify ownership or implementation risk.

The Execution Sketch is the reviewed program-design baseline and the authority for shared interfaces. `/decompose` normally materializes only the interfaces needed by the first runnable tracer, inside that behavior ticket. A separate contract-only ticket is reserved for a narrow, genuinely stable external or shared boundary that must exist before its consumers. If tracer feedback disproves a planned seam, update the plan before later slices build on it; do not preserve a bad interface merely because it was written down.

The `Change Map` should use a compact tree or diff-style list. Show expected add/modify/remove paths, key symbols, and migration, generated-file, or shared-registry impact. It is a design review aid, not a promise that no neighboring file will change.

The `Work Steps` must be vertical, touchable slices rather than database/service/API/UI layers. Prefer a browser path, CLI command, API call, integration boundary, or direct public API test as the first feedback point. For pure libraries, a focused test through the public interface can be the touchpoint.

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

For bug fixes and `test-first` scenarios, require the implementation report to show that the targeted test failed for the expected reason before the fix and passed afterward. Allow an explicit exception when the pre-change failure cannot be run safely or meaningfully; record why.

Do not create elaborate test infrastructure just to satisfy TDD. Do not mock the world. Do not keep expanding the test plan without producing an implementable plan.

## Plan Review

- Self-review the plan against the decision brief, repository evidence, goal, constraints, and behavioral contract.
- For high-risk architecture, security, migration, persistence, or broad refactor work, delegate a read-only plan review to `oracle` when available.
- When one load-bearing interface seam remains meaningfully debatable and was not already stress-tested, delegate that specific claim to `contrarian` before accepting it as the program-design baseline.
- Use Plannotator when available and useful, but do not make it a hard dependency.
- Confirm the workflow profile and human checkpoints from the decision brief. Assign an available user or peer to pre-acceptance checkpoints. Record whether final review happens locally or through the eventual pull request. Agent review does not replace either form of human review.
- Incorporate material feedback into `plan.md` and record the outcome in `## Review Notes`.
- Do not build a rigid approval state machine. The user decides when to proceed.

## Final Response

Report:

- The plan file used
- Whether `plan.md` was created or updated
- Whether self-review or an independent review changed the plan
- Any open planning questions
- The next command: `/decompose` or `/decompose <plan-path>` if a non-default plan path was used

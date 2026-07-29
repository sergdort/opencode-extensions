---
name: plan-feature
description: Create or update the explicit Architect workflow's reviewed implementation plan in plan.md. Use only when the user invokes $plan-feature.
---

Operate in the main thread as Architect. Create or update the implementation
plan for the active workflow. Use any path accompanying the invocation as the
plan target.

Do not delegate planning to another agent. Use read-only explorers and advisors
only for bounded evidence or review.

## Resolve The Plan

- A named Markdown file is the plan path.
- A named directory resolves to `<directory>/plan.md`.
- With no path, use `plan.md` in the current repository or working directory.
- Read an existing target before updating it.
- Read `decision-brief.md` next to the plan when present.
- Use the current Architect conversation with the brief as the architecture
  source of truth.
- Do not require handoffs, ADRs, or other hidden or additional state.

If the architecture context is missing, ambiguous, or conflicts with repository
reality, stop and ask the user. Do not invent a decision.

## Output

Create or update exactly one temporary artifact: the resolved `plan.md`.
Do not create behavior files, ADRs, or extra planning artifacts unless the user
explicitly asks.

Use this shape unless the feature needs a small adjustment:

```md
# Plan: <feature>

## Goal

One or two sentences describing the intended outcome.

## Constraints

Only implementation-relevant constraints. Omit if empty.

## Execution Sketch

Pseudo-code-level structure showing key types, interfaces, functions,
ownership boundaries, and composition.

## Call Flow

Representative happy path and important failure path call stacks.

## Change Map

Compact file-tree diff of expected additions, modifications, and removals,
with key symbols and ownership where useful.

## Work Steps

Ordered vertical slices. The first behavior slice produces the smallest
runnable or directly observable end-to-end path.

## Behavioral Contract

Gherkin scenarios for observable behavior.

## Verification

Checks for important scenarios and risks, including runtime touchpoints and
fail-before/pass-after evidence where required.

## Human Review

Workflow profile, reviewer, tracer checkpoint, high-risk checkpoints, and
final review.

## Review Notes

Review status, feedback incorporated, or why review was unavailable.
```

Keep the artifact concise, executable, and action-oriented.

## Program-Design Baseline

- `Execution Sketch` is the reviewed authority for shared interfaces.
- `Call Flow` traces entrypoints, modules, state or data changes, failures, and
  result handling without enumerating every branch.
- `Change Map` is a design-review aid, not a promise that no neighboring file
  will change.
- Work steps are vertical and touchable, not database/service/API/UI layers.
- Prefer a browser path, CLI command, API call, integration point, or public
  API test as the first feedback point.
- The tracer normally materializes only the interfaces it needs.
- Use a separate contract-only predecessor only for a narrow, genuinely stable
  external or shared boundary that consumers require first.
- If tracer feedback disproves a planned seam, update the plan before later
  work builds on it.

## Behavioral Contract

Write observable Gherkin scenarios. Prefer these tags when useful:

```text
@must
@edge
@failure
@migration
@observability
@manual
@deferred
@tdd
```

Every `@must` scenario must include or imply one verification mode:

```text
test-first
implementation-first
characterization-first
manual-verification
```

Choose the cheapest reliable strategy. For bug fixes and test-first scenarios,
require credible fail-before/pass-after evidence. Allow a recorded exception
when a pre-change failure cannot be run safely or meaningfully. Do not add
elaborate test infrastructure only to satisfy TDD.

## Review

- Pressure-test the plan before calling it ready.
- For high-risk work, use `oracle` when available and incorporate material
  findings.
- Use `contrarian` for one load-bearing program-design seam that has not
  already faced a serious stress test. Do not ask it to review the whole plan.
- Use `plannotator-visual-explainer` only when it is installed and a visual
  explanation would materially improve review. It is optional and never
  replaces `plan.md`.
- Otherwise self-review against the goal, constraints, design, behavioral
  contract, and verification.
- Confirm the workflow profile and checkpoints from the brief.
- Assign an available user or peer to pre-acceptance checkpoints.
- Record whether final review happens locally or in the eventual pull request.
- Agent review and Codex's built-in `/review` never replace human checkpoints.
- Present the plan to the user for confirmation and record the outcome in
  `Review Notes`.

Do not turn review into a rigid approval state machine. The user decides when
to proceed.

`plan.md` remains uncommitted temporary workflow state. Never stage or commit
it, and never remove workflow artifacts.

## Final Response

Report the resolved path, whether the plan was created or updated, review
status, open questions, and the next explicit invocation: `$decompose` (with
the plan path when non-default).

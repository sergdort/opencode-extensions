---
description: Plan the feature with show-me, clarify requirements, and review the plan before approval
agent: plan
---
Plan the current feature with the user. Inspect the repository, clarify what matters, and review the plan before final approval. Do not implement product changes or dispatch Developers.

`$ARGUMENTS`

## Resolve The Plan

- If the argument names a Markdown file, require its basename to be `plan.md` and use it.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If a non-empty argument does not resolve to an existing directory or valid `plan.md` path, report it and stop.
- If the target plan exists, read it first. Revise it only when it belongs to this feature; ask when its identity is unclear. Preserve its review baseline and execution evidence.
- Use `plan.md` as the execution artifact. For a new plan, set `Review baseline` and `Known gate failures at baseline` to `unset`; `/start-work` owns both fields.
- Respect native planning restrictions. If the active mode cannot write the target, keep the draft in the conversation or the harness-designated plan file. Pass the full draft text to reviewers when no readable file exists. At handoff, identify the source and intended `plan.md` path so `/start-work` can save the reviewed plan without redesigning it.
- Do not create tickets, ADRs, decision briefs, or another workflow ledger. Existing user-supplied design notes are optional context.

## Planning

Load `show-me` for visual explanations. If it is unavailable, report the missing skill. Use the smallest shape that helps the user judge a meaningful choice; do not require a diagram for every question. Keep settled facts in the plan text, tables, or interfaces, not only in a diagram. Do not write visual artifacts when the active mode forbids them.

Use the harness's normal planning conversation. Inspect relevant code and tests before asking for facts the repository can answer. Clarify the goal, scope, constraints, important edge cases, and acceptance criteria. Ask focused questions only when the answer changes the plan. Draft once enough context is available, then refine it with the user; do not require a complete draft before the first question.

`grill-me-architecture` is a standalone, optional skill. Invoke it only when the user requests it. You may recommend it for a specific unresolved decision across components or a choice that is expensive to reverse. Explain the reason and continue normal planning unless the user chooses grilling. Feature size alone does not require it. Bring any resulting decisions into the plan.

Discuss component ownership, dependencies, contracts, state, and proof only to the depth the feature needs. Use `show-me` before structural or flow questions when a shape helps. Recommend an option when repository evidence supports it. Do not ask the user to choose private names, helper signatures, fixtures, or other local implementation details.

Mark consequential design facts:

- **Settled**: a Developer must not change it silently because reversal cost or blast radius is material.
- **Provisional**: a Developer may adapt it from repository evidence and report the adaptation.

Resolve blocking questions before final approval. Reversible, non-blocking details can remain provisional. Keep the draft current with agreed decisions, behavior coverage, implementation phases, and final QA. Drafts can be shown throughout the conversation; a draft is not approval.

## Plan Contract

Use this compact execution contract. Keep one row per relevant component, behavior, and phase. Omit interfaces, runtime shape, state, and open seams when they add no useful information.

````md
# Plan: <feature>

Goal: <one line>
Scope and non-goals: <what changes and what stays outside this feature>
Constraints and decisions: <agreed requirements and consequential choices>
Review baseline: unset
Regression gate: `<commands that must stay green>`
Known gate failures at baseline: unset

## Architecture

Tables and real interfaces are normative. Diagrams are explanatory.

| Component | Module / file | Owns | Does not own | May depend on |
|---|---|---|---|---|
| `<name>` | `<location>` | <responsibility> | <explicit exclusion> | <closed allowlist or none> |

### Interfaces

<real declarations or diffs, each marked settled or provisional>

### Runtime Shape

<optional call stacks or diagrams, each headed by the question it answers>

### State

Transition owner: `<component>`

| From | Event | To | Guard | Effect | Cancels |
|---|---|---|---|---|---|

Illegal, unrepresentable, or asserted: <important cases only>

### Open Seams

| Seam | Options | Recommendation | Status |
|---|---|---|---|

## Test Strategy

| ID | Behavior or invariant | Level | Mode | Proof |
|---|---|---|---|---|
| B1 | <observable outcome> | <unit, integration, UI, or manual> | <mode> | <proof> |

## Phases

| # | Coherent slice | Components | Behaviors |
|---|---|---|---|

## Risks And QA

- <material risk and mitigation, or none>
- Final QA: <runtime and manual checks>

## Evidence

| Scope / range | Result or pending work | Proof / reference |
|---|---|---|

<Record Oracle review and any Contrarian challenge here before handoff. During implementation, keep accepted ranges,
checks and artifact paths, blockers, pending reviews, and historical fail-before evidence.>
````

## Architecture Rules

- Give every new or materially changed component one row. Do not list untouched components.
- Keep `Owns` narrow. Use `Does not own` for a responsibility a reader could reasonably assign to the component by mistake.
- Treat `May depend on` as a closed component-level allowlist. List an abstraction instead of its implementation when the boundary requires it.
- Write crossing-boundary interfaces in the repository's real language. Mark each interface `settled` or `provisional`.
- Treat responsibility, dependency direction, state ownership, public contract semantics, persistence, concurrency, errors, cancellation, and module placement as settled when reversal is costly.
- Treat private helpers, exact internal names, local file placement, fixtures, and local dependency injection as provisional unless there is a specific reason not to.
- Include a state section only for meaningful lifecycle, recovery, competing outcomes, or effects that require cancellation. Name one transition owner and record effects and cancellations.
- Justify a non-obvious choice directly under its proposal in no more than two sentences.

Settled means no silent change, not immutable. `/start-work` updates the plan when implementation evidence disproves a settled rule.

## Test And Phase Rules

- Give each behavior a stable ID. State the expected outcome in the behavior cell.
- Use the cheapest level that credibly proves the behavior.
- Use `test-first`, `implementation-first`, `characterization`, or `manual` as the mode.
- Require fail-before and pass-after evidence for bug fixes and practical `test-first` behavior.
- Treat state transitions and cancellation effects as coverage obligations.
- Order phases around runnable vertical slices or focused proofs of risky assumptions.
- Keep each phase small enough for Architect to judge its architecture conformance in one pass.
- Reference exact component names and behavior IDs. `/start-work` rejects unresolved references.
- Do not assign the complex or bounded Developer in the plan. Architect selects the route immediately before each task.

## Review And Handoff

Once the draft is coherent, review it before presenting it for final approval:

1. Self-review against the user's requirements and repository evidence.
2. Dispatch read-only `oracle` for every plan. Supply the full draft, relevant repository context, constraints, and open questions. Ask it to assess correctness, missing cases, repository fit, and verification. If Oracle is unavailable or delegation is prohibited, report the blocker; do not claim the plan is reviewed.
3. Dispatch read-only `contrarian` when a meaningful uncertain, hard-to-reverse, or cross-component decision needs a challenge. Name one claim and ask for the strongest evidence-based case against it, including a simpler alternative when credible. Skip it when there is no meaningful claim to challenge. If a warranted challenge cannot run, report it as pending. Independent reviews may run concurrently.
4. Assess findings against evidence. Fix technical omissions directly. Bring consequential product or design choices back to the user, with a compact visual when useful. Resolve blocking findings before approval.

Record the reviewed design, review outcomes, disposition of findings, and review references in `Evidence`, including any Contrarian challenge or why none was needed. If review findings or later user feedback change behavior, ownership, contracts, state rules, or proof strategy materially, obtain focused follow-up review of the changed scope before final approval. Do not repeat reviews for metadata or evidence-only edits.

Present the reviewed plan and material review changes before asking for final approval or offering `/start-work`. Invoking `/start-work` approves the current disclosed plan, not unseen changes or an unresolved blocking decision. Do not implement or start orchestration merely because the user approves the plan in conversation; wait for the execution command.

Use the harness's required final-plan format when one is active. Include the reviewed plan or its readable source, intended `plan.md` path, review evidence, unresolved non-blocking questions, and the next command: `/start-work` or `/start-work <plan-path>`. Do not claim a file was saved when planning restrictions prevented it.

---
description: Have Architect align with the user on program design and test strategy, then create plan.md
agent: architect
---
Create the implementation plan for the current feature.

`$ARGUMENTS`

## Resolve The Plan

- If the argument names a Markdown file, require its basename to be `plan.md` and use it.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- If a non-empty argument does not resolve to an existing directory or valid `plan.md` path, report it and stop.
- Require the target `plan.md` not to exist. If it exists, report it as an artifact from an active or previous workflow and stop. Do not overwrite or update it.
- Require `decision-brief.md` next to the plan. If missing, stop and tell the user to complete Architect's grilling first.
- Create only `plan.md`. Set `Review baseline` and `Known gate failures at baseline` to the literal value `unset`; `/start-work` owns both fields.
- Do not create tickets, ADRs, behavior files, or another planning artifact.

## Purpose

Grilling settled the product direction, constraints, and important edge cases. Planning is a collaborative alignment exercise about:

1. **Program design**: component ownership, dependencies, contracts, state, flow, and high-level implementation shape.
2. **Proof and delivery**: required behavior, verification level, implementation mode, and coherent implementation slices.

Do not silently choose the program design and present it only after writing the plan.

## Alignment Loop

### 1. Show The Implementation Shape

Read the decision brief, inspect the relevant code, and follow repository conventions. Before writing `plan.md`, present a compact implementation board in the conversation:

- The component and ownership table.
- Crossing-boundary interface changes as real declarations or diffs.
- A compact shape for each load-bearing relationship, flow, or state machine.
- Open seams that affect implementation.

Prefer tables, code, diffs, call stacks, and diagrams over explanatory paragraphs. Do not repeat the product narrative from the decision brief.

### 2. Resolve Program Decisions

Discuss decisions that materially affect ownership, dependency direction, crossing-boundary contracts, state or concurrency ownership, persistence, migration, error behavior, cancellation, or module placement.

Show the relevant shape before each important question. Ask one focused question at a time, give concrete options, and recommend one when repository evidence supports it. Do not ask the user to decide private names, helper signatures, fixtures, or other local implementation details.

Classify each design fact:

- **Settled**: a Developer must not change it silently because reversal cost or blast radius is material.
- **Provisional**: a Developer may adapt it from repository evidence and report the adaptation.

Resolve every blocking seam before finalizing. A reversible, non-blocking seam may remain provisional in the plan.

### 3. Align On Proof And Delivery

After program-design alignment, present the test strategy and implementation phases. Confirm that the behavior coverage, proof level, phase boundaries, and final quality assurance (QA) match the user's expectations.

Write `plan.md` only after the architecture, proof strategy, and phases are aligned. Update the implementation board and repeat the relevant pass when feedback changes the design.

## Plan Contract

Use this shape. Omit optional sections that the feature does not need.

````md
# Plan: <feature>

Brief: `./decision-brief.md`
Goal: <one line>
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

## Visual Rules

Show a compact shape before asking a structural, contract, flow, or state question. Choose the smallest form that makes the hard relationship easy to scan:

| Question | Preferred shape |
|---|---|
| What owns what, and which types share an abstraction? | Component table or `classDiagram` |
| What contract changes? | Real declaration or `diff` |
| Who calls whom, and in what order? | Call stack or `sequenceDiagram` |
| How does lifecycle or recovery work? | `stateDiagram-v2` plus transition table |
| How do stored entities relate? | `erDiagram` |
| Which option should be selected? | Decision table |

- Use Mermaid only when a table, declaration, diff, or call stack does not show the relationship clearly.
- Give each diagram a heading that states the question it answers.
- Keep diagrams focused on load-bearing topology, ordering, lifecycle, or cardinality.
- Do not put a settled fact only in a diagram. Record the fact in a normative table or interface.
- Delete a diagram when removing it loses no review-relevant relationship.

## Test And Phase Rules

- Give each behavior a stable ID. State the expected outcome in the behavior cell.
- Use the cheapest level that credibly proves the behavior.
- Use `test-first`, `implementation-first`, `characterization`, or `manual` as the mode.
- Require fail-before and pass-after evidence for bug fixes and practical `test-first` behavior.
- Treat state transitions and cancellation effects as coverage obligations.
- Order phases around runnable vertical slices or focused proofs of risky assumptions.
- Keep each phase small enough for Architect to judge its architecture conformance in one pass.
- Reference exact component names and behavior IDs. `/start-work` rejects unresolved references.
- Do not assign Terra or Luna in the plan. Architect selects the route immediately before each phase.

## Review And Handoff

Self-review the plan once against the decision brief and repository evidence. Use `oracle` only for a focused hard-to-reverse risk. Use `contrarian` only for one uncertain, load-bearing claim. Incorporate material findings into the plan.

In the final response, reuse the plan's tables and shapes instead of writing a prose summary. Report the plan path, unresolved non-blocking seams, material review changes, and the next command: `/start-work` or `/start-work <plan-path>`.

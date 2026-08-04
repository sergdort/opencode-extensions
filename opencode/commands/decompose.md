---
description: Have Architect decompose plan.md into routed, dependency-ordered vertical slices
agent: architect
---

Decompose the implementation plan into independently implementable, Developer-routed tickets under `tickets/`.

Command arguments are optional:

`$ARGUMENTS`

You remain Architect. Do not write product code here. Cut the plan into tickets, assign the cheapest reliable Developer to each ticket, validate the cut, and get the user's approval before implementation starts.

## Resolve The Plan

- If the argument names a Markdown file, accept it only when its basename is `plan.md`; otherwise stop and ask for a directory or a `plan.md` path.
- If it names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current working directory.
- If a non-empty argument is neither a `plan.md` path nor a directory, report it and stop; never fall back to another plan.
- Read the resolved plan and `decision-brief.md` next to it when present.
- If the plan is missing, tell the user to run `/plan-feature` first and stop.
- Put tickets in `tickets/` next to the plan. Use a short feature prefix in each id, such as `auth-000`.
- If that directory already contains tickets, derive completed tickets from exact `Ticket: <id>` trailers. Stop and explain whether this is an accidental collision, a full replacement with no completed work, or an incremental re-decomposition, then get explicit approval before changing files.
- For a full replacement with no completed work, replace all open or blocked tickets with fresh ids and remove stale files after approval.
- For an incremental re-decomposition, preserve completed ticket files and ids unchanged as historical units. Replace only open or blocked tickets, always with fresh ids. Add fresh corrective tickets when the current plan invalidates or extends completed work; never rewrite an accepted ticket or reuse its id.

## Cut Vertical Slices

Each ticket must be implementable by a fresh Developer context using only its ticket, the plan, the decision brief when present, and repository seeds.

1. On an initial cut, the first behavior ticket has `tracer: true` and delivers the smallest observable path through the system. It materializes only the interfaces it needs and proves them through the closest real boundary: browser, CLI, API, integration point, or public library interface. Every later behavior ticket depends on it directly or transitively.
2. A `type: contract` ticket may precede the tracer only for a narrow, genuinely stable external or shared boundary that consumers need first, such as a schema, public protocol, or ABI. State the justification in the ticket. Do not create one merely because stubs compile.
3. Later behavior tickets own observable behavior end to end, not technical layers. Each owns a subset of the plan's Gherkin scenarios.
4. Keep each ticket to the smallest group of scenarios that shares an interface seam and can be verified together. Aim for a diff a human can review in one sitting, roughly 100-200 hand-written changed lines when practical. Explain a likely larger slice when it cannot be split without destroying the end-to-end proof.
5. Declare expected file scope. Treat overlap between sibling scopes as a prompt to inspect sequencing and ownership, not an automatic failure: shared routers, schemas, and registries can require deliberate serial overlap.
6. The tracer has `checkpoint: human`. For a high-risk profile, give every load-bearing, migration, security, persistence, or hard-to-reverse slice the same checkpoint. Other tickets use `checkpoint: none`; the final series still requires human review.
7. On an incremental cut, preserve the completed effective tracer if it still proves the current path. If the plan invalidates it, add a fresh correcting behavior ticket with `tracer: true` and `corrects: [<old-tracer>]`; later behavior depends on the effective tracer. Add a corrective contract ticket only when a separately justified stable boundary changed.

## Assign The Developer

Every proposed ticket names exactly one installed Developer. This is execution metadata; keep model routing out of `plan.md`.

- Assign `developer-luna` only when all of these are true: the ticket is a behavior slice; its acceptance criteria are unambiguous; shared interfaces are already settled by the plan or completed dependencies; expected scope is local and predictable; automated verification is credible; observable proof is direct; and implementation requires no architectural judgment.
- Assign `developer` whenever any of these apply: a contract or shared interface is created or changed; ownership crosses several modules; repository behavior remains unclear; verification is weak, expensive, or mainly manual; implementation is exploratory or integration-heavy; or the slice involves security, authentication, concurrency, persistence, migration, schemas, public APIs, data loss, or another hard-to-reverse concern.
- Use `developer` when the evidence is mixed. Ticket size alone never justifies `developer-luna`.
- Record a concise `routing` reason tied to scope, interface stability, verification, or risk. Do not justify a route only by model price or expected changed-line count.

## Proposed Cut And Approval

Draft the complete cut in memory first. Present ticket id, title, type, assigned Developer, routing reason, tracer, checkpoint, dependencies, expected scope, owned scenarios, and observable proof, followed by preliminary gate results. Wait for explicit user approval before writing ticket files. Ticket existence with `status: open` is the durable approval record for both scope and routing.

## Ticket Schema

Write one file per ticket at `tickets/<id>.md`:

```md
---
id: auth-001
title: <short imperative title>
type: behavior
developer: developer-luna
routing: "Local behavior with settled interfaces and test-first verification"
tracer: true
checkpoint: human
status: open
deps: []
corrects: []
scope:
  - Sources/Auth/Login.swift
  - Tests/AuthTests/LoginTests.swift
gherkin:
  - "@must Login succeeds with valid credentials"
seeds:
  - Sources/Auth/AuthService.swift
verification: test-first
---

## Goal
One or two sentences.

## Contract
The interface slice this ticket builds or materializes. Reference the plan's Execution Sketch. A contract ticket also explains why a separate behaviorless predecessor is necessary.

## Acceptance Criteria
Concrete, checkable criteria derived from the assigned scenarios.

## Observable Proof
How to exercise the completed slice through a real boundary. For pure library work, a focused test through the public interface is acceptable. A contract ticket names its compile, schema, or compatibility check.

## Notes
```

Allowed ticket types are `contract` and `behavior`. Allowed Developers are `developer` and `developer-luna`. Allowed checkpoints are `human` and `none`. Allowed statuses are `open` and `blocked`. Never write `done`, `ready`, or `in-progress`; `/start-work` derives those states from git. A contract ticket uses `developer`, `tracer: false`, and normally `checkpoint: none` unless the risk profile requires human review.

`corrects` is an optional id list. It retires an accepted historical ticket from current-plan ownership in full; a correcting behavior ticket carries every still-current non-`@deferred` scenario owned by that historical ticket, plus the corrected behavior. Use a new extension ticket without `corrects` when the old behavior remains current. It does not make an old id runnable again.

The effective current set is the proposed tickets plus preserved completed tickets that are not transitively named by `corrects`. Prior open or blocked tickets being replaced are removed after approval and leave no lineage state; their fresh replacement ids and the approved current queue are sufficient. Completed files remain as history even after correction. In a correction chain, only the tip is effective and only its `tracer` value counts toward the one-tracer rule.

`seeds` reference the existing repository only. A forward reference to a file another ticket will create belongs in `## Contract`, not in `seeds`.

## Mechanical Gate

Before presenting the cut, verify:

- Every non-`@deferred` Gherkin scenario in `plan.md` belongs to exactly one effective behavior ticket across preserved completed tickets plus the proposed cut. `@deferred` scenarios belong to no ticket. A correcting ticket replaces the historical ticket's current-plan ownership in full and carries all of its still-current scenarios. Contract tickets own no behavior scenarios.
- Exactly one effective behavior ticket has `tracer: true`; it is the first observable slice, and every later behavior ticket reaches it through dependencies. If a contract ticket precedes it, that ticket contains a concrete stability and consumer justification.
- Dependencies and correction chains are acyclic. Every `deps` id resolves to an effective ticket or a preserved completed ticket, and no effective ticket depends on replaced unfinished work. Every `corrects` id resolves to a completed preserved ticket. A contract ticket, when present, is a narrow predecessor of the tracer rather than a universal default.
- Every behavior ticket explains how to exercise the completed slice. The tracer reaches a real boundary rather than stopping at compilation or internal mocks.
- Every proposed ticket names `developer` or `developer-luna` and has a non-empty routing reason grounded in scope, interface stability, verification, or risk.
- Every `developer-luna` ticket satisfies all bounded-work criteria. Contract, shared-interface, ambiguous, weakly verified, cross-boundary, and high-risk tickets use `developer`.
- The tracer has `checkpoint: human`; high-risk slices match the plan's Human Review section.
- Likely large tickets are surfaced with the reason they should not be split.
- Sibling scope overlap is surfaced and classified as intentional serial work or a bad cut.
- Every ticket has a verification method.
- Every `seeds` entry exists on disk at decomposition time, checked mechanically per path with no judgment. Move forward references into `## Contract` instead of dropping them.
- Every `scope` entry that names a not-yet-existing file inside a not-yet-existing parent directory is surfaced — usually a typo, occasionally an intentional new module.
- Every ticket's frontmatter `id` equals its filename stem; state derivation depends on the literal id.
- Every new ticket id is unique in the effective set and does not already appear as an exact `Ticket: <id>` trailer in git history. Preserved completed ids are exempt because their matching trailers are their completion record.

## Approval

After approval, preserve completed files as history, write the approved new files, and remove only the replaced open or blocked files so the directory contains preserved history plus the effective current set. Rerun the mechanical gate against disk and git history. If decomposition exposes a bad contract at any point, return to `/plan-feature`; do not hide the problem in ticket wording.

## Final Response

Report the plan and ticket directory, tickets created, gate results, open questions, and the next command: `/start-work` or `/start-work <tickets-dir>`.

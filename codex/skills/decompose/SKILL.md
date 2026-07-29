---
name: decompose
description: Decompose the active Architect workflow's plan.md into a runnable tracer and dependency-ordered vertical tickets. Use only when the user invokes $decompose.
---

Operate in the main thread as Architect. Decompose the reviewed plan into
independently implementable tickets under `tickets/`. Do not write product code.
Draft and validate the cut before asking for approval.

Use any path accompanying the invocation to resolve the plan:

- A named Markdown file is the plan path.
- A named directory resolves to `<directory>/plan.md`.
- Otherwise use `plan.md` in the current working directory.

Read the plan first. If it is missing, tell the user to invoke `$plan-feature`
and stop. Read `decision-brief.md` next to it when present. Tickets live in
`tickets/` next to the plan.

## Existing Tickets

If the tickets directory already contains files:

1. Derive completed ids from commit messages with a full line exactly equal to
   `Ticket: <id>`.
2. Classify the request as an accidental collision, a full replacement with no
   completed work, or an incremental re-decomposition.
3. Stop and explain the proposed treatment.
4. Get explicit approval before writing or removing ticket files.

For a full replacement, replace open or blocked tickets with fresh ids. For an
incremental re-decomposition, preserve completed ticket files and ids unchanged,
replace only open or blocked tickets with fresh ids, and add corrective tickets
when the new plan invalidates accepted behavior. Never rewrite an accepted
ticket or reuse its id.

This approved replacement is part of the active workflow. It does not authorize
end-of-workflow cleanup or replacement of artifacts from a different workflow.

## Cut Rules

Every ticket must be implementable by a fresh `developer` from only the ticket,
plan, brief, repository seeds, and an optional correction brief.

1. **Start with a runnable tracer.** The first behavior ticket has
   `tracer: true` and delivers the smallest observable path through the system.
   It proves the path at the closest real browser, CLI, API, integration, or
   public library boundary. Every later behavior ticket depends on it directly
   or transitively.
2. **Use a contract ticket only when justified.** It may precede the tracer only
   for a narrow, stable external or shared boundary that consumers require
   first, such as a schema, protocol, or ABI. State the justification. Typed
   code and easy stubs are not justification.
3. **Cut later work vertically.** Each behavior ticket owns observable behavior
   end to end and carries a subset of the plan's Gherkin scenarios.
4. **Size for review and proof.** Prefer a diff one person can review in one
   sitting, roughly 100-200 hand-written changed lines when practical. Explain
   larger slices that cannot split without losing end-to-end proof.
5. **Declare ownership.** Each ticket has a `scope`. Inspect sibling overlap;
   deliberate serial overlap can be valid for routers, schemas, and registries.
6. **Place checkpoints.** The tracer always has `checkpoint: human`. In a
   high-risk workflow, mark load-bearing, migration, security, persistence, and
   hard-to-reverse slices the same way. Final human review remains required.
7. **Preserve effective history.** Keep a completed tracer if it still proves
   the path. If invalidated, create a fresh correcting behavior ticket with
   `tracer: true` and `corrects: [<old-tracer>]`.

## Proposed Cut And Approval

Draft the full cut in memory. Present each ticket's id, title, type, tracer,
checkpoint, dependencies, expected scope, scenarios, and Observable Proof.
Present preliminary gate results. Wait for explicit user approval before
creating, changing, or removing ticket files.

## Ticket Schema

After approval, write one file per new ticket at `tickets/<id>.md`:

```md
---
id: auth-001
title: <short imperative title>
type: behavior
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
The interface slice this ticket materializes, referencing the plan's Execution
Sketch. A contract ticket also justifies its behaviorless predecessor.

## Acceptance Criteria
Concrete criteria derived from the assigned scenarios.

## Observable Proof
How to exercise the slice through a real boundary. A public-interface test is
acceptable for pure library work. A contract ticket names its compile, schema,
or compatibility check.

## Notes
(left empty at creation; escalation notes only)
```

Allowed frontmatter values:

- `type`: `behavior` or `contract`
- `tracer`: exactly one effective behavior ticket is `true`
- `checkpoint`: `human` or `none`
- `status`: `open` or `blocked`; never store done, ready, or in-progress
- `verification`: `test-first`, `implementation-first`,
  `characterization-first`, or `manual-verification`, plus a command when useful

A contract ticket owns no Gherkin scenarios and normally has `tracer: false`.

`corrects` retires each named completed ticket from current-plan ownership in
full. A correcting behavior ticket carries every still-current, non-deferred
scenario from the historical ticket plus the corrected behavior. Use an
extension ticket without `corrects` when old behavior remains current. Only the
tip of a correction chain is effective.

## Mechanical Gate

Run these checks before presenting the cut and again against disk after writing:

- **Coverage:** every non-deferred scenario belongs to exactly one effective
  behavior ticket; deferred scenarios belong to none.
- **Tracer:** exactly one effective behavior ticket is the first observable
  slice, and later behavior reaches it through dependencies.
- **Contract justification:** any predecessor is narrow, stable, and has named
  consumers.
- **DAG and references:** dependency and correction graphs are acyclic. Deps
  resolve to effective or preserved completed tickets. `corrects` resolves only
  to preserved completed tickets.
- **Observable proof:** every behavior ticket reaches a real boundary.
- **Human review:** tracer and high-risk checkpoints match the plan.
- **Reviewability:** likely large tickets are flagged and justified.
- **Scope overlap:** every sibling overlap is reported as deliberate and serial
  or corrected as a bad cut.
- **Verifiability:** every ticket declares a method.
- **Seeds exist:** check every seed path mechanically against the current disk.
  Future files belong in Contract, not seeds.
- **Scope sanity:** flag scope paths whose parent directory is also missing.
- **Id hygiene:** filename stem equals frontmatter id; new ids are unique and do
  not already appear as an exact `Ticket: <id>` trailer. Preserved completed ids
  are exempt.

## Write And Re-check

After approval, preserve completed files, write the approved fresh files, and
remove only replaced open or blocked files from this active workflow. Rerun the
gate against disk and full commit messages.

Ticket files are temporary and remain uncommitted. Never stage or commit the
brief, plan, or tickets. The user owns final cleanup.

If decomposition reveals a wrong program design, stop and send the user back to
`$plan-feature`. Do not hide the flaw in ticket wording.

## Final Response

Report:

- plan and tickets paths
- preserved, created, replaced, and removed tickets
- coverage, tracer, DAG, proof, review, scope, seed, and id gate results
- open questions
- the next explicit invocation: `$start-work`

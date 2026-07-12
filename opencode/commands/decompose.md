---
description: Have Architect decompose plan.md into dependency-ordered tickets with a contract-materialization ticket zero
agent: architect
---

Decompose the implementation plan into independently implementable tickets under `tickets/`.

Command arguments are optional:

`$ARGUMENTS`

You remain Architect. Do not write product code here. Cut the plan into tickets, validate the cut, and get the user's approval before implementation starts.

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

1. On an initial cut, ticket zero has `type: contract` and no dependencies. It materializes planned protocols, types, and function signatures as compiling stubs. Every behavior ticket depends on it directly or transitively.
2. Behavior tickets own observable behavior end to end, not technical layers. Each owns a subset of the plan's Gherkin scenarios.
3. Keep each ticket to the smallest group of scenarios that shares an interface seam and can be verified together.
4. Declare expected file scope. Resolve overlapping scopes between sibling tickets before implementation.
5. On an incremental cut, retain the completed contract foundation. If the contract changed, add a fresh corrective contract ticket and make affected new behavior depend on the applicable contract chain.

## Proposed Cut And Approval

Draft the complete cut in memory first. Present ticket id, title, dependencies, expected scope, and owned scenarios, followed by preliminary gate results. Wait for explicit user approval before writing ticket files. Ticket existence with `status: open` is the durable approval record.

## Ticket Schema

Write one file per ticket at `tickets/<id>.md`:

```md
---
id: auth-001
title: <short imperative title>
type: behavior
status: open
deps: [auth-000]
corrects: []
supersedes: []
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
The interface slice this ticket builds against. Reference the plan's Execution Sketch.

## Acceptance Criteria
Concrete, checkable criteria derived from the assigned scenarios.

## Notes
```

Allowed ticket types are `contract` and `behavior`. Allowed statuses are `open` and `blocked`. Never write `done`, `ready`, or `in-progress`; `/start-work` derives those states from git.

`corrects` and `supersedes` are optional id lists. Use `corrects` when fresh work repairs or updates an accepted historical ticket. Use `supersedes` when replacing an unfinished ticket and preserving that relationship is useful for traceability. Neither field makes an old id runnable again.

## Mechanical Gate

Before presenting the cut, verify:

- Every Gherkin scenario in `plan.md` belongs to exactly one effective ticket across preserved completed tickets plus the proposed cut. A fresh ticket that `corrects` a completed ticket replaces that historical ticket's ownership for affected current-plan scenarios, avoiding duplicate ownership.
- Dependencies are acyclic and every behavior ticket reaches the initial contract ticket plus any applicable corrective contract tickets.
- Sibling ticket scopes do not overlap, or every unavoidable overlap is surfaced.
- Every ticket has a verification method.
- Every new ticket id is unique in the effective set and does not already appear as an exact `Ticket: <id>` trailer in git history. Preserved completed ids are exempt because their matching trailers are their completion record.

## Approval

After approval, preserve completed files, write the approved new files, and remove only superseded open or blocked files so the directory contains exactly the effective set. Rerun the mechanical gate against disk plus git history. If decomposition exposes a bad contract at any point, return to `/plan-feature`; do not hide the problem in ticket wording.

## Final Response

Report the plan and ticket directory, tickets created, gate results, open questions, and the next command: `/start-work` or `/start-work <tickets-dir>`.

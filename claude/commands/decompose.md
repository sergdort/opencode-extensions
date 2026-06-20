---
description: Decompose plan.md into dependency-ordered tickets, starting with a contract-materialization ticket zero
argument-hint: [plan-path or directory]
---

Decompose the implementation plan into a set of independently-implementable tickets under `tickets/`.

Command arguments are optional:

`$ARGUMENTS`

You run this in the main session as the architect. **You do not write product code here** — you cut the work into tickets and get the user's approval before any implementation starts. A bad cut is the most expensive failure in this workflow, so this is a deliberate, reviewed step.

## Resolve The Plan

- If the argument names a Markdown file, use it as the plan path. If it names a directory, use `<directory>/plan.md`. Otherwise use `plan.md` in the current working directory.
- Read the resolved `plan.md` before decomposing. If it is missing, tell the user to run `/plan-feature` first and stop.
- Tickets live in a `tickets/` folder next to the plan (create it if absent). Use a short feature prefix per ticket id, e.g. `auth-000`, `auth-001`.

## How To Cut Tickets

Cut **vertical slices against the frozen contract**, not technical layers. Each ticket must be independently implementable by a fresh-context developer from only (its ticket file + the plan + the brief), and independently verifiable.

1. **Ticket zero is the contract.** The first ticket (`type: contract`, `deps: []`) materializes the plan's interfaces — protocols, types, function signatures — as **compiling stubs**. Every behavior ticket depends on it. In a typed language this makes the compiler the contract enforcer, so later tickets cannot silently drift.
2. **Behavior tickets** (`type: behavior`) each own one behavior end-to-end and carry a subset of the plan's Gherkin scenarios. They depend on ticket zero (and on each other only when genuinely necessary).
3. **Size to verifiability.** A good ticket is the smallest set of scenarios that share an interface seam and can be verified together.
4. **Declare `scope`** (the files each ticket owns). Overlapping scopes between sibling tickets are a smell — flag and resolve them at decomposition time, before any code is written.

## Ticket File Schema

Write one Markdown file per ticket, `tickets/<id>.md`:

```md
---
id: auth-001
title: <short imperative title>
type: behavior            # contract | behavior
status: open              # open | blocked  (never write done/ready/in-progress — those are derived from git)
deps: [auth-000]          # ticket ids this depends on
scope:                    # files/dirs this ticket owns
  - Sources/Auth/Login.swift
  - Tests/AuthTests/LoginTests.swift
gherkin:                  # scenario references from plan.md (behavior tickets)
  - "@must Login succeeds with valid credentials"
seeds:                    # entry points, conventions, where tests live
  - Sources/Auth/AuthService.swift
verification: test-first  # test-first | implementation-first | characterization | manual (+ command if useful)
---

## Goal
One or two sentences.

## Contract
The interface slice this ticket builds against (reference plan.md's Execution Sketch). For ticket zero, the interfaces to materialize as compiling stubs.

## Acceptance Criteria
Concrete, checkable criteria. For behavior tickets, derived from the Gherkin subset.

## Notes
(left empty at creation; the loop appends escalation notes here only if the ticket is blocked)
```

`status` is written once as `open`. The loop never mutates it except to set `blocked` with an escalation note. Completion is derived from git, never stored.

## Mechanical Gate (run before presenting the cut)

- **Coverage:** every Gherkin scenario in `plan.md` maps to **exactly one** ticket — none dropped, none double-owned. List any gaps or overlaps.
- **DAG:** dependencies are acyclic and ticket zero is the root (every behavior ticket reaches it).
- **Scope disjointness:** report any two tickets that declare overlapping `scope` files.
- **Verifiability:** every ticket has a verification method.

## Approval

Present the proposed cut to the user as a short list (id, title, deps, scope, scenarios covered) plus the gate results. **Wait for the user's approval before finalizing.** If decomposition reveals the plan's contract is wrong, stop and send the user back to `/plan-feature` to fix it — do not paper over it in the tickets.

## Final Response

Report:
- The plan and tickets directory used
- The tickets created (id, title, deps)
- Gate results (coverage, DAG, scope, verifiability)
- Any open questions
- The next command: `/start-work` (or `/start-work <tickets-dir>` for a non-default location)

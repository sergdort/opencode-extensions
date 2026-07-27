---
description: Decompose plan.md into a runnable tracer and dependency-ordered vertical slices
argument-hint: [plan-path or directory]
---

Decompose the implementation plan into a set of independently-implementable tickets under `tickets/`.

Command arguments are optional:

`$ARGUMENTS`

You run this in the main session as the architect. **You do not write product code here** — you cut the work into tickets and get the user's approval before any implementation starts. A bad cut is the most expensive failure in this workflow, so this is a deliberate, reviewed step.

## Resolve The Plan

- If the argument names a Markdown file, use it as the plan path. If it names a directory, use `<directory>/plan.md`. Otherwise use `plan.md` in the current working directory.
- Read the resolved `plan.md` before decomposing. If it is missing, tell the user to run `/plan-feature` first and stop.
- Read `decision-brief.md` next to the plan when present so the workflow profile and human review cadence survive a fresh session.
- Tickets live in a `tickets/` folder next to the plan (create it if absent). Use a short feature prefix per ticket id, e.g. `auth-000`, `auth-001`.
- If that directory already contains tickets, derive completion from exact full-line `Ticket: <id>` trailers. Stop and explain whether this is an accidental collision, a full replacement with no completed work, or an incremental re-decomposition, then get explicit approval before changing files.
- For a full replacement with no completed work, replace all open or blocked tickets with fresh ids and remove stale files after approval.
- For an incremental re-decomposition, preserve completed ticket files and ids unchanged. Replace only open or blocked tickets, always with fresh ids. Add fresh corrective tickets when the current plan invalidates or extends completed work; never rewrite an accepted ticket or reuse its id.

## How To Cut Tickets

Cut vertical slices against the reviewed program design, not technical layers. Each ticket must be independently implementable by a fresh-context developer from only its ticket, the plan, the brief, and repository seeds.

1. **Start with a runnable tracer.** The first behavior ticket has `tracer: true` and delivers the smallest observable path through the system. It materializes only the interfaces it needs and proves them through the closest real boundary: browser, CLI, API, integration point, or public library interface. Every later behavior ticket depends on it directly or transitively.
2. **Use a contract ticket only when justified.** A `type: contract` ticket may precede the tracer only for a narrow, genuinely stable external or shared boundary that consumers need first, such as a schema, public protocol, or ABI. State the justification in the ticket. Do not create a contract ticket merely because the language is typed or because stubs are easy to compile.
3. **Cut later behavior vertically.** Each `type: behavior` ticket owns observable behavior end to end and carries a subset of the plan's Gherkin scenarios.
4. **Size to reviewability and proof.** Use the smallest group of scenarios that shares an interface seam and can be verified together. Aim for a diff a human can review in one sitting, roughly 100-200 hand-written changed lines when practical. If a likely larger slice cannot be split without destroying the end-to-end proof, explain why when presenting the cut.
5. **Declare file ownership.** Each ticket declares `scope`. Overlap between sibling tickets is a prompt to inspect sequencing and ownership, not an automatic failure: shared routers, schemas, and registries can require deliberate serial overlap.
6. **Place human checkpoints.** The tracer has `checkpoint: human`. For a high-risk profile, mark every load-bearing, migration, security, persistence, or hard-to-reverse slice the same way. Other tickets use `checkpoint: none`; the final series still requires human review.
7. **Preserve effective history.** On an incremental cut, keep the completed tracer if it still proves the current path. If the plan invalidates it, add a fresh behavior ticket with `tracer: true` and `corrects: [<old-tracer>]`; later behavior depends on that effective tracer. Add a corrective contract ticket only when a separately justified stable boundary changed.

## Proposed Cut And Approval

Draft the complete cut in memory first. Present ticket id, title, type, tracer, checkpoint, dependencies, expected scope, owned scenarios, and observable proof, followed by preliminary gate results. Wait for explicit user approval before writing or removing ticket files. Ticket existence with `status: open` is the durable approval record.

## Ticket File Schema

After approval, write one Markdown file per new ticket, `tickets/<id>.md`:

```md
---
id: auth-001
title: <short imperative title>
type: behavior            # behavior | contract
tracer: true              # exactly one effective behavior ticket is the tracer
checkpoint: human         # human | none
status: open              # open | blocked  (never write done/ready/in-progress — those are derived from git)
deps: []                  # optional contract predecessor; later behavior reaches the tracer
corrects: []              # accepted historical tickets this work repairs or updates
scope:                    # files/dirs this ticket owns
  - Sources/Auth/Login.swift
  - Tests/AuthTests/LoginTests.swift
gherkin:                  # scenario references from plan.md (behavior tickets)
  - "@must Login succeeds with valid credentials"
seeds:                    # entry points, conventions, where tests live (existing files only)
  - Sources/Auth/AuthService.swift
verification: test-first  # test-first | implementation-first | characterization | manual (+ command if useful)
---

## Goal
One or two sentences.

## Contract
The interface slice this ticket builds or materializes, referencing the plan's Execution Sketch. A contract ticket also explains why a separate behaviorless predecessor is necessary.

## Acceptance Criteria
Concrete, checkable criteria. For behavior tickets, derived from the Gherkin subset.

## Observable Proof
How to exercise the completed slice through a real boundary. For pure library work, a focused test through the public interface is acceptable. A contract ticket names its compile, schema, or compatibility check.

## Notes
(left empty at creation; the loop appends escalation notes here only if the ticket is blocked)
```

`status` starts as `open`. The loop changes it only to `blocked` with an escalation note, or back to `open` after the user approves a ticket-only resolution. Completion is derived from git, never stored. A contract ticket uses `tracer: false`; it normally uses `checkpoint: none` unless the risk profile requires human review.

`corrects` is an optional id list. It retires an accepted historical ticket from current-plan ownership in full; a correcting behavior ticket carries every still-current non-`@deferred` scenario owned by that historical ticket, plus the corrected behavior. Use a new extension ticket without `corrects` when the old behavior remains current. It does not make an old id runnable again.

The effective current set is the proposed tickets plus preserved completed tickets that are not transitively named by `corrects`. Prior open or blocked tickets being replaced are removed after approval and leave no lineage state; their fresh replacement ids and the approved current queue are sufficient. Completed files remain as history even after correction. In a correction chain, only the tip is effective and only its `tracer` value counts toward the one-tracer rule.

## Mechanical Gate (run before presenting the cut)

- **Coverage:** every non-`@deferred` Gherkin scenario maps to exactly one effective behavior ticket across preserved completed tickets plus the proposed cut. `@deferred` scenarios map to no ticket. A correcting ticket replaces the historical ticket's current-plan ownership in full and carries all of its still-current scenarios. Contract tickets own no scenarios.
- **Tracer:** exactly one effective behavior ticket has `tracer: true`; it is the first observable slice, and every later behavior ticket reaches it through dependencies. If a contract ticket precedes it, the ticket contains a concrete stability and consumer justification.
- **DAG and references:** dependencies and correction chains are acyclic. Every `deps` id resolves to an effective ticket or a preserved completed ticket, and no effective ticket depends on replaced unfinished work. Every `corrects` id resolves to a completed preserved ticket. A contract ticket, when present, is a narrow predecessor of the tracer rather than a universal default.
- **Observable proof:** every behavior ticket explains how to exercise the slice. The tracer reaches a real boundary rather than stopping at compilation or internal mocks.
- **Human review:** the tracer has `checkpoint: human`; high-risk slices match the plan's Human Review section.
- **Reviewability:** flag likely large tickets and include the reason they should not be split.
- **Scope overlap:** report sibling tickets that declare overlapping files and state whether the overlap is intentional and serial or indicates a bad cut.
- **Verifiability:** every ticket has a verification method.
- **Seeds exist:** every `seeds` entry resolves to a path that exists on disk right now — check each one mechanically (`ls`/glob), no judgment. Seeds point at the existing codebase; a forward reference to a file a dependency ticket will create belongs in the ticket's `## Contract` section, not in `seeds`.
- **Scope sanity:** `scope` entries may name files that don't exist yet, but flag any entry whose parent directory is also missing — usually a typo, occasionally an intentional new module.
- **Id hygiene:** each ticket's frontmatter `id` equals its filename stem. Every new id is unique in the effective set and does not already appear as an exact full-line `Ticket: <id>` trailer in git history. Preserved completed ids are exempt because their matching trailers are the completion record.

## Approval

After approval, preserve completed files as history, write the approved new files, and remove only the replaced open or blocked files so the directory contains preserved history plus the effective current set. Rerun the gate against disk and git history. If decomposition reveals the plan's program design is wrong, stop and send the user back to `/plan-feature`; do not paper over it in ticket wording.

## Final Response

Report:
- The plan and tickets directory used
- The tickets preserved, created, replaced, or removed (id, title, deps)
- Gate results (coverage, tracer, DAG, observable proof, human review, reviewability, scope, and verifiability)
- Any open questions
- The next command: `/start-work` (or `/start-work <tickets-dir>` for a non-default location)

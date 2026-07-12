---
description: Have Architect dispatch, review, and commit one approved ticket at a time
agent: architect
---
Drive the implementation loop over the tickets produced by `/decompose`.

`$ARGUMENTS`

You remain Architect and reviewer. Developer writes product code; you dispatch, inspect, accept or reject, and commit.

## Resolve Tickets

- With no argument, use `tickets/` in the current working directory.
- With a non-empty argument, require it to name an existing directory containing ticket Markdown files. If it is missing, empty, or invalid, report that path and stop; never fall back to another queue.
- Read `plan.md` and `decision-brief.md` next to the tickets directory once at the start. The brief is optional; the plan is required.
- If tickets are missing, tell the user to run `/decompose` and stop. If the sibling `plan.md` is missing, report its expected path and stop.

## Derived State

- `done`: git history contains a commit message with a line exactly equal to `Ticket: <id>`.
- `ready`: the ticket is open, not done, and all dependency tickets are done.
- `interrupted`: relevant working-tree changes exist without a completion commit. Inspect them and decide whether to continue review or redispatch a correction.

Never write `done`, `ready`, or `in-progress` into tickets. A fresh or compacted Architect session reconstructs the queue from tickets plus git. Review-round count is not durable: if an interrupted worktree may contain a rejected correction round, stop and ask the user whether to review it or escalate rather than silently resetting the cap.

## Ticket Loop

Process one ready ticket at a time in dependency order:

1. Pick the next ready ticket.
2. Snapshot `git status --short`. If an already-dirty file overlaps the ticket's declared scope, stop and resolve ownership with the user before dispatch; path staging cannot separate pre-existing and Developer hunks safely.
3. Dispatch a fresh `developer` Task. Pass the ticket path, plan path, and decision-brief path when present, not copied artifact contents.
4. After Developer returns, inspect `git status`, the complete working-tree diff, and untracked files. Compare every Developer-touched path with the pre-dispatch snapshot, including necessary out-of-scope changes reported by Developer. If any touched path was already dirty, do not stage it; stop and resolve ownership with the user.
5. Review contract and ticket scope fit, test faithfulness, implementation correctness, and actual verification results, in that order.
6. Accept by staging only that ticket's changes, inspecting the complete staged diff, and committing only if it contains the accepted ticket and no pre-existing work; request one fresh correction round with precise findings; or escalate immediately if Developer reports `BLOCKED`.
7. Cap implementation at two Developer rounds. If round two is still unacceptable, stop and escalate instead of looping.

Do not repair rejected product code yourself.

## Escalation

Explain the disagreement at the requirements level: what the ticket requires, what Developer or the repository implies, and the decision needed from the user. Mark the ticket `status: blocked` and append a concise `## Escalation` note. This is the only normal ticket mutation after approval.

The user's decision must update a durable artifact. For a ticket-only correction, amend the ticket, resolve its escalation note, and restore `status: open`. Alternatively, accept with a recorded note or replace it through re-decomposition. A shared contract change returns to `/plan-feature` and `/decompose`. Never rewrite accepted commits; corrections move forward as new tickets with ids not previously used in `Ticket:` trailers.

## Commits

- One local commit per accepted ticket; never push.
- End every ticket commit with `Ticket: <id>`.
- Stage only files belonging to the accepted ticket. Preserve unrelated worktree changes.
- The commit series is the completion ledger and final review surface.

## Iteration After The Queue

Draining the queue does not end your orchestrator role. For each manual-testing bug or failing test:

1. Triage read-only when useful and decide whether it is an in-scope defect or a requirement change.
2. Dispatch a focused micro-brief to `developer`: symptom, reproduction, suspected locations, and proof of correction. No ticket file is required.
3. Apply the same review rubric and two-round cap.
4. Commit accepted fixes with a `Fix: <short-slug>` trailer.
5. Escalate requirement changes back to planning rather than disguising them as fixes.

## Final Response

Report:

- Completed tickets and commit hashes
- Blocked or remaining tickets and reasons
- Verification commands and results
- Commit series for final user review
- Remaining risks and manual checks
- A reminder that the user decides whether to squash or push

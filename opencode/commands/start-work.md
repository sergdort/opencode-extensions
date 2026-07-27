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
- `interrupted`: relevant working-tree changes exist without a completion commit. Inspect whether they await agent review, a declared human checkpoint, or correction before resuming.

Never write `done`, `ready`, or `in-progress` into tickets. A fresh or compacted Architect session reconstructs the queue from tickets plus git. Review-round count is not durable: if an interrupted worktree may contain a rejected correction round, stop and ask the user whether to review it or escalate rather than silently resetting the cap.

## Ticket Loop

Process one ready ticket at a time in dependency order. A justified contract ticket may precede the tracer; otherwise the runnable tracer is first.

1. Pick the next ready ticket.
2. Verify the ticket's `seeds` still exist on disk. A missing seed means the repository drifted since decomposition, for example an earlier ticket moved a file; resolve the current location and pass the corrected pointer in the dispatch message rather than letting Developer hunt or guess. If the drift indicates the contract itself moved, escalate instead.
3. Snapshot `git status --short`. If an already-dirty file overlaps the ticket's declared scope, stop and resolve ownership with the user before dispatch; path staging cannot separate pre-existing and Developer hunks safely.
4. Dispatch a fresh `developer` Task. Pass the ticket path, plan path, and decision-brief path when present, not copied artifact contents.
5. After Developer returns, inspect `git status`, the complete working-tree diff, and untracked files. Compare every Developer-touched path with the pre-dispatch snapshot, including necessary out-of-scope changes reported by Developer. If any touched path was already dirty, do not stage it; stop and resolve ownership with the user.
6. Review from the diff; pull full files into context only when needed. Apply these axes in order:
   - Design and scope fit: reviewed interfaces, ticket scope, acceptance criteria, and necessary deviations from the plan's Change Map.
   - Test faithfulness: real coverage of assigned behavior, plus credible fail-before/pass-after evidence for bugs and `test-first` work or a valid exception.
   - Correctness and verification: implementation correctness and actual build, test, and Observable Proof results.
   - Maintainability and program-design fit: local ownership and future change, without needless coupling, shotgun edits, indirection, or type/error workarounds.
7. When all agent-review axes pass and the ticket says `checkpoint: human`, pause before staging. Present the goal, diff summary, Observable Proof result, remaining manual checks, and exact paths or commands the human can inspect. Ask the human to judge whether the code remains understandable, cohesive, and locally changeable, then choose approval, a code correction, or a plan correction. A code correction consumes the remaining Developer round; if round two has already run, rejection escalates instead of creating round three. A plan correction returns to planning immediately. Agent review does not stand in for this decision.
8. After any required human approval, accept by staging only that ticket's changes, inspecting the complete staged diff, and committing only if it contains the accepted ticket and no pre-existing work; request one fresh correction round with a Correction Brief; or escalate immediately if Developer reports `BLOCKED`.
9. Cap implementation at two Developer rounds. If round one reaches the checkpoint and the human requests a code correction, dispatch round two and run the checkpoint again after agent review passes. If round two reaches the checkpoint and the human rejects it, stop and escalate instead of creating round three.

Do not repair rejected product code yourself.

## Correction Brief

The round-two dispatch passes the same artifact paths plus a Correction Brief. Round-one work stays in the worktree; the fresh Developer starts from it and inspects the diff itself. The brief contains exactly:

- Verdict: one line per review axis (design and scope fit, test faithfulness, correctness and verification, maintainability) stating pass or fail.
- Findings: each as `path:line`, what is wrong, and what the acceptance criterion requires instead.
- Keep: what round one got right and must not be reworked.
- Prohibitions: out-of-scope paths round one drifted into that must be reverted or left alone.

Do not include the round-one transcript and do not paste the diff. Findings only; the worktree is the source of truth.

## Escalation

Explain the disagreement at the requirements level: what the ticket requires, what Developer or the repository implies, and the decision needed from the user. Mark the ticket `status: blocked` and append a concise `## Escalation` note. This records a pending decision and prevents auto-retry; only an approved escalation resolution or re-decomposition may edit it again.

The user's decision must update a durable artifact. For a ticket-only correction, amend the ticket, resolve its escalation note, and restore `status: open`. Alternatively, accept with a recorded note or replace it through re-decomposition. A shared-interface or program-design change returns to `/plan-feature` and `/decompose`. Re-decomposition cancels the replaced scope: never dispatch a replaced ticket, and never review or commit uncommitted Developer work produced against a replaced spec. Report the orphaned paths and let the user decide whether to discard them; you cannot discard worktree changes yourself. Never rewrite accepted commits; corrections move forward as new tickets with ids not previously used in `Ticket:` trailers.

## Commits

- One local commit per accepted ticket; never push.
- End every ticket commit with `Ticket: <id>`.
- Stage only files belonging to the accepted ticket. Preserve unrelated worktree changes.
- The commit series is the completion ledger. Final human review is required before merge or release. The user may perform it locally before push or in a pull request; you do not push.

## Iteration After The Queue

Draining the queue does not end your orchestrator role. For each manual-testing bug or failing test:

1. Triage read-only when useful and decide whether it is an in-scope defect or a requirement change.
2. Dispatch a focused micro-brief to `developer`: symptom, reproduction, suspected locations, targeted fail-before check, and pass-after proof. No ticket file is required.
3. Apply the same four-axis review rubric and two-round cap. Require credible fail-before/pass-after evidence or a valid exception. Use a human checkpoint before committing any risky fix that changes a load-bearing interface, persistence, security, or migration behavior.
4. Commit accepted fixes with a `Fix: <short-slug>` trailer.
5. Escalate requirement changes back to planning rather than disguising them as fixes.

Every accepted `Fix:` commit makes final human review pending again and expands its comparison range. A prior final approval does not cover later fixes.

## Final Response

Report:

- Completed tickets and commit hashes
- Blocked or remaining tickets and reasons
- Verification commands and results
- Commit series and comparison range for required final human review
- Remaining risks and manual checks
- Whether final human review is complete, will occur in a pull request, or is otherwise pending; the user decides whether to squash or push

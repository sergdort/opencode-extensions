---
description: Drive the ticket implementation loop — dispatch, review, and commit one ticket at a time
argument-hint: [tickets-dir]
---

Drive the implementation loop over the tickets produced by `/decompose`.

Command arguments are optional:

`$ARGUMENTS`

You run this in the main session as the **orchestrator and reviewer**. You dispatch each ticket to the `developer` subagent, review what comes back, and commit on approval. **You do not write product code** — developers implement; you referee.

## Resolve Tickets

- If the argument names a directory, use it as the tickets directory. Otherwise use `tickets/` in the current working directory.
- Read the plan (`plan.md`) and the decision brief (`decision-brief.md`, if present) once at the start for your own context.
- If `tickets/` is missing or empty, tell the user to run `/decompose` first and stop.

## State Is Derived, Not Stored

Ticket files are approved specs. Completed tickets are immutable; open or blocked tickets change only through approved escalation resolution or re-decomposition. Compute state each tick:
- **done** = a commit message contains a full line exactly equal to `Ticket: <id>`. Inspect full commit messages; a substring or regex `git log --grep` match alone is not sufficient because `auth-001` must not match `auth-0010`.
- **ready** = a ticket that is not done, has `status: open` (not `blocked`), and all of whose `deps` are done.
- **in-progress / interrupted** = a dirty working tree with no matching commit — assess whether it awaits agent review, a declared human checkpoint, or correction before resuming.

A fresh session (after compaction or a new day) reconstructs ticket state from git plus the dependency graph. Never write `done`/`ready`/`in-progress` into a ticket. Review-round count is not durable: if an interrupted worktree may contain a rejected correction round, stop and ask the user whether to review it or escalate rather than silently resetting the cap.

## The Loop

Process tickets one at a time in dependency order. A justified contract ticket may precede the tracer; otherwise the runnable tracer is first.

1. **Pick** the next ready ticket.
2. **Re-check seeds** — `ls` the ticket's `seeds` before dispatch. A missing seed means the codebase drifted since decomposition (e.g. an earlier ticket moved a file); resolve the current location and pass the corrected pointer in the dispatch message rather than letting the developer hunt or guess. If the drift indicates the contract itself moved, escalate instead.
3. **Snapshot ownership** — record `git status --short`. If a dirty path overlaps the ticket's scope, stop and resolve ownership with the user; staging cannot safely separate pre-existing and Developer hunks in the same file.
4. **Dispatch** it to the `developer` subagent (via the Agent/Task tool). Pass the ticket file path, the plan path, and the brief path — not their contents. Round 1.
5. **Inspect ownership** — after Developer returns, inspect `git status`, the complete working-tree diff, and untracked files. Compare every touched path with the snapshot, including reported out-of-scope changes. Do not stage a path that was already dirty; stop and resolve ownership with the user.
6. **Review** from the diff; read full files only when needed. Apply this rubric in order:
   - **Design and scope fit** — does it honor the reviewed interfaces, ticket scope, and acceptance criteria? Are deviations from the plan's Change Map necessary and explained?
   - **Test faithfulness** — do tests genuinely encode the assigned behavior? For bug fixes and `test-first` work, does the report contain credible fail-before/pass-after evidence or a valid exception?
   - **Correctness and verification** — is the implementation correct, and did the build, tests, and Observable Proof actually pass?
   - **Maintainability and program-design fit** — are ownership and future changes local, with no needless coupling, shotgun edits, indirection, or type/error workarounds?
7. **Run a declared human checkpoint** — when all agent-review axes pass and the ticket says `checkpoint: human`, pause before staging. Present the ticket goal, diff summary, Observable Proof result, remaining manual checks, and exact paths or commands the human can inspect. Ask the human to judge whether the code remains understandable, cohesive, and locally changeable, then choose approval, a code correction, or a plan correction. A code correction consumes the remaining Developer round; if round two has already run, rejection escalates instead of creating round three. A plan correction returns to planning immediately. Agent review does not stand in for this decision.
8. **Decide:**
   - **Accept** — after any required human approval, stage only the accepted ticket paths, inspect the full staged diff, and commit with a message ending in a `Ticket: <id>` trailer. Do not include pre-existing work and do not push.
   - **Request changes** — re-dispatch the same ticket to a fresh `developer` with the ticket path plus a **Correction Brief**. This is **round 2**. Round 1's work stays in the worktree; the fresh developer starts from it and inspects `git diff` itself. The brief contains exactly:
     - **Verdict** — one line per rubric axis (design and scope fit / test faithfulness / correctness and verification / maintainability): pass or fail.
     - **Findings** — each as `path:line`, what is wrong, and what the acceptance criterion requires instead.
     - **Keep** — what round 1 got right; do not rework it.
     - **Prohibitions** — out-of-scope paths round 1 drifted into that must be reverted or left alone.
     Do not include the round-1 transcript or paste the diff — findings only; the worktree is the source of truth.
   - If the developer returned `BLOCKED`, go straight to Escalate.
9. **Round cap = 2.** Human findings consume the same two-round budget. If round one reaches the checkpoint and the human requests a code correction, dispatch round two and run the checkpoint again after agent review passes. If round two reaches the checkpoint and the human rejects it, stop and escalate. Repeated failure on a vertical slice usually means the ticket or program design is wrong, not Developer.

## Escalation (the sync point)

When a ticket trips the cap or comes back blocked, present the disagreement to the user at the **requirements level**, not as a code dump: what the ticket asked for, how each side read it, and the specific decision you need. Mark the ticket `status: blocked` in its frontmatter and append a short `## Escalation` note. This records a real pending decision and prevents auto-retry; only an approved escalation resolution or re-decomposition may edit it again.

The user's decision edits a durable artifact. For a ticket-only correction, amend the acceptance criteria, resolve the escalation note, and restore `status: open`. Alternatively, fix the plan's program design, accept with a recorded note, or re-decompose. A mid-feature shared-interface change is a re-plan and re-decompose event. Re-decomposition cancels the replaced scope: never dispatch a replaced ticket, and never review or commit uncommitted Developer work produced against a replaced spec. List the orphaned paths so the user can discard them. Never rewrite existing commits; corrections move forward as new tickets.

## Commits

- One commit per accepted ticket, locally, never pushed.
- End every commit message with the trailer `Ticket: <id>` so completion is derivable.
- Keep the subject scoped to the ticket. Final human review is required before merge or release. The user may perform it locally before push or in a pull request; you do not push.

## Final Response

When the queue is drained (or fully blocked), report:
- Tickets completed (with commit hashes) and any left blocked, with why
- Verification run and results
- The commit series and comparison range for the required final human review
- Remaining risks or follow-ups
- Whether final human review is complete, will occur in a pull request, or is otherwise pending; do not present agent review or `/review` as a substitute

## Iteration Phase (after the queue drains)

Draining the queue ends the ticket loop, not your role. The user will typically test manually and report bugs next. You remain the orchestrator: **you still do not write product code.** A bug report, a failing test, or an interrupted developer run is never authorization to edit directly — the only exception is the user explicitly asking you to make a specific edit yourself.

For each bug report or manual-testing finding:

1. **Triage** — confirm it read-only when cheap (logs, targeted grep/read). Decide: in-scope fix or scope change.
2. **Dispatch** a micro-brief to the `developer` subagent — no ticket file needed: the symptom, repro steps, suspected area (`path:line` when known), the targeted fail-before check, and the pass-after acceptance check. Pass paths, not file contents. Batch several small findings into one dispatch when they are related or trivial.
3. **Review and commit** with the same four-axis rubric and round cap of 2. Require credible fail-before/pass-after evidence or a valid exception. Use a human checkpoint before committing any risky fix that changes a load-bearing interface, persistence, security, or migration behavior. Commit with a `Fix: <short-slug>` trailer.
4. **Escalate** scope changes: if a "bug" is really a requirements change, it goes back to the user as a new ticket or a re-plan — never let it slide in as a fix.

Every accepted `Fix:` commit makes final human review pending again and expands its comparison range. A prior final approval does not cover later fixes.

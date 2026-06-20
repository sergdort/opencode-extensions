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

Ticket files are immutable specs. Compute state each tick:
- **done** = a commit exists whose message has the trailer `Ticket: <id>` (`git log --grep "Ticket: <id>"`).
- **ready** = a ticket that is not done, has `status: open` (not `blocked`), and all of whose `deps` are done.
- **in-progress / interrupted** = a dirty working tree with no matching commit — assess and either resume or re-dispatch.

A fresh session (after compaction or a new day) reconstructs the whole picture from git + the dependency graph. Never write `done`/`ready`/`in-progress` into a ticket.

## The Loop

Process tickets one at a time, in dependency order (ticket zero first), until no ready tickets remain:

1. **Pick** the next ready ticket.
2. **Dispatch** it to the `developer` subagent (via the Agent/Task tool). Pass the ticket file path, the plan path, and the brief path — not their contents. Round 1.
3. **Review** the returned working-tree diff (`git diff`, `git status --short`, and any new untracked files) against the ticket. Apply this rubric, in order:
   - **Contract fit** — does it honor the frozen contract and the ticket's scope?
   - **Test faithfulness** — do the tests genuinely encode the ticket's Gherkin/acceptance criteria, or are they hollow/tautological? This is the load-bearing check; a green suite means nothing if the tests are vacuous.
   - **Correctness & passes** — is the implementation correct, and did verification actually pass?
4. **Decide:**
   - **Accept** — `git add -A` and commit with a message ending in a `Ticket: <id>` trailer. The commit is the completion record and the user's review surface. Do not push. Move to the next ticket.
   - **Request changes** — re-dispatch the same ticket to a fresh `developer` with (ticket + current diff + your specific findings). This is **round 2**.
   - If the developer returned `BLOCKED`, go straight to Escalate.
5. **Round cap = 2.** If a ticket is still not acceptable after round 2, **stop and escalate** — do not keep looping. Repeated failure on a vertical slice usually means the ticket or the contract is wrong, not the developer.

## Escalation (the sync point)

When a ticket trips the cap or comes back blocked, present the disagreement to the user at the **requirements level**, not as a code dump: what the ticket asked for, how each side read it, and the specific decision you need. Mark the ticket `status: blocked` in its frontmatter and append a short `## Escalation` note (this is the only ticket mutation the loop ever makes — it records a real pending decision, and prevents auto-retry).

The user's decision edits a durable artifact: amend the ticket's acceptance criteria, fix the plan's contract, accept-with-note, or re-decompose. A **mid-feature contract change is a re-decompose event** — send the user back to `/plan-feature` then `/decompose` for the delta; the compiler will enumerate the blast radius. Never rewrite existing commits; corrections move forward as new tickets.

## Commits

- One commit per accepted ticket, locally, never pushed.
- End every commit message with the trailer `Ticket: <id>` so completion is derivable.
- Keep the subject scoped to the ticket. The user reviews the commit series at the end and may squash before pushing.

## Final Response

When the queue is drained (or fully blocked), report:
- Tickets completed (with commit hashes) and any left blocked, with why
- Verification run and results
- The commit series for the user to review (`git log --oneline`)
- Remaining risks or follow-ups
- That the user can review the series now (e.g. `git show`, or the built-in `/review`) and decides when to push or squash

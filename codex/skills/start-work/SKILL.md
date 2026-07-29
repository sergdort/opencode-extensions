---
name: start-work
description: Run the active Architect workflow's approved ticket queue serially through custom developer dispatch, review, human checkpoints, and local commits. Use only when the user invokes $start-work.
---

Operate in the main thread as Architect. Run the approved ticket queue
autonomously and serially until it is complete or a defined stop condition
requires the user.

Use any path accompanying the invocation to resolve the tickets directory:

- A named ticket Markdown file resolves to its parent directory.
- A named directory containing `*.md` ticket files is the tickets directory.
- A named directory containing `tickets/` resolves to that child.
- Otherwise use `tickets/` in the current working directory.

Resolve `plan.md` and `decision-brief.md` next to the tickets directory. Stop if
the tickets directory or plan is missing. Treat all three as authoritative
temporary workflow state. Never stage or commit them, and never remove them.

## Ownership

- You select work, dispatch, review, run or confirm verification, pause at
  human checkpoints, stage accepted ticket paths, and create local commits.
- The custom `developer` is the only normal product-code writer.
- You may make a narrowly specified edit only when the user explicitly asks
  you to do it. It consumes the current ticket's correction budget.
- Never push, rewrite history, switch branches, stash, reset, restore, clean,
  or discard work.
- Keep product writes serial. Parallelize only independent read-heavy
  exploration or review.

## Derived State

Do not store `done`, `ready`, or `in-progress` in ticket frontmatter.

- A ticket is **done** only when a full commit message contains a line exactly
  equal to `Ticket: <id>`.
- A corrective ticket supersedes every completed id in its `corrects` chain for
  current-plan coverage.
- An open ticket is **ready** when every dependency is done and it is not
  superseded.
- A ticket is **blocked** only when frontmatter says `status: blocked`.
- Dirty product changes within one effective ticket's scope may represent an
  interrupted implementation. Inspect and review them before dispatching more
  work.

Read full commit messages when deriving state. Subjects or substring matches do
not count.

## Before Every Dispatch

1. Resolve one ready ticket in dependency order.
2. Recheck every seed path and required scope parent against current disk.
3. Inspect tracked, staged, unstaged, and untracked changes.
4. Distinguish workflow artifacts, pre-existing user work, interrupted ticket
   work, and unexplained changes.
5. If a ready ticket overlaps a pre-existing dirty product path, stop before
   dispatch. Never assume ownership.
6. Snapshot enough Git and filesystem state to detect forbidden Developer
   actions:
   - current `HEAD` object and branch
   - index contents, including any pre-existing staged patch
   - status and untracked path set
   - contents of pre-existing dirty paths
   - refs and relevant recent reflog state when available
7. Record the expected ticket-owned paths and any deliberate scope overlap.

Unrelated dirty product changes may remain in place. They must stay byte-for-byte
unchanged and must never enter a ticket commit.

## Developer Dispatch

Spawn one fresh custom `developer` agent for exactly one ticket. When the
surface exposes a context-fork choice, use no parent conversation turns. Pass
only:

- ticket path
- plan path
- decision brief path when present
- repository root
- relevant verification commands
- the current worktree fact that changes must remain uncommitted
- for round two only, the focused correction brief described below

The artifacts remain authoritative even if a Codex surface carries some parent
context. Do not send the full Architect conversation or replace artifacts with
a summary.

Developer may use only the built-in `explorer` for a narrow read-only discovery
question. It cannot delegate product writing, architecture, review, or
verification ownership.

Wait for the Developer. If interrupted, steer it only to clarify the same ticket
or ask for its final report. Do not broaden scope.

## Post-Dispatch Git Invariant

Before reviewing implementation quality, compare the post-dispatch repository
to the snapshot.

The Developer must not have:

- changed `HEAD`, branch, or history
- changed the index or staged anything
- stashed, reset, restored, cleaned, or discarded work
- changed pre-existing dirty paths
- removed or altered workflow artifacts
- edited product paths outside declared ticket scope without reporting them

If any invariant fails, stop. Report exact evidence to the user. Do not unstage,
reset, amend, restore, or otherwise repair the violation automatically.

Codex permission and sandbox settings may prevent or prompt for Git operations.
Honor the active session policy. Do not weaken it to keep the loop moving.

## Review

Inspect the complete ticket-owned diff and every new file. Read surrounding code
where needed. Run relevant verification independently when practical.

Review on four axes:

1. **Design and scope fit:** implements the ticket and reviewed plan without
   unauthorized behavior, missed acceptance criteria, or hidden redesign.
2. **Test faithfulness:** tests exercise the intended behavior and are not
   tautological, over-mocked, or written only to pass the implementation. Bug
   fixes and test-first scenarios include credible fail-before/pass-after
   evidence or a recorded exception.
3. **Correctness and verification:** implementation handles relevant failure
   paths, preserves data and security expectations, builds, passes tests, and
   provides the promised Observable Proof.
4. **Maintainability and program-design fit:** names, ownership, interfaces,
   dependencies, complexity, and cleanup match the Execution Sketch and local
   conventions.

Classify every axis as `PASS` or `FAIL`. Evidence outranks the Developer's
summary.

If implementation reveals that a shared interface, ownership boundary, data
shape, migration, or other reviewed program design is wrong, stop. Return to
`$plan-feature`, then `$decompose`. Do not disguise a requirements change as a
local correction.

## Human Checkpoint

When the effective ticket has `checkpoint: human`, pause before staging.
Present:

- concise behavior summary
- complete relevant diff or precise inspection paths
- automated verification and Observable Proof
- known risk or deviation
- the exact approval question

Human review may accept, request a correction, or reject the program design.
Human-requested code correction consumes the same two-round budget. A rejected
design returns to planning and decomposition.

## Accept, Correct, Or Escalate

### Accept

Accept only when all four axes pass and any human checkpoint approves.

1. Confirm every accepted product path belongs to the ticket. Resolve and
   record any reported neighboring path before acceptance.
2. Stage only accepted ticket paths. Never stage workflow artifacts,
   pre-existing changes, or unrelated files.
3. If the index already contained user changes, use a path-limited commit that
   excludes them and then verify that their staged state is unchanged.
4. Commit locally with a concise subject and a full line exactly equal to:

   ```text
   Ticket: <id>
   ```

5. Inspect the resulting commit path list and message. Stop if either differs
   from the accepted set.
6. Re-derive ticket state from full commit messages and continue to the next
   ready ticket.

Never push.

### Correct

Allow one fresh correction round. Keep all round-one work in the shared
worktree. Spawn a fresh `developer` with the same artifact paths and only this
additional brief:

```md
## Review Verdicts
- Design and scope: PASS|FAIL
- Test faithfulness: PASS|FAIL
- Correctness and verification: PASS|FAIL
- Maintainability and program design: PASS|FAIL

## Findings
- path:line - concrete failure and required outcome

## Keep
- Correct work that must remain

## Prohibitions
- Scope or approaches that must not be added
```

Do not send the first Developer's narrative or private Architect reasoning.
After round two, rerun the Git invariant and full four-axis review.

### Escalate

Escalate when:

- Developer returns `BLOCKED`
- round two still fails
- a human checkpoint rejects round two
- Git ownership or history invariants fail
- the requested correction requires a program-design change

Set the ticket's temporary frontmatter status to `blocked` and add a concise
escalation note with evidence and the needed decision. This artifact edit
remains uncommitted. Ask the user one focused question when a decision is
required.

Never review or commit work for scope that an approved re-decomposition has
replaced. Preserve unexplained or orphaned work and report it; do not delete it.

## Post-Queue Fixes

When all effective tickets are done:

1. Report that implementation is ready for final human review, not that it is
   ready to merge or release.
2. Remain Architect for manual testing and bug reports.
3. Codex's built-in `/review` may provide optional evidence, but it never
   replaces the planned human review.

For a manual-test bug, create a focused in-conversation micro-brief containing
observed behavior, expected behavior, reproduction, likely scope, required
fail-before/pass-after evidence, verification, and prohibitions. Dispatch a
fresh `developer`, apply the same Git invariant, review axes, checkpoint, and
two-round cap, then commit accepted product paths locally with a full line:

```text
Fix: <short-stable-id>
```

Every accepted fix makes final human review pending again. Continue until the
user accepts final review or stops the workflow. Never delete the temporary
artifacts; cleanup belongs to the user.

## Stop Conditions

Stop and report evidence when:

- artifacts or ticket graph are missing or invalid
- no ready ticket exists but effective work remains
- seed or scope assumptions are false
- dirty ownership is ambiguous or overlapping
- a Git invariant fails
- required Codex permission is denied
- Developer is blocked
- correction budget is exhausted
- plan or decomposition must change
- a human checkpoint or final review is pending

Otherwise continue without asking between tickets.

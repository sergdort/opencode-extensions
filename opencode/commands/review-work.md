---
description: Optional independent agent review after Architect's inline reviews; does not replace human review
agent: review
---
Review the current implementation against the plan identified by these command arguments:

`$ARGUMENTS`

## Resolve The Plan

- If the argument names a Markdown file, use that file as the plan path.
- If the argument names a directory, use `<directory>/plan.md`.
- If no argument is provided, use `plan.md` in the current repository or working directory.
- Read the resolved `plan.md` before judging the implementation.
- If `plan.md` is missing, warn that `/plan-feature` must create the implementation plan first and stop.
- Read ticket ids from `tickets/` next to the plan and locate commits with exact full-line `Ticket: <id>` trailers. If matching commits exist, review from the parent of the earliest matching commit through `HEAD`, including later `Fix:` commits, plus current tracked and untracked changes. Report unrelated commits separately.
- If no matching ticket commit exists, review current tracked and untracked changes. If neither a workflow commit nor a current change exists, ask the user for an explicit git comparison range and stop.

## Review Scope

- Review the resolved commit comparison and current changes, then read relevant touched files.
- Compare the implementation to `plan.md`.
- Flag deviations from the goal, constraints, execution sketch, call flow, work steps, behavioral contract, and verification plan.
- Flag implementation defects, regressions, missing tests, missing fail-before evidence where required, and missing verification.
- Review maintainability and program-design fit: ownership, change locality, cohesion, unnecessary coupling or indirection, shotgun edits, and workarounds that bypass types or error handling.
- Treat the plan's Change Map as a design aid. Flag unexplained structural drift, not necessary neighboring edits merely because they were not predicted exactly.
- Distinguish code problems from plan problems.
- If the diff includes unrelated changes, call them out separately instead of treating them as part of the planned work.
- Stay read-only. Do not edit files, stage changes, commit, or push.

## Findings Format

Put findings first, ordered by blast radius, not discovery order. For each candidate finding ask: who controls the input, and how wide does failure spread?

- Must-fix: an attacker or unlucky caller can turn it into data loss, corruption, breach, or outage. Examples: unbounded caller-controlled cost, trust-boundary input not parsed or bounded, non-idempotent retry touching money or external state, failure that cascades past the feature.
- Consider before shipping: real costs that stay contained. Examples: silent swallows, missing teardown, action-at-a-distance, missing contract tests.
- Nice-to-have: clarity and taste with no correctness impact.

For each finding, include:

- Severity tier from above
- File and line reference when available
- The violated plan step, expected behavior, or verification requirement
- Why it matters
- A concrete fix or follow-up

If there are no findings, say that explicitly and mention any residual verification gaps.

## Noise Control

Do not flag:

- Missing atomicity or idempotency machinery where nothing actually interleaves and no retry touches money, state, or the outside world.
- Missing re-validation at internal hops; parsing and bounding belong at real trust boundaries, once.
- Missing fallbacks or bulkheads where the blast radius does not justify them; an untested degraded path is a second bug.
- Deliberate, logged fallbacks as if they were silent failures; the sin is the silent swallow, not the catch keyword.
- Flexibility the plan does not require; prefer fewer states over more guards.

Where the implementation accepts a real tradeoff, name its cost explicitly instead of reporting it as a defect.

## Final Response

Keep the response concise. Do not restate the whole plan. Focus on risks the implementer should act on before the work is considered complete. State that this agent review does not replace the final human review required by the workflow.

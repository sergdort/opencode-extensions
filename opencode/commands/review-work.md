---
description: Optional independent final review after Architect's inline per-ticket reviews
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

## Review Scope

- Review the current diff and relevant touched files.
- Compare the implementation to `plan.md`.
- Flag deviations from the goal, constraints, execution sketch, call flow, work steps, behavioral contract, and verification plan.
- Flag implementation defects, regressions, missing tests, and missing verification.
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

Keep the response concise. Do not restate the whole plan. Focus on risks the implementer should act on before the work is considered complete.

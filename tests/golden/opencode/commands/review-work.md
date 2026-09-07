---
description: Optional independent review of the completed plan implementation; does not replace human QA or acceptance
agent: review
---
Review the current implementation against its working plan.

Usage: `/review-work [plan-path-or-directory] [git-range]`

`$ARGUMENTS`

Plan argument: `$1`

Git range argument: `$2`

## Resolve The Plan And Range

- If `$1` names a Markdown file, require its basename to be `plan.md` and use it.
- If `$1` names a directory, use `<directory>/plan.md`.
- If `$1` is empty, use `plan.md` in the current repository or working directory.
- Reject a non-empty `$1` that is not an existing directory or valid `plan.md`. Do not fall back to the default plan.
- Require the resolved plan to exist. If missing, report the expected path and stop.
- Require `decision-brief.md` next to the plan and read it before review.
- If `$2` is provided, verify that it is a valid Git range. Reject an invalid range instead of guessing. An explicit range overrides the plan.
- Without `$2`, use the plan's `Review baseline` SHA and review from that commit through `HEAD`. Verify that the SHA exists in this repository.
- If the plan has no baseline and the worktree has changes, review current tracked and untracked changes.
- If the plan has no baseline and the worktree is clean, ask for an explicit comparison range instead of guessing from workflow metadata.
- Always include current tracked and untracked changes in the review.
- Reject unexpected extra arguments.
- Do not look for tickets or workflow trailers.

## Review Scope

- Read the complete comparison and relevant touched files.
- Compare product behavior and hard constraints with the decision brief.
- Check the implementation against the plan's architecture table: component responsibilities, excluded responsibilities, allowed dependencies, settled interfaces, and state transition ownership. A dependency outside a component's allowlist, a component that absorbed work its `Does not own` cell excludes, or a second writer to an owned state machine is a finding.
- Check each behavior ID in the test strategy for the proof its `Mode` requires.
- Treat provisional details, predicted files, and phase boundaries as guidance. Flag unexplained harmful drift, not reasonable adaptation.
- Flag defects, regressions, unsafe behavior, missing tests, weak verification, and incomplete required behavior.
- Review maintainability and program-design fit: ownership, change locality, cohesion, unnecessary coupling or indirection, shotgun edits, and workarounds that bypass types or error handling.
- Distinguish code problems from plan problems.
- Report unrelated changes separately.
- Stay read-only. Do not edit, stage, commit, or push.

## Findings Format

Put findings first, ordered by blast radius.

- **Must-fix:** credible data loss, corruption, security exposure, outage, or failure that spreads beyond the feature.
- **Consider before shipping:** real correctness, lifecycle, maintainability, or verification costs that remain contained.
- **Nice-to-have:** clarity or simplification with no correctness impact.

For each finding, include:

- Severity.
- File and line reference when available.
- Violated required behavior, settled decision, or verification need.
- Why the issue matters.
- A concrete fix or follow-up check.

If there are no findings, say so and identify residual verification or QA gaps.

## Noise Control

Do not flag speculative safeguards without a credible failure mode. Do not require flexibility, fallback paths, abstractions, or test infrastructure that the feature does not need. Name accepted tradeoffs and their costs instead of presenting every tradeoff as a defect.

## Final Response

Keep the response concise. Focus on findings that should affect implementation or release. State that independent agent review does not replace final human QA and acceptance.

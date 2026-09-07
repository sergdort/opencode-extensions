---
name: review-work
description: Use only when the user explicitly invokes $review-work. Optional
  independent review of the completed plan implementation; does not replace
  human QA or acceptance
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. A single-plan command accepts at most one plan path or directory. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles for their stated purposes. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing required role blocks its stage. Optional repository verifier or independent review tools remain optional.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Dispatch the installed read-only `oracle` with the complete review procedure below and the user's inputs. Return its findings. If Oracle is unavailable, stop and report the missing dependency. Do not substitute a main-session review.

Review the current implementation against its working plan.

Usage: `$review-work [plan-path-or-directory] [git-range]`

`user-supplied skill arguments`

Plan argument: `plan-path`

Git range argument: `git-range`

## Resolve The Plan And Range

- If `plan-path` names a Markdown file, require its basename to be `plan.md` and use it.
- If `plan-path` names a directory, use `<directory>/plan.md`.
- If `plan-path` is empty, use `plan.md` in the current repository or working directory.
- Reject a non-empty `plan-path` that is not an existing directory or valid `plan.md`. Do not fall back to the default plan.
- Require the resolved plan to exist. If missing, report the expected path and stop.
- Require `decision-brief.md` next to the plan and read it before review.
- If `git-range` is provided, verify that it is a valid Git range. Reject an invalid range instead of guessing. An explicit range overrides the plan.
- Without `git-range`, use the plan's `Review baseline` SHA and review from that commit through `HEAD`. Verify that the SHA exists in this repository.
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

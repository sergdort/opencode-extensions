Review the current implementation against the agreed outcome.

Usage: `{{ commands.review }} [plan-path-or-directory] [git-range]`

`{{ inputs.arguments }}`

Plan argument: `{{ inputs.plan }}`

Git range argument: `{{ inputs.range }}`

## Scope

- If `{{ inputs.plan }}` names a Markdown file, require its basename to be `plan.md` and use it. If it names a directory, use `<directory>/plan.md`. With no argument, use `plan.md` in the current repository or working directory. Reject a non-empty argument that does not resolve; never silently fall back to another plan.
- Read the note's outcome, constraints, and decisions when one exists. If `{{ inputs.range }}` is given, verify it is a valid Git range and use it. Otherwise review from the note's recorded base, or from recent history through `HEAD`; ask for a range instead of guessing when the boundary is unclear. Always include current tracked and untracked changes. Reject unexpected extra arguments.
- Read the complete comparison and the relevant touched files. Stay read-only: do not edit, stage, commit, or push.

## What To Weigh

- Does the implementation deliver the agreed outcome within the real constraints? Flag defects, regressions, unsafe behavior, and missing checks for real failure risks, plus incomplete required behavior.
- Flag excess too: scope, complexity, indirection, or tests the work does not need. Name accepted tradeoffs and their costs instead of presenting every tradeoff as a defect.
- Distinguish evidence from speculation, and code problems from intent problems. Do not require flexibility, fallback paths, abstractions, or test infrastructure without a credible failure mode.
- Report unrelated changes separately. No findings is a valid outcome; say so and name any residual verification or QA gaps.

Order findings by blast radius. For each one give the file and line when available, why it matters, and a concrete fix or follow-up check. Independent review does not replace human QA and acceptance.

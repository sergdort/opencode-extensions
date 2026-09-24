---
name: review-work
description: Use only when the user explicitly invokes $review-work. Optional
  independent review of the implementation; does not replace human QA or
  acceptance
---
## Codex Invocation And Tools

Run this skill only on explicit user invocation. Treat the text supplied with the skill as its arguments. A single-plan command accepts at most one plan path or directory. Review accepts a plan path or directory and an optional Git range. Ask if the supplied input cannot be assigned unambiguously; reject unexpected extra inputs.

Use the installed `developer`, `developer_luna`, `oracle`, and `contrarian` roles when their stated purpose fits. Independent review is optional and based on uncertainty and impact. Use built-in `explorer` for discovery. Use the native subagent tools available in this session; select the named role on a supported isolated spawn and resume the same agent for corrections when available. Follow current tool schemas, not remembered parameter names. A missing role blocks only the dispatch that needs it.

Parent live permissions apply to spawned sessions. Agent sandbox defaults do not mechanically enforce Git boundaries. Repository and explicit user restrictions remain authoritative. Do not automatically invoke the next workflow skill; ask the user to invoke it.

Dispatch the installed read-only `oracle` with the complete review procedure below and the user's inputs. Return its findings. If Oracle is unavailable, stop and report the missing dependency. Do not substitute a main-session review.

Review the current implementation against the agreed outcome.

Usage: `$review-work [plan-path-or-directory] [git-range]`

`user-supplied skill arguments`

Plan argument: `plan-path`

Git range argument: `git-range`

## Scope

- If `plan-path` names a Markdown file, require its basename to be `plan.md` and use it. If it names a directory, use `<directory>/plan.md`. With no argument, use `plan.md` in the current repository or working directory. Reject a non-empty argument that does not resolve; never silently fall back to another plan.
- Read the note's outcome, constraints, and decisions when one exists. If `git-range` is given, verify it is a valid Git range and use it. Otherwise review from the note's recorded base, or from recent history through `HEAD`; ask for a range instead of guessing when the boundary is unclear. Always include current tracked and untracked changes. Reject unexpected extra arguments.
- Read the complete comparison and the relevant touched files. Stay read-only: do not edit, stage, commit, or push.

## What To Weigh

- Does the implementation deliver the agreed outcome within the real constraints? Flag defects, regressions, unsafe behavior, and missing checks for real failure risks, plus incomplete required behavior.
- Flag excess too: scope, complexity, indirection, or tests the work does not need. Name accepted tradeoffs and their costs instead of presenting every tradeoff as a defect.
- Distinguish evidence from speculation, and code problems from intent problems. Do not require flexibility, fallback paths, abstractions, or test infrastructure without a credible failure mode.
- Report unrelated changes separately. No findings is a valid outcome; say so and name any residual verification or QA gaps.

Order findings by blast radius. For each one give the file and line when available, why it matters, and a concrete fix or follow-up check. Independent review does not replace human QA and acceptance.

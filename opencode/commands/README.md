# OpenCode Commands

Reusable OpenCode command files.

## Commands

- `bro.md`: restate the last response plainly and concisely
- `handoff.md`: create repo-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `plan-feature.md`: have Architect create reviewed program design, behavior, verification, and human checkpoints
- `decompose.md`: have Architect cut `plan.md` into Developer-routed, dependency-ordered vertical slices with a runnable tracer
- `start-work.md`: have Architect dispatch each ticket to its approved Developer, review, pause at planned human checkpoints, and commit one at a time
- `review-work.md`: optionally review the workflow commit range and current changes with an independent agent; this does not replace human review

## Install

For global use:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p ~/.config/opencode/commands
cp "$COMMANDS_DIR"/*.md ~/.config/opencode/commands/
```

For one project:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p .opencode/commands
cp "$COMMANDS_DIR"/*.md .opencode/commands/
```

Restart OpenCode after copying command files. OpenCode loads commands at startup.

`github-librarian.md` assumes the `github-librarian` subagent is installed and task delegation is allowed from the `build` agent.

`plan-feature.md`, `decompose.md`, and `start-work.md` require the Architect package, including its `developer` and `developer-luna` subagents. They intentionally run under the persistent `architect` primary agent.

`review-work.md` is outside the normal inline-review loop and assumes your optional review agent is named `review`. That agent must be read-only and return findings in its response; `review.md` is not workflow state. If the agent has a different name, edit the command frontmatter.

# OpenCode Commands

Reusable OpenCode command files.

## Commands

- `bro.md`: restate the last response plainly and concisely
- `handoff.md`: create repository-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `plan-feature.md`: have Architect settle the program design and test strategy in `plan.md`
- `start-work.md`: have Architect route coherent implementation phases dynamically, check architecture conformance, and run final review and QA
- `review-work.md`: optionally review the completed implementation with an independent agent; this does not replace human QA or acceptance

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

When upgrading, inspect any installed `decompose.md`. Remove it only when it is the obsolete ticket command from this package. Restart OpenCode after copying command files.

`github-librarian.md` assumes the `github-librarian` subagent is installed and task delegation is allowed from the `build` agent.

`plan-feature.md` and `start-work.md` require the Architect package, including its `developer` and `developer-luna` subagents. Both commands run under the persistent `architect` primary agent.

`review-work.md` assumes an optional read-only agent named `review`. The agent returns findings in its response and does not create workflow state. Edit the command frontmatter when the agent has a different name.

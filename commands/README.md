# OpenCode Commands

Reusable OpenCode command files.

## Commands

- `handoff.md`: create repo-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `plan-feature.md`: create a Plannotator-reviewed executable implementation plan with the `plan` agent
- `start-work.md`: implement work from `plan.md`
- `review-work.md`: review an implementation against `plan.md`

## Install

For global use:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p ~/.config/opencode/commands
cp "$COMMANDS_DIR"/*.md ~/.config/opencode/commands/
```

For one project:

```bash
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p .opencode/commands
cp "$COMMANDS_DIR"/*.md .opencode/commands/
```

Restart OpenCode after copying command files. OpenCode loads commands at startup.

`github-librarian.md` assumes the `github-librarian` subagent is installed and task delegation is allowed from the `build` agent.

`plan-feature.md` assumes the built-in or configured `plan` agent can submit plans to Plannotator in your OpenCode setup.

`review-work.md` assumes your review agent is named `review`. If your agent has a different name, edit the `agent:` frontmatter after copying the command.

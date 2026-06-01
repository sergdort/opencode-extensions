# OpenCode Commands

Reusable OpenCode command files.

## Commands

- `handoff.md`: create repo-local handoff documents for a fresh agent
- `github-librarian.md`: investigate GitHub repositories with the `github-librarian` subagent
- `start-work.md`: implement an Architect work packet from `decision.md` and `plan.md`
- `review-work.md`: review an implementation against an Architect work packet

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

`review-work.md` assumes your review agent is named `review`. If your agent has a different name, edit the `agent:` frontmatter after copying the command.

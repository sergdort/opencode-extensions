# OpenCode Commands

Reusable OpenCode command files.

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

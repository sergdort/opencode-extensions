# OpenCode GitHub Librarian

GitHub Librarian is a simple OpenCode subagent for targeted GitHub repository research.

It uses the `gh` CLI to search code, inspect repository trees, fetch only the files needed for evidence, and return concise path-first findings with line ranges.

## What It Provides

- `agents/github-librarian.md`: the GitHub Librarian subagent definition
- `../../commands/github-librarian.md`: slash command that delegates a query to the subagent

## What It Does Not Do

- It does not install a plugin.
- It does not add a custom tool.
- It does not mutate your `opencode.json`.
- It does not clone repositories unless explicitly requested.
- It does not create durable project memory.

All setup is explicit and copy-based so changes are visible and reversible.

## Requirements

- `gh` installed and authenticated for the repositories you want to inspect
- `jq`, `base64`, and standard shell utilities available on `PATH`

Private repository access depends on the authenticated `gh` account. If GitHub returns 404 or 403, the agent should report that constraint rather than guessing.

## Global Install

Use this when you want GitHub Librarian available across projects on a machine.

Run from any directory and set these paths to this repository:

```bash
LIBRARIAN_DIR=/path/to/opencode-extensions/opencode/agents/librarian
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p ~/.config/opencode/agents ~/.config/opencode/commands
cp "$LIBRARIAN_DIR/agents/github-librarian.md" ~/.config/opencode/agents/github-librarian.md
cp "$COMMANDS_DIR/github-librarian.md" ~/.config/opencode/commands/github-librarian.md
```

No `opencode.json` changes are needed to use `/github-librarian` or `@github-librarian`. Without an explicit route, GitHub Librarian inherits OpenCode's configured default model. The Architect package already includes the scoped policy and Task permission it needs to delegate GitHub research.

## Project Install

Use this when you want GitHub Librarian available only in one repository.

Run from the target project root and set these paths to this repository:

```bash
LIBRARIAN_DIR=/path/to/opencode-extensions/opencode/agents/librarian
COMMANDS_DIR=/path/to/opencode-extensions/opencode/commands
mkdir -p .opencode/agents .opencode/commands
cp "$LIBRARIAN_DIR/agents/github-librarian.md" .opencode/agents/github-librarian.md
cp "$COMMANDS_DIR/github-librarian.md" .opencode/commands/github-librarian.md
```

No project config changes are needed to use `/github-librarian` or `@github-librarian`. Without an explicit route, GitHub Librarian inherits OpenCode's configured default model. Install the Architect package as well when you want scoped GitHub-research delegation during its workflow.

## Permissions

The default agent file denies edits and nested Task delegation, allows the read/search tools, and allows all bash commands so it can use `gh`, `git`, `jq`, temp workspace setup, and other repository-inspection utilities without repeated prompts.

It also allows external-directory access only for the isolated temp workspace paths `/tmp/github-librarian-*` and `/private/tmp/github-librarian-*`, including nested files under those directories. This lets Librarian create its cache folders without prompting while keeping the permission scoped to its own workspace.

If you want stricter behavior, edit `github-librarian.md` after copying it and change `permission.bash` to `ask` or to a pattern object with only the commands you trust.

## Usage

Run:

```text
/github-librarian where does anthropics/claude-code define the marketplace.json schema?
```

Good queries include scope hints when you have them:

```text
/github-librarian in diegopetrucci/github-librarian, where is the Claude plugin metadata defined?
```

You can also invoke the subagent directly with `@github-librarian` after installing the agent file.

## Model

The agent definition intentionally omits `model` and `variant`. To use the recommended route, merge this into global or project `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "github-librarian": {
      "model": "openai/gpt-5.6-terra",
      "variant": "high"
    }
  }
}
```

## Restart Required

OpenCode loads agent and command files at startup. Quit and restart OpenCode after changing them.

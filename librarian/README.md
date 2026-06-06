# OpenCode GitHub Librarian

GitHub Librarian is a simple OpenCode subagent for targeted GitHub repository research.

It uses the `gh` CLI to search code, inspect repository trees, fetch only the files needed for evidence, and return concise path-first findings with line ranges.

## What It Provides

- `agents/github-librarian.md`: the GitHub Librarian subagent definition
- `GITHUB_LIBRARIAN_INSTRUCTIONS.md`: optional delegation policy for other agents
- `opencode.github-librarian.example.json`: copyable config snippet for command delegation and optional delegation policy
- `../commands/github-librarian.md`: slash command that delegates a query to the subagent

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
LIBRARIAN_DIR=/path/to/opencode-extensions/librarian
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p ~/.config/opencode/agents ~/.config/opencode/commands
cp "$LIBRARIAN_DIR/agents/github-librarian.md" ~/.config/opencode/agents/github-librarian.md
cp "$LIBRARIAN_DIR/GITHUB_LIBRARIAN_INSTRUCTIONS.md" ~/.config/opencode/GITHUB_LIBRARIAN_INSTRUCTIONS.md
cp "$COMMANDS_DIR/github-librarian.md" ~/.config/opencode/commands/github-librarian.md
```

Then manually merge the task permission you want into:

```text
~/.config/opencode/opencode.json
```

Minimal command delegation snippet:

```json
{
  "instructions": ["/Users/you/.config/opencode/GITHUB_LIBRARIAN_INSTRUCTIONS.md"],
  "agent": {
    "build": {
      "permission": {
        "task": {
          "github-librarian": "allow"
        }
      }
    }
  }
}
```

Use an absolute path for global instructions. If you already have `instructions`, append this path instead of replacing the array.

Optional Architect delegation snippet:

```json
{
  "agent": {
    "architect": {
      "permission": {
        "task": {
          "github-librarian": "allow"
        }
      }
    }
  }
}
```

## Project Install

Use this when you want GitHub Librarian available only in one repository.

Run from the target project root and set these paths to this repository:

```bash
LIBRARIAN_DIR=/path/to/opencode-extensions/librarian
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p .opencode/agents .opencode/commands
cp "$LIBRARIAN_DIR/agents/github-librarian.md" .opencode/agents/github-librarian.md
cp "$LIBRARIAN_DIR/GITHUB_LIBRARIAN_INSTRUCTIONS.md" .opencode/GITHUB_LIBRARIAN_INSTRUCTIONS.md
cp "$COMMANDS_DIR/github-librarian.md" .opencode/commands/github-librarian.md
```

Then manually merge the task permission into your project OpenCode config, such as:

```text
opencode.json
```

or:

```text
.opencode/opencode.json
```

Example project config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [".opencode/GITHUB_LIBRARIAN_INSTRUCTIONS.md"],
  "agent": {
    "build": {
      "permission": {
        "task": {
          "github-librarian": "allow"
        }
      }
    }
  }
}
```

If your `build` agent already has `permission` or `task` settings, merge these keys manually. Do not replace your existing config wholesale.

If your config already has `instructions`, append `.opencode/GITHUB_LIBRARIAN_INSTRUCTIONS.md` instead of replacing the array.

If you want Architect to delegate GitHub research while designing features, also allow `architect` to invoke `github-librarian` through the Task tool.

If you use deny-by-default task permissions, put the broad rule first and the Librarian allow rule later:

```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "*": "deny",
          "github-librarian": "allow"
        }
      }
    }
  }
}
```

OpenCode evaluates the last matching permission rule, so order matters.

## Permissions

The default agent file denies edits, allows the read/search tools, and allows all bash commands so it can use `gh`, `git`, `jq`, temp workspace setup, and other repository-inspection utilities without repeated prompts.

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

## Delegated Use

To help primary agents decide when to call GitHub Librarian, add `GITHUB_LIBRARIAN_INSTRUCTIONS.md` to your OpenCode `instructions`, or copy its contents into an existing instruction file such as `AGENTS.md`, `CLAUDE.md`, or `RTK.md`.

README text alone is documentation for humans. Agents will only reliably see the delegation policy if it is part of their configured instructions or task context.

## Model

The default GitHub Librarian agent uses:

```yaml
model: openai/gpt-5.5
variant: xhigh
```

Edit `github-librarian.md` after copying it if you want a different model or reasoning variant.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after changing agent files, command files, instruction files, or `opencode.json`.

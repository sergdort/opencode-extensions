# OpenCode Oracle

Oracle is a simple OpenCode configuration preset for adding a read-only second-opinion subagent.

It is inspired by Pi Oracle, but the OpenCode version intentionally uses native OpenCode agents instead of a custom tool, plugin, subprocess, or installer.

## What It Provides

- `agents/oracle.md`: the Oracle subagent definition
- `ORACLE_INSTRUCTIONS.md`: optional delegation policy for your primary agents
- `opencode.oracle.example.json`: copyable config snippets

## What It Does Not Do

- It does not mutate your `opencode.json`.
- It does not install a plugin.
- It does not add a custom tool.
- It does not run a subprocess.
- It does not auto-select models.

All setup is explicit and copy-based so changes are visible and reversible.

## Global Install

Use this when you want Oracle available across projects on a machine.

Run from any directory and set `ORACLE_DIR` to this package directory:

```bash
ORACLE_DIR=/path/to/opencode-extensions/oracle
mkdir -p ~/.config/opencode/agents
cp "$ORACLE_DIR/agents/oracle.md" ~/.config/opencode/agents/oracle.md
cp "$ORACLE_DIR/ORACLE_INSTRUCTIONS.md" ~/.config/opencode/ORACLE_INSTRUCTIONS.md
```

Then manually merge the config you want into:

```text
~/.config/opencode/opencode.json
```

Minimal task permission snippet:

```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "oracle": "allow"
        }
      }
    }
  }
}
```

Optional Architect delegation snippet:

```json
{
  "agent": {
    "architect": {
      "permission": {
        "task": {
          "oracle": "allow"
        }
      }
    }
  }
}
```

Optional instruction wiring:

```json
{
  "instructions": ["/Users/you/.config/opencode/ORACLE_INSTRUCTIONS.md"]
}
```

Use an absolute path for global instructions. If you already have `instructions`, append this path instead of replacing the array.

## Project Install

Use this when you want Oracle available only in one repository.

Run from the target project root and set `ORACLE_DIR` to this package directory:

```bash
ORACLE_DIR=/path/to/opencode-extensions/oracle
mkdir -p .opencode/agents
cp "$ORACLE_DIR/agents/oracle.md" .opencode/agents/oracle.md
cp "$ORACLE_DIR/ORACLE_INSTRUCTIONS.md" .opencode/ORACLE_INSTRUCTIONS.md
```

Then manually merge the config you want into your project OpenCode config, such as:

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
  "instructions": [".opencode/ORACLE_INSTRUCTIONS.md"],
  "agent": {
    "build": {
      "permission": {
        "task": {
          "oracle": "allow"
        }
      }
    }
  }
}
```

If your `build` agent already has `permission` or `task` settings, merge these keys manually. Do not replace your existing config wholesale.

If you want Architect to delegate high-risk decisions to Oracle, also allow `architect` to invoke `oracle` through the Task tool.

If your config already has `instructions`, append `.opencode/ORACLE_INSTRUCTIONS.md` instead of replacing the array.

If you use deny-by-default task permissions, put the broad rule first and the Oracle allow rule later:

```json
{
  "agent": {
    "build": {
      "permission": {
        "task": {
          "*": "deny",
          "oracle": "allow"
        }
      }
    }
  }
}
```

OpenCode evaluates the last matching permission rule, so order matters.

## Manual Use

You can invoke Oracle directly with `@oracle` after installing the agent file.

Good prompts include the context Oracle needs to answer without guessing:

```text
@oracle Review this migration plan for data-loss risks. Relevant files are src/db/migrate.ts and src/user/repository.ts. I am considering making the write path dual-write for one release before switching reads. What failure modes am I missing?
```

## Delegated Use

To help primary agents decide when to call Oracle, add `ORACLE_INSTRUCTIONS.md` to your OpenCode `instructions`, or copy its contents into an existing instruction file such as `AGENTS.md`, `CLAUDE.md`, or `RTK.md`.

README text alone is documentation for humans. Agents will only reliably see the delegation policy if it is part of their configured instructions or task context.

## Model

The default Oracle agent uses:

```yaml
model: openai/gpt-5.5
variant: xhigh
```

Edit `oracle.md` after copying it if you want a different model or reasoning variant.

## Restart Required

OpenCode loads agent and config files at startup. Quit and restart OpenCode after changing agent files, instruction files, or `opencode.json`.

# OpenCode Oracle

Oracle is a simple OpenCode configuration preset for adding a read-only second-opinion subagent.

It is inspired by Pi Oracle, but the OpenCode version intentionally uses native OpenCode agents instead of a custom tool, plugin, subprocess, or installer.

## What It Provides

- `agents/oracle.md`: the Oracle subagent definition

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
ORACLE_DIR=/path/to/opencode-extensions/opencode/agents/oracle
mkdir -p ~/.config/opencode/agents
cp "$ORACLE_DIR/agents/oracle.md" ~/.config/opencode/agents/oracle.md
```

No `opencode.json` changes are needed for direct `@oracle` use. Without an explicit route, Oracle inherits OpenCode's configured default model. The Architect package already includes the scoped policy and Task permission it needs to delegate to Oracle.

## Project Install

Use this when you want Oracle available only in one repository.

Run from the target project root and set `ORACLE_DIR` to this package directory:

```bash
ORACLE_DIR=/path/to/opencode-extensions/opencode/agents/oracle
mkdir -p .opencode/agents
cp "$ORACLE_DIR/agents/oracle.md" .opencode/agents/oracle.md
```

No project config changes are needed for direct `@oracle` use. Without an explicit route, Oracle inherits OpenCode's configured default model. Install the Architect package as well when you want scoped Oracle delegation during its workflow.

## Permissions

Oracle allows file reads, local search, web fetching, and Bash diagnostics without repeated prompts. Direct and RTK-wrapped Git commands are denied by default, with common read-only inspection such as `git status`, `git diff`, and `git log` allowed afterward. Edits and nested Task delegation are denied.

This is a workflow guardrail rather than a shell sandbox. If you broaden Bash access after copying the agent, keep the read-only prompt boundary in mind.

## Manual Use

You can invoke Oracle directly with `@oracle` after installing the agent file.

Good prompts include the context Oracle needs to answer without guessing:

```text
@oracle Review this migration plan for data-loss risks. Relevant files are src/db/migrate.ts and src/user/repository.ts. I am considering making the write path dual-write for one release before switching reads. What failure modes am I missing?
```

## Model

The agent definition intentionally omits `model` and `variant`. To use the recommended route, merge this into global or project `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "oracle": {
      "model": "openai/gpt-5.6-sol",
      "variant": "xhigh"
    }
  }
}
```

## Restart Required

OpenCode loads agent files at startup. Quit and restart OpenCode after changing them.

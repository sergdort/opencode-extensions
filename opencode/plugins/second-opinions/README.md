# Second Opinions Plugin

An OpenCode V2 server plugin that appends a short "when to consult Oracle or Contrarian" policy to the system prompt of selected primary agents (default: `build`).

Subagent descriptions alone rarely lead `build` to ask for a second opinion. This plugin adds the trigger rule only to the agents you choose, so subagents (Oracle, Contrarian, Developer, Explore) never see it and do not start delegating on their own.

## What It Provides

- `index.ts`: registers a `context` session hook. For each model call by a listed agent, it appends `policy.md` as one system text part.
- `policy.md`: the trigger rule. Claude Code can reuse it through `--append-system-prompt-file`; see the Claude Code README. It names a few moments (choosing between viable approaches, fixing an inferred root cause, reporting a non-trivial change done). These moments count only when the work touches a high-risk area. The file also lists when to skip.

The appended text changes only the outgoing model call. It is not saved in session history or configuration. The text is constant, so prompt caching still works.

## Non-Goals

- No model routing, effort dial, or agent switching.
- No new agents, commands, or TUI changes.
- No changes to `AGENTS.md`, global instructions, or agent definitions.
- Not part of core generation. Codex has no equivalent hook.

## Requirements

- OpenCode V2.
- The `oracle` and `contrarian` subagents installed, for example by `opencode/link-global.sh`.

## Install

Add this directory's absolute path to `plugins` in `~/.config/opencode/opencode.json(c)` or in a project config:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/absolute/path/to/opencode-extensions/opencode/plugins/second-opinions"]
}
```

Relative paths resolve from the config file that contains them. Plugin arrays from different config layers are merged.

## Configuration

To choose which agents receive the policy, use the object form:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "/absolute/path/to/opencode-extensions/opencode/plugins/second-opinions",
      "options": { "agents": ["build", "plan"] }
    }
  ]
}
```

`agents` defaults to `["build"]`. Edit `policy.md` to tune the trigger rule. It is read once at plugin startup.

## Usage

Work in `build` as usual. When a listed moment occurs in a high-risk area, the agent should consult `oracle` or `contrarian` on its own, or explain in one line why it skipped. You can still mention `@oracle` or `@contrarian` directly at any time.

Check that the plugin loaded:

```bash
opencode api get "/api/plugin?location[directory]=$PWD"
```

## Model Defaults

None. The plugin does not choose models. Oracle and Contrarian use the models set for them in your config, or the parent session's model when none is set.

## Restart

After changing `plugins` or `policy.md`, restart the service if the change does not reload automatically:

```bash
opencode service restart
```

## Undo

Remove the `plugins` entry and restart the service.

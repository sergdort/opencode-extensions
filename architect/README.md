# OpenCode Architect

Architect is a simple OpenCode primary agent for starting non-trivial feature work.

It helps the user settle the architecture in conversation, then hands planning/implementation/review to normal OpenCode agents through commands.

When optional subagents are installed, Architect can also delegate focused GitHub repository research to `github-librarian` and risky second-opinion review to `oracle`.

## What It Provides

- `agents/architect.md`: the primary Architect agent definition
- `ARCHITECT_INSTRUCTIONS.md`: optional routing policy for other agents
- `opencode.architect.example.json`: copyable config snippet for the optional routing policy
- `../commands/plan-feature.md`: command prompt for creating a Plannotator-reviewed executable implementation plan
- `../commands/start-work.md`: command prompt for implementing work from `plan.md`
- `../commands/review-work.md`: command prompt for reviewing an implementation against `plan.md`

## What It Does Not Do

- It does not install a plugin.
- It does not add a custom tool.
- It does not run a subprocess.
- It does not mutate your `opencode.json`.
- It does not auto-select models or enforce a runtime state machine.
- It does not require GitHub Librarian or Oracle; those delegations are optional.

All setup is explicit and copy-based so changes are visible and reversible.

## Workflow

Start in the `architect` agent for meaningful feature work.

Architect will interview, inspect the repo, settle the approach, and summarize the agreed direction in conversation. It does not create a default handoff artifact.

Then create the implementation plan with the plan agent:

```text
/plan-feature
```

`/plan-feature` uses the preserved conversation context, inspects the repo as needed, writes one artifact at `plan.md` by default, and submits the plan to Plannotator. The plan is an executable sketch: goal, implementation-relevant constraints, pseudo-code/types/interfaces, call flow, work steps, embedded Gherkin behavioral contract, verification, and Plannotator notes.

After planning, run:

```text
/start-work
```

After implementation, run:

```text
/review-work
```

## Global Install

Use this when you want Architect available across projects on a machine.

Run from any directory and set these paths to this repository:

```bash
ARCHITECT_DIR=/path/to/opencode-extensions/architect
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p ~/.config/opencode/agents ~/.config/opencode/commands
cp "$ARCHITECT_DIR/agents/architect.md" ~/.config/opencode/agents/architect.md
cp "$ARCHITECT_DIR/ARCHITECT_INSTRUCTIONS.md" ~/.config/opencode/ARCHITECT_INSTRUCTIONS.md
cp "$COMMANDS_DIR/plan-feature.md" ~/.config/opencode/commands/plan-feature.md
cp "$COMMANDS_DIR/start-work.md" ~/.config/opencode/commands/start-work.md
cp "$COMMANDS_DIR/review-work.md" ~/.config/opencode/commands/review-work.md
```

Then optionally add the routing policy to your global config:

```json
{
  "instructions": ["/Users/you/.config/opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

Use an absolute path for global instructions. If you already have `instructions`, append this path instead of replacing the array.

## Project Install

Use this when you want Architect available only in one repository.

Run from the target project root and set these paths to this repository:

```bash
ARCHITECT_DIR=/path/to/opencode-extensions/architect
COMMANDS_DIR=/path/to/opencode-extensions/commands
mkdir -p .opencode/agents .opencode/commands
cp "$ARCHITECT_DIR/agents/architect.md" .opencode/agents/architect.md
cp "$ARCHITECT_DIR/ARCHITECT_INSTRUCTIONS.md" .opencode/ARCHITECT_INSTRUCTIONS.md
cp "$COMMANDS_DIR/plan-feature.md" .opencode/commands/plan-feature.md
cp "$COMMANDS_DIR/start-work.md" .opencode/commands/start-work.md
cp "$COMMANDS_DIR/review-work.md" .opencode/commands/review-work.md
```

Then optionally add the routing policy to your project config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [".opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

If your config already has `instructions`, append `.opencode/ARCHITECT_INSTRUCTIONS.md` instead of replacing the array.

If your review agent is not named `review`, edit the `agent:` frontmatter in `review-work.md` after copying it.

## Optional GitHub Librarian

Architect is aware of the `github-librarian` subagent and can delegate targeted GitHub research to it when external repository evidence matters.

To enable that delegation, install GitHub Librarian and allow Architect to invoke it through the Task tool:

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

If you use deny-by-default task permissions, put the broad rule first and the Librarian allow rule later:

```json
{
  "agent": {
    "architect": {
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

If your `architect` agent already has `permission` or `task` settings, merge these keys manually. Do not replace your existing config wholesale.

## Optional Oracle

Architect is aware of the `oracle` subagent and can delegate high-risk decisions to it for an independent read-only second opinion.

Use this when the design involves high-risk architecture or API decisions, security-sensitive work, data migration/deletion/persistence changes, large refactors, or broad behavior changes where independent critique would materially reduce risk.

To enable that delegation, install Oracle and allow Architect to invoke it through the Task tool:

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

If you enable both optional delegation subagents, merge them under the same `task` object:

```json
{
  "agent": {
    "architect": {
      "permission": {
        "task": {
          "github-librarian": "allow",
          "oracle": "allow"
        }
      }
    }
  }
}
```

If you use deny-by-default task permissions, put the broad rule first and the specific allows later:

```json
{
  "agent": {
    "architect": {
      "permission": {
        "task": {
          "*": "deny",
          "github-librarian": "allow",
          "oracle": "allow"
        }
      }
    }
  }
}
```

OpenCode evaluates the last matching permission rule, so order matters.

If your `architect` agent already has `permission` or `task` settings, merge these keys manually. Do not replace your existing config wholesale.

## Delegated Use

To help your default agents recommend Architect for non-trivial feature design, add `ARCHITECT_INSTRUCTIONS.md` to your OpenCode `instructions`, or copy its contents into an existing instruction file such as `AGENTS.md`, `CLAUDE.md`, or `RTK.md`.

README text alone is documentation for humans. Agents will only reliably see the routing policy if it is part of their configured instructions or task context.

## Model

The default Architect agent uses:

```yaml
model: openai/gpt-5.5
variant: xhigh
```

Edit `architect.md` after copying it if you want a different model or reasoning variant.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after changing agent files, command files, instruction files, or `opencode.json`.

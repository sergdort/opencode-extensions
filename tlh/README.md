# The Last Harness Package

Prompt templates for [The Last Harness](https://github.com/diegopetrucci/the-last-harness) (TLH), a packaged profile for the Pi coding agent.

## What This Provides

- `prompts/plan-feature.md`: a manually invoked `/plan-feature` command that runs a program-design alignment pass before tickets are cut.
- `link-global.sh`: an opt-in symlink helper that installs the prompt templates into the isolated TLH profile.

## Non-Goals

This package does not reimplement an architect workflow. TLH already ships its own architect primary agent, `tk` ticket loop, subagent roster, and review cadence. This package adds one optional step to that loop and nothing else.

It also stays out of the profile's owned state:

- No skills. A skill's name and description are injected into every system prompt inside `<available_skills>`, and the model is told to load a skill whenever the task matches its description. That would let the harness fire this pass on its own, including on small work where it is not wanted. A prompt template is never advertised to the model, so it runs only when you type it.
- No `settings.json` changes, no agents, no extensions, no packages.

## Install

```sh
tlh/link-global.sh --dry-run
tlh/link-global.sh
```

The script links `prompts/*.md` into `~/.the-last-harness/agent/prompts/`. Set `PI_CODING_AGENT_DIR` if you installed TLH with a custom `--agent-dir`. Pass `--force` only when an existing differing regular file should be replaced.

To copy instead of linking:

```sh
mkdir -p ~/.the-last-harness/agent/prompts
cp tlh/prompts/plan-feature.md ~/.the-last-harness/agent/prompts/
```

For a single project, put the file in `.pi/prompts/` instead and save project trust.

Run `/reload` in TLH after installing so the prompt template is picked up.

Prompt template discovery is not recursive, so the files must stay flat in `prompts/`.

## Usage

Run `/plan-feature` after the architect's discovery pass ends in your approval and before it creates `tk` tickets:

```text
/plan-feature
/plan-feature the retry queue
```

With no argument the pass covers the change you just approved. An argument scopes it.

The pass shows a component and ownership table, real crossing-boundary interfaces, and compact shapes for load-bearing flows or state; resolves program decisions one question at a time; classifies each design fact as settled or provisional; confirms the behaviors worth proving; then carries the settled facts into `tk create --design` and the behavior IDs into `--acceptance`.

It is additive. If you never type it, the architect loop behaves exactly as TLH ships it.

## Models

None configured. The prompt template runs in your current session with the active model and thinking level. TLH's architect enforces a medium thinking floor of its own.

## Undo

```sh
rm ~/.the-last-harness/agent/prompts/plan-feature.md
```

Then run `/reload`. Nothing else was changed.

## Related

The same program-design pass exists in the other trees, adapted to their artifacts: `/plan-feature` in `opencode/commands/` and `claude/commands/`, and `$plan-feature` in `codex/skills/`. Those write a durable `plan.md`; this one keeps the design in the conversation and hands it to `tk`, because tickets are TLH's durable artifact.

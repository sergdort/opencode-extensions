# OpenCode Architect Orchestrator

Architect is a persistent OpenCode primary agent that executes the agreed outcome. The built-in Plan agent handles planning: clarify the outcome, constraints, and what would demonstrate success, then identify a useful next step. Architect directs Developer subagents through implementation, verification, and honest handoff.

Use `/plan-feature` for planning only, then `/start-work` to select Architect and execute. No manual agent switch or `/architect` command is needed. Developers submit local task commits when authorized. Architect reviews results and resumes the same Developer for corrections when available.

## Workflow

```text
/plan-feature selects Plan
  -> inspect the repository and clarify outcome, constraints, success criteria
  -> identify a useful next step (visuals and grilling only when they help)
  -> /start-work selects Architect and executes
  -> pick the next step from evidence and delegate to a Developer
  -> Developer builds, adapts, verifies with the smallest credible checks
  -> Architect reviews, directs corrections, decides when to stop
  -> honest handoff and human acceptance
```

The agreed outcome and real constraints bind the work; the implementation route is discovered by building and integrating. Developers may revise implementation choices as they learn, within user intent and safety constraints. Architect asks the user only when discovery changes desired behavior or requires a consequential trade-off, not merely because the original approach changed.

## What It Provides

Generated agents in `generated/current/opencode/agents/`:

- `architect.md`: primary orchestrator; owns intent and delegates product code
- `developer.md`: Sol-high Developer for work with unresolved design, unfamiliar integration, or uncertain debugging
- `developer-luna.md`: Luna-max Developer for bounded, predictable, directly verifiable work that follows an established pattern

Both Developers work from briefs inside `/start-work` and from self-contained direct briefs, which cover follow-up sessions, QA findings, and ad hoc fixes.
- `contrarian.md`: read-only adversarial challenge to one decision

Architect and both Developers use OpenCode's built-in Explore agent for focused read-only repository discovery.

Generated commands in `generated/current/opencode/commands/`:

- `plan-feature.md`: planning only; clarifies the outcome and picks a useful next step
- `start-work.md`: explicit execution through Developer delegation, verification, and honest reporting
- `review-work.md`: optional independent review of the implementation

Planning uses the shared `show-me` skill when a visual helps. Independent Oracle or Contrarian review is a judgment call based on uncertainty and impact, not a required step; no findings is a valid outcome. `grill-me-architecture` remains a standalone skill invoked only at your request. GitHub Librarian is optional.

## Durable State

- `plan.md`: a lightweight durable note for continuity: outcome, constraints, decisions worth keeping, what would demonstrate success, the next step, and honest evidence. No template or ledger.
- Git history: task submissions and correction commits
- Working tree: active implementation

Existing planning artifacts are preserved. If native planning restrictions prevent writing `plan.md`, the note stays in the conversation. An outcome already agreed in the conversation is enough to execute; do not retrofit plan metadata. A fresh or compacted Architect reads the note, the diff, and Git history before choosing the next step, and keeps recorded evidence honest and minimal.

## Implementation Loop

Architect picks the next useful step from current evidence, not an up-front task breakdown. There is no minimum slice size or count; a small feature may be a single dispatch.

- Use the complex Developer when design, integration, or debugging is unresolved, and Luna for predictable, directly verifiable work that follows an established pattern. Routing is judgment, not choreography; reassess when evidence changes the route.
- Give each dispatch the outcome, constraints, relevant paths, and the proof expected. Keep briefs short; Developers explore and adapt internally. Resume the same Developer for corrections when available.
- If a strategy fails twice, change it instead of repeating the prompt. Bring product conflicts, consequential trade-offs, or safety risks to the user.

When user judgment can prevent substantial rework, Architect shows a concrete intermediate result and asks for focused feedback, especially on appearance or interaction. This is not a required approval step. Independent work continues while work that depends on the answer waits.

Verification demonstrates intended behavior or a real failure risk with the smallest credible checks, and reuses evidence while its inputs are unchanged. Do not invent helper APIs or tests that merely pin your own styling or math to satisfy a gate. There are no automatic full gates or repeated reviews; run independent review when uncertainty or impact justifies it.

## Workflow Profiles

- **Small:** use the normal `build` agent directly. Do not create workflow artifacts.
- **Standard:** plan with `/plan-feature`, execute with `/start-work`.
- **High-risk:** add an independent Oracle or Contrarian look and widen proof around the actual risk.

## Boundaries

- The Plan agent inspects the repository before asking design questions and does not implement. Approval in conversation does not begin implementation; `/start-work` is the execution trigger.
- Architect edits `plan.md` freely. Any other Architect file edit asks for user approval through the edit permission. Architect does not write product code.
- Developers submit task-only local commits after focused proof when repository policy permits. They preserve user work and staged entries.
- Runtime QA respects repository and user authority; nothing launches the app or erases data without permission. Final human acceptance remains required before merge or release.

These are prompt rules with partial permission guardrails, not a shell sandbox. Architect's edit tool allows `plan.md` and asks for other paths. Selected Git command forms are denied. Broad shell access still requires the agent to respect ownership and mutation rules; permission patterns do not prevent every alternate command form.

Loop mechanics live in the commands: `/plan-feature` carries the planning rules and `/start-work` carries the execution, delegation, and verification rules. The agent file stays minimal; to resume an interrupted implementation, re-run `/start-work`.

## Non-Goals

- No tickets, dependency queue, workflow trailers, plugin, installer, hidden state, or runtime state machine
- No required plan template, architecture tables, behavior IDs, verdict schemas, or acceptance ledgers
- No automatic push, squash, history rewriting, or destructive worktree cleanup
- No automatic model routing outside Architect's explicit judgment
- No requirement that GitHub Librarian, Review, Plannotator, or the grill skill is installed

## Install

Requires Node.js 22 or newer. Run from the checkout:

```bash
npm ci
./opencode/link-global.sh --dry-run
./opencode/link-global.sh
```

The helper generates both native payloads, then links OpenCode core agents, commands, routing instructions, Librarian, and the shared `show-me` and standalone grill skills. It does not edit `opencode.json`. Add `--with-review` only when an optional read-only `review` agent is installed.

After source updates, rerun the helper. If Codex is also installed, rerun its helper to refresh agent copies. Restart OpenCode and reload Codex. Selection limits installation edits, not shared content publication.

Destination overrides are `OPENCODE_CONFIG_DIR` (default `$XDG_CONFIG_HOME/opencode`, or `~/.config/opencode`) and `AGENTS_SKILLS_DIR` (default `~/.agents/skills`).

See the root [migration and recovery rules](../../../README.md#migration-and-recovery) before replacing an existing installation. The helper migrates owned legacy links and removes owned obsolete decomposition links. It preserves foreign links and directories even with `--force`.

### Copy Native Files

Generate with `npm run generate` first. From the destination project, set the checkout path:

```bash
EXTENSIONS_DIR=/path/to/opencode-extensions
NATIVE_DIR="$EXTENSIONS_DIR/generated/current/opencode"
mkdir -p .opencode/agents .opencode/commands .agents/skills/show-me
cp "$NATIVE_DIR/agents/"*.md .opencode/agents/
cp "$NATIVE_DIR/commands/"{bro,handoff,plan-feature,start-work}.md .opencode/commands/
cp "$NATIVE_DIR/ARCHITECT_INSTRUCTIONS.md" .opencode/ARCHITECT_INSTRUCTIONS.md
cp "$EXTENSIONS_DIR/skills/show-me/SKILL.md" .agents/skills/show-me/SKILL.md
```

For optional standalone grilling, also copy `skills/grill-me-architecture/SKILL.md` into `.agents/skills/grill-me-architecture/`. Inspect destination conflicts before copying. For global copies, use `~/.config/opencode/` and `~/.agents/skills/` instead. Copy optional `review-work.md` only when its `review` agent is available. Install Librarian separately if needed.

### Optional Routing Config

Merge the instruction path into existing config. For a project:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [".opencode/ARCHITECT_INSTRUCTIONS.md"]
}
```

For global config, use an absolute path to the installed `ARCHITECT_INSTRUCTIONS.md`. The helper never changes these settings.

### Plan Agent Config

Merge the Plan model, variant, and `agent.plan.permission.task` from [the example config](opencode.architect.example.json) into the existing OpenCode config. It denies general delegation, then allows Explore, Oracle, Contrarian, and optional GitHub Librarian. Preserve the Plan agent's native file and shell restrictions; do not grant it implementation permissions. The link helper does not edit config.

## Agent Dependencies

Install Oracle and Contrarian when you want optional independent review. A missing reviewer does not block execution by default; if Architect judges a review necessary, or you request one and none is available, expect an honest gap report instead of a substitute. Install Librarian only if needed for GitHub research.

The Task allowlist is:

```text
plan -> explore, oracle, contrarian, github-librarian
architect -> developer, developer-luna, explore, contrarian, oracle, github-librarian
architect -> review when an optional read-only review agent is installed
developer -> explore
developer-luna -> explore
```

## Models

Agent definitions omit `model` and `variant`. Configure role routing in global `~/.config/opencode/opencode.json` or project `opencode.json`.

Recommended routes:

- Plan and Architect: `openai/gpt-6-sol`, `high`
- Complex Developer: `openai/gpt-6-sol`, `high`
- Luna Developer: `openai/gpt-6-luna`, `max`
- Explore: OpenCode built-in, with `openai/gpt-5.6-terra`, `low` as the recommended override
- Oracle and Contrarian: `openai/gpt-6-astra`, `xhigh`

Merge the `agent` block from `opencode.architect.example.json` into your global or project config. Edit routes to match available models and variants.

Architect picks the route per task from the work at hand; `plan.md` does not fix it.

## Usage

1. Describe the feature and run `/plan-feature`. The command selects the built-in Plan agent. An optional argument selects a `plan.md` path or directory; a supplied path is respected and never silently replaced.
2. Clarify the outcome, constraints, and what would demonstrate success. Add `show-me` visuals or grilling only when they help.
3. When you are ready to build, run `/start-work` with the same path if one was supplied. The command selects Architect and executes; an outcome already agreed in the conversation is enough.
4. Use `/plan-feature` to revise the note before execution. During execution, Architect keeps it current when a decision changes.
5. Finish with an honest handoff and human acceptance before merge or release.

## Restart Required

OpenCode loads agent, command, instruction, and config files at startup. Quit and restart OpenCode after copying or changing them.

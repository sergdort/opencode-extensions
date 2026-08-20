# opencode-extensions

File-based agent extensions for four coding harnesses: **OpenCode**, **Claude Code**, **Codex**, and **The Last Harness**. Everything here is plain Markdown prompts, agent definitions, instruction files, example config snippets, and explicit opt-in global symlink helpers. There are no plugins or hidden config mutations; every installed file remains visible and reversible.

## Repository Layout

```
opencode/               OpenCode packages
  link-global.sh         opt-in global symlink setup for the core package set
  agents/               agent packages, each self-contained (README, instructions, example config)
    architect/           primary orchestrator plus developer and contrarian
    oracle/               read-only second-opinion subagent
    librarian/            GitHub research subagent
  commands/             reusable slash commands (/plan-feature, /start-work, ...)

claude/                 Claude Code package
  agents/               subagents (developer, repo-scout, oracle, contrarian, github-librarian)
  commands/             slash commands (/architect, /plan-feature, /decompose, /start-work, ...)

codex/                  Codex package
  link-global.sh        opt-in global symlink setup for the core package
  agents/               custom subagents (developer, oracle, contrarian)
  skills/               manual-only workflow skills ($architect, $plan-feature, $decompose, $start-work)
  optional/librarian/   optional GitHub research agent and skill

tlh/                    The Last Harness package (additive only)
  link-global.sh        opt-in symlink setup for the prompt templates
  prompts/              prompt templates installed as slash commands (/plan-feature)

skills/                 shared skills used by more than one harness
  grill-me-architecture/ visual-first architecture grilling skill (canonical copy)
```

Each package directory has its own README with install steps, config snippets, and usage. The OpenCode and Codex link helpers provide opt-in global setups when you want repository edits reflected without copying again.

## The Three Configurations

All three trees use an architect-first workflow, adapted to each harness's native agent and command model. OpenCode uses a simpler plan-driven implementation loop. Claude Code and Codex retain ticket queues.

| | OpenCode (`opencode/`) | Claude Code (`claude/`) | Codex (`codex/`) |
|---|---|---|---|
| Architect role | Persistent `mode: primary` orchestrator you switch into | `/architect` installs the role in the current session | `$architect` installs the role in the current thread; Codex custom agents are spawned roles, not primary modes |
| Role instructions | Agent definition plus agent-bound commands | Command bodies | Manual-only skills in the main thread |
| Delegation | Explicit `permission.task` rules | Description-driven subagents | Named custom agents plus built-in `explorer` |
| Workflow | Select Architect → `/plan-feature` → `/start-work` | `/architect` → `/plan-feature` → `/decompose` → `/start-work` | `$architect` → `$plan-feature` → `$decompose` → `$start-work` |
| Implementation | Architect selects coherent plan phases and routes Terra or Luna just in time | `developer` writes one ticket; main session reviews and commits | Custom `developer` writes one ticket; main thread reviews and commits |
| Review | Per-phase architecture-conformance checks, then full review, QA, and human acceptance; optional `/review-work` | Inline review, human checkpoints, final human review; optional built-in `/review` | Inline review, human checkpoints, final human review; optional built-in `/review` |
| Discovery and advice | Built-in Explore, Contrarian, optional Oracle and Librarian | Repo Scout, Contrarian, Oracle, Librarian | Built-in `explorer`, custom Contrarian and Oracle, optional Librarian |
| Recommended models | Sol for architect/oracle/contrarian; Terra for standard developer/explore/librarian; Luna max for bounded developer; configured in `opencode.json` | Sonnet for developer/librarian; Haiku for repo-scout; Fable for oracle/contrarian | Main model inherited; GPT-5.6 Terra for developer; GPT-5.6 for oracle/contrarian |
| Install target | `~/.config/opencode/` or project `.opencode/` | `~/.claude/` or project `.claude/` | `~/.agents/skills` + `~/.codex/agents`, or project `.agents/skills` + `.codex/agents` |

OpenCode uses a selectable primary Architect and keeps durable intent in `decision-brief.md` and `plan.md`. Git and the working tree show implementation progress. Claude Code and Codex install the Architect role into the active session or thread and use ticket queues with exact `Ticket:` commit trailers.

The Last Harness is not in this table because `tlh/` is not a fourth workflow. That harness already ships its own architect, `tk` ticket loop, subagents, and review cadence; the package here only adds optional prompt templates on top of it. See `tlh/README.md`.

## How the Workflows Run

**OpenCode** — switch to `architect`; it inspects the repository, grills the design, settles product intent and hard constraints, and writes `decision-brief.md`. `/plan-feature` settles the program design and test strategy in `plan.md`: a component table with owned, excluded, and allowed dependencies, settled interfaces, state ownership, and behavior IDs with proof modes. `/start-work` selects the next coherent phase, carries that architecture slice into every phase brief, routes Terra-high or Luna-max just in time, and checks conformance against the diff. Developers adapt provisional details and escalate a settled rule they cannot meet. After the required behavior works, Architect runs full review, QA, and final human acceptance. Outside the workflow, both Developers also accept direct fix briefs — follow-up sessions, QA findings, ad hoc fixes — with the same verdict protocol and Git limits. `oracle` and `github-librarian` are optional delegation targets.

**Claude Code** — `/architect` settles product intent, system architecture, risk, and review cadence in `decision-brief.md`; `/plan-feature` turns the brief and repository evidence into `plan.md`; `/decompose` cuts a runnable tracer followed by dependency-ordered vertical slices; `/start-work` dispatches one ticket, reviews design fit, tests, correctness, and maintainability, pauses at planned human checkpoints, and commits on approval. Ticket completion is derived from `Ticket:` trailers, so a fresh session reconstructs queue state from the repository; ambiguous interrupted review rounds require user confirmation. See `claude/README.md` for the full mechanics.

**The Last Harness** — the harness supplies the loop. `tlh/prompts/plan-feature.md` installs a `/plan-feature` slash command that you invoke by hand after the architect's discovery pass ends in your approval and before it creates `tk` tickets. It shows the component and ownership table, real crossing-boundary interfaces, and compact shapes for load-bearing flows; resolves program decisions one at a time; marks each design fact settled or provisional; then carries the settled facts into `tk create --design` and the behavior IDs into `--acceptance`. It is a prompt template rather than a skill precisely so the harness cannot invoke it on its own — if you never type it, the default architect loop is unchanged. See `tlh/README.md`.

**Codex** — `$architect` establishes the main-thread role, requires the `grill-me-architecture` skill from this repository's `skills/` directory (linked by `opencode/link-global.sh` or copied manually), and writes the decision brief. `$plan-feature` records the reviewed program design. `$decompose` creates the tracer-first queue after user approval. `$start-work` dispatches a fresh custom Developer for each ticket, verifies that the Developer did not mutate Git state, applies the same four-axis review and human checkpoints, and creates local ticket commits. The artifacts stay uncommitted and temporary; the user removes them after the workflow. See `codex/README.md` for supported Codex surfaces, limitations, and install paths.

## Install

Pick a tree and installation style:

- OpenCode package-by-package: follow the README under `opencode/agents/` or `opencode/commands/` and copy only the pieces you want.
- OpenCode core global setup: run `opencode/link-global.sh --dry-run`, then `opencode/link-global.sh --force` if existing differing copies should be replaced. The script links repository-owned core agents, commands, instructions, and the shared `grill-me-architecture` skill into `~/.agents/skills`; it does not install the optional review command, edit `opencode.json`, or change unrelated files. Remove any previously installed `grill-me-architecture` copy before linking.
- Claude Code: follow `claude/README.md` — copy `claude/agents/*.md` and `claude/commands/*.md` into `~/.claude/` (global) or `.claude/` (per project). No restart or JSON config needed.
- Codex global setup: run `codex/link-global.sh --dry-run`, then
  `codex/link-global.sh --force` if existing differing copies or directories
  should be replaced. Add `--with-librarian` for the optional package. For a
  project-local setup, follow `codex/README.md`.
- The Last Harness: run `tlh/link-global.sh --dry-run`, then `tlh/link-global.sh`. It links only prompt templates into the isolated profile's `prompts/` directory and changes no settings, skills, agents, or extensions. For a single project, copy the files into `.pi/prompts/` instead.

Restart OpenCode after linking or changing files. Reload Codex after changing skills or custom agents. Run `/reload` in The Last Harness after changing prompt templates.

Packages are independent: you can install just `oracle`, just the librarian, or the full workflow.

## Shared Principles

- **File-based and reversible.** Install by copying selected packages or using
  the explicit OpenCode and Codex symlink helpers. No hidden config mutation,
  subprocess harnesses, or runtime state machines.
- **Externalized artifacts over hidden state.** Decisions and plans live in visible Markdown files. Claude Code and Codex also use visible ticket files. Each package defines its own lifecycle and Git treatment.
- **Proportional process.** Small work can bypass the artifact flow; standard and high-risk work receive explicit design and review cadence.
- **Runnable feedback early.** Start with a useful end-to-end path or focused technical proof instead of speculative layers.
- **Program design before implementation.** Component responsibilities, allowed dependencies, and state ownership are settled in the plan and carried into every implementation dispatch, because a goal alone does not constrain structure.
- **Humans own maintainability judgment.** Agent review raises the floor, but final review and acceptance remain human decisions. Claude Code and Codex also pause at selected mid-implementation checkpoints; OpenCode runs its phase loop uninterrupted and reviews once.
- **Additive.** Outside the workflow your session behaves normally; nothing is enforced globally.

## Contributing

See `AGENTS.md` for contributor guidance: file conventions, harness config rules, verification steps, and git hygiene.

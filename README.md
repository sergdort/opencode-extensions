# opencode-extensions

File-based agent workflows for OpenCode and Codex, plus independent Claude Code and The Last Harness packages.

> Codex installs custom-agent TOML files as managed regular copies because symlinked agent files fail at spawn time. All four core roles passed a spawn smoke test with the GPT-6 defaults. Full workflow verification remains separate. See [runtime evidence](docs/core-generation-proof.md).

OpenCode and Codex share canonical procedures. Nunjucks templates generate complete native files. Agents do not need to follow a runtime `@file` reference to load the canonical procedure.

## Layout

```text
canonical/             shared workflow, role, and utility procedures
templates/             OpenCode and Codex native adapters
scripts/               renderer, output manifest, publication, link helpers
generated/current/     generated native installation files (Git-ignored)
tests/golden/          reviewed native output fixtures (tracked, not installed)
skills/                shared show-me and optional grill-me-architecture skills
opencode/              documentation, example config, Librarian, optional plugin, scoped helper
codex/                 documentation, optional Librarian, scoped helper
claude/                unchanged independent Claude Code workflow
tlh/                   unchanged additive prompt package
```

Edit `canonical/` for shared behavior. Edit `templates/` or `scripts/manifest.mjs` for native metadata, role names, models, and input mapping. Never edit generated output or install golden fixtures.

## Install OpenCode And Codex

Requires Node.js 22 or newer and npm. Run from this checkout:

```bash
npm ci
./link-global.sh --dry-run
./link-global.sh
```

To link only one harness, use `./opencode/link-global.sh` or `./codex/link-global.sh`. Each accepts `--dry-run` and `--force`. The root helper also accepts `--harness opencode|codex|both`.

All entry points regenerate **both** native payloads. Harness selection limits destination installation edits. Generation also updates content used by existing links in the other harness. Codex agent copies update only when Codex is selected; generation alone or an OpenCode-only run does not refresh them.

The scripts do not install dependencies, edit harness config, or change unrelated files. Add `--with-review` to link OpenCode's optional review command when a read-only `review` agent is installed. Add `--with-librarian` for Codex's optional Librarian. OpenCode preserves its existing Librarian links.

After pulling updates or editing sources, rerun the appropriate link helper. Then restart OpenCode and reload Codex if they use this checkout. Source edits alone do not update generated instructions.

For generation without global installation:

```bash
npm run generate
```

You can copy selected files from `generated/current/` instead. These files are self-contained. Node.js and this checkout are not needed at runtime for copied native files. Copy the shared `show-me` skill from `skills/`. Copy `grill-me-architecture` too if you want standalone grilling. See the [OpenCode agent guide](opencode/agents/architect/README.md) and [Codex guide](codex/README.md).

## Shared Workflow

Use the harness's normal agent (`build` in OpenCode, the main thread in Codex) for conversation, prototypes, and direct building. The packages add subagents and a few manual entry points around that:

| Purpose | OpenCode | Codex |
|---|---|---|
| Show the program design for alignment before building | `/show-program-design` | `$show-program-design` |
| Delegate agreed work to a Developer and review it in this session | `/delegate` | `$delegate` |
| Plain-language restatement | `/bro` | `$bro` |
| Handoff | `/handoff` | `$handoff` |
| Independent implementation review | Optional `/review-work` via `review` | `$review-work` via `oracle` |

Delegation picks the complex or bounded Developer by the work at hand, inspects the diff instead of trusting a delegated claim, and resumes the same Developer for corrections. Oracle and Contrarian are read-only reviewers used when uncertainty or impact justifies them, through delegation or directly. Program design uses `show-me` to present the approach, architecture, and important interfaces, then stops; implementation starts when you ask, directly or through delegation. `grill-me-architecture` runs at the user's request. There is no orchestrator agent, required plan file, template, tickets, or decomposition stage. Final human acceptance remains required, and repository and user restrictions remain authoritative.

## Rationale

The shared workflow keeps design in the conversation and revises the route through building and integrating: [responding to change over following a plan](https://agilemanifesto.org/principles.html), [YAGNI](https://martinfowler.com/bliki/Yagni.html), and [getting one piece done](https://basecamp.com/shapeup/3.2-chapter-11) instead of prescribing the whole solution up front. Ceremony earns its place only when uncertainty or blast radius justifies it.

Native mechanisms still differ. OpenCode uses commands and subagents. Codex uses manual-only skills in the main thread and custom spawned agents. Prompt rules are not universal permission enforcement. Shared text cannot guarantee identical model behavior.

## Migration And Recovery

The helper recognizes exact legacy and generated links owned by this checkout, including dangling legacy links. It removes owned obsolete `decompose` links, the retired Codex `architect` skill link, and the retired Architect workflow links (OpenCode `architect` agent, `ARCHITECT_INSTRUCTIONS.md`, and `plan-feature`/`start-work` in both harnesses). Config entries that referenced them are yours to remove. It reports obsolete copies for manual inspection.

The helpers link both shared skill directories directly from `skills/`. Codex discovers directory links but skips a symlinked `SKILL.md`. For an older install with a real skill directory containing a `SKILL.md` link, move that directory outside all skill search paths, then rerun the helper. The helper preserves those directories, including with `--force`. An existing personal `show-me` skill is a named conflict and is preserved by default. Unmanaged or edited regular files require explicit `--force` to replace. Directories and foreign links are never removed by force. Back up and move conflicting copies or links manually, then rerun. Old installed links to removed source paths need this migration before the next agent session.

Codex agent files include TOML comments with their source path and content hash. The helper updates unchanged copies owned by this checkout and migrates owned agent symlinks to copies. It preserves edited copies and files owned by another checkout unless `--force` explicitly permits regular-file replacement. Skill directories remain symlinks.

Generation validates the full payload, publishes an immutable content-addressed release, and atomically switches `generated/current`. Failed rendering leaves the prior release active. A generation/link lock excludes competing runs. Remove a stale lock only after confirming no invocation is active.

Installation across destination directories is not atomic. If it fails midway, inspect the reported changed and pending paths and rerun before reloading either harness. The scripts retain published releases and abandoned temporary entries. They report unpublished temporary entries for manual cleanup; they never prune releases automatically.

To uninstall, inspect the named installed links and unlink only those owned by this checkout. For Codex agent copies, check the source comment and preserve any edits before removing the named files. Keep unrelated files and any manually configured settings.

## Tests And Golden Files

```bash
npm test
```

Tests compare all output paths and file bytes with `tests/golden/`. They also check native syntax, manual-only Codex policy, literal serialization, failure behavior, publication, and isolated link migration. They never update fixtures or your installed configuration.

After reviewing an intentional output change:

```bash
npm run snapshots:update
npm test
git diff -- tests/golden
```

Review the full fixture diff before committing it. Golden approval does not bypass independent policy checks or prove model compliance.

## Independent Packages

[Claude Code](claude/README.md) retains its existing ticket workflow. [The Last Harness](tlh/README.md) remains an additive prompt package. [OpenCode Librarian](opencode/agents/librarian/README.md) and [Codex Librarian](codex/optional/librarian/README.md) remain separately maintained native packages. The optional [OpenCode second-opinions plugin](opencode/plugins/second-opinions/README.md) tells `build` when to consult Oracle or Contrarian; it is installed by a `plugins` config entry, not by the link helpers.

See [AGENTS.md](AGENTS.md) for contributor rules.

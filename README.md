# opencode-extensions

File-based agent workflows for OpenCode and Codex, plus independent Claude Code and The Last Harness packages.

> Migration status: implementation is not ready for installation. Codex 0.153.0 discovers symlinked custom-agent TOML files but rejects them when spawning. The identical regular-file control passes file loading, then the existing Oracle model `gpt-5.6` is rejected by this account. Native installation and model choices remain unresolved. Do not run the new link helpers yet. Legacy sources remain in place until migration is verified. See [runtime evidence](docs/core-generation-proof.md).

OpenCode and Codex share canonical procedures. Nunjucks templates generate complete native files. Agents do not need to follow a runtime `@file` reference to load the canonical procedure.

## Layout

```text
canonical/             shared workflow, role, and utility procedures
templates/             OpenCode and Codex native adapters
scripts/               renderer, output manifest, publication, link helpers
generated/current/     generated native installation files (Git-ignored)
tests/golden/          reviewed native output fixtures (tracked, not installed)
skills/                canonical grill-me-architecture skill
opencode/              documentation, example config, Librarian, scoped helper
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

All entry points regenerate **both** native payloads. Harness selection limits destination-link edits only. It also updates content used by the other harness if that harness already links to this checkout.

The scripts do not install dependencies, edit harness config, or change unrelated files. Add `--with-review` to link OpenCode's optional review command when a read-only `review` agent is installed. Add `--with-librarian` for Codex's optional Librarian. OpenCode preserves its existing Librarian links.

After pulling updates or editing sources, rerun the appropriate link helper. Then restart OpenCode and reload Codex if they use this checkout. Source edits alone do not update generated instructions.

For generation without global installation:

```bash
npm run generate
```

You can copy selected files from `generated/current/` instead. These files are self-contained. Node.js and this checkout are not needed at runtime for copied native files. Install the shared grill skill separately. See the [OpenCode Architect guide](opencode/agents/architect/README.md) and [Codex guide](codex/README.md).

## Shared Workflow

| Stage | OpenCode | Codex |
|---|---|---|
| Establish Architect and decision brief | Select `architect` | `$architect` |
| Program design and Oracle review | `/plan-feature` | `$plan-feature` |
| Implement approved plan | `/start-work` | `$start-work` |
| Plain-language restatement | `/bro` | `$bro` |
| Handoff | `/handoff` | `$handoff` |
| Independent implementation review | Optional `/review-work` via `review` | `$review-work` via `oracle` |

The shared workflow follows OpenCode's plan-driven model. It uses `decision-brief.md`, `plan.md`, Git, and the working tree. It has no tickets or decomposition stage.

Architect routes one coherent task to the complex or bounded Developer. Developers run focused proof and submit task-owned local commits when authorized. Architect reviews each submission and correction, reuses valid evidence, and coordinates final verification and QA. Final human acceptance remains required. Repository and user restrictions remain authoritative.

Native mechanisms still differ. OpenCode uses a persistent primary agent and command bindings. Codex uses manual-only skills in the main thread and custom spawned agents. Prompt rules are not universal permission enforcement. Shared text cannot guarantee identical model behavior.

## Migration And Recovery

The helper recognizes exact legacy and generated links owned by this checkout, including dangling legacy links. It removes owned obsolete `decompose` links. It reports obsolete copies for manual inspection.

Existing regular files require explicit `--force` to replace. Directories and foreign links are never removed by force. Back up and move conflicting copies or links manually, then rerun. Old installed links to removed source paths need this migration before the next agent session.

Generation validates the full payload, publishes an immutable content-addressed release, and atomically switches `generated/current`. Failed rendering leaves the prior release active. A generation/link lock excludes competing runs. Remove a stale lock only after confirming no invocation is active.

Installation across destination directories is not atomic. If it fails midway, inspect the reported changed and pending paths and rerun before reloading either harness. The scripts retain published releases and abandoned temporary entries. They report unpublished temporary entries for manual cleanup; they never prune releases automatically.

To uninstall, inspect the named installed links and unlink only those owned by this checkout. Keep unrelated files and any manually configured settings.

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

[Claude Code](claude/README.md) retains its existing ticket workflow. [The Last Harness](tlh/README.md) remains an additive prompt package. [OpenCode Librarian](opencode/agents/librarian/README.md) and [Codex Librarian](codex/optional/librarian/README.md) remain separately maintained native packages.

See [AGENTS.md](AGENTS.md) for contributor rules.

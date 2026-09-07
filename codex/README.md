# Codex Workflow

> Migration is pending a native installation decision. The tested CLI rejects symlinked agent TOML files at spawn time. The regular-file control then rejects the existing Oracle model `gpt-5.6`. Do not run the new link helper until these checks pass. See [runtime evidence](../docs/core-generation-proof.md).

Codex uses the same canonical procedures as OpenCode. Native templates provide manual-only skills and custom spawned agents. Generated native files contain the complete procedure; there is no runtime canonical-file include.

## Install

Requires Node.js 22 or newer. From the checkout:

```bash
npm ci
./codex/link-global.sh --dry-run
./codex/link-global.sh
```

The helper links six skills into `~/.agents/skills` and four custom agents into `~/.codex/agents`. It also links the canonical `grill-me-architecture/SKILL.md` directly from `skills/`.

Override destinations with `CODEX_SKILLS_DIR` and `CODEX_AGENTS_DIR`. Add `--with-librarian` for the unchanged optional Librarian package.

After source updates, rerun the helper. It regenerates both payloads, even when only Codex links are selected. Reload Codex and restart any OpenCode installation linked to this checkout.

The helper does not install dependencies or edit Codex config. Use `--force` only to replace conflicting regular files. Directories and links owned by another checkout require manual migration. See the root [migration and recovery rules](../README.md#migration-and-recovery).

### Copy Into One Project

Generate in this checkout first:

```bash
npm ci
npm run generate
```

From the target project, set the checkout path:

```bash
EXTENSIONS_DIR=/path/to/opencode-extensions
mkdir -p .agents/skills .codex/agents
cp -R "$EXTENSIONS_DIR/generated/current/codex/skills/." .agents/skills/
cp "$EXTENSIONS_DIR/generated/current/codex/agents/"*.toml .codex/agents/
mkdir -p .agents/skills/grill-me-architecture
cp "$EXTENSIONS_DIR/skills/grill-me-architecture/SKILL.md" .agents/skills/grill-me-architecture/SKILL.md
```

Inspect destination conflicts before copying. For global copies, use `~/.agents/skills` and `~/.codex/agents` instead. Copy-based installations require copying again after updates.

## Workflow

1. Invoke `$architect` to inspect the repository, grill the design, and write `decision-brief.md`.
2. Invoke `$plan-feature` to settle program design and proof strategy in `plan.md`. Oracle review is required.
3. Review the current disclosed plan, then invoke `$start-work` to approve it and start implementation.
4. Architect routes one coherent task at a time to a Developer. It reviews every submission and correction.
5. Complete combined review, final verification, QA, and human acceptance.

Revise an existing plan with Architect rather than repeating initial planning. There is no `$decompose`, ticket queue, or `Ticket:` trailer protocol.

Developers may submit task-owned local commits after focused proof when repository policy and the user permit them. They preserve unrelated working-tree content and index entries. Architect reviews and directs corrections; it does not commit product changes. Development and verification run sequentially. The same Developer resumes corrections when available.

The workflow uses `decision-brief.md`, `plan.md`, Git, and the working tree. It never removes planning artifacts automatically; cleanup belongs to the user.

## Skills And Agents

All six bundled entry points have `policy.allow_implicit_invocation: false`:

- `$architect`: establish the main-thread Architect role.
- `$plan-feature [plan-path]`: create and review the program design.
- `$start-work [plan-path]`: implement the approved plan.
- `$bro`: restate the last response plainly.
- `$handoff`: write repository-local handoff documents.
- `$review-work [plan-path] [git-range]`: dispatch Oracle for independent implementation review.

Handoff does not create GitHub issues without an explicit user request. Review returns findings; it does not replace human QA or acceptance.

Custom agents:

| Name | Purpose | Default model / effort |
|---|---|---|
| `developer` | Complex or uncertain implementation | `gpt-5.6-terra` / high |
| `developer_luna` | Bounded, directly verifiable implementation | `gpt-5.6-luna` / max |
| `oracle` | Read-only plan and implementation advice | `gpt-5.6` / xhigh |
| `contrarian` | Focused read-only challenge to a design decision | `gpt-5.6` / xhigh |

The main thread keeps its selected model. Use built-in `explorer` for discovery. Model availability depends on the client and account; change native metadata in `scripts/manifest.mjs` and regenerate when needed.

Architect requires the separate shared grill skill. Plan review requires Oracle. Missing required roles block their stage. Optional Librarian and repository verification tools do not become core dependencies.

## Permissions And Limits

Use a Codex client that supports skill invocation policy and named custom agents. The templates follow current native tool schemas instead of requiring a fixed tool-call signature.

Developer defaults use `workspace-write`; advisory defaults use `read-only`. Parent live permissions can override spawned-agent sandbox defaults. These settings do not mechanically enforce every Git or read-only prompt boundary.

There is no implicit `AGENTS.md` router, primary-mode emulation, plugin, subprocess harness, automatic model selector, or hidden workflow state. Manual-only metadata controls skill triggering; it does not guarantee that different models behave identically.

Edit shared procedures in `canonical/`, native adapters in `templates/codex/`, and native metadata in `scripts/manifest.mjs`. Run generation and review the golden diff. Do not edit `generated/` or install `tests/golden/`.

Reload Codex after changing skills or custom agents.

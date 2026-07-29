# Optional Codex GitHub Librarian

A manual-only Codex skill and custom read-only agent for focused research in
external GitHub repositories.

This package is optional. The core Architect workflow continues with repository
evidence when it is absent.

## Requirements

- A current local Codex desktop, CLI, or IDE client with custom agents.
- The `gh` CLI installed and authenticated for the repositories being
  researched.
- Network access allowed by the active Codex permission mode.

## Install

For the complete global Codex package, run
`codex/link-global.sh --with-librarian` from the repository root. Preview it
first with `--dry-run`.

To install only the optional package, use one of these copy layouts.

For a global installation, copy:

```text
skills/github-librarian/             -> ~/.agents/skills/github-librarian/
agents/github_librarian.toml         -> ~/.codex/agents/github_librarian.toml
```

For a project-local installation, copy:

```text
skills/github-librarian/             -> <project>/.agents/skills/github-librarian/
agents/github_librarian.toml         -> <project>/.codex/agents/github_librarian.toml
```

Inspect and remove any existing destination before copying. Reload Codex after
installing or changing the files.

## Use

Invoke explicitly:

```text
$github-librarian <focused GitHub research question>
```

The skill delegates the question verbatim to `github_librarian`. The agent uses
read-only `gh` calls, prefers API and raw-file evidence over clones, does not
modify local or remote repositories, and returns evidence to the caller. It
does not make architecture decisions.

The skill never activates implicitly.

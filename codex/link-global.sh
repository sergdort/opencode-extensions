#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SKILLS_DIR=${CODEX_SKILLS_DIR:-$HOME/.agents/skills}
AGENTS_DIR=${CODEX_AGENTS_DIR:-$HOME/.codex/agents}
FORCE=false
DRY_RUN=false
WITH_LIBRARIAN=false

usage() {
  cat <<'EOF'
Usage: codex/link-global.sh [--dry-run] [--force] [--with-librarian]

Symlink this repository's core Codex skills and custom agents into the global
Codex directories. Existing differing regular files or directories require
--force. Differing symlinks are replaced. Unrelated files are never changed.

Options:
  --dry-run          Print the changes without making them.
  --force            Replace existing differing files or directories.
  --with-librarian   Also link the optional GitHub Librarian skill and agent.

Environment:
  CODEX_SKILLS_DIR   Skill destination (default: ~/.agents/skills).
  CODEX_AGENTS_DIR   Custom-agent destination (default: ~/.codex/agents).
EOF
}

for argument in "$@"; do
  case "$argument" in
    --dry-run) DRY_RUN=true ;;
    --force) FORCE=true ;;
    --with-librarian) WITH_LIBRARIAN=true ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$argument" >&2
      usage >&2
      exit 2
      ;;
  esac
done

validate_root() {
  local root_path=$1
  local root_name=$2
  local current_real
  local home_real
  local repository_real
  local root_real
  local script_real

  case "$root_path" in
    ""|/|"."|".."|"~"|"~/"*|"$HOME"|"$HOME/"|"$HOME/."|"$HOME/..")
      printf 'Refusing unsafe %s destination: %s\n' \
        "$root_name" "$root_path" >&2
      exit 1
      ;;
  esac

  case "/$root_path/" in
    */../*)
      printf 'Refusing %s destination containing ..: %s\n' \
        "$root_name" "$root_path" >&2
      exit 1
      ;;
  esac

  if [[ -L "$root_path" && ! -d "$root_path" ]] ||
      [[ -e "$root_path" && ! -d "$root_path" ]]; then
    printf 'Refusing %s destination that is not a directory: %s\n' \
      "$root_name" "$root_path" >&2
    exit 1
  fi

  if [[ -d "$root_path" ]]; then
    root_real=$(CDPATH= cd -- "$root_path" && pwd -P)
    home_real=$(CDPATH= cd -- "$HOME" && pwd -P)
    current_real=$(pwd -P)
    script_real=$(CDPATH= cd -- "$SCRIPT_DIR" && pwd -P)
    repository_real=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd -P)

    case "$root_real" in
      /|"$home_real"|"$current_real"|"$script_real"|"$repository_real")
        printf 'Refusing unsafe %s destination: %s\n' \
          "$root_name" "$root_path" >&2
        exit 1
        ;;
    esac
  fi
}

run() {
  if $DRY_RUN; then
    printf 'Would run:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

LINK_SOURCES=()
LINK_DESTINATIONS=()

add_link() {
  LINK_SOURCES+=("$1")
  LINK_DESTINATIONS+=("$2")
}

canonical_existing_path() {
  local path=$1
  local parent_path
  local path_name

  if [[ -d "$path" ]]; then
    CDPATH= cd -- "$path" && pwd -P
    return
  fi

  parent_path=$(dirname -- "$path")
  path_name=$(basename -- "$path")
  printf '%s/%s\n' \
    "$(CDPATH= cd -- "$parent_path" && pwd -P)" \
    "$path_name"
}

preflight_link() {
  local source_path=$1
  local destination_path=$2
  local source_real
  local destination_real

  if [[ ! -e "$source_path" ]]; then
    printf 'Missing source: %s\n' "$source_path" >&2
    exit 1
  fi

  if [[ -L "$destination_path" || ! -e "$destination_path" ]]; then
    return
  fi

  source_real=$(canonical_existing_path "$source_path")
  destination_real=$(canonical_existing_path "$destination_path")
  if [[ "$source_real" == "$destination_real" ]]; then
    printf 'Refusing destination that is also the source: %s\n' \
      "$destination_path" >&2
    exit 1
  fi

  if ! $FORCE && [[ -f "$source_path" && -f "$destination_path" ]] &&
      cmp -s "$source_path" "$destination_path"; then
    return
  fi

  if ! $FORCE; then
    printf 'Refusing to replace existing path without --force: %s\n' \
      "$destination_path" >&2
    exit 1
  fi
}

link_path() {
  local source_path=$1
  local destination_path=$2

  run mkdir -p "$(dirname -- "$destination_path")"

  if [[ -L "$destination_path" ]]; then
    if [[ "$(readlink "$destination_path")" == "$source_path" ]]; then
      printf 'Current: %s\n' "$destination_path"
      return
    fi
    run rm "$destination_path"
  elif [[ -d "$destination_path" ]]; then
    run rm -r "$destination_path"
  elif [[ -e "$destination_path" ]]; then
    run rm "$destination_path"
  fi

  run ln -s "$source_path" "$destination_path"
  if $DRY_RUN; then
    printf 'Would link: %s\n' "$destination_path"
  else
    printf 'Linked: %s\n' "$destination_path"
  fi
}

validate_root "$SKILLS_DIR" "skill"
validate_root "$AGENTS_DIR" "agent"

for skill_name in architect plan-feature decompose start-work; do
  add_link "$SCRIPT_DIR/skills/$skill_name" "$SKILLS_DIR/$skill_name"
done

for agent_name in developer oracle contrarian; do
  add_link "$SCRIPT_DIR/agents/$agent_name.toml" "$AGENTS_DIR/$agent_name.toml"
done

if $WITH_LIBRARIAN; then
  add_link \
    "$SCRIPT_DIR/optional/librarian/skills/github-librarian" \
    "$SKILLS_DIR/github-librarian"
  add_link \
    "$SCRIPT_DIR/optional/librarian/agents/github_librarian.toml" \
    "$AGENTS_DIR/github_librarian.toml"
fi

for link_index in "${!LINK_SOURCES[@]}"; do
  preflight_link \
    "${LINK_SOURCES[$link_index]}" \
    "${LINK_DESTINATIONS[$link_index]}"
done

for link_index in "${!LINK_SOURCES[@]}"; do
  link_path \
    "${LINK_SOURCES[$link_index]}" \
    "${LINK_DESTINATIONS[$link_index]}"
done

printf 'Codex files linked from %s\n' "$SCRIPT_DIR"
if ! $WITH_LIBRARIAN; then
  printf 'Optional Librarian not linked; rerun with --with-librarian to add it.\n'
fi
printf 'Install grill-me-architecture separately before using $architect.\n'
printf 'Reload Codex to load skill or custom-agent changes.\n'

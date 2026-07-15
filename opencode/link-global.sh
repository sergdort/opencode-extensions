#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CONFIG_DIR=${OPENCODE_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode}
FORCE=false
DRY_RUN=false

usage() {
  cat <<'EOF'
Usage: opencode/link-global.sh [--dry-run] [--force]

Symlink this repository's OpenCode agents, commands, and instruction files into
the global OpenCode config directory. Existing differing regular files require
--force. Unrelated config files are never changed.
EOF
}

for argument in "$@"; do
  case "$argument" in
    --dry-run) DRY_RUN=true ;;
    --force) FORCE=true ;;
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

run() {
  if $DRY_RUN; then
    printf 'Would run:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

link_file() {
  source_path=$1
  destination_path=$2

  if [[ ! -f "$source_path" ]]; then
    printf 'Missing source file: %s\n' "$source_path" >&2
    exit 1
  fi

  run mkdir -p "$(dirname -- "$destination_path")"

  if [[ -L "$destination_path" ]]; then
    if [[ "$(readlink "$destination_path")" == "$source_path" ]]; then
      printf 'Current: %s\n' "$destination_path"
      return
    fi
    run rm "$destination_path"
  elif [[ -e "$destination_path" ]]; then
    if ! $FORCE && ! cmp -s "$source_path" "$destination_path"; then
      printf 'Refusing to replace differing file without --force: %s\n' "$destination_path" >&2
      exit 1
    fi
    run rm "$destination_path"
  fi

  run ln -s "$source_path" "$destination_path"
  if $DRY_RUN; then
    printf 'Would link: %s\n' "$destination_path"
  else
    printf 'Linked: %s\n' "$destination_path"
  fi
}

link_file "$SCRIPT_DIR/agents/architect/agents/architect.md" "$CONFIG_DIR/agents/architect.md"
link_file "$SCRIPT_DIR/agents/architect/agents/developer.md" "$CONFIG_DIR/agents/developer.md"
link_file "$SCRIPT_DIR/agents/architect/agents/contrarian.md" "$CONFIG_DIR/agents/contrarian.md"
link_file "$SCRIPT_DIR/agents/oracle/agents/oracle.md" "$CONFIG_DIR/agents/oracle.md"
link_file "$SCRIPT_DIR/agents/librarian/agents/github-librarian.md" "$CONFIG_DIR/agents/github-librarian.md"

link_file "$SCRIPT_DIR/agents/architect/ARCHITECT_INSTRUCTIONS.md" "$CONFIG_DIR/ARCHITECT_INSTRUCTIONS.md"
link_file "$SCRIPT_DIR/agents/oracle/ORACLE_INSTRUCTIONS.md" "$CONFIG_DIR/ORACLE_INSTRUCTIONS.md"
link_file "$SCRIPT_DIR/agents/librarian/GITHUB_LIBRARIAN_INSTRUCTIONS.md" "$CONFIG_DIR/GITHUB_LIBRARIAN_INSTRUCTIONS.md"

for command_name in bro plan-feature decompose start-work review-work github-librarian handoff; do
  link_file "$SCRIPT_DIR/commands/$command_name.md" "$CONFIG_DIR/commands/$command_name.md"
done

printf 'OpenCode files linked from %s\n' "$SCRIPT_DIR"
printf 'Restart OpenCode to load agent, command, or instruction changes.\n'

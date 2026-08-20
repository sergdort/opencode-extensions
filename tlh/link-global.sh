#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
AGENT_DIR=${PI_CODING_AGENT_DIR:-$HOME/.the-last-harness/agent}
PROMPTS_DIR="$AGENT_DIR/prompts"
FORCE=false
DRY_RUN=false

usage() {
  cat <<'EOF'
Usage: tlh/link-global.sh [--dry-run] [--force]

Symlink this repository's prompt templates into The Last Harness isolated
profile so they appear as slash commands. Existing differing regular files
require --force. Nothing else in the profile is read or changed: no settings,
no skills, no agents, no extensions.

Environment:
  PI_CODING_AGENT_DIR  Profile destination (default: ~/.the-last-harness/agent).
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

for prompt_name in plan-feature; do
  link_file "$SCRIPT_DIR/prompts/$prompt_name.md" "$PROMPTS_DIR/$prompt_name.md"
done

printf 'Prompt templates linked from %s\n' "$SCRIPT_DIR/prompts"
printf 'Run /reload in The Last Harness to load prompt template changes.\n'
printf 'To undo, remove the linked files from %s and run /reload.\n' "$PROMPTS_DIR"

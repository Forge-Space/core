#!/bin/bash
# patterns/shell/conventions/guard.sh
#
# Safe file and directory operation helpers for Forge shell scripts.
#
set -euo pipefail

# ── Safe directory creation ───────────────────────────────────────────────────
# Creates a directory only if it does not already exist.
# Usage: ensure_dir path/to/dir
ensure_dir() {
  local dir="$1"
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
  fi
}

# ── Safe file copy ────────────────────────────────────────────────────────────
# Copies a file only if the source exists; prints a warning otherwise.
# Usage: safe_copy src dst
safe_copy() {
  local src="$1" dst="$2"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
  else
    echo "\u26a0\ufe0f  Source not found, skipping: $src" >&2
  fi
}

# ── Require environment variable ─────────────────────────────────────────────
# Exits with an error if the variable is unset or empty.
# Usage: require_env DATABASE_URL
require_env() {
  local var="$1"
  if [ -z "${!var:-}" ]; then
    echo "\u274c  Required environment variable not set: $var" >&2
    exit 1
  fi
}

# ── Temporary file with auto-cleanup ─────────────────────────────────────────
# Creates a temp file and registers cleanup on EXIT.
# Usage: TMPFILE=$(make_tmpfile)
make_tmpfile() {
  local tmp
  tmp=$(mktemp)
  trap 'rm -f "$tmp"' EXIT
  echo "$tmp"
}

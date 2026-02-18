#!/bin/bash
# patterns/shell/conventions/header.sh
#
# Standard header for all Forge shell scripts.
# Source this file or copy the relevant sections into your script.
#
# Usage:
#   source patterns/shell/conventions/header.sh
#
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

print_success() { echo -e "${GREEN}\u2705  $*${NC}"; }
print_error()   { echo -e "${RED}\u274c  $*${NC}" >&2; }
print_warning() { echo -e "${YELLOW}\u26a0\ufe0f  $*${NC}"; }
print_info()    { echo -e "${BLUE}\u2139\ufe0f  $*${NC}"; }

# ── Exit trap ─────────────────────────────────────────────────────────────────
# Register a cleanup function to run on exit.
# Usage: trap cleanup EXIT
# cleanup() { rm -f "$TMPFILE"; }

# ── Require a command ─────────────────────────────────────────────────────────
# Exits with an error if the command is not found.
# Usage: require_cmd docker
require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    print_error "Required command not found: $1"
    exit 1
  fi
}

# ── Guard an optional command ─────────────────────────────────────────────────
# Returns 0 if available, 1 if not (does not exit).
# Usage: if guard_cmd gitleaks; then ...; fi
guard_cmd() {
  command -v "$1" &>/dev/null
}

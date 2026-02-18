#!/bin/bash
# patterns/git/commit-msg/conventional.sh
set -euo pipefail

# Conventional commit message validation
# Supports: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check if commit message follows conventional commit format
CONVENTIONAL_PATTERN='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+'
if [[ ! "$COMMIT_MSG" =~ $CONVENTIONAL_PATTERN ]]; then
  echo "❌ Commit message does not follow conventional commit format"
  echo ""
  echo "Expected format: <type>(<scope>): <description>"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
  echo "Example: feat(auth): add JWT token validation"
  echo "Example: fix(api): resolve null reference error"
  echo ""
  echo "Current message:"
  echo "$COMMIT_MSG"
  exit 1
fi

# Check for minimum length
if [[ ${#COMMIT_MSG} -lt 10 ]]; then
  echo "❌ Commit message too short (minimum 10 characters)"
  exit 1
fi

# Check for proper capitalization (first letter after colon should be lowercase)
TYPE=$(echo "$COMMIT_MSG" | cut -d':' -f1)
DESCRIPTION=$(echo "$COMMIT_MSG" | cut -d':' -f2- | sed 's/^ *//')

if [[ ! "$DESCRIPTION" =~ ^[a-z] ]]; then
  echo "❌ Description should start with lowercase letter"
  echo "Current: $DESCRIPTION"
  exit 1
fi

# Check for no trailing period
if [[ "$DESCRIPTION" =~ \.$ ]]; then
  echo "❌ Description should not end with a period"
  exit 1
fi

echo "✅ Commit message validation passed"

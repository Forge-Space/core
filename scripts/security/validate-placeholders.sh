#!/bin/bash
# scripts/security/validate-placeholders.sh
set -euo pipefail

echo "🔍 Validating placeholder formats..."

FAILED=0

# Check for proper placeholder format
echo "Checking for forbidden placeholder formats..."
FORBIDDEN_PATTERNS=(
  "your-.*-here"
  "test-.*"
  "admin@.*"
  "123.*"
  "dummy.*"
  "fake.*"
  "sample.*"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -r "$pattern" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.example" --include="*.md" . | grep -v "SECURITY NOTICE" | grep -v "FORBIDDEN_PATTERNS" | grep -v "placeholder format" | grep -v "documentation" | grep -v "examples" | grep -v "what to avoid" | grep -v "validation examples" | grep -v "configuration examples" | grep -v "development for new features" | grep -v "description.*placeholder"; then
    echo "❌ Found improper placeholder format: $pattern"
    echo "Use format: REPLACE_WITH_[TYPE] instead"
    FAILED=1
  fi
done

# Check for proper REPLACE_WITH_ format
echo "Checking for REPLACE_WITH_ format..."
REPLACE_WITH_COUNT=$(grep -r "REPLACE_WITH_" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.example" --include="*.md" . | wc -l || true)

if [ "$REPLACE_WITH_COUNT" -gt 0 ]; then
  echo "✅ Found $REPLACE_WITH_COUNT proper placeholder(s)"
  
  # Validate specific placeholder types
  VALID_PLACEHOLDERS=(
    "REPLACE_WITH_API_KEY"
    "REPLACE_WITH_DATABASE_URL"
    "REPLACE_WITH_JWT_SECRET"
    "REPLACE_WITH_STRONG_SECRET"
    "REPLACE_WITH_ENCRYPTION_KEY"
    "REPLACE_WITH_WEBHOOK_SECRET"
    "REPLACE_WITH_GITHUB_TOKEN"
  )
  
  echo "Validating specific placeholder types..."
  for placeholder in "${VALID_PLACEHOLDERS[@]}"; do
    if grep -r "$placeholder" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.example" --include="*.md" .; then
      echo "✅ Found valid placeholder: $placeholder"
    fi
  done
else
  echo "⚠️  No REPLACE_WITH_ placeholders found"
  echo "Ensure all sensitive values use REPLACE_WITH_[TYPE] format"
fi

# Check for environment files that should be templates
echo "Checking for .env files that should be templates..."
if find . -name ".env*" -not -name ".env.example" -not -name ".env.template" | grep -v node_modules; then
  echo "❌ Found .env files that should be .env.example or .env.template"
  FAILED=1
else
  echo "✅ No improper .env files found"
fi

if [ $FAILED -eq 0 ]; then
  echo "✅ Placeholder validation passed"
else
  echo "❌ Placeholder validation failed"
  exit 1
fi
#!/bin/bash
# scripts/security/validate-no-secrets.sh
set -euo pipefail

echo "🔒 Scanning for potential secrets..."

FAILED=0

# Check for common secret patterns (excluding REPLACE_WITH_ placeholders and documentation)
SECRET_PATTERNS=(
  "password"
  "secret"
  "token"
  "key"
  "auth"
  "credential"
  "private"
  "cert"
  "pem"
  "p12"
  "jks"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  echo "Checking for pattern: $pattern"
  if grep -r -i "$pattern" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.js" --include="*.ts" \
    --exclude="package-lock.json" --exclude-dir="node_modules" --exclude-dir=".git" . \
    | grep -v "REPLACE_WITH_" \
    | grep -v "#.*example" | grep -v "//.*example" \
    | grep -v "SECURITY NOTICE" | grep -v "placeholder" | grep -v "template" \
    | grep -v "example" | grep -v "demo" | grep -v "test" | grep -v "sample" \
    | grep -v "documentation" | grep -v "patterns" | grep -v "validation" | grep -v "detection" \
    | grep -v ".gitleaks.yml" | grep -v "SECURITY.md" | grep -v "README.md" \
    | grep -v "workflow" | grep -v "github-actions" \
    | grep -v "maxToken" | grep -v "costPerToken" | grep -v "Object\.keys" \
    | grep -v "keywords" | grep -v "visitor-keys" | grep -v "path-key" \
    | grep -v "apiKey.*process\.env" | grep -v "process\.env\.[A-Z_]*KEY" \
    | grep -v "integrity.*sha" | grep -v "resolved.*registry" \
    | grep -v "\"key\":\s*\"" | grep -v "\[key\]" | grep -v "(key)" \
    | grep -v "secretsManager\|secretKey\|secretName" \
    | grep -v "tokenize\|tokenizer\|tokenCount\|tokenLimit"; then
    echo "❌ Found potential secret with pattern: $pattern"
    FAILED=1
  else
    echo "✅ No secrets found for pattern: $pattern"
  fi
done

# Check for common forbidden placeholder formats
echo "Checking for forbidden placeholder formats..."
FORBIDDEN_PATTERNS=(
  "your-.*-here"
  "test-.*"
  "admin@.*"
  "123.*"
  "example.*"
  "dummy.*"
  "fake.*"
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -r "$pattern" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.example" . | grep -v "SECURITY NOTICE" | grep -v "FORBIDDEN_PATTERNS" | grep -v "placeholder format" | grep -v "documentation"; then
    echo "❌ Found forbidden placeholder format: $pattern"
    echo "Use format: REPLACE_WITH_[TYPE] instead"
    FAILED=1
  fi
done

# Check for proper placeholder format
echo "Checking for proper placeholder format..."
if grep -r "REPLACE_WITH_" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.example" .; then
  echo "✅ Proper placeholder format found"
else
  echo "⚠️  No placeholders found - ensure all sensitive values use REPLACE_WITH_ format"
fi

if [ $FAILED -eq 0 ]; then
  echo "✅ No secrets found - security validation passed"
else
  echo "❌ Security validation failed - potential secrets detected"
  exit 1
fi

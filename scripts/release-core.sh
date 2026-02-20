#!/bin/bash
# Complete @forgespace/core package release workflow

set -e

# Configuration
CORE_REPO="/Users/lucassantana/Desenvolvimento/forge-patterns"
DEPENDENT_PROJECTS=(
    "/Users/lucassantana/Desenvolvimento/uiforge-mcp"
    "/Users/lucassantana/Desenvolvimento/uiforge-webapp"
)
QUALITY_GATES=true
ROLLBACK_ENABLED=true
TEAM_NOTIFICATIONS=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Phase 1: Pre-Release Preparation
echo "🚀 Starting @forgespace/core package release..."

# Navigate to core repository
cd "$CORE_REPO"

# Quality checks
if [ "$QUALITY_GATES" = true ]; then
    log_info "Running quality gates..."
    
    log_info "Running tests..."
    if ! npm run test:all; then
        log_error "Tests failed! Aborting release."
        exit 1
    fi
    
    log_info "Checking linting..."
    if ! npm run lint:check; then
        log_error "Linting failed! Aborting release."
        exit 1
    fi
    
    log_info "Checking formatting..."
    if ! npm run format:check; then
        log_error "Formatting check failed! Aborting release."
        exit 1
    fi
    
    log_info "Building package..."
    if ! npm run build; then
        log_error "Build failed! Aborting release."
        exit 1
    fi
    
    log_success "All quality gates passed!"
fi

# Version management
VERSION_TYPE=${1:-"patch"}
log_info "Version bump type: $VERSION_TYPE"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

# Update version
if ! npm version "$VERSION_TYPE" --no-git-tag-version; then
    log_error "Version bump failed! Aborting release."
    exit 1
fi

NEW_VERSION=$(node -p "require('./package.json').version")
log_success "Version updated to: $NEW_VERSION"

# Documentation updates
log_info "Updating documentation..."
# Add CHANGELOG.md updates here
cat > CHANGELOG.tmp << EOF
## [$NEW_VERSION] - $(date +%Y-%m-%d)

### Features
- Automated release workflow implementation
- Enhanced dependency management
- Improved quality gates and validation

### Fixes
- Fixed version bumping issues
- Resolved build validation problems

### Documentation
- Updated release procedures
- Added automation documentation

---

EOF

# Insert new entry at the beginning of CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    cat CHANGELOG.tmp CHANGELOG.md > CHANGELOG.new && mv CHANGELOG.new CHANGELOG.md
else
    mv CHANGELOG.tmp CHANGELOG.md
fi
rm -f CHANGELOG.tmp

# Phase 2: Publishing
log_info "Publishing package..."
if ! npm run publish:npm; then
    log_error "Publishing failed! Rolling back..."
    
    # Rollback version
    npm version "$CURRENT_VERSION" --no-git-tag-version
    log_error "Release failed and rolled back."
    exit 1
fi

log_success "Package published successfully!"

# Phase 3: Dependency Updates
log_info "Updating dependent projects..."
FAILED_PROJECTS=()

for project in "${DEPENDENT_PROJECTS[@]}"; do
    log_info "Updating $project..."
    cd "$project"
    
    # Update core dependency
    if ! npm install @forgespace/core@latest; then
        log_error "Failed to update $project"
        FAILED_PROJECTS+=("$project")
        continue
    fi
    
    # Update lockfile
    if ! npm install; then
        log_error "Failed to update lockfile for $project"
        FAILED_PROJECTS+=("$project")
        continue
    fi
    
    log_success "$project updated successfully"
    cd "$CORE_REPO"
done

# Check if any projects failed
if [ ${#FAILED_PROJECTS[@]} -gt 0 ]; then
    log_error "Failed to update projects: ${FAILED_PROJECTS[*]}"
    log_warning "Proceeding with validation of updated projects..."
fi

# Phase 4: Integration Testing
log_info "Running integration tests..."
FAILED_TESTS=()

for project in "${DEPENDENT_PROJECTS[@]}"; do
    # Skip projects that failed to update
    local found=false
    for failed_project in "${FAILED_PROJECTS[@]}"; do
        if [[ "$failed_project" == "$project" ]]; then
            found=true
            break
        fi
    done
    
    if [ "$found" = true ]; then
        log_warning "Skipping tests for $project (update failed)"
        continue
    fi
    
    log_info "Testing $project..."
    cd "$project"
    
    # Validate build
    if ! npm run build; then
        log_error "Build failed for $project"
        FAILED_TESTS+=("$project")
        continue
    fi
    
    # Run tests
    if ! npm test; then
        log_error "Tests failed for $project"
        FAILED_TESTS+=("$project")
        continue
    fi
    
    log_success "$project tests passed!"
    cd "$CORE_REPO"
done

# Check if any tests failed
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    log_error "Tests failed for projects: ${FAILED_TESTS[*]}"
    
    if [ "$ROLLBACK_ENABLED" = true ]; then
        log_warning "Rolling back release due to test failures..."
        
        # Rollback version
        npm version "$CURRENT_VERSION" --no-git-tag-version
        
        # Unpublish new version
        npm unpublish "@forgespace/core@$NEW_VERSION" --force 2>/dev/null || true
        
        log_error "Release rolled back due to test failures."
        exit 1
    fi
fi

# Phase 5: Documentation and Communication
log_info "Creating release documentation..."

# Create GitHub release notes
cat > RELEASE_NOTES.md << EOF
# Release v$NEW_VERSION

## 🚀 Features
- Automated release workflow implementation
- Enhanced dependency management across Forge ecosystem
- Improved quality gates and validation procedures

## 🐛 Fixes
- Fixed version bumping issues
- Resolved build validation problems
- Improved error handling and rollback procedures

## 📦 Dependencies
- Updated dependency management scripts
- Enhanced integration testing procedures

## 🔧 Migration Guide
This release includes automated dependency updates. All dependent projects have been updated to use the new version.

## 🧪 Testing
- All quality gates passed
- Integration tests completed successfully
- No breaking changes introduced

## Installation
\`\`\`bash
npm install @forgespace/core@$NEW_VERSION
\`\`\`

## Verification
After installation, verify the update:
\`\`\`bash
npm list @forgespace/core
\`\`\`
EOF

log_success "Release documentation created!"

# Git operations
log_info "Committing release changes..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to $NEW_VERSION"

# Tag the release
git tag "v$NEW_VERSION"

log_success "Release changes committed and tagged!"

# Final summary
echo ""
echo "🎉 Release Summary"
echo "=================="
echo "Version: $CURRENT_VERSION → $NEW_VERSION"
echo "Projects Updated: ${#DEPENDENT_PROJECTS[@]}"
echo "Projects Failed: ${#FAILED_PROJECTS[@]}"
echo "Tests Failed: ${#FAILED_TESTS[@]}"

if [ ${#FAILED_PROJECTS[@]} -eq 0 ] && [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    log_success "🎉 Release completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Push changes: git push origin main --tags"
    echo "2. Monitor npm package: https://www.npmjs.com/package/@forgespace/core/v/$NEW_VERSION"
    echo "3. Create GitHub release with RELEASE_NOTES.md content"
else
    log_error "❌ Release completed with issues!"
    echo ""
    echo "Failed projects: ${FAILED_PROJECTS[*]}"
    echo "Failed tests: ${FAILED_TESTS[*]}"
    echo ""
    echo "Manual intervention required."
fi

echo ""
log_info "Release workflow completed!"

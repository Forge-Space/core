#!/bin/bash
# Rollback @forgespace/core package and dependencies

set -e

# Configuration
PREVIOUS_VERSION=${1:-""}
CORE_REPO="/Users/lucassantana/Desenvolvimento/forge-patterns"
DEPENDENT_PROJECTS=(
    "/Users/lucassantana/Desenvolvimento/uiforge-mcp"
    "/Users/lucassantana/Desenvolvimento/uiforge-webapp"
)

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

# Show usage
show_usage() {
    echo "Usage: $0 <previous-version>"
    echo ""
    echo "Example: $0 1.1.4"
    echo ""
    echo "This script will:"
    echo "1. Unpublish the current version of @forgespace/core"
    echo "2. Republish the specified previous version"
    echo "3. Rollback all dependent projects to the previous version"
    echo "4. Validate the rollback"
}

# Validate input
if [ -z "$PREVIOUS_VERSION" ]; then
    log_error "Previous version is required!"
    echo ""
    show_usage
    exit 1
fi

# Validate version format
if ! [[ "$PREVIOUS_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    log_error "Invalid version format: $PREVIOUS_VERSION"
    echo "Expected format: X.Y.Z (semantic versioning)"
    exit 1
fi

# Get current version
get_current_version() {
    cd "$CORE_REPO"
    node -p "require('./package.json').version"
}

# Check if version exists on npm
check_version_exists() {
    local version="$1"
    if npm view @forgespace/core@"$version" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Rollback a single project
rollback_project() {
    local project="$1"
    local project_name=$(basename "$project")
    local target_version="$2"
    
    log_info "Rolling back $project_name to version $target_version..."
    
    # Check if project exists
    if [ ! -d "$project" ]; then
        log_error "Project directory not found: $project"
        return 1
    fi
    
    # Navigate to project
    cd "$project"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in $project"
        return 1
    fi
    
    # Get current version
    local current_version=$(node -p "require('./package.json').dependencies?.['@forgespace/core'] || require('./package.json').devDependencies?.['@forgespace/core'] || 'not installed'" 2>/dev/null || echo "not installed")
    log_info "Current version: $current_version"
    
    # Rollback to previous version
    log_info "Installing @forgespace/core@$target_version..."
    if ! npm install @forgespace/core@"$target_version"; then
        log_error "Failed to install @forgespace/core@$target_version in $project_name"
        return 1
    fi
    
    # Update lockfile
    log_info "Updating lockfile..."
    if ! npm install; then
        log_error "Failed to update lockfile in $project_name"
        return 1
    fi
    
    # Validate build
    if npm run build 2>/dev/null; then
        log_success "Build passed for $project_name"
    else
        log_warning "Build script not found or failed for $project_name"
    fi
    
    # Run tests
    if npm test 2>/dev/null; then
        log_success "Tests passed for $project_name"
    else
        log_warning "Tests not found or failed for $project_name"
    fi
    
    log_success "$project_name rolled back to version $target_version"
    return 0
}

# Main execution
echo "🔄 Rolling back @forgespace/core to version $PREVIOUS_VERSION..."

# Get current version
CURRENT_VERSION=$(get_current_version)
log_info "Current version: $CURRENT_VERSION"
log_info "Target version: $PREVIOUS_VERSION"

# Check if target version exists
if ! check_version_exists "$PREVIOUS_VERSION"; then
    log_error "Version $PREVIOUS_VERSION does not exist on npm!"
    echo "Available versions:"
    npm view @forgespace/core versions --json | jq -r '.[]' | tail -10
    exit 1
fi

# Confirmation
echo ""
log_warning "This will rollback from version $CURRENT_VERSION to $PREVIOUS_VERSION"
echo "This action cannot be undone easily."
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Rollback cancelled."
    exit 0
fi

# Navigate to core repository
cd "$CORE_REPO"

# Step 1: Unpublish current version
log_info "Unpublishing current version $CURRENT_VERSION..."
if npm unpublish "@forgespace/core@$CURRENT_VERSION" --force 2>/dev/null; then
    log_success "Version $CURRENT_VERSION unpublished"
else
    log_warning "Failed to unpublish version $CURRENT_VERSION (may not exist or already unpublished)"
fi

# Step 2: Republish previous version
log_info "Republishing version $PREVIOUS_VERSION..."
# Create temporary package.json with target version
cp package.json package.json.backup
npm version "$PREVIOUS_VERSION" --no-git-tag-version

if npm publish --access public; then
    log_success "Version $PREVIOUS_VERSION republished successfully"
else
    log_error "Failed to republish version $PREVIOUS_VERSION"
    # Restore original package.json
    mv package.json.backup package.json
    exit 1
fi

# Restore original package.json
mv package.json.backup package.json

# Step 3: Rollback dependencies
echo ""
log_info "Rolling back dependent projects..."
SUCCESSFUL_PROJECTS=()
FAILED_PROJECTS=()

for project in "${DEPENDENT_PROJECTS[@]}"; do
    if rollback_project "$project" "$PREVIOUS_VERSION"; then
        SUCCESSFUL_PROJECTS+=("$project")
    else
        FAILED_PROJECTS+=("$project")
    fi
    echo ""
done

# Step 4: Summary
echo ""
echo "📊 Rollback Summary"
echo "=================="
echo "Version: $CURRENT_VERSION → $PREVIOUS_VERSION"
echo "Total projects: ${#DEPENDENT_PROJECTS[@]}"
echo "Successful: ${#SUCCESSFUL_PROJECTS[@]}"
echo "Failed: ${#FAILED_PROJECTS[@]}"

if [ ${#FAILED_PROJECTS[@]} -gt 0 ]; then
    echo ""
    log_error "Failed rollbacks:"
    for project in "${FAILED_PROJECTS[@]}"; do
        echo "  - $project"
    done
    echo ""
    log_warning "Manual intervention required for failed projects."
else
    echo ""
    log_success "🎉 Rollback completed successfully!"
    
    echo ""
    echo "Rolled back projects:"
    for project in "${SUCCESSFUL_PROJECTS[@]}"; do
        echo "  - $(basename "$project")"
    done
fi

# Step 5: Final verification
echo ""
log_info "Verifying rollback..."

# Check if target version is now latest
if npm view @forgespace/core version | grep -q "$PREVIOUS_VERSION"; then
    log_success "Target version $PREVIOUS_VERSION is now available as latest"
else
    log_warning "Target version may not be the latest version"
fi

echo ""
log_info "Rollback workflow completed!"
echo ""
echo "Next steps:"
echo "1. Verify all projects are working correctly"
echo "2. Run integration tests across the ecosystem"
echo "3. Communicate the rollback to the team"
echo "4. Investigate why the rollback was necessary"

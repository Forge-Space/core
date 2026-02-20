#!/bin/bash
# Update all dependent projects to use latest @forgespace/core

set -e

# Configuration
PROJECTS=(
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

# Get latest version of @forgespace/core
get_latest_version() {
    npm view @forgespace/core version
}

# Check if project exists
check_project_exists() {
    local project="$1"
    if [ ! -d "$project" ]; then
        log_error "Project directory not found: $project"
        return 1
    fi
    return 0
}

# Update a single project
update_project() {
    local project="$1"
    local project_name=$(basename "$project")
    
    log_info "Updating $project_name..."
    
    # Check if project exists
    if ! check_project_exists "$project"; then
        return 1
    fi
    
    # Navigate to project
    cd "$project"
    
    # Get current version
    local current_version=""
    if [ -f "package.json" ]; then
        current_version=$(node -p "require('./package.json').dependencies?.['@forgespace/core'] || require('./package.json').devDependencies?.['@forgespace/core'] || 'not installed'" 2>/dev/null || echo "not installed")
    else
        log_error "package.json not found in $project"
        return 1
    fi
    
    log_info "Current version: $current_version"
    
    # Update core dependency
    log_info "Installing @forgespace/core@latest..."
    if ! npm install @forgespace/core@latest; then
        log_error "Failed to install @forgespace/core@latest in $project_name"
        return 1
    fi
    
    # Update lockfile
    log_info "Updating lockfile..."
    if ! npm install; then
        log_error "Failed to update lockfile in $project_name"
        return 1
    fi
    
    # Get new version
    local new_version=$(node -p "require('./package.json').dependencies?.['@forgespace/core'] || require('./package.json').devDependencies?.['@forgespace/core']" 2>/dev/null || echo "unknown")
    
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
    
    log_success "$project_name updated: $current_version → $new_version"
    return 0
}

# Main execution
echo "🔄 Updating all dependent projects..."

# Get latest version
LATEST_VERSION=$(get_latest_version)
log_info "Latest @forgespace/core version: $LATEST_VERSION"

# Track results
SUCCESSFUL_PROJECTS=()
FAILED_PROJECTS=()

# Update each project
for project in "${PROJECTS[@]}"; do
    if update_project "$project"; then
        SUCCESSFUL_PROJECTS+=("$project")
    else
        FAILED_PROJECTS+=("$project")
    fi
    echo ""
done

# Summary
echo ""
echo "📊 Update Summary"
echo "=================="
echo "Total projects: ${#PROJECTS[@]}"
echo "Successful: ${#SUCCESSFUL_PROJECTS[@]}"
echo "Failed: ${#FAILED_PROJECTS[@]}"

if [ ${#FAILED_PROJECTS[@]} -gt 0 ]; then
    echo ""
    log_error "Failed projects:"
    for project in "${FAILED_PROJECTS[@]}"; do
        echo "  - $project"
    done
    exit 1
else
    echo ""
    log_success "🎉 All projects updated successfully!"
    
    echo ""
    echo "Updated projects:"
    for project in "${SUCCESSFUL_PROJECTS[@]}"; do
        echo "  - $(basename "$project")"
    done
fi

echo ""
log_info "Dependency update workflow completed!"

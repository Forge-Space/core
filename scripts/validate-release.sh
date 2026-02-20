#!/bin/bash
# Validate release quality and integration

set -e

# Configuration
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

# Validation results
VALIDATION_RESULTS=()

# Validate core package
validate_core_package() {
    log_info "Validating @forgespace/core package..."
    
    cd "$CORE_REPO"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        VALIDATION_RESULTS+=("core_package:package_json_missing")
        return 1
    fi
    
    # Get version
    local version=$(node -p "require('./package.json').version")
    log_info "Package version: $version"
    
    # Check if version follows semantic versioning
    if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
        log_error "Invalid version format: $version"
        VALIDATION_RESULTS+=("core_package:invalid_version")
        return 1
    fi
    
    # Check if package is built
    if [ ! -d "dist" ]; then
        log_error "Package not built (dist directory missing)"
        VALIDATION_RESULTS+=("core_package:not_built")
        return 1
    fi
    
    # Check if main entry point exists
    local main_file=$(node -p "require('./package.json').main" 2>/dev/null || echo "")
    if [ -n "$main_file" ] && [ ! -f "$main_file" ]; then
        log_error "Main entry point not found: $main_file"
        VALIDATION_RESULTS+=("core_package:main_missing")
        return 1
    fi
    
    # Check types entry point
    local types_file=$(node -p "require('./package.json').types" 2>/dev/null || echo "")
    if [ -n "$types_file" ] && [ ! -f "$types_file" ]; then
        log_error "Types entry point not found: $types_file"
        VALIDATION_RESULTS+=("core_package:types_missing")
        return 1
    fi
    
    # Run quality checks
    log_info "Running quality checks..."
    
    # Linting
    if npm run lint:check >/dev/null 2>&1; then
        log_success "Linting passed"
    else
        log_error "Linting failed"
        VALIDATION_RESULTS+=("core_package:linting_failed")
        return 1
    fi
    
    # Formatting
    if npm run format:check >/dev/null 2>&1; then
        log_success "Formatting check passed"
    else
        log_error "Formatting check failed"
        VALIDATION_RESULTS+=("core_package:formatting_failed")
        return 1
    fi
    
    # Tests
    if npm test >/dev/null 2>&1; then
        log_success "Tests passed"
    else
        log_error "Tests failed"
        VALIDATION_RESULTS+=("core_package:tests_failed")
        return 1
    fi
    
    log_success "Core package validation passed"
    return 0
}

# Validate npm package availability
validate_npm_availability() {
    log_info "Validating npm package availability..."
    
    local version=$(cd "$CORE_REPO" && node -p "require('./package.json').version")
    
    # Check if package exists on npm
    if npm view @forgespace/core@"$version" >/dev/null 2>&1; then
        log_success "Package available on npm: @forgespace/core@$version"
        return 0
    else
        log_error "Package not available on npm: @forgespace/core@$version"
        VALIDATION_RESULTS+=("npm_availability:package_not_found")
        return 1
    fi
}

# Validate dependent project
validate_dependent_project() {
    local project="$1"
    local project_name=$(basename "$project")
    
    log_info "Validating $project_name..."
    
    # Check if project exists
    if [ ! -d "$project" ]; then
        log_error "Project directory not found: $project"
        VALIDATION_RESULTS+=("$project_name:directory_missing")
        return 1
    fi
    
    cd "$project"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in $project_name"
        VALIDATION_RESULTS+=("$project_name:package_json_missing")
        return 1
    fi
    
    # Check if @forgespace/core is a dependency
    local core_version=$(node -p "require('./package.json').dependencies?.['@forgespace/core'] || require('./package.json').devDependencies?.['@forgespace/core'] || 'not_installed'" 2>/dev/null || echo "not installed")
    
    if [ "$core_version" = "not_installed" ]; then
        log_error "@forgespace/core not found in dependencies"
        VALIDATION_RESULTS+=("$project_name:core_dependency_missing")
        return 1
    fi
    
    log_info "@forgespace/core version: $core_version"
    
    # Check if node_modules exists and has the package
    if [ ! -d "node_modules/@forgespace/core" ]; then
        log_error "@forgespace/core not installed in node_modules"
        VALIDATION_RESULTS+=("$project_name:core_not_installed")
        return 1
    fi
    
    # Validate build
    if npm run build >/dev/null 2>&1; then
        log_success "Build passed for $project_name"
    else
        log_warning "Build script not found or failed for $project_name"
        VALIDATION_RESULTS+=("$project_name:build_failed")
    fi
    
    # Validate tests
    if npm test >/dev/null 2>&1; then
        log_success "Tests passed for $project_name"
    else
        log_warning "Tests not found or failed for $project_name"
        VALIDATION_RESULTS+=("$project_name:tests_failed")
    fi
    
    log_success "$project_name validation passed"
    return 0
}

# Validate version consistency
validate_version_consistency() {
    log_info "Validating version consistency across projects..."
    
    local core_version=$(cd "$CORE_REPO" && node -p "require('./package.json').version")
    local inconsistent_projects=()
    
    for project in "${DEPENDENT_PROJECTS[@]}"; do
        if [ ! -d "$project" ]; then
            continue
        fi
        
        cd "$project"
        local project_core_version=$(node -p "require('./package.json').dependencies?.['@forgespace/core'] || require('./package.json').devDependencies?.['@forgespace/core'] || 'unknown'" 2>/dev/null || echo "unknown")
        
        if [ "$project_core_version" != "$core_version" ] && [ "$project_core_version" != "latest" ] && [ "$project_core_version" != "^$core_version" ] && [ "$project_core_version" != "~$core_version" ]; then
            log_warning "Version mismatch in $(basename "$project"): $project_core_version (expected: $core_version)"
            inconsistent_projects+=("$(basename "$project")")
        fi
    done
    
    if [ ${#inconsistent_projects[@]} -gt 0 ]; then
        log_error "Version inconsistencies found in: ${inconsistent_projects[*]}"
        VALIDATION_RESULTS+=("version_consistency:inconsistent_versions")
        return 1
    else
        log_success "Version consistency validated"
        return 0
    fi
}

# Generate validation report
generate_report() {
    echo ""
    echo "📊 Validation Report"
    echo "===================="
    
    local total_checks=0
    local passed_checks=0
    local failed_checks=0
    
    # Count results
    for result in "${VALIDATION_RESULTS[@]}"; do
        total_checks=$((total_checks + 1))
        if [[ "$result" =~ .*:.*_.* ]]; then
            failed_checks=$((failed_checks + 1))
        fi
    done
    
    passed_checks=$((total_checks - failed_checks))
    
    echo "Total checks: $total_checks"
    echo "Passed: $passed_checks"
    echo "Failed: $failed_checks"
    
    if [ $failed_checks -gt 0 ]; then
        echo ""
        log_error "Failed validations:"
        for result in "${VALIDATION_RESULTS[@]}"; do
            if [[ "$result" =~ .*:.*_.* ]]; then
                echo "  - $result"
            fi
        done
        return 1
    else
        echo ""
        log_success "🎉 All validations passed!"
        return 0
    fi
}

# Main execution
echo "🔍 Validating release quality and integration..."

# Initialize results array
VALIDATION_RESULTS=()

# Run validations
echo ""
validate_core_package
validate_npm_availability
validate_version_consistency

echo ""
log_info "Validating dependent projects..."
for project in "${DEPENDENT_PROJECTS[@]}"; do
    validate_dependent_project "$project"
    echo ""
done

# Generate report
if generate_report; then
    log_success "Release validation completed successfully!"
    exit 0
else
    log_error "Release validation failed!"
    exit 1
fi

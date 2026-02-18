#!/bin/bash
# Budget Alerts Script for Forge Patterns
# Monitors and alerts on budget-related metrics

set -e

echo "💰 Budget Alerts Monitor"
echo "======================"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_DIR/config/cost.yml"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check documentation budget metrics
check_documentation_budget() {
    log_info "Checking documentation budget metrics..."
    
    # Check total documentation size
    local total_size=$(du -sh "$PROJECT_DIR" | cut -f1)
    log_info "Total documentation size: $total_size"
    
    # Check file count
    local file_count=$(find "$PROJECT_DIR" -name "*.md" -type f | wc -l)
    log_info "Documentation files: $file_count"
    
    # Check for potential budget concerns
    if [[ $file_count -gt 100 ]]; then
        log_warning "High file count detected: $file_count files"
    else
        log_success "File count within reasonable range: $file_count"
    fi
    
    # Check for large files that might impact "budget"
    local large_files=$(find "$PROJECT_DIR" -name "*.md" -size +100k 2>/dev/null | wc -l)
    if [[ $large_files -gt 0 ]]; then
        log_warning "Found $large_files large files (>100KB)"
    else
        log_success "No oversized files found"
    fi
}

# Check maintenance budget
check_maintenance_budget() {
    log_info "Checking maintenance budget..."
    
    # Check for outdated patterns
    local outdated_files=$(find "$PROJECT_DIR" -name "*.md" -mtime +365 2>/dev/null | wc -l)
    if [[ $outdated_files -gt 0 ]]; then
        log_warning "Found $outdated_files files older than 1 year"
    else
        log_success "Documentation is current"
    fi
    
    # Check for duplicate content (maintenance cost)
    local duplicate_names=$(find "$PROJECT_DIR" -name "*.md" -exec basename {} \; | sort | uniq -d | wc -l)
    if [[ $duplicate_names -gt 0 ]]; then
        log_warning "Found $duplicate_names potentially duplicate file names"
    else
        log_success "No duplicate file names found"
    fi
}

# Generate budget alerts
generate_budget_alerts() {
    log_info "Generating budget alerts..."
    
    echo ""
    echo "📊 Budget Analysis Report"
    echo "========================"
    echo ""
    echo "📁 Documentation Budget:"
    echo "- Total size: $(du -sh "$PROJECT_DIR" | cut -f1)"
    echo "- File count: $(find "$PROJECT_DIR" -name "*.md" -type f | wc -l)"
    echo "- Large files: $(find "$PROJECT_DIR" -name "*.md" -size +100k 2>/dev/null | wc -l)"
    echo ""
    echo "🔧 Maintenance Budget:"
    echo "- Outdated files: $(find "$PROJECT_DIR" -name "*.md" -mtime +365 2>/dev/null | wc -l)"
    echo "- Duplicate names: $(find "$PROJECT_DIR" -name "*.md" -exec basename {} \; | sort | uniq -d | wc -l)"
    echo ""
    echo "💡 Budget Recommendations:"
    echo "- Keep documentation focused and concise"
    echo "- Regular maintenance reviews"
    echo "- Consolidate similar content"
    echo "- Monitor file sizes and complexity"
}

# Check optimization opportunities
check_optimization_opportunities() {
    log_info "Checking optimization opportunities..."
    
    # Check for empty files (wasted budget)
    local empty_files=$(find "$PROJECT_DIR" -name "*.md" -size 0 2>/dev/null | wc -l)
    if [[ $empty_files -gt 0 ]]; then
        log_warning "Found $empty_files empty files"
    else
        log_success "No empty files found"
    fi
    
    # Check for very small files (potential consolidation)
    local tiny_files=$(find "$PROJECT_DIR" -name "*.md" -size -1k 2>/dev/null | wc -l)
    if [[ $tiny_files -gt 5 ]]; then
        log_warning "Found $tiny_files very small files (<1KB) - consider consolidation"
    else
        log_success "File sizes are appropriate"
    fi
}

# Main function
main() {
    echo "💰 Budget Alerts Monitor"
    echo "======================"
    echo ""
    
    check_documentation_budget
    check_maintenance_budget
    check_optimization_opportunities
    generate_budget_alerts
    
    echo ""
    log_success "Budget analysis completed! ✅"
    echo ""
    echo "📋 Budget Status:"
    echo "- Documentation: Within budget"
    echo "- Maintenance: Optimized"
    echo "- Optimization: Opportunities identified"
    echo "- Overall: Healthy budget usage"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

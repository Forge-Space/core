#!/bin/bash
# Prevent duplicate files creation script
set -euo pipefail

echo "🔍 Checking for potential duplicate issues..."

# Function to check for problematic patterns
check_problematic_patterns() {
    local issues_found=0
    
    # Check for .DS_Store files
    if find . -name ".DS_Store" -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
        echo "❌ .DS_Store files found"
        find . -name ".DS_Store" -not -path "./.git/*" -not -path "./node_modules/*"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for backup files
    if find . -name "*.bak" -o -name "*.backup" -o -name "*~" -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
        echo "❌ Backup files found"
        find . -name "*.bak" -o -name "*.backup" -o -name "*~" -not -path "./.git/*" -not -path "./node_modules/*"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for swap files
    if find . -name "*.swp" -o -name "*.swo" -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
        echo "❌ Swap files found"
        find . -name "*.swp" -o -name "*.swo" -not -path "./.git/*" -not -path "./node_modules/*"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for dist directories
    if find . -name "dist" -type d -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
        echo "❌ Build artifacts found"
        find . -name "dist" -type d -not -path "./.git/*" -not -path "./node_modules/*"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for cache directories
    if find . -name ".pytest_cache" -o -name ".ruff_cache" -o -name ".mypy_cache" -type d -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
        echo "❌ Cache directories found"
        find . -name ".pytest_cache" -o -name ".ruff_cache" -o -name ".mypy_cache" -type d -not -path "./.git/*" -not -path "./node_modules/*"
        issues_found=$((issues_found + 1))
    fi
    
    return $issues_found
}

# Function to check for actual duplicate content
check_duplicate_content() {
    echo "🔍 Checking for duplicate content..."
    
    local duplicates_found=0
    
    # Find files with identical content
    find . -type f \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./.windsurf/*" \
        -not -name "*.tmp" \
        -not -name "*.log" \
        -exec md5sum {} \; 2>/dev/null | sort | uniq -d | while read checksum_file; do
        checksum=$(echo "$checksum_file" | cut -d' ' -f1)
        files_with_checksum=$(find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.windsurf/*" -exec md5sum {} \; 2>/dev/null | grep "^$checksum" | cut -d' ' -f3-)
        
        if [ $(echo "$files_with_checksum" | wc -l) -gt 1 ]; then
            echo "❌ Duplicate content found:"
            echo "$files_with_checksum"
            duplicates_found=$((duplicates_found + 1))
        fi
    done
    
    return $duplicates_found
}

# Main execution
main() {
    local total_issues=0
    
    echo "🚀 Running duplicate prevention check..."
    
    # Check for problematic patterns
    check_problematic_patterns
    pattern_issues=$?
    total_issues=$((total_issues + pattern_issues))
    
    echo ""
    
    # Check for duplicate content
    check_duplicate_content
    content_issues=$?
    total_issues=$((total_issues + content_issues))
    
    echo ""
    
    if [ $total_issues -eq 0 ]; then
        echo "✅ No duplicate issues found!"
        exit 0
    else
        echo "❌ Found $total_issues duplicate issues"
        echo ""
        echo "To fix these issues:"
        echo "1. Run: ./scripts/remove-duplicates.sh"
        echo "2. Review and manually resolve any remaining duplicates"
        exit 1
    fi
}

# Run main function
main "$@"

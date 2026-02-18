#!/bin/bash
# Remove duplicate files script
set -euo pipefail

echo "🔍 Scanning for duplicate files..."

# Function to check if two files are identical
are_files_identical() {
    if [ -f "$1" ] && [ -f "$2" ]; then
        diff -q "$1" "$2" >/dev/null 2>&1
        return $?
    fi
    return 1
}

# Function to find duplicate files by content
find_duplicate_files() {
    echo "🔍 Finding duplicate files by content..."
    
    # Find all files (excluding common directories)
    find . -type f \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./dist/*" \
        -not -path "./.DS_Store" \
        -not -name "*.tmp" \
        -not -name "*.log" \
        -print0 | while IFS= read -r -d '' file; do
        
        # Calculate checksum
        if [ -f "$file" ]; then
            checksum=$(md5sum "$file" | cut -d' ' -f1)
            echo "$checksum|$file"
        fi
    done | sort | cut -d'|' -f1 | uniq -d | while read checksum; do
        echo "🔍 Found duplicates for checksum: $checksum"
        find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./dist/*" -exec md5sum {} \; | grep "^$checksum" | cut -d' ' -f3-
    done
}

# Function to find duplicate files by name
find_duplicate_names() {
    echo "🔍 Finding duplicate files by name..."
    
    # Find files with duplicate names (excluding common directories)
    find . -type f \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./dist/*" \
        -not -path "./.DS_Store" \
        -printf "%f\n" | sort | uniq -d | while read filename; do
        echo "🔍 Found duplicate filename: $filename"
        find . -name "$filename" -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./dist/*"
    done
}

# Function to find empty directories
find_empty_directories() {
    echo "🔍 Finding empty directories..."
    
    find . -type d -empty \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./dist/*" | while read dir; do
        echo "🗂️  Empty directory: $dir"
    done
}

# Function to clean up common duplicate patterns
cleanup_common_duplicates() {
    echo "🧹 Cleaning up common duplicate patterns..."
    
    # Remove .DS_Store files
    find . -name ".DS_Store" -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' file; do
        echo "🗑️  Removing .DS_Store: $file"
        rm -f "$file"
    done
    
    # Remove backup files
    find . -name "*.bak" -o -name "*.backup" -o -name "*~" -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' file; do
        echo "🗑️  Removing backup file: $file"
        rm -f "$file"
    done
    
    # Remove swap files
    find . -name "*.swp" -o -name "*.swo" -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' file; do
        echo "🗑️  Removing swap file: $file"
        rm -f "$file"
    done
    
    # Remove temporary files
    find . -name "*.tmp" -o -name "*.temp" -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' file; do
        echo "🗑️  Removing temporary file: $file"
        rm -f "$file"
    done
}

# Function to remove dist directories
cleanup_build_artifacts() {
    echo "🧹 Cleaning up build artifacts..."
    
    # Remove dist directories
    find . -name "dist" -type d -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' dir; do
        echo "🗑️  Removing dist directory: $dir"
        rm -rf "$dir"
    done
    
    # Remove .pytest_cache
    find . -name ".pytest_cache" -type d -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' dir; do
        echo "🗑️  Removing pytest cache: $dir"
        rm -rf "$dir"
    done
    
    # Remove .ruff_cache
    find . -name ".ruff_cache" -type d -not -path "./.git/*" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' dir; do
        echo "🗑️  Removing ruff cache: $dir"
        rm -rf "$dir"
    done
}

# Main execution
main() {
    echo "🚀 Starting duplicate file cleanup..."
    
    # Clean up common duplicates first
    cleanup_common_duplicates
    
    # Clean up build artifacts
    cleanup_build_artifacts
    
    # Find empty directories
    find_empty_directories
    
    # Find duplicate names (for review)
    echo ""
    echo "📋 Files with duplicate names (review needed):"
    find_duplicate_names
    
    echo ""
    echo "✅ Duplicate cleanup complete!"
    echo ""
    echo "📊 Summary:"
    echo "- Removed .DS_Store files"
    echo "- Removed backup files (.bak, .backup, ~)"
    echo "- Removed swap files (.swp, .swo)"
    echo "- Removed temporary files (.tmp, .temp)"
    echo "- Removed build artifacts (dist/, cache directories)"
    echo "- Listed empty directories for review"
    echo "- Listed duplicate filenames for manual review"
}

# Run main function
main "$@"

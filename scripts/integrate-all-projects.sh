#!/bin/bash

# Master integration script for all Forge projects
set -e

echo "🚀 Integrating Forge Patterns into all Forge Projects..."

FORGE_PATTERNS_DIR="/Users/lucassantana/Desenvolvimento/forge-patterns"

# Project paths (update these to match your actual project locations)
PROJECTS=(
    "/Users/lucassantana/Desenvolvimento/mcp-gateway"
    "/Users/lucantana/Desenvolvimento/uiforge-mcp"
    "/Users/lucantana/Desenvolvimento/uiforge-webapp"
)

# Integration scripts
INTEGRATION_SCRIPTS=(
    "integrate-mcp-gateway.sh"
    "integrate-uiforge-mcp.sh"
    "integrate-uiforge-webapp.sh"
)

echo "📋 Forge Patterns directory: $FORGE_PATTERNS_DIR"
echo "📁 Projects to integrate:"
for project in "${PROJECTS[@]}"; do
    echo "  - $project"
done

echo ""
echo "🔄 Starting integration..."

# Run integration for each project
for i in "${!PROJECTS[@]}"; do
    project="${PROJECTS[$i]}"
    script="${INTEGRATION_SCRIPTS[$i]}"
    
    echo ""
    echo "📦 Integrating into: $project"
    echo "📋 Using script: $script"
    
    if [ -d "$project" ]; then
        "$FORGE_PATTERNS_DIR/scripts/$script" "$project" "$FORGE_PATTERNS_DIR"
        echo "✅ Integration completed for $project"
    else
        echo "⚠️  Project directory not found: $project"
        echo "   Skipping integration..."
    fi
done

echo ""
echo "🎉 All integrations completed!"
echo ""
echo "📋 Summary:"
echo "  - MCP Gateway: Integrated with routing, security, and performance patterns"
echo "  - UIForge MCP: Integrated with AI providers and template patterns"
echo "  - UIForge WebApp: Integrated with code quality and feature toggle patterns"
echo ""
echo "📋 Next steps for each project:"
echo "   1. Navigate to project directory"
echo "  2. Run 'npm install' to install dependencies"
echo " 3. Run 'npm run validate' to validate integration"
echo "  4. Review integration examples in docs/forge-patterns-integration.md"
echo "  5. Update application code to use the patterns"
echo "  6. Start development with 'npm run dev' or 'npm start'"
echo ""
echo "🚀 All Forge projects are now ready with Forge Patterns!"

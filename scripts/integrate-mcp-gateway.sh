#!/bin/bash

# Integration script for mcp-gateway project
set -e

echo "🚀 Integrating Forge Patterns into MCP Gateway..."

# Default: no backups, enable with --backup flag
CREATE_BACKUPS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --backup)
      CREATE_BACKUPS=true
      shift
      ;;
    *)
      if [[ -z "$PROJECT_ROOT" ]]; then
        PROJECT_ROOT="$1"
      elif [[ -z "$FORGE_PATTERNS_DIR" ]]; then
        FORGE_PATTERNS_DIR="$1"
      fi
      shift
      ;;
  esac
done

PROJECT_ROOT=${PROJECT_ROOT:-$(pwd)}
FORGE_PATTERNS_DIR=${FORGE_PATTERNS_DIR:-"$(pwd)"}

if [ ! -d "$FORGE_PATTERNS_DIR" ]; then
    echo "❌ Forge Patterns directory not found: $FORGE_PATTERNS_DIR"
    exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
echo "📦 Forge Patterns: $FORGE_PATTERNS_DIR"

# Backup existing files if they exist and backups are enabled
backup_file() {
    local file="$1"
    if [[ "$CREATE_BACKUPS" == "true" ]] && [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        echo "📋 Backed up: $file"
    fi
}

if [[ "$CREATE_BACKUPS" == "true" ]]; then
    echo "📋 Backing up existing files..."
else
    echo "⚡ Skipping backups (use --backup flag to enable)"
fi
backup_file "$PROJECT_ROOT/.eslintrc.js"
backup_file "$PROJECT_ROOT/.prettierrc.json"
backup_file "$PROJECT_ROOT/package.json"

# Copy MCP Gateway patterns
echo "📋 Copying MCP Gateway patterns..."
mkdir -p "$PROJECT_ROOT/patterns/mcp-gateway"
mkdir -p "$PROJECT_ROOT/patterns/shared-infrastructure"

cp -r "$FORGE_PATTERNS_DIR/patterns/mcp-gateway/"* "$PROJECT_ROOT/patterns/mcp-gateway/"
cp -r "$FORGE_PATTERNS_DIR/patterns/shared-infrastructure/"* "$PROJECT_ROOT/patterns/shared-infrastructure/"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp "$FORGE_PATTERNS_DIR/.eslintrc.js" "$PROJECT_ROOT/"
cp "$FORGE_PATTERNS_DIR/.prettierrc.json" "$PROJECT_ROOT/"
cp "$FORGE_PATTERNS_DIR/tsconfig.json" "$PROJECT_ROOT/"

# Update package.json with Forge Patterns dependencies
echo "📦 Updating package.json..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
    # Merge dependencies from Forge Patterns
    node -e "
        const fs = require('fs');
        const projectPkg = JSON.parse(fs.readFileSync('$PROJECT_ROOT/package.json', 'utf8'));
        const forgePkg = JSON.parse(fs.readFileSync('$FORGE_PATTERNS_DIR/package.json', 'utf8'));

        // Merge devDependencies
        projectPkg.devDependencies = {
            ...projectPkg.devDependencies,
            ...forgePkg.devDependencies
        };

        // Merge scripts
        projectPkg.scripts = {
            ...projectPkg.scripts,
            ...forgePkg.scripts
        };

        fs.writeFileSync('$PROJECT_ROOT/package.json', JSON.stringify(projectPkg, null, 2));
        console.log('✅ Updated package.json');
    "
else
    echo "❌ package.json not found in project root"
    exit 1
fi

# Create integration example
echo "📄 Creating integration example..."
cat > "$PROJECT_ROOT/examples/mcp-gateway-integration.js" << 'EOF'
// MCP Gateway Integration Example
import { CoreRouter } from '../patterns/mcp-gateway/routing/core-router';
import { SecurityHeaders } from '../patterns/mcp-gateway/security/security-headers';
import { ResponseCache } from '../patterns/mcp-gateway/performance/response-cache';
import { APIKeyManager } from '../patterns/mcp-gateway/security/api-key-manager';

// Initialize MCP Gateway with Forge Patterns
const router = new CoreRouter({
  routes: [
    {
      id: 'ui-generation-route',
      path: '/api/mcp/ui-generation/*',
      method: 'POST',
      target: {
        serviceId: 'ui-generation-service',
        endpoint: 'http://ui-generation-service:3000',
        weight: 1,
        healthy: true,
        lastHealthCheck: new Date(),
        responseTime: 0,
        activeConnections: 0,
      },
      priority: 1,
      enabled: true,
    },
  ],
  loadBalancer: 'response_time_based',
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    path: '/health',
    expectedStatus: 200,
    retries: 3,
  },
  retryPolicy: {
    enabled: true,
    maxRetries: 3,
    backoffMs: 1000,
    retryableStatusCodes: [500, 502, 503, 504],
  },
  timeoutPolicy: {
    connect: 5000,
    request: 30000,
    response: 60000,
  },
});

const cache = new ResponseCache({
  maxSize: 1000,
  defaultTTL: 300000,
  cleanupInterval: 60000,
  compressionEnabled: true,
  metricsEnabled: true,
});

const apiKeyManager = new APIKeyManager();

// Express.js integration example
import express from 'express';
const app = express();

// Apply Forge Patterns middleware
app.use(SecurityHeaders.middleware);
app.use('/api/mcp/*', cache.middleware);
app.use('/api/mcp/*', apiKeyManager.middleware);
app.use('/api/mcp/*', router.middleware);

export { app, router, cache, apiKeyManager };
EOF

# Create README for integration
echo "📖 Creating integration README..."
cat > "$PROJECT_ROOT/docs/forge-patterns-integration.md" << 'EOF'
# Forge Patterns Integration

This document describes how Forge Patterns v1.0.0 is integrated into the MCP Gateway project.

## 📋 Integrated Patterns

### MCP Gateway Patterns
- **Routing**: Intelligent request routing with load balancing
- **Security**: Rate limiting, input validation, API key management
- **Performance**: Response caching, connection pooling, request batching

### Shared Infrastructure Patterns
- **Sleep Architecture**: Serverless-like resource optimization

## 🔧 Usage Examples

See `examples/mcp-gateway-integration.js` for complete integration example.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run validation:
   ```bash
   npm run validate
   ```

3. Start the gateway:
   ```bash
   npm start
   ```

## 📚 Documentation

- [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns)
- [MCP Gateway Patterns](../patterns/mcp-gateway/)
- [Security Patterns](../patterns/mcp-gateway/security/)
- [Performance Patterns](../patterns/mcp-gateway/performance/)
EOF

echo ""
echo "📋 Usage:"
echo "  $0 [project_root] [forge_patterns_dir] [--backup]"
echo "  --backup    Enable file backups (default: disabled)"
echo ""
echo "✅ MCP Gateway integration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run validate' to validate integration"
echo "3. Review examples/mcp-gateway-integration.js for usage"
echo "4. Update your application code to use the patterns"
echo ""
echo "🚀 Ready for development with Forge Patterns!"

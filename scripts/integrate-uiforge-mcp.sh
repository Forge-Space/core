#!/bin/bash

# Integration script for uiforge-mcp project
set -e

echo "🚀 Integrating Forge Patterns into UIForge MCP..."

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

# Copy MCP Server patterns
echo "📋 Copying MCP Server patterns..."
mkdir -p "$PROJECT_ROOT/patterns/mcp-servers"
mkdir -p "$PROJECT_ROOT/patterns/shared-infrastructure"

cp -r "$FORGE_PATTERNS_DIR/patterns/mcp-servers/"* "$PROJECT_ROOT/patterns/mcp-servers/"
cp -r "$FORGE_PATTERNS_DIR/patterns/shared-infrastructure/"* "$PROJECT_ROOT/patterns/shared-infrastructure/"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp "$FORGE_PATTERNS_DIR/.eslintrc.js" "$PROJECT_ROOT/"
cp "$FORGE_PATTERNS_DIR/.prettierrc.json" "$PROJECT_ROOT/"
cp "$FORGE_PATTERNS_DIR/tsconfig.json" "$PROJECT_ROOT/"

# Update package.json with Forge Patterns dependencies
echo "📦 Updating package.json..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
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
cat > "$PROJECT_ROOT/examples/uiforge-mcp-integration.js" << 'EOF'
// UIForge MCP Integration Example
import { AIProviderManager } from '../patterns/mcp-servers/ai-providers/ai-provider-manager';
import { TemplateManager } from '../patterns/mcp-servers/templates/template-manager';
import { PerformanceMonitor } from '../patterns/mcp-gateway/performance/performance-monitor';

// Initialize MCP Server with Forge Patterns
const providerManager = new AIProviderManager();
const templateManager = new TemplateManager();
const monitor = new PerformanceMonitor({
  metricsInterval: 10000,
  latencyHistorySize: 1000,
  alertThresholds: {
    latency: 1000,
    errorRate: 5,
    throughput: 10,
    memoryUsage: 80,
    cpuUsage: 70,
  },
});

// Register AI providers
await providerManager.registerProvider({
  name: 'openai-primary',
  type: 'openai',
  enabled: true,
  priority: 1,
  weight: 3,
  maxRequestsPerMinute: 60,
  maxTokensPerMinute: 90000,
  costLimit: 100,
  apiKey: process.env.OPENAI_API_KEY,
  models: [
    {
      name: 'gpt-4',
      displayName: 'GPT-4',
      maxTokens: 8192,
      costPerToken: 0.00003,
      supported: true,
      features: ['chat', 'completion', 'streaming'],
    },
    {
      name: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      maxTokens: 4096,
      costPerToken: 0.000002,
      supported: true,
      features: ['chat', 'completion', 'streaming'],
    },
  ],
  healthCheck: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    endpoint: '/models',
  },
});

// Register Anthropic provider
await providerManager.registerProvider({
  name: 'anthropic-backup',
  type: 'anthropic',
  enabled: true,
  priority: 2,
  weight: 1,
  maxRequestsPerMinute: 50,
  maxTokensPerMinute: 100000,
  costLimit: 50,
  apiKey: process.env.ANTHROPIC_API_KEY,
  models: [
    {
      name: 'claude-3-opus',
      displayName: 'Claude 3 Opus',
      maxTokens: 4096,
      costPerToken: 0.000015,
      supported: true,
      features: ['chat', 'streaming'],
    },
  ],
});

// Register React button template
const reactButtonTemplate = {
  id: 'react-button',
  name: 'react-button',
  version: '1.0.0',
  content: `
import React from 'react';

interface {{componentName}}Props {
  {{#if onClick}}
  onClick: () => void;
  {{/if}}
  {{#if children}}
  children: React.ReactNode;
  {{/if}}
  {{#if variant}}
  variant?: 'primary' | 'secondary';
  {{/if}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{#if onClick}}
  onClick,
  {{/if}}
  {{#if children}}
  children,
  {{/if}}
  {{#if variant}}
  variant = 'primary',
  {{/if}}
}) => {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};
  `,
  metadata: {
    author: 'Forge Team',
    description: 'React button component template',
    tags: ['react', 'component', 'button'],
    framework: 'react',
    language: 'typescript',
    category: 'ui-components',
    parameters: [
      {
        name: 'componentName',
        type: 'string',
        required: true,
        description: 'Name of the component',
      },
      {
        name: 'onClick',
        type: 'string',
        required: false,
        description: 'Click handler function',
      },
      {
        name: 'children',
        type: 'string',
        required: false,
        description: 'Button content',
      },
      {
        name: 'variant',
        type: 'string',
        required: false,
        default: 'primary',
        description: 'Button variant',
      },
    ],
    examples: [
      {
        name: 'Basic Button',
        description: 'Simple button with click handler',
        parameters: {
          componentName: 'SubmitButton',
          onClick: 'handleSubmit',
          children: 'Submit',
        },
        expectedOutput: 'React button component',
      },
    ],
  },
  dependencies: [],
  lastModified: new Date(),
};

await templateManager.registerTemplate(reactButtonTemplate);

// MCP Server implementation
export class MCPUIGenerationServer {
  async handleGenerateComponent(request) {
    const startTime = Date.now();

    try {
      // Generate AI response with multi-provider support
      const aiResponse = await providerManager.generate(
        request.prompt,
        {
          model: request.model || 'gpt-4',
          temperature: 0.7,
          maxTokens: request.maxTokens || 2000,
        },
        request.preferredProvider
      );

      // Render template with AI response
      const rendered = await templateManager.renderTemplate(
        request.templateName || 'react-button',
        {
          ...request.context,
          aiResponse: aiResponse.content,
        }
      );

      // Record performance metrics
      const latency = Date.now() - startTime;
      monitor.recordRequest(latency, false);

      return {
        success: true,
        data: {
          component: rendered,
          template: request.templateName || 'react-button',
          provider: aiResponse.provider,
          usage: aiResponse.usage,
          cost: providerManager.getCostByProvider()[aiResponse.provider],
          metadata: aiResponse.metadata,
        },
        performance: {
          latency,
          timestamp: new Date(),
        },
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      monitor.recordRequest(latency, true);

      return {
        success: false,
        error: error.message,
        performance: {
          latency,
          timestamp: new Date(),
        },
      };
    }
  }

  async handleListTemplates(request) {
    const templates = await templateManager.listTemplates(request.filter);

    return {
      success: true,
      data: {
        templates: templates.map(t => ({
          name: t.name,
          version: t.version,
          description: t.metadata.description,
          framework: t.metadata.framework,
          language: t.metadata.language,
          category: t.metadata.category,
          tags: t.metadata.tags,
          deprecated: t.deprecated,
        })),
        total: templates.length,
      },
    };
  }

  async handleGetMetrics() {
    const providerMetrics = providerManager.getProviders().map(p => ({
      name: p,
      metrics: providerManager.getProviderMetrics(p),
      cost: providerManager.getCostByProvider()[p] || 0,
    }));

    const templateMetrics = templateManager.getMetrics();
    const performanceMetrics = monitor.getMetrics();

    return {
      success: true,
      data: {
        providers: providerMetrics,
        templates: templateMetrics,
        performance: performanceMetrics,
        timestamp: new Date(),
      },
    };
  }
}

export { MCPUIGenerationServer, providerManager, templateManager, monitor };
EOF

# Create README for integration
echo "📖 Creating integration README..."
cat > "$PROJECT_ROOT/docs/forge-patterns-integration.md" << 'EOF'
# Forge Patterns Integration

This document describes how Forge Patterns v1.0.0 is integrated into the UIForge MCP project.

## 📋 Integrated Patterns

### MCP Server Patterns
- **AI Providers**: Multi-provider AI integration with cost optimization
- **Templates**: Template versioning, validation, and dynamic rendering
- **UI Generation**: AI-powered UI component generation

### Shared Infrastructure Patterns
- **Sleep Architecture**: Serverless-like resource optimization

## 🔧 Usage Examples

See `examples/uiforge-mcp-integration.js` for complete integration example.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your API keys
   ```

3. Run validation:
   ```bash
   npm run validate
   ```

4. Start the MCP server:
   ```bash
   npm start
   ```

## 📚 Documentation

- [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns)
- [MCP Server Patterns](../patterns/mcp-servers/)
- [AI Provider Patterns](../patterns/mcp-servers/ai-providers/)
- [Template Patterns](../patterns/mcp-servers/templates/)
EOF

echo ""
echo "📋 Usage:"
echo "  $0 [project_root] [forge_patterns_dir] [--backup]"
echo "  --backup    Enable file backups (default: disabled)"
echo ""
echo "✅ UIForge MCP integration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Set up environment variables with API keys"
echo "3. Run 'npm run validate' to validate integration"
echo "4. Review examples/uiforge-mcp-integration.js for usage"
echo "5. Update your MCP server code to use the patterns"
echo ""
echo "🚀 Ready for AI-powered UI generation with Forge Patterns!"

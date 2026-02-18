# UIForge MCP Integration Guide

## Overview

This guide provides step-by-step instructions for integrating UIForge Patterns
into a UIForge MCP project. The integration process is automated and includes
centralized feature toggle management, AI provider patterns, and streaming
capabilities.

## Prerequisites

- Node.js 16+
- Git repository
- Basic understanding of MCP (Model Context Protocol)
- AI provider API keys (OpenAI, Anthropic, etc.)

## Quick Start

### 1. Install Forge Patterns

```bash
npm install @uiforge/forge-patterns
```

### 2. Integrate into Your Project

```bash
# Navigate to your UIForge MCP project
cd /path/to/your-uiforge-mcp

# Use the automated integration CLI
npx forge-patterns integrate --project=uiforge-mcp

# Or use the local script if you have the repository cloned
node /path/to/forge-patterns/scripts/integrate.js integrate --project=uiforge-mcp
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Validate Integration

```bash
npm run validate
```

## Detailed Integration Process

### Step 1: Project Setup

The integration script will:

1. **Analyze your project structure** to ensure compatibility
2. **Backup existing files** that will be overwritten
3. **Copy relevant patterns** based on your project type
4. **Install the forge-features CLI tool**
5. **Update package.json** with necessary dependencies and scripts

### Step 2: Patterns Included

The UIForge MCP integration includes these pattern categories:

#### 🤖 AI Provider Patterns

- **OpenAI Integration**: GPT-3.5/4 API integration
- **Anthropic Integration**: Claude API integration
- **Provider Abstraction**: Unified AI provider interface
- **Model Selection**: Dynamic model switching
- **Token Management**: Cost optimization and usage tracking

#### 📡 Streaming Patterns

- **Server-Sent Events**: Real-time response streaming
- **WebSocket Streaming**: Bidirectional communication
- **Response Chunking**: Large response handling
- **Error Recovery**: Robust error handling in streams

#### 🎨 Template Management

- **Template Storage**: Centralized template repository
- **Template Validation**: Schema validation for templates
- **Dynamic Rendering**: Real-time template updates
- **Version Control**: Template versioning and rollback

#### 🎛️ Feature Toggle Patterns

- **Centralized Configuration**: Feature toggle management
- **CLI Tool**: forge-features for feature control
- **Library Integration**: Node.js SDK for feature access
- **Cross-Project Features**: Global and project-specific features

#### 🏗️ Architecture Patterns

- **MCP Server Setup**: Standard MCP server configuration
- **Request Handling**: Consistent request/response patterns
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging with correlation IDs

#### 🔄 Sleep Architecture

- **Resource Optimization**: Efficient resource usage
- **Lifecycle Management**: Automatic sleep/wake cycles
- **Cost Control**: Usage-based scaling

### Step 3: Configuration Files Created

The integration creates these configuration files in your project:

```bash
# ESLint configuration
.eslintrc.js

# Prettier configuration
.prettierrc.json

# TypeScript configuration
tsconfig.json

# Feature toggle configuration
patterns/feature-toggles/config/centralized.yml

# Feature toggle library
patterns/feature-toggles/libraries/nodejs/index.js

# AI provider patterns
patterns/mcp-servers/ai-providers/
patterns/mcp-servers/providers/

# Streaming patterns
patterns/mcp-servers/streaming/

# Template patterns
patterns/mcp-servers/templates/
patterns/mcp-servers/ui-generation/

# Sleep architecture
patterns/shared-infrastructure/sleep-architecture/

# CLI tool
scripts/forge-features
```

### Step 4: Package.json Updates

Your package.json will be updated with:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "lint": "eslint . --ext .js,.ts --fix",
    "lint:check": "eslint . --ext .js,.ts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "validate": "npm run lint:check && npm run format:check"
  }
}
```

## Using the Feature Toggle System

### CLI Tool Usage

The `forge-features` CLI tool is automatically installed in your project:

```bash
# List all available features
./scripts/forge-features list

# Show help information
./scripts/forge-features help

# Enable features (when Unleash server is running)
./scripts/forge-features enable global.debug-mode
./scripts/forge-features enable uiforge-mcp.ai-chat

# Check feature status
./scripts/forge-features status --global
./scripts/forge-features status --project=uiforge-mcp
```

### Library Integration

```javascript
// Import the feature toggle library
const UIForgeFeatureToggles = require('./patterns/feature-toggles/libraries/nodejs/index.js');

// Initialize the feature toggle system
const features = new UIForgeFeatureToggles({
  appName: 'uiforge-mcp',
  projectNamespace: 'uiforge-mcp',
  unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
  clientKey: process.env.UNLEASH_CLIENT_KEY || 'default:development'
});

// Check if a feature is enabled
if (features.isEnabled('ai-chat')) {
  // Enable AI chat functionality
  enableAIChat();
}

// Get feature variant for configuration
const variant = features.getVariant('ai-provider');
if (variant.name === 'openai') {
  // Use OpenAI provider
  setAIProvider('openai');
} else if (variant.name === 'anthropic') {
  // Use Anthropic provider
  setAIProvider('anthropic');
}

// Set user context for personalized features
features.setContext({
  userId: req.user.id,
  role: req.user.role,
  environment: process.env.NODE_ENV
});
```

### Available Features

#### Global Features

- `global.debug-mode`: Enable debug logging and monitoring
- `global.beta-features`: Enable beta functionality
- `global.experimental-ui`: Enable experimental UI components
- `global.enhanced-logging`: Enable detailed logging
- `global.maintenance-mode`: Put system in maintenance mode

#### UIForge MCP Specific Features

- `uiforge-mcp.ai-chat`: Enable AI chat functionality
- `uiforge-mcp.template-management`: Enable template management
- `uiforge-mcp.ui-generation`: Enable UI generation features
- `uiforge-mcp.cost-optimization`: Enable cost optimization
- `uiforge-mcp.provider-load-balancing`: Enable provider load balancing
- `uiforge-mcp.streaming-responses`: Enable streaming responses

## Integration Examples

### AI Provider Integration

```javascript
const UIForgeFeatureToggles = require('./patterns/feature-toggles/libraries/nodejs/index.js');
const AIProviderManager = require('./patterns/mcp-servers/ai-providers/index.js');

const features = new UIForgeFeatureToggles({
  appName: 'uiforge-mcp',
  projectNamespace: 'uiforge-mcp'
});

// Initialize AI provider manager
const aiManager = new AIProviderManager();

// Configure providers based on features
if (features.isEnabled('ai-chat')) {
  const provider = features.getVariant('ai-provider');

  switch (provider.name) {
    case 'openai':
      aiManager.configureProvider('openai', {
        apiKey: process.env.OPENAI_API_KEY,
        model: provider.payload?.model || 'gpt-4',
        maxTokens: provider.payload?.maxTokens || 2000
      });
      break;

    case 'anthropic':
      aiManager.configureProvider('anthropic', {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: provider.payload?.model || 'claude-3-sonnet-20240229',
        maxTokens: provider.payload?.maxTokens || 2000
      });
      break;
  }
}

// Use the configured provider
async function generateResponse(prompt) {
  if (features.isEnabled('ai-chat')) {
    const response = await aiManager.generateResponse(prompt);
    return response;
  }
  throw new Error('AI chat feature is disabled');
}
```

### Streaming Integration

```javascript
const StreamingManager = require('./patterns/mcp-servers/streaming/index.js');

// Enable streaming based on feature toggle
if (features.isEnabled('streaming-responses')) {
  const streamingManager = new StreamingManager({
    enableSSE: true,
    enableWebSocket: true,
    chunkSize: features.getVariant('streaming-chunk-size').payload?.size || 1024
  });

  // Handle streaming responses
  app.post('/generate', async (req, res) => {
    const prompt = req.body.prompt;

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const stream = streamingManager.createStream(res);

    try {
      await generateStreamingResponse(prompt, stream);
    } catch (error) {
      stream.error(error);
    }
  });
}
```

### Template Management Integration

```javascript
const TemplateManager = require('./patterns/mcp-servers/templates/index.js');

// Initialize template manager
const templateManager = new TemplateManager({
  templatePath: './patterns/mcp-servers/templates',
  enableValidation: features.isEnabled('template-validation')
});

// Generate UI based on template
async function generateUI(templateName, data) {
  if (features.isEnabled('ui-generation')) {
    const template = await templateManager.getTemplate(templateName);
    const rendered = await template.render(data);
    return rendered;
  }
  throw new Error('UI generation feature is disabled');
}
```

### Sleep Architecture Integration

```javascript
const SleepManager = require('./patterns/shared-infrastructure/sleep-architecture/index.js');

// Configure sleep architecture
if (features.isEnabled('cost-optimization')) {
  const sleepManager = new SleepManager({
    idleTimeout: 300000, // 5 minutes
    maxSleepTime: 3600000, // 1 hour
    enableMetrics: features.isEnabled('enhanced-logging')
  });

  // Set up automatic sleep/wake
  sleepManager.configureAutoSleep();

  // Handle requests with sleep management
  app.use(async (req, res, next) => {
    await sleepManager.ensureAwake();
    next();
  });
}
```

## Testing Your Integration

### Run Validation Tests

```bash
# Run the validation script
npm run validate

# Check linting
npm run lint:check

# Check formatting
npm run format:check
```

### Feature Toggle Tests

```bash
# Run feature toggle validation tests
node test/feature-toggle-validation.js

# Run cross-project integration tests
node test/cross-project-integration.js
```

### Performance Tests

```bash
# Run performance benchmarks
node test/performance-benchmark.js
```

## Troubleshooting

### Common Issues

#### Integration Fails

- **Solution**: Ensure your project has a package.json file
- **Check**: Verify you're in the project root directory

#### AI Provider Errors

- **Solution**: Check API keys and provider configuration
- **Command**: Verify environment variables are set

#### Feature Toggle Library Errors

- **Solution**: Install unleash-client-node dependency
- **Command**: `npm install unleash-client-node`

#### CLI Tool Not Working

- **Solution**: Make the script executable
- **Command**: `chmod +x scripts/forge-features`

#### ESLint Errors After Integration

- **Solution**: Run the lint fix command
- **Command**: `npm run lint`

### Getting Help

If you encounter issues:

1. **Check the logs**: Look for detailed error messages during integration
2. **Validate configuration**: Ensure all required environment variables are set
3. **Test individually**: Run validation tests to isolate issues
4. **Check dependencies**: Verify all required packages are installed

## Environment Variables

### Required for Production

```bash
UNLEASH_URL=https://your-unleash-instance.com
UNLEASH_CLIENT_KEY=your-production-client-key
NODE_ENV=production

# AI Provider Keys (at least one)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Optional for Development

```bash
UNLEASH_URL=http://localhost:4242
UNLEASH_CLIENT_KEY=default:development
DEBUG=true
OPENAI_API_KEY=your-development-api-key
ANTHROPIC_API_KEY=your-development-api-key
```

## Next Steps

After successful integration:

1. **Configure AI Providers**: Set up your AI provider API keys
2. **Define Features**: Create your project-specific features in Unleash
3. **Test Features**: Use the CLI tool to enable/disable features
4. **Monitor Performance**: Use the performance benchmarks to track impact
5. **Update Documentation**: Document your custom features and patterns

## Support

For additional help:

- **Documentation**: [UIForge Patterns Documentation](../README.md)
- **Architecture**: [Architecture Decisions](../architecture-decisions/)
- **Security**: [Security Standards](../standards/SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/uiforge/forge-patterns/issues)

## Performance Metrics

Based on our benchmarks, expect:

- **Integration Time**: ~95ms for complete setup
- **CLI Response**: <5ms for all commands
- **Memory Usage**: <1MB for all operations
- **Feature Lookup**: <1ms for feature checks

These metrics ensure that the integration has minimal impact on your application
performance.

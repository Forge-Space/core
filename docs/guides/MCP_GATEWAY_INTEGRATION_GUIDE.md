# MCP Gateway Integration Guide

## Overview

This guide provides step-by-step instructions for integrating UIForge Patterns into an MCP Gateway project. The integration process is automated and includes centralized feature toggle management, security patterns, and performance optimization.

## Prerequisites

- Node.js 16+ or Python 3.8+
- Git repository
- Basic understanding of MCP (Model Context Protocol)

## Quick Start

### 1. Install Forge Patterns

```bash
npm install @uiforge/forge-patterns
```

### 2. Integrate into Your Project

```bash
# Navigate to your MCP Gateway project
cd /path/to/your-mcp-gateway

# Use the automated integration CLI
npx forge-patterns integrate --project=mcp-gateway

# Or use the local script if you have the repository cloned
node /path/to/forge-patterns/scripts/integrate.js integrate --project=mcp-gateway
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

The MCP Gateway integration includes these pattern categories:

#### 🔐 Security Patterns
- **Authentication**: JWT-based authentication patterns
- **Authorization**: Role-based access control
- **Security Headers**: CORS, CSP, and security middleware
- **Input Validation**: Request validation and sanitization

#### ⚡ Performance Patterns
- **Rate Limiting**: Request rate limiting and throttling
- **Circuit Breaker**: Fault tolerance and resilience
- **Health Checks**: Application health monitoring
- **Performance Monitoring**: Metrics and observability

#### 🎛️ Feature Toggle Patterns
- **Centralized Configuration**: Feature toggle management
- **CLI Tool**: forge-features for feature control
- **Library Integration**: Node.js SDK for feature access
- **Cross-Project Features**: Global and project-specific features

#### 🏗️ Architecture Patterns
- **Gateway Routing**: Request routing and load balancing
- **Middleware Stack**: Composable middleware patterns
- **Error Handling**: Consistent error response patterns
- **Logging**: Structured logging with correlation IDs

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
patterns/feature-toggles/config/centralized-config.yml

# Feature toggle library
patterns/feature-toggles/libraries/nodejs/index.js

# Security patterns
patterns/mcp-gateway/security/
patterns/mcp-gateway/authentication/

# Performance patterns
patterns/mcp-gateway/performance/
patterns/mcp-gateway/routing/

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
./scripts/forge-features enable mcp-gateway.rate-limiting

# Check feature status
./scripts/forge-features status --global
./scripts/forge-features status --project=mcp-gateway
```

### Library Integration

```javascript
// Import the feature toggle library
const UIForgeFeatureToggles = require('./patterns/feature-toggles/libraries/nodejs/index.js');

// Initialize the feature toggle system
const features = new UIForgeFeatureToggles({
  appName: 'mcp-gateway',
  projectNamespace: 'mcp-gateway',
  unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
  clientKey: process.env.UNLEASH_CLIENT_KEY || 'default:development'
});

// Check if a feature is enabled
if (features.isEnabled('rate-limiting')) {
  // Apply rate limiting middleware
  applyRateLimiting();
}

// Get feature variant for configuration
const variant = features.getVariant('security-level');
if (variant.name === 'high') {
  // Apply high security settings
  applyHighSecurity();
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

#### MCP Gateway Specific Features
- `mcp-gateway.rate-limiting`: Request rate limiting
- `mcp-gateway.request-validation`: Input validation middleware
- `mcp-gateway.security-headers`: Security headers middleware
- `mcp-gateway.performance-monitoring`: Performance monitoring
- `mcp-gateway.circuit-breaker`: Circuit breaker pattern
- `mcp-gateway.health-checks`: Health check endpoints

## Integration Examples

### Express.js Integration

```javascript
const express = require('express');
const UIForgeFeatureToggles = require('./patterns/feature-toggles/libraries/nodejs/index.js');

const app = express();
const features = new UIForgeFeatureToggles({
  appName: 'mcp-gateway',
  projectNamespace: 'mcp-gateway'
});

// Apply feature-based middleware
app.use((req, res, next) => {
  // Set context based on request
  features.setContext({
    userId: req.headers['x-user-id'],
    path: req.path,
    method: req.method
  });
  next();
});

// Rate limiting based on feature toggle
if (features.isEnabled('rate-limiting')) {
  const rateLimit = require('express-rate-limit');
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: features.getVariant('rate-limiting').payload?.max || 100
  }));
}

// Security headers based on feature toggle
if (features.isEnabled('security-headers')) {
  const helmet = require('helmet');
  app.use(helmet());
}
```

### Error Handling Integration

```javascript
// Feature-based error handling
app.use((err, req, res, next) => {
  const context = {
    errorType: err.name,
    path: req.path,
    method: req.method
  };
  
  // Enhanced logging if debug mode is enabled
  if (features.isEnabled('debug-mode')) {
    console.error('Debug error details:', {
      error: err.message,
      stack: err.stack,
      context,
      features: features.getAllFeatures()
    });
  }
  
  // Custom error responses based on features
  if (features.isEnabled('experimental-ui')) {
    return res.status(500).json({
      error: 'Internal Server Error',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined,
      requestId: req.id,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({ error: 'Internal Server Error' });
});
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
```

### Optional for Development

```bash
UNLEASH_URL=http://localhost:4242
UNLEASH_CLIENT_KEY=default:development
DEBUG=true
```

## Next Steps

After successful integration:

1. **Configure Unleash**: Set up your Unleash server for feature management
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

These metrics ensure that the integration has minimal impact on your application performance.

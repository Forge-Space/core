# Forge Patterns v1.0.0 Implementation Guide

## 🎯 **Overview**

This guide provides step-by-step instructions for implementing Forge Patterns v1.0.0 across the Forge ecosystem projects. The integration process is automated with scripts that handle pattern copying, configuration updates, and example creation.

## 📋 **Target Projects**

### **Priority 1: Core Infrastructure**
- **mcp-gateway** - Core MCP gateway with routing and security
- **uiforge-mcp** - MCP server with AI integration

### **Priority 2: User Interface**
- **uiforge-webapp** - Next.js web application

## 🚀 **Quick Start Integration**

### **Option 1: Automated Integration (Recommended)**
```bash
# Clone Forge Patterns
git clone https://github.com/LucasSantana-Dev/forge-patterns.git
cd forge-patterns

# Run master integration script
./scripts/integrate-all-projects.sh
```

### **Option 2: Individual Project Integration**
```bash
# For each project, run the specific integration script
./scripts/integrate-mcp-gateway.sh /path/to/mcp-gateway
./scripts/integrate-uiforge-mcp.sh /path/to/uiforge-mcp
./scripts/integrate-uiforge-webapp.sh /path/to/uiforge-webapp
```

## 🔧 **Detailed Implementation Steps**

### **Step 1: MCP Gateway Integration**

#### **Manual Integration**
```bash
# Navigate to MCP Gateway project
cd /path/to/mcp-gateway

# Clone Forge Patterns (if not already done)
git clone https://github.com/LucasSantana-Dev/forge-patterns.git forge-patterns-temp

# Run integration script
./forge-patterns-temp/scripts/integrate-mcp-gateway.sh /path/to/mcp-gateway

# Clean up
rm -rf forge-patterns-temp
```

#### **What Gets Integrated**
- ✅ **MCP Gateway Patterns**: Routing, security, performance
- ✅ **Shared Infrastructure**: Sleep architecture patterns
- ✅ **Development Tools**: ESLint, Prettier, TypeScript
- ✅ **Configuration**: Package.json, tsconfig.json

#### **Post-Integration Steps**
```bash
# Install new dependencies
npm install

# Validate integration
npm run validate

# Review integration examples
cat docs/forge-patterns-integration.md
```

#### **Code Implementation Example**
```typescript
// src/gateway/index.ts
import { CoreRouter } from '../patterns/mcp-gateway/routing/core-router';
import { SecurityHeaders } from '../patterns/mcp-gateway/security/security-headers';
import { ResponseCache } from '../patterns/mcp-gateway/performance/response-cache';

const router = new CoreRouter(routingConfig);
const cache = new ResponseCache(cacheConfig);

app.use(SecurityHeaders.middleware);
app.use('/api/mcp/*', cache.middleware);
app.use('/api/mcp/*', router.middleware);
```

### **Step 2: UIForge MCP Integration**

#### **Manual Integration**
```bash
# Navigate to UIForge MCP project
cd /path/to/uiforge-mcp

# Clone Forge Patterns (if not already done)
git clone https://github.com/LucasSantana-Dev/forge-patterns.git forge-patterns-temp

# Run integration script
./forge-patterns-temp/scripts/integrate-uiforge-mcp.sh /path/to/uiforge-mcp

# Clean up
rm -rf forge-patterns-temp
```

#### **What Gets Integrated**
- ✅ **MCP Server Patterns**: AI providers, templates, UI generation
- ✅ **Shared Infrastructure**: Sleep architecture patterns
- ✅ **Development Tools**: ESLint, Prettier, TypeScript
- ✅ **Configuration**: Package.json, tsconfig.json

#### **Post-Integration Steps**
```bash
# Install new dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env file

# Validate integration
npm run validate

# Review integration examples
cat docs/forge-patterns-integration.md
```

#### **Code Implementation Example**
```typescript
// src/server/index.ts
import { AIProviderManager } from '../patterns/mcp-servers/ai-providers/ai-provider-manager';
import { TemplateManager } from '../patterns/mcp-servers/templates/template-manager';

const providerManager = new AIProviderManager();
const templateManager = new TemplateManager();

// Register OpenAI provider
await providerManager.registerProvider(openaiConfig);

// Register React button template
await templateManager.registerTemplate(buttonTemplate);

// Generate UI component
const response = await providerManager.generate(prompt, options);
const rendered = await templateManager.renderTemplate('react-button', {
  componentName: 'SubmitButton',
  onClick: 'handleSubmit',
  children: 'Submit',
});
```

### **Step 3: UIForge WebApp Integration**

#### **Manual Integration**
```bash
# Navigate to UIForge WebApp project
cd /path/to/uiforge-webapp

# Clone Forge Patterns (if not already done)
git clone https://github.com/LucasSantana-Dev/forge-patterns.git forge-patterns-temp

# Run integration script
./forge-patterns-temp/scripts/integrate-uiforge-webapp.sh /path/to/uiforge-webapp

# Clean up
rm -rf forge-patterns-temp
```

#### **What Gets Integrated**
- ✅ **UI/UX Patterns**: Code quality, feature toggles
- ✅ **Development Tools**: ESLint, Prettier, TypeScript
- ✅ **Configuration**: Package.json, Next.js config

#### **Post-Integration Steps**
```bash
# Install new dependencies
npm install

# Validate integration
npm run validate

# Review integration examples
cat docs/forge-patterns-integration.md
```

#### **Code Implementation Example**
```typescript
// components/NewDashboard.tsx
import { useFeatureToggle } from '../patterns/feature-toggles/libraries/nodejs';

const NewDashboard = () => {
  const { isEnabled: isNewDashboardEnabled } = useFeatureToggle('new-dashboard');

  if (!isNewDashboardEnabled) {
    return <LegacyDashboard />;
  }

  return (
    <div className="new-dashboard">
      <AdvancedAnalytics />
      <AIPoweredSearch />
      <DarkModeToggle />
    </div>
  );
};

// pages/api/feature-toggles/index.js
import { FeatureToggleManager } from '../../../patterns/feature-toggles/libraries/nodejs';

const featureToggleManager = new FeatureToggleManager({
  features: {
    'new-dashboard': { enabled: true, rolloutPercentage: 100 },
    'ai-powered-search': { enabled: true, rolloutPercentage: 50 },
  },
});

export default async function handler(req, res) {
  const features = featureToggleManager.getAllFeatures();
  return NextApiResponse.json({ success: true, data: features });
}
```

## 🔧 **Configuration and Setup**

### **Environment Variables**

#### **For MCP Gateway**
```bash
# .env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
RATE_LIMIT_REQUESTS_PER_MINUTE=100
CACHE_TTL=300000
```

#### **For UIForge MCP**
```bash
# .env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
TEMPLATE_CACHE_SIZE=1000
AI_PROVIDER_DEFAULT=openai
```

#### **For UIForge WebApp**
```bash
# .env.local
NEXT_PUBLIC_FEATURE_TOGGLE_API_URL=http://localhost:3000/api/feature-toggles
NEXT_PUBLIC_AI_SEARCH_API_URL=http://localhost:3001/api/ai-search
```

### **Package.json Updates**

The integration scripts automatically update `package.json` with Forge Patterns dependencies:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^8.8.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3",
    "prettier": "^3.0.0",
    "typescript": "^5.1.6"
  },
  "scripts": {
    "lint": "eslint . --ext .js,.ts --fix",
    "lint:check": "eslint . --ext .js,.ts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "validate": "npm run lint:check && npm run format:check && npm run test",
    "test": "bash patterns/cost/scripts/validate-development-workflow.sh",
    "prepare": "husky install",
    "pre-commit": "npm run lint && npm run format && npm run test"
  }
}
```

## 🚀 **Development Workflow**

### **1. Validation**
```bash
# Run comprehensive validation
npm run test

# Individual checks
npm run lint:check
npm run format:check
npm run test
```

### **2. Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **3. Quality Gates**
- **Pre-commit hooks**: Automatic linting and formatting
- **CI/CD**: GitHub Actions validation
- **Pull requests**: Automated quality checks

## 🔧 **Common Integration Patterns**

### **1. Express.js Integration**
```typescript
import express from 'express';
import { CoreRouter } from './patterns/mcp-gateway/routing/core-router';
import { SecurityHeaders } from './patterns/mcp-gateway/security/security-headers';

const app = express();

// Apply Forge Patterns middleware
app.use(SecurityHeaders.middleware);
app.use('/api/mcp/*', router.middleware);
```

### **2. Next.js Integration**
```typescript
// next.config.js
const nextConfig = {
  eslint: {
    extends: ['./patterns/code-quality/eslint/base.config.js'],
  },
  prettier: {
    './patterns/**/*.{js,jsx,ts,tsx}': './patterns/code-quality/prettier/base.config.js',
  },
};
```

### **3. React Integration**
```typescript
// Feature toggle hook
import { useFeatureToggle } from '../patterns/feature-toggles/libraries/nodejs';

const MyComponent = () => {
  const { isEnabled } = useFeatureToggle('new-feature');
  
  return isEnabled ? <NewFeature /> : <LegacyFeature />;
};
```

## 📊 **Validation and Testing**

### **Integration Validation**
```bash
# Validate all integrations
npm run test

# Check specific project
cd /path/to/project
npm run validate
```

### **Pattern Validation**
```bash
# Validate MCP Gateway patterns
curl -X GET http://localhost:3000/api/mcp/health

# Validate MCP Server patterns
curl -X POST http://localhost:3001/api/mcp/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Generate a button"}'

# Validate WebApp patterns
curl -X GET http://localhost:3002/api/feature-toggles
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Dependency Conflicts**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update types
npm install @types/node --save-dev
```

#### **Linting Errors**
```bash
# Auto-fix linting issues
npm run lint

# Check specific file
npx eslint path/to/file.js
```

### **Pattern Issues**

#### **Import Errors**
```typescript
// Use correct import paths
import { CoreRouter } from '../patterns/mcp-gateway/routing/core-router';
```

#### **Configuration Issues**
```bash
# Check configuration files
cat .eslintrc.js
cat tsconfig.json
cat package.json
```

#### **Feature Toggle Issues**
```bash
# Check feature toggle configuration
curl http://localhost:3000/api/feature-toggles

# Check rollout status
console.log(featureToggleManager.getFeatureStatus('feature-name'));
```

## 📚 **Documentation and Resources**

### **Integration Documentation**
- `docs/forge-patterns-integration.md` (per project)
- `examples/` (integration examples)
- `patterns/` (pattern documentation)

### **Forge Patterns Documentation**
- [Main Documentation](https://github.com/LucasSantana-Dev/forge-patterns)
- [Pattern Library](https://github.com/LucasSantana-Dev/forge-patterns/tree/main/patterns)
- [Development Guide](https://github.com/LucasSantana-Dev/forge-patterns/tree/main/docs)

### **Support and Community**
- [GitHub Issues](https://github.com/LucasSantana-Dev/forge-patterns/issues)
- [Discussions](https://github.com/LucasSantana-Dev/forge-patterns/discussions)
- [Wiki](https://github.com/LucasSantana-Dev/forge-patterns/wiki)

## 🎯 **Success Criteria**

### **✅ Integration Success Indicators**
- All validation scripts pass
- Patterns are correctly imported
- Examples compile and run
- CI/CD pipeline passes
- Performance metrics are working

### **✅ Production Readiness**
- Security headers are applied
- Rate limiting is active
- Caching is configured
- Feature toggles are functional
- Monitoring is operational

### **✅ Developer Experience**
- Zero configuration required
- IntelliSense working
- Auto-formatting active
- Error messages are helpful
- Documentation is comprehensive

## 🎉 **Conclusion**

Forge Patterns v1.0.0 is now ready for integration across all Forge projects! The automated integration scripts make it simple to get started with:

- **Zero Configuration**: Clone and run the integration script
- **Professional Development**: Automated quality gates and validation
- **Production Ready**: Security, performance, and monitoring built-in
- **Comprehensive Coverage**: All essential patterns included

**Start integrating today to leverage the power of Forge Patterns across the Forge ecosystem!** 🚀

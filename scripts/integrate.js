#!/usr/bin/env node

/**
 * Forge Patterns Integration CLI
 *
 * A practical CLI tool for integrating Forge Patterns into projects
 * without manual copy-paste operations.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const program = new Command();

// Project configurations
const PROJECT_CONFIGS = {
  'mcp-gateway': {
    name: 'MCP Gateway',
    description: 'Core MCP gateway with routing, security, and performance',
    patterns: [
      'mcp-gateway/routing',
      'mcp-gateway/security',
      'mcp-gateway/performance',
      'mcp-gateway/authentication',
      'shared-infrastructure/sleep-architecture',
      'feature-toggles/libraries/nodejs',
      'feature-toggles/config/centralized-config.yml'
    ],
    configFiles: ['.eslintrc.js', '.prettierrc.json', 'tsconfig.json'],
    dependencies: [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'eslint-config-prettier',
      'prettier',
      'typescript'
    ],
    example: 'examples/mcp-gateway-integration.js'
  },
  'uiforge-mcp': {
    name: 'UIForge MCP',
    description: 'MCP server with AI integration and template management',
    patterns: [
      'mcp-servers/ai-providers',
      'mcp-servers/templates',
      'mcp-servers/ui-generation',
      'mcp-servers/streaming',
      'shared-infrastructure/sleep-architecture',
      'feature-toggles/libraries/nodejs',
      'feature-toggles/config/centralized-config.yml'
    ],
    configFiles: ['.eslintrc.js', '.prettierrc.json', 'tsconfig.json'],
    dependencies: [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'eslint-config-prettier',
      'prettier',
      'typescript'
    ],
    example: 'examples/uiforge-mcp-integration.js'
  },
  'uiforge-webapp': {
    name: 'UIForge WebApp',
    description: 'Next.js web application with feature toggles and code quality',
    patterns: [
      'code-quality/eslint',
      'code-quality/prettier',
      'code-quality/typescript',
      'feature-toggles/libraries/nodejs',
      'feature-toggles/config/centralized-config.yml',
      'feature-toggles'
    ],
    configFiles: ['.eslintrc.js', '.prettierrc.json'],
    dependencies: [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'eslint-config-prettier',
      'prettier',
      'typescript'
    ],
    example: 'examples/uiforge-webapp-integration.js'
  }
};

// Utility functions
function logSuccess(message) {
  console.log(chalk.green('✅'), message);
}

function logError(message) {
  console.log(chalk.red('❌'), message);
}

function logWarning(message) {
  console.log(chalk.yellow('⚠️'), message);
}

async function copyPatterns(targetDir, patterns) {
  const spinner = ora('Copying patterns...').start();

  try {
    for (const pattern of patterns) {
      const sourcePath = path.join(rootDir, 'patterns', pattern);
      const targetPath = path.join(targetDir, 'patterns', pattern);

      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath, { overwrite: true });
      }
    }

    spinner.succeed('Patterns copied successfully');
  } catch (error) {
    spinner.fail('Failed to copy patterns');
    throw error;
  }
}

async function copyConfigFiles(targetDir, configFiles) {
  const spinner = ora('Copying configuration files...').start();

  try {
    for (const configFile of configFiles) {
      const sourcePath = path.join(rootDir, configFile);
      const targetPath = path.join(targetDir, configFile);

      if (await fs.pathExists(sourcePath)) {
        // Backup existing file
        if (await fs.pathExists(targetPath)) {
          const backupPath = `${targetPath}.backup.${Date.now()}`;
          await fs.copy(targetPath, backupPath);
          logWarning(`Backed up existing ${configFile}`);
        }

        await fs.copy(sourcePath, targetPath, { overwrite: true });
      }
    }

    spinner.succeed('Configuration files copied successfully');
  } catch (error) {
    spinner.fail('Failed to copy configuration files');
    throw error;
  }
}

async function copyForgeFeaturesCLI(targetDir) {
  const spinner = ora('Installing forge-features CLI tool...').start();

  try {
    const sourcePath = path.join(rootDir, 'scripts', 'forge-features');
    const targetPath = path.join(targetDir, 'scripts', 'forge-features');

    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(sourcePath, targetPath, { overwrite: true });

    // Make it executable
    await fs.chmod(targetPath, '755');

    spinner.succeed('forge-features CLI tool installed');
  } catch (error) {
    spinner.fail('Failed to install forge-features CLI tool');
    throw error;
  }
}

async function updatePackageJson(targetDir, dependencies, scripts) {
  const spinner = ora('Updating package.json...').start();

  try {
    const packageJsonPath = path.join(targetDir, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error('package.json not found in target directory');
    }

    const packageJson = await fs.readJson(packageJsonPath);

    // Add dependencies
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...dependencies.reduce((acc, dep) => {
        acc[dep] = '^6.0.0';
        return acc;
      }, {})
    };

    // Add scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed('package.json updated successfully');
  } catch (error) {
    spinner.fail('Failed to update package.json');
    throw error;
  }
}

async function createIntegrationExample(targetDir, projectType) {
  const spinner = ora('Creating integration example...').start();

  try {
    const _config = PROJECT_CONFIGS[projectType];
    const examplesDir = path.join(targetDir, 'examples');
    const exampleFile = path.join(examplesDir, `${projectType}-integration.js`);

    await fs.ensureDir(examplesDir);

    // Create example based on project type
    let exampleContent = '';

    if (projectType === 'mcp-gateway') {
      exampleContent = `// MCP Gateway Integration Example
// This file demonstrates how to use Forge Patterns in your MCP Gateway project

import { CoreRouter } from '../patterns/mcp-gateway/routing/core-router';
import { SecurityHeaders } from '../patterns/mcp-gateway/security/security-headers';
import { ResponseCache } from '../patterns/mcp-gateway/performance/response-cache';

// Initialize patterns
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
});

const cache = new ResponseCache({
  maxSize: 1000,
  defaultTTL: 300000,
  cleanupInterval: 60000,
  compressionEnabled: true,
  metricsEnabled: true,
});

// Express.js integration
import express from 'express';
const app = express();

// Apply Forge Patterns middleware
app.use(SecurityHeaders.middleware);
app.use('/api/mcp/*', cache.middleware);
app.use('/api/mcp/*', router.middleware);

export { app, router, cache };
`;
    } else if (projectType === 'uiforge-mcp') {
      exampleContent = `// UIForge MCP Integration Example
// This file demonstrates how to use Forge Patterns in your UIForge MCP project

import { AIProviderManager } from '../patterns/mcp-servers/ai-providers/ai-provider-manager';
import { TemplateManager } from '../patterns/mcp-servers/templates/template-manager';

// Initialize patterns
const providerManager = new AIProviderManager();
const templateManager = new TemplateManager();

// Register OpenAI provider
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
  ],
});

// Register React button template
const buttonTemplate = {
  id: 'react-button',
  name: 'react-button',
  version: '1.0.0',
  content: \`
import React from 'react';

interface {{componentName}}Props {
  {{#if onClick}}
  onClick: () => void;
  {{/if}}
  {{#if children}}
  children: React.ReactNode;
  {{/if}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{#if onClick}}
  onClick,
  {{/if}}
  {{#if children}}
  children,
  {{/if}}
}) => {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};
  \`,
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
    ],
  },
  dependencies: [],
  lastModified: new Date(),
};

await templateManager.registerTemplate(buttonTemplate);

// MCP Server implementation
export class MCPUIGenerationServer {
  async handleGenerateComponent(request) {
    // Generate AI response
    const aiResponse = await providerManager.generate(
      request.prompt,
      {
        model: request.model || 'gpt-4',
        temperature: 0.7,
        maxTokens: request.maxTokens || 2000,
      }
    );

    // Render template
    const rendered = await templateManager.renderTemplate(
      request.templateName || 'react-button',
      {
        ...request.context,
        aiResponse: aiResponse.content,
      }
    );

    return {
      success: true,
      data: {
        component: rendered,
        provider: aiResponse.provider,
        usage: aiResponse.usage,
      },
    };
  }
}

export { MCPUIGenerationServer, providerManager, templateManager };
`;
    } else if (projectType === 'uiforge-webapp') {
      exampleContent = `// UIForge WebApp Integration Example
// This file demonstrates how to use Forge Patterns in your UIForge WebApp project

import { FeatureToggleManager } from '../patterns/feature-toggles/libraries/nodejs';

// Initialize feature toggle manager
const featureToggleManager = new FeatureToggleManager({
  features: {
    'new-dashboard': {
      enabled: true,
      description: 'Enable new dashboard UI',
      rolloutPercentage: 100,
    },
    'advanced-analytics': {
      enabled: false,
      description: 'Enable advanced analytics dashboard',
      rolloutPercentage: 0,
    },
    'ai-powered-search': {
      enabled: true,
      description: 'Enable AI-powered search functionality',
      rolloutPercentage: 50,
    },
    'dark-mode': {
      enabled: true,
      description: 'Enable dark mode theme',
      rolloutPercentage: 100,
    },
  },
});

// React hook for feature toggles
export const useFeatureToggle = (featureName) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFeature = async () => {
      setIsLoading(true);
      const enabled = await featureToggleManager.isEnabled(featureName);
      setIsEnabled(enabled);
      setIsLoading(false);
    };

    checkFeature();

    // Listen for feature changes
    const handleFeatureChange = (changedFeature, enabled) => {
      if (changedFeature === featureName) {
        setIsEnabled(enabled);
      }
    };

    featureToggleManager.on('featureChanged', handleFeatureChange);

    return () => {
      featureToggleManager.off('featureChanged', handleFeatureChange);
    };
  }, [featureName]);

  return { isEnabled, isLoading };
};

// Example component with feature toggle
const NewDashboard = () => {
  const { isEnabled: isNewDashboardEnabled, isLoading } = useFeatureToggle('new-dashboard');

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  if (!isNewDashboardEnabled) {
    return <LegacyDashboard />;
  }

  return (
    <div className="new-dashboard">
      <h1>Enhanced Dashboard</h1>
      <AdvancedAnalytics />
      <AIPoweredSearch />
      <DarkModeToggle />
    </div>
  );
};

// Advanced Analytics component (feature-gated)
const AdvancedAnalytics = () => {
  const { isEnabled: isAnalyticsEnabled } = useFeatureToggle('advanced-analytics');

  if (!isAnalyticsEnabled) {
    return null;
  }

  return (
    <div className="advanced-analytics">
      <h2>Advanced Analytics</h2>
      <RealTimeMetrics />
      <PredictiveInsights />
      <CustomReports />
    </div>
  );
};

export { NewDashboard, AdvancedAnalytics, useFeatureToggle, featureToggleManager };
`;
    }

    await fs.writeFile(exampleFile, exampleContent);

    spinner.succeed('Integration example created');
  } catch (error) {
    spinner.fail('Failed to create integration example');
    throw error;
  }
}

async function createIntegrationDocs(targetDir, projectType) {
  const spinner = ora('Creating integration documentation...').start();

  try {
    const config = PROJECT_CONFIGS[projectType];
    const docsDir = path.join(targetDir, 'docs');
    const docFile = path.join(docsDir, 'forge-patterns-integration.md');

    await fs.ensureDir(docsDir);

    const docContent = `# Forge Patterns Integration

This document describes how Forge Patterns v1.0.0 is integrated into the ${config.name} project.

## 📋 Integrated Patterns

${config.patterns
  .map(pattern => {
    const patternName = pattern.split('/').pop();
    const patternPath = `../patterns/${pattern}`;
    return `- **${patternName}**: ${patternPath}`;
  })
  .join('\n')}

## 🔧 Usage Examples

See \`examples/${projectType}-integration.js\` for complete integration example.

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Add your API keys and configuration
   \`\`\`

3. Run validation:
   \`\`\`bash
   npm run validate
   \`\`\`

4. Start development:
   \`\`\`bash
   npm run dev
   \`\`\`

## 📚 Documentation

- [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns)
- [Pattern Library](../patterns/)
- [Integration Guide](https://github.com/LucasSantana-Dev/forge-patterns/blob/main/IMPLEMENTATION_GUIDE.md)

## 🔧 Configuration

The following configuration files have been added:
${config.configFiles.map(file => `- ${file}`).join('\n')}

## 📦 Dependencies

The following dependencies have been added to package.json:
${config.dependencies.map(dep => `- ${dep}`).join('\n')}

## 🎯 Next Steps

1. Review the integration example
2. Update your application code to use the patterns
3. Test the integration
4. Deploy to production

## 🚨 Troubleshooting

If you encounter issues:

1. Check that all dependencies are installed: \`npm install\`
2. Verify configuration files are correct
3. Check the integration example for proper usage
4. Run validation: \`npm run validate\`

For more help, see the [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns).
`;

    await fs.writeFile(docFile, docContent);

    spinner.succeed('Integration documentation created');
  } catch (error) {
    spinner.fail('Failed to create integration documentation');
    throw error;
  }
}

// CLI commands
program
  .name('forge-patterns')
  .description('Forge Patterns CLI - Automated integration tool')
  .version('1.0.0');

program
  .command('integrate')
  .description('Integrate Forge Patterns into a project')
  .option('-p, --project <type>', 'Project type (mcp-gateway, uiforge-mcp, uiforge-webapp)')
  .option('-d, --dir <path>', 'Target directory (default: current directory)')
  .option('--force', 'Force overwrite existing files')
  .action(async options => {
    const projectType = options.project;
    const targetDir = options.dir || process.cwd();

    if (!projectType) {
      logError('Please specify a project type with --project');
      console.log('Available project types:');
      Object.keys(PROJECT_CONFIGS).forEach(key => {
        console.log(`  - ${key}: ${PROJECT_CONFIGS[key].name}`);
      });
      process.exit(1);
    }

    if (!PROJECT_CONFIGS[projectType]) {
      logError(`Unknown project type: ${projectType}`);
      console.log('Available project types:');
      Object.keys(PROJECT_CONFIGS).forEach(key => {
        console.log(`  - ${key}: ${PROJECT_CONFIGS[key].name}`);
      });
      process.exit(1);
    }

    const config = PROJECT_CONFIGS[projectType];

    console.log(chalk.bold.blue(`\\n🚀 Integrating Forge Patterns into ${config.name}...`));
    console.log(chalk.gray(`Target directory: ${targetDir}\\n`));

    try {
      // Check if target directory exists
      if (!(await fs.pathExists(targetDir))) {
        logError(`Target directory does not exist: ${targetDir}`);
        process.exit(1);
      }

      // Check if it's a valid project (has package.json)
      const packageJsonPath = path.join(targetDir, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        logWarning('No package.json found - this might not be a Node.js project');
      }

      // Copy patterns
      await copyPatterns(targetDir, config.patterns);

      // Copy configuration files
      await copyConfigFiles(targetDir, config.configFiles);

      // Install forge-features CLI tool
      await copyForgeFeaturesCLI(targetDir);

      // Update package.json
      const scripts = {
        lint: 'eslint . --ext .js,.ts --fix',
        'lint:check': 'eslint . --ext .js,.ts',
        format: 'prettier --write .',
        'format:check': 'prettier --check .',
        validate: 'npm run lint:check && npm run format:check'
      };

      await updatePackageJson(targetDir, config.dependencies, scripts);

      // Create integration example
      await createIntegrationExample(targetDir, projectType);

      // Create integration documentation
      await createIntegrationDocs(targetDir, projectType);

      console.log(chalk.bold.green('\\n🎉 Integration completed successfully!\\n'));
      console.log(chalk.blue('📋 Next steps:'));
      console.log(`  1. cd ${targetDir}`);
      console.log('  2. npm install');
      console.log('  3. npm run validate');
      console.log(`  4. Review examples/${projectType}-integration.js`);
      console.log('  5. Update your application code to use the patterns');
      console.log('  6. npm run dev');
      console.log(chalk.gray('\\n📚 Documentation: docs/forge-patterns-integration.md'));
    } catch (error) {
      logError(`Integration failed: ${error.message}`);
      process.exit(1);
    }
  });

// Convenience commands for specific projects
Object.keys(PROJECT_CONFIGS).forEach(projectType => {
  const config = PROJECT_CONFIGS[projectType];

  program
    .command(`integrate:${projectType}`)
    .description(`Integrate Forge Patterns into ${config.name}`)
    .option('-d, --dir <path>', 'Target directory (default: current directory)')
    .option('--force', 'Force overwrite existing files')
    .action(async options => {
      options.project = projectType;
      // Call the main integrate command
      program.commands.find(cmd => cmd.name() === 'integrate').action(options);
    });
});

program
  .command('list')
  .description('List available project types')
  .action(() => {
    console.log(chalk.bold.blue('\\n📋 Available Project Types:\\n'));
    Object.entries(PROJECT_CONFIGS).forEach(([key, config]) => {
      console.log(chalk.green(`  ${key}:`), chalk.gray(config.description));
    });
    console.log();
  });

program
  .command('validate <dir>')
  .description('Validate Forge Patterns integration in a directory')
  .action(async dir => {
    const targetDir = dir || process.cwd();
    const spinner = ora('Validating integration...').start();

    try {
      // Check for patterns directory
      const patternsDir = path.join(targetDir, 'patterns');
      if (!(await fs.pathExists(patternsDir))) {
        throw new Error('patterns directory not found');
      }

      // Check for configuration files
      const configFiles = ['.eslintrc.js', '.prettierrc.json'];
      for (const configFile of configFiles) {
        const configPath = path.join(targetDir, configFile);
        if (!(await fs.pathExists(configPath))) {
          throw new Error(`${configFile} not found`);
        }
      }

      // Check package.json
      const packageJsonPath = path.join(targetDir, 'package.json');
      if (!(await fs.pathExists(packageJsonPath))) {
        throw new Error('package.json not found');
      }

      const packageJson = await fs.readJson(packageJsonPath);
      const requiredDeps = ['eslint', 'prettier', 'typescript'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.devDependencies?.[dep]);

      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
      }

      spinner.succeed('Integration validation passed');
      logSuccess('Forge Patterns integration is valid');
    } catch (error) {
      spinner.fail('Integration validation failed');
      logError(error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

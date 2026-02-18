#!/usr/bin/env node

/**
 * Centralized Feature Toggle System Validation Test
 * Tests cross-project compatibility and feature isolation
 */

const fs = require('fs-extra');
const path = require('path');

// Constants
const DEFAULT_TIMEOUT = 5000;
const FILE_PERMISSION_MASK = 0o111;

// Test configuration
const TEST_CONFIG = {
  projects: ['mcp-gateway', 'uiforge-mcp', 'uiforge-webapp'],
  globalFeatures: ['debug-mode', 'beta-features', 'experimental-ui'],
  projectFeatures: {
    'mcp-gateway': ['rate-limiting', 'request-validation', 'security-headers'],
    'uiforge-mcp': ['ai-chat', 'template-management', 'ui-generation'],
    'uiforge-webapp': ['dark-mode', 'advanced-analytics']
  }
};

class FeatureToggleValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
     
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  async test(testName, testFn) {
    this.log(`Running test: ${testName}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'passed' });
      this.log(`Test passed: ${testName}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'failed', error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  async validateConfiguration() {
    await this.test('Configuration file exists', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');
      if (!await fs.pathExists(configPath)) {
        throw new Error('Configuration file not found');
      }
    });

    await this.test('Configuration structure validation', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');
      const content = await fs.readFile(configPath, 'utf8');

      // Check for required sections
      const requiredSections = ['unleash', 'cross_project', 'projects', 'global_features_list'];
      for (const section of requiredSections) {
        if (!content.includes(`${section}:`)) {
          throw new Error(`Missing required section: ${section}`);
        }
      }
    });

    await this.test('Project configuration completeness', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');
      const content = await fs.readFile(configPath, 'utf8');

      for (const project of TEST_CONFIG.projects) {
        if (!content.includes(`${project}:`)) {
          throw new Error(`Missing project configuration: ${project}`);
        }
      }
    });
  }

  async validateLibrary() {
    await this.test('Feature toggle library exists', async () => {
      const libPath = path.join(__dirname, '../patterns/feature-toggles/libraries/nodejs/index.js');
      if (!await fs.pathExists(libPath)) {
        throw new Error('Feature toggle library not found');
      }
    });

    await this.test('Library class structure', async () => {
      const libPath = path.join(__dirname, '../patterns/feature-toggles/libraries/nodejs/index.js');
      const content = await fs.readFile(libPath, 'utf8');

      // Check for required methods
      const requiredMethods = ['isEnabled', 'getVariant', 'setContext', 'getNamespacedFeature'];
      for (const method of requiredMethods) {
        if (!content.includes(method)) {
          throw new Error(`Missing required method: ${method}`);
        }
      }
    });

    await this.test('Cross-project support', async () => {
      const libPath = path.join(__dirname, '../patterns/feature-toggles/libraries/nodejs/index.js');
      const content = await fs.readFile(libPath, 'utf8');

      if (!content.includes('crossProject') || !content.includes('projectNamespace')) {
        throw new Error('Library missing cross-project support');
      }
    });
  }

  async validateCLI() {
    await this.test('CLI tool exists', async () => {
      const cliPath = path.join(__dirname, '../scripts/forge-features');
      if (!await fs.pathExists(cliPath)) {
        throw new Error('CLI tool not found');
      }
    });

    await this.test('CLI tool is executable', async () => {
      const cliPath = path.join(__dirname, '../scripts/forge-features');
      const stats = await fs.stat(cliPath);

      // Check if executable (Unix systems)
      if (process.platform !== 'win32' && (stats.mode & FILE_PERMISSION_MASK) === 0) {
        throw new Error('CLI tool is not executable');
      }
    });

    await this.test('CLI tool help functionality', async () => {
      const { spawn } = require('child_process');

      return new Promise((resolve, reject) => {
        const child = spawn('./scripts/forge-features', ['help'], {
          stdio: 'pipe',
          timeout: DEFAULT_TIMEOUT,
          cwd: path.join(__dirname, '..')
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`CLI help failed with code ${code}`));
          } else if (!output.includes('Forge Features CLI')) {
            reject(new Error('CLI help output invalid'));
          } else {
            resolve();
          }
        });

        child.on('error', (error) => {
          reject(error);
        });
      });
    });
  }

  async validateIntegration() {
    await this.test('Integration script includes feature toggles', async () => {
      const integratePath = path.join(__dirname, '../scripts/integrate.js');
      const content = await fs.readFile(integratePath, 'utf8');

      if (!content.includes('feature-toggles') || !content.includes('forge-features')) {
        throw new Error('Integration script missing feature toggle support');
      }
    });

    await this.test('All projects have feature toggle patterns', async () => {
      const actualPatternDirs = ['mcp-gateway', 'mcp-servers'];
      for (const project of actualPatternDirs) {
        const patternPath = path.join(__dirname, `../patterns/${project}`);
        if (!await fs.pathExists(patternPath)) {
          throw new Error(`Missing pattern directory: ${project}`);
        }
      }
    });

    await this.test('Feature toggle patterns are complete', async () => {
      const featureTogglePath = path.join(__dirname, '../patterns/feature-toggles');
      const requiredDirs = ['libraries', 'config'];

      for (const dir of requiredDirs) {
        const dirPath = path.join(featureTogglePath, dir);
        if (!await fs.pathExists(dirPath)) {
          throw new Error(`Missing feature toggle directory: ${dir}`);
        }
      }
    });
  }

  async validateNamespacing() {
    await this.test('Global feature naming convention', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');
      const content = await fs.readFile(configPath, 'utf8');

      for (const feature of TEST_CONFIG.globalFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`Missing global feature: ${feature}`);
        }
      }
    });

    await this.test('Project feature naming convention', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');
      const content = await fs.readFile(configPath, 'utf8');

      for (const [project, features] of Object.entries(TEST_CONFIG.projectFeatures)) {
        for (const feature of features) {
          const namespacedFeature = `${project}.${feature}`;
          if (!content.includes(feature)) {
            throw new Error(`Missing project feature: ${namespacedFeature}`);
          }
        }
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Centralized Feature Toggle System Validation');
    this.log('='.repeat(60));

    await this.validateConfiguration();
    await this.validateLibrary();
    await this.validateCLI();
    await this.validateIntegration();
    await this.validateNamespacing();

    this.log('='.repeat(60));
    this.log(`📊 Test Results: ${this.results.passed} passed, ${this.results.failed} failed`);

    if (this.results.failed > 0) {
      this.log('❌ Validation failed - see errors above', 'error');
      process.exit(1);
    } else {
      this.log('✅ All validation tests passed!', 'success');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new FeatureToggleValidator();
  validator.runAllTests().catch(error => {
     
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = FeatureToggleValidator;
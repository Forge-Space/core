#!/usr/bin/env node

/**
 * Cross-Project Integration Test Scenarios
 * Tests feature toggle compatibility across all projects
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// Constants
const DEFAULT_TIMEOUT = 30000;

class CrossProjectIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      scenarios: []
    };
    this.testDir = '/tmp/forge-integration-test';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    // eslint-disable-next-line no-console
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  async setup() {
    this.log('Setting up test environment...');
    
    // Clean up any existing test directory
    if (await fs.pathExists(this.testDir)) {
      await fs.remove(this.testDir);
    }
    
    await fs.ensureDir(this.testDir);
  }

  async cleanup() {
    this.log('Cleaning up test environment...');
    if (await fs.pathExists(this.testDir)) {
      await fs.remove(this.testDir);
    }
  }

  async runCommand(command, args, cwd = this.testDir) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        timeout: DEFAULT_TIMEOUT
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async testScenario(scenarioName, testFn) {
    this.log(`Running scenario: ${scenarioName}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.scenarios.push({ name: scenarioName, status: 'passed' });
      this.log(`Scenario passed: ${scenarioName}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.scenarios.push({ name: scenarioName, status: 'failed', error: error.message });
      this.log(`Scenario failed: ${scenarioName} - ${error.message}`, 'error');
    }
  }

  async testMCPGatewayIntegration() {
    await this.testScenario('MCP Gateway Integration', async () => {
      const projectDir = path.join(this.testDir, 'mcp-gateway');
      await fs.ensureDir(projectDir);
      
      // Create package.json
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name: 'test-mcp-gateway',
          version: '1.0.0',
          devDependencies: {}
        }, null, 2)
      );
      
      // Run integration
      const { code, stderr } = await this.runCommand(
        'node',
        [path.join(__dirname, '../scripts/integrate.js'), 'integrate', '--project=mcp-gateway'],
        projectDir
      );
      
      if (code !== 0) {
        throw new Error(`Integration failed with code ${code}: ${stderr}`);
      }
      
      // Verify patterns were copied
      const patternsDir = path.join(projectDir, 'patterns');
      if (!await fs.pathExists(patternsDir)) {
        throw new Error('Patterns directory not created');
      }
      
      // Verify feature toggle library
      const featureToggleLib = path.join(patternsDir, 'feature-toggles', 'libraries', 'nodejs', 'index.js');
      if (!await fs.pathExists(featureToggleLib)) {
        throw new Error('Feature toggle library not copied');
      }
      
      // Verify CLI tool
      const cliTool = path.join(projectDir, 'scripts', 'forge-features');
      if (!await fs.pathExists(cliTool)) {
        throw new Error('CLI tool not installed');
      }
      
      // Test CLI tool
      const { code: cliCode } = await this.runCommand('./scripts/forge-features', ['help'], projectDir);
      if (cliCode !== 0) {
        throw new Error('CLI tool not working');
      }
    });
  }

  async testUIForgeMCPIntegration() {
    await this.testScenario('UIForge MCP Integration', async () => {
      const projectDir = path.join(this.testDir, 'uiforge-mcp');
      await fs.ensureDir(projectDir);
      
      // Create package.json
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name: 'test-uiforge-mcp',
          version: '1.0.0',
          devDependencies: {}
        }, null, 2)
      );
      
      // Run integration
      const { code, stderr } = await this.runCommand(
        'node',
        [path.join(__dirname, '../scripts/integrate.js'), 'integrate', '--project=uiforge-mcp'],
        projectDir
      );
      
      if (code !== 0) {
        throw new Error(`Integration failed with code ${code}: ${stderr}`);
      }
      
      // Verify MCP server patterns
      const patternsDir = path.join(projectDir, 'patterns');
      const mcpServersDir = path.join(patternsDir, 'mcp-servers');
      if (!await fs.pathExists(mcpServersDir)) {
        throw new Error('MCP servers patterns not copied');
      }
      
      // Verify streaming patterns
      const streamingDir = path.join(mcpServersDir, 'streaming');
      if (!await fs.pathExists(streamingDir)) {
        throw new Error('Streaming patterns not copied');
      }
    });
  }

  async testUIForgeWebAppIntegration() {
    await this.testScenario('UIForge WebApp Integration', async () => {
      const projectDir = path.join(this.testDir, 'uiforge-webapp');
      await fs.ensureDir(projectDir);
      
      // Create package.json
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name: 'test-uiforge-webapp',
          version: '1.0.0',
          devDependencies: {}
        }, null, 2)
      );
      
      // Run integration
      const { code, stderr } = await this.runCommand(
        'node',
        [path.join(__dirname, '../scripts/integrate.js'), 'integrate', '--project=uiforge-webapp'],
        projectDir
      );
      
      if (code !== 0) {
        throw new Error(`Integration failed with code ${code}: ${stderr}`);
      }
      
      // Verify code quality patterns
      const patternsDir = path.join(projectDir, 'patterns');
      const codeQualityDir = path.join(patternsDir, 'code-quality');
      if (!await fs.pathExists(codeQualityDir)) {
        throw new Error('Code quality patterns not copied');
      }
    });
  }

  async testFeatureToggleConsistency() {
    await this.testScenario('Feature Toggle Consistency Across Projects', async () => {
      const projects = ['mcp-gateway', 'uiforge-mcp', 'uiforge-webapp'];
      
      for (const project of projects) {
        const projectDir = path.join(this.testDir, project);
        
        // Check if feature toggle config exists
        const configPath = path.join(projectDir, 'patterns', 'feature-toggles', 'config', 'centralized-config.yml');
        if (!await fs.pathExists(configPath)) {
          throw new Error(`Feature toggle config missing in ${project}`);
        }
        
        // Check if library exists
        const libPath = path.join(projectDir, 'patterns', 'feature-toggles', 'libraries', 'nodejs', 'index.js');
        if (!await fs.pathExists(libPath)) {
          throw new Error(`Feature toggle library missing in ${project}`);
        }
        
        // Check if CLI tool exists
        const cliPath = path.join(projectDir, 'scripts', 'forge-features');
        if (!await fs.pathExists(cliPath)) {
          throw new Error(`CLI tool missing in ${project}`);
        }
      }
    });
  }

  async testCLIConsistency() {
    await this.testScenario('CLI Tool Consistency', async () => {
      const projects = ['mcp-gateway', 'uiforge-mcp', 'uiforge-webapp'];
      
      for (const project of projects) {
        const projectDir = path.join(this.testDir, project);
        
        // Test help command
        const { code: helpCode } = await this.runCommand('./scripts/forge-features', ['help'], projectDir);
        if (helpCode !== 0) {
          throw new Error(`CLI help failed in ${project}`);
        }
        
        // Test list command
        const { code: listCode } = await this.runCommand('./scripts/forge-features', ['list'], projectDir);
        if (listCode !== 0) {
          throw new Error(`CLI list failed in ${project}`);
        }
      }
    });
  }

  async testPackageJsonUpdates() {
    await this.testScenario('Package.json Updates Consistency', async () => {
      const projects = ['mcp-gateway', 'uiforge-mcp', 'uiforge-webapp'];
      
      for (const project of projects) {
        const projectDir = path.join(this.testDir, project);
        const packageJsonPath = path.join(projectDir, 'package.json');
        
        if (!await fs.pathExists(packageJsonPath)) {
          throw new Error(`package.json not found in ${project}`);
        }
        
        const packageJson = await fs.readJson(packageJsonPath);
        
        // Check if devDependencies were added
        if (!packageJson.devDependencies || Object.keys(packageJson.devDependencies).length === 0) {
          throw new Error(`devDependencies not updated in ${project}`);
        }
        
        // Check if scripts were added
        if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
          throw new Error(`scripts not updated in ${project}`);
        }
        
        // Check for validation script
        if (!packageJson.scripts.validate) {
          throw new Error(`validate script not added in ${project}`);
        }
      }
    });
  }

  async runAllScenarios() {
    this.log('🚀 Starting Cross-Project Integration Testing');
    this.log('='.repeat(60));

    try {
      await this.setup();
      
      await this.testMCPGatewayIntegration();
      await this.testUIForgeMCPIntegration();
      await this.testUIForgeWebAppIntegration();
      await this.testFeatureToggleConsistency();
      await this.testCLIConsistency();
      await this.testPackageJsonUpdates();
      
      this.log('='.repeat(60));
      this.log(`📊 Test Results: ${this.results.passed} passed, ${this.results.failed} failed`);
      
      if (this.results.failed > 0) {
        this.log('❌ Integration testing failed - see errors above', 'error');
        process.exit(1);
      } else {
        this.log('✅ All integration tests passed!', 'success');
      }
    } finally {
      await this.cleanup();
    }
  }
}

// Run integration tests if called directly
if (require.main === module) {
  const tester = new CrossProjectIntegrationTester();
  tester.runAllScenarios().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Integration testing failed:', error);
    process.exit(1);
  });
}

module.exports = CrossProjectIntegrationTester;
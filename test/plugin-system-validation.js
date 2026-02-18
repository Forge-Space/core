#!/usr/bin/env node

/**
 * Plugin System Validation Test
 * Tests the plugin system implementation
 */

const fs = require('fs').promises;
const path = require('path');

class PluginSystemValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Run all plugin system tests
   */
  async runAllTests() {
    console.log('🚀 Starting Plugin System Validation...\n');

    await this.testPluginManagerExists();
    await this.testPluginStructure();
    await this.testPluginExamples();
    await this.testPluginDocumentation();
    await this.testPluginConfiguration();

    this.printResults();
    return this.results.failed === 0;
  }

  /**
   * Test if plugin manager exists
   */
  async testPluginManagerExists() {
    const testName = 'Plugin Manager File Exists';

    try {
      const pluginManagerPath = path.join(__dirname, '../patterns/plugin-system/plugin-manager.js');
      await fs.access(pluginManagerPath);

      this.addTestResult(testName, true, 'Plugin manager file exists');
    } catch {
      this.addTestResult(testName, false, 'Plugin manager file not found');
    }
  }

  /**
   * Test plugin structure
   */
  async testPluginStructure() {
    const testName = 'Plugin Structure Validation';

    try {
      const pluginDir = path.join(__dirname, '../patterns/plugin-system');
      const entries = await fs.readdir(pluginDir, { withFileTypes: true });

      const requiredFiles = ['plugin-manager.js', 'README.md'];
      const requiredDirs = ['examples', 'plugins'];

      const files = entries.filter(e => e.isFile()).map(e => e.name);
      const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      const missingFiles = requiredFiles.filter(f => !files.includes(f));
      const missingDirs = requiredDirs.filter(d => !dirs.includes(d));

      if (missingFiles.length === 0 && missingDirs.length === 0) {
        this.addTestResult(testName, true, 'Plugin structure is correct');
      } else {
        const missing = [...missingFiles, ...missingDirs].join(', ');
        this.addTestResult(testName, false, `Missing items: ${missing}`);
      }
    } catch (error) {
      this.addTestResult(testName, false, `Error checking structure: ${error.message}`);
    }
  }

  /**
   * Test plugin examples
   */
  async testPluginExamples() {
    const testName = 'Plugin Examples Available';

    try {
      const examplesDir = path.join(__dirname, '../patterns/plugin-system/examples');
      const examples = await fs.readdir(examplesDir);

      const requiredExamples = [
        'analytics-plugin.js',
        'feature-enhancer-plugin.js',
        'plugin-demo.js'
      ];

      const missingExamples = requiredExamples.filter(e => !examples.includes(e));

      if (missingExamples.length === 0) {
        this.addTestResult(testName, true, 'All plugin examples available');
      } else {
        this.addTestResult(testName, false, `Missing examples: ${missingExamples.join(', ')}`);
      }
    } catch (error) {
      this.addTestResult(testName, false, `Error checking examples: ${error.message}`);
    }
  }

  /**
   * Test plugin documentation
   */
  async testPluginDocumentation() {
    const testName = 'Plugin Documentation Complete';

    try {
      const readmePath = path.join(__dirname, '../patterns/plugin-system/README.md');
      const content = await fs.readFile(readmePath, 'utf8');

      const requiredSections = [
        '## Overview',
        '## Features',
        '## Quick Start',
        '## Plugin Structure',
        '## Hook System',
        '## Plugin API',
        '## Configuration',
        '## Examples',
        '## Best Practices',
        '## Troubleshooting'
      ];

      const missingSections = requiredSections.filter(section => !content.includes(section));

      if (missingSections.length === 0) {
        this.addTestResult(testName, true, 'Documentation is complete');
      } else {
        this.addTestResult(testName, false, `Missing sections: ${missingSections.join(', ')}`);
      }
    } catch (error) {
      this.addTestResult(testName, false, `Error checking documentation: ${error.message}`);
    }
  }

  /**
   * Test plugin configuration
   */
  async testPluginConfiguration() {
    const testName = 'Plugin Configuration Setup';

    try {
      const configDir = path.join(__dirname, '../patterns/plugin-system/plugins/config');

      // Check if config directory exists
      await fs.access(configDir);

      // Check if analytics config exists
      const analyticsConfigPath = path.join(configDir, 'analytics-plugin.json');
      await fs.access(analyticsConfigPath);

      // Validate config content
      const configContent = await fs.readFile(analyticsConfigPath, 'utf8');
      const config = JSON.parse(configContent);

      const requiredConfigFields = ['enabled', 'endpoint', 'batchSize', 'flushInterval'];
      const missingFields = requiredConfigFields.filter(field => !(field in config));

      if (missingFields.length === 0) {
        this.addTestResult(testName, true, 'Plugin configuration is properly set up');
      } else {
        this.addTestResult(testName, false, `Missing config fields: ${missingFields.join(', ')}`);
      }
    } catch (error) {
      this.addTestResult(testName, false, `Error checking configuration: ${error.message}`);
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, message) {
    this.results.tests.push({
      name: testName,
      passed,
      message
    });

    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Plugin System Validation Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.tests.length}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All plugin system tests passed!');
    } else {
      console.log('\n⚠️  Some plugin system tests failed. Please review the issues above.');
    }
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new PluginSystemValidator();
  validator.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PluginSystemValidator;

#!/usr/bin/env node

/**
 * Performance Benchmarking for Forge Patterns
 * Tests integration speed, CLI performance, and resource usage
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

// Constants
const PERFORMANCE_THRESHOLD = 5000;
const SLOW_OPERATION_THRESHOLD = 1000;
const MEMORY_MB_DIVISOR = 1024 * 1024;

class PerformanceBenchmark {
  constructor() {
    this.results = {
      benchmarks: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0
      }
    };
    this.testDir = '/tmp/forge-benchmark-test';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
     
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  async measurePerformance(testName, testFn) {
    this.log(`Benchmarking: ${testName}`);

    const start = performance.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await testFn();
      const end = performance.now();
      const endMemory = process.memoryUsage();

      const duration = end - start;
      const memoryDelta = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal
      };

      this.results.benchmarks.push({
        name: testName,
        duration,
        memoryDelta,
        result,
        status: 'passed'
      });

      this.results.summary.totalTests++;
      this.results.summary.passed++;

      this.log(`✅ ${testName}: ${duration.toFixed(2)}ms, Memory: ${(memoryDelta.heapUsed / MEMORY_MB_DIVISOR).toFixed(2)}MB`, 'success');

      return { duration, memoryDelta, result };
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      this.results.benchmarks.push({
        name: testName,
        duration,
        error: error.message,
        status: 'failed'
      });

      this.results.summary.totalTests++;
      this.results.summary.failed++;

      this.log(`❌ ${testName}: Failed after ${duration.toFixed(2)}ms - ${error.message}`, 'error');
      throw error;
    }
  }

  async benchmarkIntegrationSpeed() {
    return this.measurePerformance('Integration Speed', async () => {
      const projectDir = path.join(this.testDir, 'speed-test');
      await fs.ensureDir(projectDir);

      // Create package.json
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name: 'speed-test',
          version: '1.0.0',
          devDependencies: {}
        }, null, 2)
      );

      const start = performance.now();

      // Run integration
      return new Promise((resolve, reject) => {
        const child = spawn('node', [
          path.join(__dirname, '../scripts/integrate.js'),
          'integrate',
          '--project=mcp-gateway'
        ], {
          cwd: projectDir,
          stdio: 'pipe'
        });

        child.on('close', (code) => {
          const duration = performance.now() - start;
          if (code === 0) {
            resolve({ duration, code });
          } else {
            reject(new Error(`Integration failed with code ${code}`));
          }
        });

        child.on('error', reject);
      });
    });
  }

  async benchmarkCLIResponse() {
    return this.measurePerformance('CLI Response Time', async () => {
      const cliPath = path.join(__dirname, '../scripts/forge-features');

      // Test help command
      return new Promise((resolve, reject) => {
        const child = spawn(cliPath, ['help'], {
          stdio: 'pipe'
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0 && output.includes('Forge Features CLI')) {
            resolve({ output, code });
          } else {
            reject(new Error('CLI help failed'));
          }
        });

        child.on('error', reject);
      });
    });
  }

  async benchmarkLibraryLoad() {
    return this.measurePerformance('Library Load Time', async () => {
      const libPath = path.join(__dirname, '../patterns/feature-toggles/libraries/nodejs/index.js');

      // Check if library file exists and has content
      if (!await fs.pathExists(libPath)) {
        throw new Error('Library file not found');
      }

      const content = await fs.readFile(libPath, 'utf8');

      // Measure file read time
      const start = performance.now();

      // Parse library structure without requiring dependencies
      const hasUnleashImport = content.includes('require(\'unleash-client-node\')');
      const hasClassDefinition = content.includes('class UIForgeFeatureToggles');
      const hasRequiredMethods = content.includes('isEnabled') && content.includes('getVariant');

      const loadTime = performance.now() - start;

      // Verify library structure
      if (!hasClassDefinition || !hasRequiredMethods) {
        throw new Error('Library structure invalid');
      }

      return {
        loadTime,
        hasUnleashImport,
        hasClassDefinition,
        hasRequiredMethods,
        contentLength: content.length
      };
    });
  }

  async benchmarkPatternCount() {
    return this.measurePerformance('Pattern Count Analysis', async () => {
      const patternsDir = path.join(__dirname, '../patterns');

      let totalFiles = 0;
      let totalSize = 0;

      async function countFiles(dir) {
        const items = await fs.readdir(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory()) {
            await countFiles(itemPath);
          } else {
            totalFiles++;
            totalSize += stats.size;
          }
        }
      }

      await countFiles(patternsDir);

      return { totalFiles, totalSize };
    });
  }

  async benchmarkConfigParsing() {
    return this.measurePerformance('Configuration Parsing', async () => {
      const configPath = path.join(__dirname, '../patterns/feature-toggles/config/centralized-config.yml');

      // Read and parse configuration
      const content = await fs.readFile(configPath, 'utf8');

      // Simple YAML parsing for benchmark
      const lines = content.split('\n');
      const sections = [];
      let currentSection = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          if (trimmed.endsWith(':')) {
            currentSection = trimmed.slice(0, -1);
            sections.push({ name: currentSection, items: [] });
          } else if (currentSection && trimmed.startsWith('- ')) {
            sections[sections.length - 1].items.push(trimmed.slice(2));
          }
        }
      }

      return { sections, lineCount: lines.length };
    });
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      benchmarks: this.results.benchmarks,
      recommendations: []
    };

    // Add recommendations based on results
    const avgDuration = this.results.benchmarks
      .filter(b => b.status === 'passed')
      .reduce((sum, b) => sum + b.duration, 0) / this.results.summary.passed;

    if (avgDuration > PERFORMANCE_THRESHOLD) {
      report.recommendations.push('Consider optimizing integration scripts for better performance');
    }

    const slowBenchmarks = this.results.benchmarks
      .filter(b => b.status === 'passed' && b.duration > SLOW_OPERATION_THRESHOLD);

    if (slowBenchmarks.length > 0) {
      report.recommendations.push(`Slow operations detected: ${slowBenchmarks.map(b => b.name).join(', ')}`);
    }

    // Write report
    const reportPath = path.join(__dirname, '../performance-report.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });

    this.log(`Performance report saved to: ${reportPath}`);

    return report;
  }

  async runAllBenchmarks() {
    this.log('🚀 Starting Performance Benchmarking');
    this.log('='.repeat(60));

    try {
      await this.benchmarkIntegrationSpeed();
      await this.benchmarkCLIResponse();
      await this.benchmarkLibraryLoad();
      await this.benchmarkPatternCount();
      await this.benchmarkConfigParsing();

      const report = await this.generateReport();

      this.log('='.repeat(60));
      this.log('📊 Benchmark Summary:');
      this.log(`  Total Tests: ${report.summary.totalTests}`);
      this.log(`  Passed: ${report.summary.passed}`);
      this.log(`  Failed: ${report.summary.failed}`);
      this.log(`  Success Rate: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);

      if (report.recommendations.length > 0) {
        this.log('📋 Recommendations:');
        report.recommendations.forEach(rec => {
          this.log(`  - ${rec}`);
        });
      }

      // Show detailed results
      this.log('\n📈 Detailed Results:');
      report.benchmarks.forEach(benchmark => {
        if (benchmark.status === 'passed') {
          this.log(`  ✅ ${benchmark.name}: ${benchmark.duration.toFixed(2)}ms`);
          if (benchmark.memoryDelta) {
            this.log(`     Memory: ${(benchmark.memoryDelta.heapUsed / MEMORY_MB_DIVISOR).toFixed(2)}MB`);
          }
        } else {
          this.log(`  ❌ ${benchmark.name}: Failed`);
        }
      });

      if (this.results.summary.failed > 0) {
        this.log('❌ Some benchmarks failed - see details above', 'error');
        process.exit(1);
      } else {
        this.log('✅ All benchmarks completed successfully!', 'success');
      }
    } catch (error) {
      this.log(`❌ Benchmarking failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run benchmarks if called directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runAllBenchmarks().catch(error => {
     
    console.error('Benchmarking failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceBenchmark;

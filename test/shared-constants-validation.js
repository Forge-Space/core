#!/usr/bin/env node

/**
 * Shared Constants Validation Test
 * Validates all exports from patterns/shared-constants/
 */

'use strict';

const path = require('path');
const fs = require('fs');

class SharedConstantsValidator {
  constructor() {
    this.results = { passed: 0, failed: 0, tests: [] };
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async test(testName, testFn) {
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'passed' });
      this.log(`${testName}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'failed', error: error.message });
      this.log(`${testName} — ${error.message}`, 'error');
    }
  }

  async validateFiles() {
    const base = path.join(__dirname, '../patterns/shared-constants');
    const required = [
      'index.ts', 'network.ts', 'mcp-protocol.ts', 'environments.ts',
      'ai-providers.ts', 'feature-flags.ts', 'storage.ts', 'README.md'
    ];
    for (const file of required) {
      await this.test(`File exists: ${file}`, async () => {
        this.assert(fs.existsSync(path.join(base, file)), `Missing file: ${file}`);
      });
    }
  }

  async validateNetworkConstants() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/network.ts'), 'utf8'
    );
    await this.test('network.ts: DEFAULT_TIMEOUT_MS = 120_000', async () => {
      this.assert(content.includes('DEFAULT_TIMEOUT_MS') && content.includes('120_000'), 'Wrong value');
    });
    await this.test('network.ts: MAX_RETRIES = 3', async () => {
      this.assert(content.includes('MAX_RETRIES') && content.includes('= 3'), 'Wrong value');
    });
    await this.test('network.ts: RETRY_DELAY_MS = 2_000', async () => {
      this.assert(content.includes('RETRY_DELAY_MS') && content.includes('2_000'), 'Wrong value');
    });
    await this.test('network.ts: GATEWAY_DEFAULT_URL', async () => {
      this.assert(content.includes('GATEWAY_DEFAULT_URL') && content.includes('http://gateway:4444'), 'Wrong URL');
    });
    await this.test('network.ts: AI_ROUTER_DEFAULT_WEIGHT = 0.7', async () => {
      this.assert(content.includes('AI_ROUTER_DEFAULT_WEIGHT') && content.includes('0.7'), 'Wrong value');
    });
    await this.test('network.ts: MAX_TOOLS_SEARCH = 10', async () => {
      this.assert(content.includes('MAX_TOOLS_SEARCH') && content.includes('= 10'), 'Wrong value');
    });
  }

  async validateMcpProtocolConstants() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/mcp-protocol.ts'), 'utf8'
    );
    await this.test('mcp-protocol.ts: JSONRPC_VERSION = "2.0"', async () => {
      this.assert(content.includes('JSONRPC_VERSION') && content.includes("'2.0'"), 'Wrong version');
    });
    await this.test('mcp-protocol.ts: MCP_SERVER_VERSION = "0.1.0"', async () => {
      this.assert(content.includes('MCP_SERVER_VERSION') && content.includes("'0.1.0'"), 'Wrong version');
    });
    await this.test('mcp-protocol.ts: all protocol methods present', async () => {
      for (const m of ['tools/list','tools/call','resources/list','resources/read','prompts/list','prompts/get']) {
        this.assert(content.includes(m), `Missing: ${m}`);
      }
    });
  }

  async validateEnvironmentsConstants() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/environments.ts'), 'utf8'
    );
    await this.test('environments.ts: NODE_ENVS has all three values', async () => {
      for (const v of ['NODE_ENVS','development','production','test']) this.assert(content.includes(v), `Missing: ${v}`);
    });
    await this.test('environments.ts: LOG_LEVELS has all four values', async () => {
      for (const v of ['LOG_LEVELS','debug','info','warn','error']) this.assert(content.includes(v), `Missing: ${v}`);
    });
    await this.test('environments.ts: DEFAULT_NODE_ENV = "production"', async () => {
      this.assert(content.includes('DEFAULT_NODE_ENV') && content.includes("'production'"), 'Wrong default');
    });
    await this.test('environments.ts: DEFAULT_LOG_LEVEL = "info"', async () => {
      this.assert(content.includes('DEFAULT_LOG_LEVEL') && content.includes("'info'"), 'Wrong default');
    });
    await this.test('environments.ts: guard functions exported', async () => {
      this.assert(content.includes('isValidNodeEnv') && content.includes('isValidLogLevel'), 'Missing guards');
    });
  }

  async validateAiProvidersConstants() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/ai-providers.ts'), 'utf8'
    );
    await this.test('ai-providers.ts: all three providers', async () => {
      for (const p of ["'openai'","'anthropic'","'google'"]) this.assert(content.includes(p), `Missing: ${p}`);
    });
    await this.test('ai-providers.ts: AI_PROVIDERS registry', async () => {
      this.assert(content.includes('AI_PROVIDERS'), 'Missing AI_PROVIDERS');
    });
    await this.test('ai-providers.ts: correct base URLs', async () => {
      this.assert(content.includes('https://api.openai.com/v1'), 'Wrong OpenAI URL');
      this.assert(content.includes('https://api.anthropic.com/v1'), 'Wrong Anthropic URL');
      this.assert(content.includes('https://generativelanguage.googleapis.com/v1beta'), 'Wrong Google URL');
    });
    await this.test('ai-providers.ts: API_KEY_EXPIRY_DAYS = 90', async () => {
      this.assert(content.includes('API_KEY_EXPIRY_DAYS') && content.includes('= 90'), 'Wrong value');
    });
    await this.test('ai-providers.ts: helper functions', async () => {
      this.assert(content.includes('isValidAIProvider') && content.includes('getAIProviderConfig'), 'Missing helpers');
    });
  }

  async validateFeatureFlagsPattern() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/feature-flags.ts'), 'utf8'
    );
    await this.test('feature-flags.ts: FeatureFlagCategory type', async () => {
      this.assert(content.includes('FeatureFlagCategory'), 'Missing type');
      for (const c of ['auth','ui','generation','storage','analytics','system']) {
        this.assert(content.includes(`'${c}'`), `Missing category: ${c}`);
      }
    });
    await this.test('feature-flags.ts: FeatureFlag interface', async () => {
      this.assert(content.includes('interface FeatureFlag'), 'Missing interface');
      for (const f of ['name:','enabled:','description:','category:']) this.assert(content.includes(f), `Missing: ${f}`);
    });
    await this.test('feature-flags.ts: createFeatureFlags factory', async () => {
      this.assert(content.includes('createFeatureFlags'), 'Missing factory');
    });
    await this.test('feature-flags.ts: resolveFeatureFlag helper', async () => {
      this.assert(content.includes('resolveFeatureFlag'), 'Missing helper');
    });
    await this.test('feature-flags.ts: no product-specific flag names', async () => {
      for (const f of ['ENABLE_GOOGLE_SSO','ENABLE_GITHUB_SSO','ENABLE_COMPONENT_GENERATION']) {
        this.assert(!content.includes(f), `Product flag found: ${f}`);
      }
    });
  }

  async validateStoragePattern() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/storage.ts'), 'utf8'
    );
    await this.test('storage.ts: DEFAULT_DB_VERSION = 1', async () => {
      this.assert(content.includes('DEFAULT_DB_VERSION') && content.includes('= 1'), 'Wrong value');
    });
    await this.test('storage.ts: IndexedDBStoreConfig interface', async () => {
      this.assert(content.includes('IndexedDBStoreConfig'), 'Missing interface');
    });
    await this.test('storage.ts: createStorageConfig factory', async () => {
      this.assert(content.includes('createStorageConfig'), 'Missing factory');
    });
    await this.test('storage.ts: COMMON_STORE_NAMES', async () => {
      this.assert(content.includes('COMMON_STORE_NAMES') && content.includes('api_keys') && content.includes('user_preferences'), 'Missing store names');
    });
  }

  async validateBarrelIndex() {
    const content = fs.readFileSync(
      path.join(__dirname, '../patterns/shared-constants/index.ts'), 'utf8'
    );
    await this.test('index.ts: re-exports all modules', async () => {
      for (const m of ['network','mcp-protocol','environments','ai-providers','feature-flags','storage']) {
        this.assert(content.includes(`./${m}`), `Missing re-export: ${m}`);
      }
    });
  }

  async validateNoSecrets() {
    const base = path.join(__dirname, '../patterns/shared-constants');
    const files = fs.readdirSync(base).filter(f => f.endsWith('.ts'));
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/,
      /AIza[0-9A-Za-z-_]{35}/,
      /Bearer\s+[a-zA-Z0-9._-]{20,}/,
      /password\s*=\s*['"'][^'"]+['"]/i
    ];
    for (const file of files) {
      await this.test(`BR-001 Zero-Secrets: ${file}`, async () => {
        const content = fs.readFileSync(path.join(base, file), 'utf8');
        for (const pattern of secretPatterns) {
          this.assert(!pattern.test(content), `Potential secret in ${file}`);
        }
      });
    }
  }

  async runAllTests() {
    this.log('Starting Shared Constants Validation');
    this.log('='.repeat(60));
    await this.validateFiles();
    await this.validateNetworkConstants();
    await this.validateMcpProtocolConstants();
    await this.validateEnvironmentsConstants();
    await this.validateAiProvidersConstants();
    await this.validateFeatureFlagsPattern();
    await this.validateStoragePattern();
    await this.validateBarrelIndex();
    await this.validateNoSecrets();
    this.log('='.repeat(60));
    this.log(`Test Results: ${this.results.passed} passed, ${this.results.failed} failed`);
    if (this.results.failed > 0) {
      this.log('Validation failed — see errors above', 'error');
      process.exit(1);
    } else {
      this.log('All shared-constants validation tests passed!', 'success');
    }
  }
}

if (require.main === module) {
  const validator = new SharedConstantsValidator();
  validator.runAllTests().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = SharedConstantsValidator;

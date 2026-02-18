# Shared Constants

Centralised constants, types, and factory helpers extracted from all Forge ecosystem projects.

**Version:** 1.0.0  
**Sources:** `mcp-gateway`, `uiforge-mcp`, `UIForge`

---

## Modules

| Module | Contents |
| --- | --- |
| `network.ts` | Timeouts, retry limits, gateway URL |
| `mcp-protocol.ts` | JSON-RPC version, MCP server version, protocol method names |
| `environments.ts` | `NodeEnv` / `LogLevel` types and defaults |
| `ai-providers.ts` | `AI_PROVIDERS` registry, `AIProvider` type, token/rate-limit caps |
| `feature-flags.ts` | `FeatureFlag` interface, `createFeatureFlags()` factory |
| `storage.ts` | `IndexedDBStoreConfig` interface, `createStorageConfig()` factory |

---

## Usage

```ts
import {
  DEFAULT_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  GATEWAY_DEFAULT_URL,
  JSONRPC_VERSION,
  NODE_ENVS,
  LOG_LEVELS,
  AI_PROVIDERS,
  createFeatureFlags,
  createStorageConfig,
} from '@uiforge/forge-patterns/shared-constants';
```

---

## Module Reference

### `network.ts`

```ts
DEFAULT_TIMEOUT_MS      = 120_000   // ms
MIN_TIMEOUT_MS          = 1_000
MAX_TIMEOUT_MS          = 600_000
MAX_RETRIES             = 3
RETRY_DELAY_MS          = 2_000
GATEWAY_DEFAULT_URL     = 'http://gateway:4444'
AI_ROUTER_DEFAULT_TIMEOUT_MS = 2_000
AI_ROUTER_DEFAULT_WEIGHT     = 0.7
MAX_TOOLS_SEARCH        = 10
DEFAULT_TOP_N           = 1
```

### `mcp-protocol.ts`

```ts
JSONRPC_VERSION         = '2.0'
MCP_SERVER_VERSION      = '0.1.0'
MCP_GATEWAY_CLIENT_NAME = 'forge-mcp-gateway-client'
MCP_UIFORGE_SERVER_NAME = 'uiforge'
MCP_PROTOCOL_METHODS    = { TOOLS_LIST, TOOLS_CALL, RESOURCES_LIST, ... }
```

### `environments.ts`

```ts
NODE_ENVS               = ['development', 'production', 'test']
type NodeEnv            = 'development' | 'production' | 'test'
DEFAULT_NODE_ENV        = 'production'
LOG_LEVELS              = ['debug', 'info', 'warn', 'error']
type LogLevel           = 'debug' | 'info' | 'warn' | 'error'
DEFAULT_LOG_LEVEL       = 'info'
isValidNodeEnv(value)   -> boolean
isValidLogLevel(value)  -> boolean
```

### `ai-providers.ts`

```ts
type AIProvider         = 'openai' | 'anthropic' | 'google'
AI_PROVIDERS            // Record<AIProvider, AIProviderConfig>
AI_PROVIDERS_LIST       = ['openai', 'anthropic', 'google']
DEFAULT_AI_PROVIDER     = 'openai'
DEFAULT_MAX_TOKENS      = 2_000
DEFAULT_TEMPERATURE     = 0.7
API_KEY_EXPIRY_DAYS     = 90
isValidAIProvider(v)    -> boolean
getAIProviderConfig(p)  -> AIProviderConfig
```

**Provider details:**

| Provider | Base URL | Max Tokens | Rate Limit/min |
| --- | --- | --- | --- |
| `openai` | `https://api.openai.com/v1` | 128,000 | 3,500 |
| `anthropic` | `https://api.anthropic.com/v1` | 200,000 | 1,000 |
| `google` | `https://generativelanguage.googleapis.com/v1beta` | 2,097,152 | 60 |

### `feature-flags.ts`

```ts
type FeatureFlagCategory = 'auth' | 'ui' | 'generation' | 'storage' | 'analytics' | 'system'

interface FeatureFlag<T extends string> {
  name: T; enabled: boolean; description: string; category: FeatureFlagCategory;
}

createFeatureFlags(definitions, overrides?)  -> Record<T, boolean>
resolveFeatureFlag(name, default, envPrefix?) -> boolean
resolveAllFeatureFlags(definitions, envPrefix?) -> Record<T, boolean>
```

**Example:**

```ts
type MyFlags = 'ENABLE_DARK_MODE' | 'ENABLE_BETA';

const flags = createFeatureFlags<MyFlags>([
  { name: 'ENABLE_DARK_MODE', enabled: true, description: 'Toggle dark mode', category: 'ui' },
  { name: 'ENABLE_BETA', enabled: false, description: 'Beta features', category: 'system' },
]);
// flags.ENABLE_DARK_MODE === true
// flags.ENABLE_BETA === false
```

### `storage.ts`

```ts
DEFAULT_DB_VERSION = 1

interface IndexedDBStoreConfig { dbName, version, stores }

createStorageConfig(dbName, stores, version?) -> IndexedDBStoreConfig

COMMON_STORE_NAMES = { API_KEYS, USER_PREFERENCES, SESSIONS, CACHE }
```

---

## Python Consumers (mcp-gateway)

The Python `tool_router` reads these values from environment variables. The canonical defaults are:

| Env Var | Default | TS Constant |
| --- | --- | --- |
| `GATEWAY_URL` | `http://gateway:4444` | `GATEWAY_DEFAULT_URL` |
| `GATEWAY_TIMEOUT_MS` | `120000` | `DEFAULT_TIMEOUT_MS` |
| `GATEWAY_MAX_RETRIES` | `3` | `MAX_RETRIES` |
| `GATEWAY_RETRY_DELAY_MS` | `2000` | `RETRY_DELAY_MS` |
| `ROUTER_AI_TIMEOUT_MS` | `2000` | `AI_ROUTER_DEFAULT_TIMEOUT_MS` |
| `ROUTER_AI_WEIGHT` | `0.7` | `AI_ROUTER_DEFAULT_WEIGHT` |
| `MAX_TOOLS_SEARCH` | `10` | `MAX_TOOLS_SEARCH` |
| `DEFAULT_TOP_N` | `1` | `DEFAULT_TOP_N` |

---

## Business Rules

- **BR-001** Zero-Secrets: no secrets or credentials in this module.
- **BR-002** Pattern Versioning: follows semantic versioning.
- **BR-004** Documentation Coverage: all exports documented above.

# ADR-005: Integration Patterns and API Contracts

## Status
Accepted

## Context
With the hub-and-spoke architecture established (ADR-001), we needed to define the integration patterns and API contracts between the three main components: webapp, gateway, and MCP servers. The key challenges were:

- Standardizing communication protocols between components
- Defining clear API contracts and versioning strategies
- Handling authentication and authorization across service boundaries
- Managing error handling and retry logic
- Supporting real-time communication and streaming responses
- Ensuring backward compatibility during evolution

## Decision
We established **standardized integration patterns** with the following key decisions:

- **RESTful API Contracts**: HTTP/JSON APIs with OpenAPI documentation
- **MCP Protocol Compliance**: Standard MCP protocol for server communication
- **JWT Token Propagation**: Consistent authentication across all services
- **Circuit Breaker Pattern**: Fault tolerance and automatic recovery
- **Event-Driven Communication**: Async messaging for real-time updates
- **Semantic Versioning**: Clear API versioning and compatibility guarantees

## Consequences

### Positive Consequences
- **Interoperability**: Standardized protocols enable easy integration
- **Reliability**: Circuit breakers prevent cascading failures
- **Maintainability**: Clear contracts reduce integration complexity
- **Scalability**: Async patterns support high-throughput scenarios
- **Developer Experience**: Well-documented APIs accelerate development
- **Future-Proofing**: Versioning strategy supports evolution

### Negative Consequences
- **Overhead**: Additional layers add latency and complexity
- **Documentation Burden**: Requires continuous API documentation maintenance
- **Version Management**: Multiple API versions increase maintenance overhead
- **Testing Complexity**: Integration testing across multiple service boundaries

## Alternatives Considered

### Alternative 1: Direct Database Sharing
- Services share database access directly
- **Rejected**: Tight coupling, security concerns, scaling issues

### Alternative 2: gRPC Communication
- Use gRPC for internal service communication
- **Rejected**: Added complexity without clear benefits for current scale

### Alternative 3: Message Queue Only
- All communication through message queues
- **Rejected**: Too complex for synchronous operations, added latency

## Rationale
The standardized integration patterns were chosen because they provide:

- **Industry Standards**: REST and MCP are widely adopted and understood
- **Tooling Support**: Rich ecosystem of tools for development and testing
- **Flexibility**: Supports both synchronous and asynchronous communication
- **Observability**: Built-in support for monitoring and debugging
- **Evolution**: Versioning strategy allows for gradual upgrades
- **Reliability**: Proven patterns for fault tolerance and recovery

This approach balances simplicity with robustness while providing a solid foundation for ecosystem growth.

## Implementation

### API Contract Definition
```typescript
// contracts/api-contracts.ts

// Authentication Contract
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

// Component Generation Contract
export interface GenerateComponentRequest {
  description: string;
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  style: 'modern' | 'classic' | 'minimal' | 'material';
  options?: GenerationOptions;
}

export interface GenerationOptions {
  include_typescript?: boolean;
  include_tests?: boolean;
  include_storybook?: boolean;
  custom_dependencies?: string[];
}

export interface GeneratedComponent {
  id: string;
  name: string;
  code: string;
  framework: string;
  dependencies: string[];
  preview?: string;
  metadata: ComponentMetadata;
}

// Template Management Contract
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  template_code: string;
  variables: TemplateVariable[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  default_value?: any;
  required: boolean;
}

// Server Status Contract
export interface ServerStatus {
  servers: ServerInfo[];
  system_health: 'healthy' | 'degraded' | 'unhealthy';
  metrics: SystemMetrics;
  last_updated: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  health_check_url: string;
  metrics: ServerMetrics;
  last_heartbeat: string;
}
```

### Gateway API Implementation
```typescript
// gateway/api/routes.ts
import { Router } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimit } from '../middleware/rate-limit';

const router = Router();

// Authentication Routes
router.post('/api/auth/login', 
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 minutes
  validateRequest(AuthRequestSchema),
  async (req, res) => {
    try {
      const result = await authService.authenticate(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
);

// Component Generation Routes
router.post('/api/generate/component',
  authenticateToken,
  requirePermission('component', 'generate'),
  validateRequest(GenerateComponentSchema),
  async (req, res) => {
    try {
      const user = req.user;
      const request = req.body;
      
      // Route to appropriate MCP server
      const server = await routingService.routeRequest('generate_component', user);
      const result = await server.callTool('generate_ui_component', {
        ...request,
        user_context: { user_id: user.id, permissions: user.permissions }
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Generation failed' });
    }
  }
);

// Template Management Routes
router.get('/api/templates',
  authenticateToken,
  requirePermission('template', 'read'),
  async (req, res) => {
    try {
      const filters = req.query as TemplateFilters;
      const server = await routingService.routeRequest('list_templates', req.user);
      const result = await server.callTool('list_templates', { filters });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }
);

// Server Status Routes
router.get('/api/servers/status',
  authenticateToken,
  requirePermission('system', 'read'),
  async (req, res) => {
    try {
      const status = await serverManager.getAllServerStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch server status' });
    }
  }
);
```

### MCP Server Integration
```typescript
// gateway/services/mcp-client.ts
class MCPClient {
  private connection: MCPConnection;
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;

  constructor(serverInfo: ServerInfo) {
    this.connection = new MCPConnection(serverInfo);
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringEnabled: true,
    });
    this.retryPolicy = new RetryPolicy({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    });
  }

  async callTool(toolName: string, arguments: any): Promise<any> {
    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        // Validate connection
        if (!this.connection.isConnected()) {
          await this.connection.connect();
        }

        // Call tool with timeout
        const result = await Promise.race([
          this.connection.callTool(toolName, arguments),
          this.timeout(30000) // 30 second timeout
        ]);

        return result;
      });
    });
  }

  async listTools(): Promise<Tool[]> {
    return this.circuitBreaker.execute(async () => {
      return this.connection.listTools();
    });
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms);
    });
  }
}
```

### WebApp API Client
```typescript
// webapp/lib/api/api-client.ts
class APIClient {
  private baseURL: string;
  private authToken?: string;
  private interceptors: Map<string, Function[]> = new Map();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.addInterceptor('request', async (config: RequestConfig) => {
      if (this.authToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.authToken}`,
        };
      }
      return config;
    });

    // Response interceptor for error handling
    this.addInterceptor('response', async (response: Response) => {
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }
      return response;
    });
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const config: RequestConfig = {
      url: `${this.baseURL}${endpoint}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.interceptors.get('request') || []) {
      processedConfig = await interceptor(processedConfig);
    }

    try {
      const response = await fetch(processedConfig.url, {
        method: processedConfig.method,
        headers: processedConfig.headers,
        body: processedConfig.body,
      });

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.interceptors.get('response') || []) {
        processedResponse = await interceptor(processedResponse);
      }

      const data = await processedResponse.json();
      return {
        data,
        status: processedResponse.status,
        headers: processedResponse.headers,
      };
    } catch (error) {
      throw new APIError('Request failed', error);
    }
  }

  // Typed API methods
  async generateComponent(request: GenerateComponentRequest): Promise<GeneratedComponent> {
    const response = await this.request<GeneratedComponent>('/api/generate/component', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data;
  }

  async getTemplates(filters?: TemplateFilters): Promise<Template[]> {
    const params = new URLSearchParams(filters as any).toString();
    const response = await this.request<Template[]>(`/api/templates?${params}`);
    return response.data;
  }

  async getServerStatus(): Promise<ServerStatus> {
    const response = await this.request<ServerStatus>('/api/servers/status');
    return response.data;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = undefined;
  }

  private addInterceptor(type: 'request' | 'response', interceptor: Function) {
    if (!this.interceptors.has(type)) {
      this.interceptors.set(type, []);
    }
    this.interceptors.get(type)!.push(interceptor);
  }

  private async handleErrorResponse(response: Response) {
    if (response.status === 401) {
      // Handle authentication error
      this.clearAuthToken();
      throw new AuthenticationError('Authentication required');
    } else if (response.status === 403) {
      throw new AuthorizationError('Insufficient permissions');
    } else if (response.status >= 500) {
      throw new ServerError('Server error occurred');
    }
  }
}
```

### Event-Driven Communication
```typescript
// shared/events/event-bus.ts
interface EventBus {
  publish(event: DomainEvent): void;
  subscribe(eventType: string, handler: EventHandler): Unsubscribe;
}

class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.type) || [];
    
    // Execute handlers asynchronously
    handlers.forEach(handler => {
      setTimeout(() => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error handling event ${event.type}:`, error);
        }
      }, 0);
    });
  }

  subscribe(eventType: string, handler: EventHandler): Unsubscribe {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }
}

// Domain Events
export interface ComponentGeneratedEvent extends DomainEvent {
  type: 'component.generated';
  data: {
    component_id: string;
    user_id: string;
    framework: string;
    generation_time: number;
  };
}

export interface ServerStatusChangedEvent extends DomainEvent {
  type: 'server.status_changed';
  data: {
    server_id: string;
    old_status: string;
    new_status: string;
    timestamp: string;
  };
}
```

### API Versioning Strategy
```typescript
// gateway/api/versioning.ts
class APIVersionManager {
  private versions: Map<string, APIVersion> = new Map();
  private defaultVersion = 'v1';

  constructor() {
    this.registerVersions();
  }

  private registerVersions() {
    // v1 API
    this.versions.set('v1', {
      version: 'v1',
      basePath: '/api/v1',
      deprecated: false,
      sunsetDate: null,
      migrations: new Map(),
    });

    // v2 API (future)
    this.versions.set('v2', {
      version: 'v2',
      basePath: '/api/v2',
      deprecated: false,
      sunsetDate: null,
      migrations: new Map([
        ['generate_component', this.migrateGenerateComponentV1ToV2],
      ]),
    });
  }

  getVersion(request: Request): APIVersion {
    const version = request.headers['api-version'] || 
                   request.query.version || 
                   this.extractVersionFromPath(request.path) ||
                   this.defaultVersion;

    return this.versions.get(version) || this.versions.get(this.defaultVersion)!;
  }

  migrateRequest(request: Request, fromVersion: string, toVersion: string): Request {
    const version = this.versions.get(toVersion);
    if (!version) return request;

    const migrations = version.migrations;
    let migratedRequest = request;

    for (const [endpoint, migration] of migrations) {
      if (request.path.includes(endpoint)) {
        migratedRequest = migration(migratedRequest);
      }
    }

    return migratedRequest;
  }

  private migrateGenerateComponentV1ToV2(request: Request): Request {
    // Example migration: add new required field
    const body = JSON.parse(request.body);
    body.options = body.options || {};
    body.options.include_typescript = body.options.include_typescript ?? true;
    
    return {
      ...request,
      body: JSON.stringify(body),
    };
  }
}
```

### Error Handling and Retry Logic
```typescript
// shared/resilience/circuit-breaker.ts
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new CircuitBreakerError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// shared/resilience/retry-policy.ts
class RetryPolicy {
  constructor(private options: RetryPolicyOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.options.maxRetries) {
          break;
        }

        if (!this.shouldRetry(error as Error, attempt)) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    // Don't retry on authentication errors
    if (error instanceof AuthenticationError) {
      return false;
    }

    // Don't retry on client errors (4xx)
    if (error instanceof APIError && error.status >= 400 && error.status < 500) {
      return false;
    }

    return true;
  }

  private calculateDelay(attempt: number): number {
    const delay = this.options.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, this.options.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Related Decisions
- [ADR-001: Hub-and-Spoke Ecosystem Architecture](./ADR-001-ecosystem-design.md)
- [ADR-002: Gateway as Central Authentication Authority](./ADR-002-gateway-central-hub.md)
- [ADR-003: MCP Server Design for UI Generation](./ADR-003-mcp-server-design.md)
- [ADR-004: WebApp Architecture for Management Interface](./ADR-004-webapp-architecture.md)

## Notes
- Implement comprehensive API documentation with OpenAPI/Swagger
- Use API versioning to support backward compatibility
- Monitor circuit breaker states and retry patterns
- Consider implementing distributed tracing for better observability
- Plan for API deprecation and migration strategies

---

*Decision made on 2025-02-17 by the UIForge architecture team.*
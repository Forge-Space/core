# MCP Gateway Routing Patterns

## 🎯 Overview

Routing patterns for the Forge MCP Gateway, providing intelligent request routing, load balancing, service discovery, and API gateway functionality for the complete MCP ecosystem.

## 📋 Available Patterns

### Request Routing
- **Path-Based Routing**: Route requests based on URL paths
- **Header-Based Routing**: Route requests based on HTTP headers
- **Query Parameter Routing**: Route requests based on query parameters
- **Method-Based Routing**: Route requests based on HTTP methods
- **Content-Based Routing**: Route requests based on request content

### Load Balancing
- **Round Robin**: Distribute requests evenly across servers
- **Weighted Round Robin**: Distribute based on server capacity
- **Least Connections**: Route to server with fewest active connections
- **Response Time Based**: Route to fastest responding server
- **Health-Based Routing**: Route only to healthy servers

### Service Discovery
- **Static Configuration**: Pre-configured service endpoints
- **Dynamic Discovery**: Automatic service registration and discovery
- **Health Checking**: Continuous service health monitoring
- **Service Registry**: Central service endpoint management
- **Failover Handling**: Automatic failover to backup services

### API Gateway Patterns
- **Request Transformation**: Modify requests before forwarding
- **Response Transformation**: Modify responses before returning
- **Protocol Translation**: Convert between different protocols
- **Version Routing**: Route requests based on API version
- **Tenant-Based Routing**: Route requests based on tenant ID

## 🔧 Implementation Examples

### Core Router Implementation
```typescript
// patterns/mcp-gateway/routing/core-router.ts
import { EventEmitter } from 'events';

export interface Route {
  id: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  target: ServiceTarget;
  priority: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface ServiceTarget {
  serviceId: string;
  endpoint: string;
  weight: number;
  healthy: boolean;
  lastHealthCheck: Date;
  responseTime: number;
  activeConnections: number;
}

export interface RoutingConfig {
  routes: Route[];
  loadBalancer: LoadBalancerType;
  healthCheck: HealthCheckConfig;
  retryPolicy: RetryPolicy;
  timeoutPolicy: TimeoutPolicy;
}

export enum LoadBalancerType {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  RESPONSE_TIME_BASED = 'response_time_based',
  HEALTH_BASED = 'health_based'
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  path: string;
  expectedStatus: number;
  retries: number;
}

export interface RetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffMs: number;
  retryableStatusCodes: number[];
}

export interface TimeoutPolicy {
  connect: number; // milliseconds
  request: number; // milliseconds
  response: number; // milliseconds
}

export class CoreRouter extends EventEmitter {
  private routes = new Map<string, Route>();
  private services = new Map<string, ServiceTarget[]>();
  private loadBalancers = new Map<LoadBalancerType, LoadBalancer>();
  private healthChecker: HealthChecker;
  private config: RoutingConfig;

  constructor(config: RoutingConfig) {
    super();
    this.config = config;
    this.healthChecker = new HealthChecker(config.healthCheck);
    this.initializeLoadBalancers();
    this.loadRoutes(config.routes);
    this.startHealthChecking();
  }

  async routeRequest(request: RoutingRequest): Promise<RoutingResult> {
    const startTime = Date.now();
    
    try {
      // Find matching routes
      const matchingRoutes = this.findMatchingRoutes(request);
      
      if (matchingRoutes.length === 0) {
        throw new Error('No matching route found');
      }

      // Select best route based on priority
      const route = this.selectBestRoute(matchingRoutes);
      
      // Select target service using load balancer
      const target = this.selectTarget(route);
      
      if (!target) {
        throw new Error('No healthy targets available');
      }

      // Execute request with retry policy
      const response = await this.executeRequest(request, target, route);
      
      // Update metrics
      this.updateMetrics(route, target, Date.now() - startTime, true);
      
      this.emit('requestRouted', { request, route, target, response });
      
      return {
        success: true,
        route,
        target,
        response,
        duration: Date.now() - startTime
      };

    } catch (error) {
      this.emit('routingError', { request, error });
      
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  private findMatchingRoutes(request: RoutingRequest): Route[] {
    const matchingRoutes: Route[] = [];

    for (const route of this.routes.values()) {
      if (!route.enabled) continue;

      // Check path match
      if (!this.pathMatches(route.path, request.path)) continue;

      // Check method match
      if (route.method && route.method !== request.method) continue;

      // Check header match
      if (route.headers && !this.headersMatch(route.headers, request.headers)) continue;

      // Check query parameter match
      if (route.query && !this.queryMatches(route.query, request.query)) continue;

      matchingRoutes.push(route);
    }

    return matchingRoutes.sort((a, b) => b.priority - a.priority);
  }

  private selectBestRoute(routes: Route[]): Route {
    return routes[0]; // Already sorted by priority
  }

  private selectTarget(route: Route): ServiceTarget | null {
    const targets = this.services.get(route.target.serviceId);
    if (!targets || targets.length === 0) return null;

    const loadBalancer = this.loadBalancers.get(this.config.loadBalancer);
    if (!loadBalancer) return null;

    return loadBalancer.selectTarget(targets);
  }

  private async executeRequest(
    request: RoutingRequest, 
    target: ServiceTarget, 
    route: Route
  ): Promise<any> {
    const maxRetries = this.config.retryPolicy.enabled ? this.config.retryPolicy.maxRetries : 0;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Increment connection count
        target.activeConnections++;

        // Execute request with timeout
        const response = await this.executeWithTimeout(request, target);
        
        // Decrement connection count
        target.activeConnections--;

        // Update response time
        target.responseTime = Date.now() - request.timestamp;

        return response;

      } catch (error) {
        // Decrement connection count
        target.activeConnections--;

        lastError = error;

        // Check if error is retryable
        if (attempt < maxRetries && this.isRetryableError(error)) {
          // Wait before retry
          await this.delay(this.config.retryPolicy.backoffMs * (attempt + 1));
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  private async executeWithTimeout(request: RoutingRequest, target: ServiceTarget): Promise<any> {
    const timeout = this.config.timeoutPolicy.request;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);

      // Execute actual request (simplified)
      this.makeHttpRequest(request, target)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private async makeHttpRequest(request: RoutingRequest, target: ServiceTarget): Promise<any> {
    // Implementation for making HTTP request
    // This would use fetch, axios, or similar
    const url = `${target.endpoint}${request.path}`;
    
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private pathMatches(routePath: string, requestPath: string): boolean {
    // Simple path matching (can be enhanced with regex)
    if (routePath === requestPath) return true;
    
    // Handle wildcard paths
    if (routePath.endsWith('*')) {
      const prefix = routePath.slice(0, -1);
      return requestPath.startsWith(prefix);
    }
    
    // Handle parameterized paths
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    
    if (routeParts.length !== requestParts.length) return false;
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue; // Parameter
      if (routeParts[i] !== requestParts[i]) return false;
    }
    
    return true;
  }

  private headersMatch(routeHeaders: Record<string, string>, requestHeaders: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(routeHeaders)) {
      if (requestHeaders[key] !== value) return false;
    }
    return true;
  }

  private queryMatches(routeQuery: Record<string, string>, requestQuery: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(routeQuery)) {
      if (requestQuery[key] !== value) return false;
    }
    return true;
  }

  private isRetryableError(error: Error): boolean {
    // Check if error is retryable based on status code or error type
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('connection')) return true;
    if (error.message.includes('HTTP 5')) return true; // 5xx errors
    
    return this.config.retryPolicy.retryableStatusCodes.some(code => 
      error.message.includes(`HTTP ${code}`)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateMetrics(route: Route, target: ServiceTarget, duration: number, success: boolean): void {
    // Update routing metrics
    this.emit('metricsUpdated', {
      routeId: route.id,
      serviceId: target.serviceId,
      duration,
      success,
      timestamp: new Date()
    });
  }

  private initializeLoadBalancers(): void {
    this.loadBalancers.set(LoadBalancerType.ROUND_ROBIN, new RoundRobinLoadBalancer());
    this.loadBalancers.set(LoadBalancerType.WEIGHTED_ROUND_ROBIN, new WeightedRoundRobinLoadBalancer());
    this.loadBalancers.set(LoadBalancerType.LEAST_CONNECTIONS, new LeastConnectionsLoadBalancer());
    this.loadBalancers.set(LoadBalancerType.RESPONSE_TIME_BASED, new ResponseTimeBasedLoadBalancer());
    this.loadBalancers.set(LoadBalancerType.HEALTH_BASED, new HealthBasedLoadBalancer());
  }

  private loadRoutes(routes: Route[]): void {
    for (const route of routes) {
      this.routes.set(route.id, route);
    }
  }

  private startHealthChecking(): void {
    if (this.config.healthCheck.enabled) {
      this.healthChecker.on('healthUpdate', (serviceId: string, healthy: boolean) => {
        this.updateServiceHealth(serviceId, healthy);
      });
      
      this.healthChecker.start();
    }
  }

  private updateServiceHealth(serviceId: string, healthy: boolean): void {
    const targets = this.services.get(serviceId);
    if (targets) {
      targets.forEach(target => {
        target.healthy = healthy;
        target.lastHealthCheck = new Date();
      });
    }
  }

  // Public API methods
  addRoute(route: Route): void {
    this.routes.set(route.id, route);
    this.emit('routeAdded', route);
  }

  removeRoute(routeId: string): boolean {
    const removed = this.routes.delete(routeId);
    if (removed) {
      this.emit('routeRemoved', routeId);
    }
    return removed;
  }

  addServiceTarget(serviceId: string, target: ServiceTarget): void {
    if (!this.services.has(serviceId)) {
      this.services.set(serviceId, []);
    }
    this.services.get(serviceId)!.push(target);
    this.emit('targetAdded', { serviceId, target });
  }

  removeServiceTarget(serviceId: string, endpoint: string): boolean {
    const targets = this.services.get(serviceId);
    if (!targets) return false;

    const index = targets.findIndex(t => t.endpoint === endpoint);
    if (index === -1) return false;

    targets.splice(index, 1);
    this.emit('targetRemoved', { serviceId, endpoint });
    return true;
  }

  getRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  getServiceTargets(serviceId: string): ServiceTarget[] {
    return this.services.get(serviceId) || [];
  }

  getMetrics(): RoutingMetrics {
    return {
      totalRoutes: this.routes.size,
      totalServices: this.services.size,
      totalTargets: Array.from(this.services.values()).reduce((sum, targets) => sum + targets.length, 0),
      healthyTargets: Array.from(this.services.values()).reduce((sum, targets) => 
        sum + targets.filter(t => t.healthy).length, 0)
    };
  }
}
```

### Load Balancer Implementations
```typescript
// patterns/mcp-gateway/routing/load-balancers.ts
export interface LoadBalancer {
  selectTarget(targets: ServiceTarget[]): ServiceTarget | null;
}

export class RoundRobinLoadBalancer implements LoadBalancer {
  private currentIndex = 0;

  selectTarget(targets: ServiceTarget[]): ServiceTarget | null {
    const healthyTargets = targets.filter(t => t.healthy);
    
    if (healthyTargets.length === 0) return null;

    const target = healthyTargets[this.currentIndex % healthyTargets.length];
    this.currentIndex++;
    
    return target;
  }
}

export class WeightedRoundRobinLoadBalancer implements LoadBalancer {
  private currentWeights = new Map<string, number>();

  selectTarget(targets: ServiceTarget[]): ServiceTarget | null {
    const healthyTargets = targets.filter(t => t.healthy);
    
    if (healthyTargets.length === 0) return null;

    // Calculate total weight
    const totalWeight = healthyTargets.reduce((sum, target) => sum + target.weight, 0);
    
    // Select target based on weight
    let random = Math.random() * totalWeight;
    
    for (const target of healthyTargets) {
      random -= target.weight;
      if (random <= 0) {
        return target;
      }
    }
    
    return healthyTargets[healthyTargets.length - 1];
  }
}

export class LeastConnectionsLoadBalancer implements LoadBalancer {
  selectTarget(targets: ServiceTarget[]): ServiceTarget | null {
    const healthyTargets = targets.filter(t => t.healthy);
    
    if (healthyTargets.length === 0) return null;

    return healthyTargets.reduce((min, target) => 
      target.activeConnections < min.activeConnections ? target : min
    );
  }
}

export class ResponseTimeBasedLoadBalancer implements LoadBalancer {
  selectTarget(targets: ServiceTarget[]): ServiceTarget | null {
    const healthyTargets = targets.filter(t => t.healthy);
    
    if (healthyTargets.length === 0) return null;

    return healthyTargets.reduce((fastest, target) => 
      target.responseTime < fastest.responseTime ? target : fastest
    );
  }
}

export class HealthBasedLoadBalancer implements LoadBalancer {
  selectTarget(targets: ServiceTarget[]): ServiceTarget | null {
    const healthyTargets = targets.filter(t => t.healthy);
    
    if (healthyTargets.length === 0) return null;

    // Prefer targets that were recently health checked
    return healthyTargets.reduce((best, target) => 
      target.lastHealthCheck > best.lastHealthCheck ? target : best
    );
  }
}
```

### Health Checker Implementation
```typescript
// patterns/mcp-gateway/routing/health-checker.ts
export class HealthChecker extends EventEmitter {
  private services = new Map<string, ServiceHealthConfig>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private config: HealthCheckConfig;

  constructor(config: HealthCheckConfig) {
    super();
    this.config = config;
  }

  addService(serviceId: string, endpoints: string[]): void {
    this.services.set(serviceId, {
      serviceId,
      endpoints,
      healthy: new Map(endpoints.map(endpoint => [endpoint, true])),
      lastCheck: new Map(endpoints.map(endpoint => [endpoint, new Date()])),
    });

    if (this.config.enabled) {
      this.startHealthCheck(serviceId);
    }
  }

  removeService(serviceId: string): void {
    this.stopHealthCheck(serviceId);
    this.services.delete(serviceId);
  }

  private startHealthCheck(serviceId: string): void {
    const interval = setInterval(() => {
      this.checkServiceHealth(serviceId);
    }, this.config.interval);

    this.intervals.set(serviceId, interval);
  }

  private stopHealthCheck(serviceId: string): void {
    const interval = this.intervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(serviceId);
    }
  }

  private async checkServiceHealth(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) return;

    for (const endpoint of service.endpoints) {
      try {
        const healthy = await this.checkEndpointHealth(endpoint);
        
        const wasHealthy = service.healthy.get(endpoint) || false;
        service.healthy.set(endpoint, healthy);
        service.lastCheck.set(endpoint, new Date());

        if (wasHealthy !== healthy) {
          this.emit('healthUpdate', serviceId, healthy);
        }

      } catch (error) {
        service.healthy.set(endpoint, false);
        service.lastCheck.set(endpoint, new Date());
        
        this.emit('healthUpdate', serviceId, false);
      }
    }
  }

  private async checkEndpointHealth(endpoint: string): Promise<boolean> {
    try {
      const url = `${endpoint}${this.config.path}`;
      
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return response.status === this.config.expectedStatus;

    } catch (error) {
      return false;
    }
  }

  start(): void {
    for (const serviceId of this.services.keys()) {
      this.startHealthCheck(serviceId);
    }
  }

  stop(): void {
    for (const serviceId of this.intervals.keys()) {
      this.stopHealthCheck(serviceId);
    }
  }

  getServiceHealth(serviceId: string): ServiceHealthConfig | null {
    return this.services.get(serviceId) || null;
  }

  isHealthy(serviceId: string, endpoint: string): boolean {
    const service = this.services.get(serviceId);
    return service ? (service.healthy.get(endpoint) || false) : false;
  }
}

interface ServiceHealthConfig {
  serviceId: string;
  endpoints: string[];
  healthy: Map<string, boolean>;
  lastCheck: Map<string, Date>;
}

interface RoutingRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: any;
  timestamp: number;
}

interface RoutingResult {
  success: boolean;
  route?: Route;
  target?: ServiceTarget;
  response?: any;
  error?: string;
  duration: number;
}

interface RoutingMetrics {
  totalRoutes: number;
  totalServices: number;
  totalTargets: number;
  healthyTargets: number;
}
```

## 🚀 Quick Start

### Basic Router Setup
```typescript
// Setup basic routing for your MCP Gateway
import { CoreRouter, LoadBalancerType } from './patterns/mcp-gateway/routing/core-router';

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
    {
      id: 'translation-route',
      path: '/api/mcp/translation/*',
      method: 'POST',
      target: {
        serviceId: 'translation-service',
        endpoint: 'http://translation-service:3001',
        weight: 1,
        healthy: true,
        lastHealthCheck: new Date(),
        responseTime: 0,
        activeConnections: 0,
      },
      priority: 2,
      enabled: true,
    },
  ],
  loadBalancer: LoadBalancerType.ROUND_ROBIN,
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    path: '/health',
    expectedStatus: 200,
    retries: 3,
  },
  retryPolicy: {
    enabled: true,
    maxRetries: 3,
    backoffMs: 1000,
    retryableStatusCodes: [500, 502, 503, 504],
  },
  timeoutPolicy: {
    connect: 5000,   // 5 seconds
    request: 30000,  // 30 seconds
    response: 60000, // 60 seconds
  },
});

// Route a request
const result = await router.routeRequest({
  method: 'POST',
  path: '/api/mcp/ui-generation/generate',
  headers: { 'Content-Type': 'application/json' },
  query: {},
  timestamp: Date.now(),
  body: {
    type: 'component',
    framework: 'react',
    description: 'Generate a button component',
  },
});

if (result.success) {
  console.log('Request routed successfully:', result.response);
} else {
  console.error('Routing failed:', result.error);
}
```

### Advanced Load Balancing
```typescript
// Use weighted round robin for different service capacities
router.addServiceTarget('ui-generation-service', {
  serviceId: 'ui-generation-service',
  endpoint: 'http://ui-generation-service-1:3000',
  weight: 3, // Higher capacity
  healthy: true,
  lastHealthCheck: new Date(),
  responseTime: 0,
  activeConnections: 0,
});

router.addServiceTarget('ui-generation-service', {
  serviceId: 'ui-generation-service',
  endpoint: 'http://ui-generation-service-2:3000',
  weight: 1, // Lower capacity
  healthy: true,
  lastHealthCheck: new Date(),
  responseTime: 0,
  activeConnections: 0,
});
```

## 📊 Performance Benefits

### Load Balancing Efficiency
- **Round Robin**: Even distribution across all healthy targets
- **Weighted Round Robin**: Distribution based on service capacity
- **Least Connections**: Route to least busy service
- **Response Time Based**: Route to fastest responding service
- **Health Based**: Prioritize recently health-checked services

### Reliability Features
- **Health Checking**: Continuous monitoring of service health
- **Automatic Failover**: Route away from unhealthy services
- **Retry Logic**: Automatic retry for transient failures
- **Timeout Protection**: Prevent hanging requests
- **Circuit Breaking**: Stop routing to failing services

### Monitoring & Metrics
- **Request Metrics**: Track routing performance
- **Health Metrics**: Monitor service health status
- **Load Metrics**: Track service utilization
- **Error Metrics**: Monitor routing failures

## 🔧 Integration Examples

### Express.js Integration
```typescript
// Integrate with Express.js MCP Gateway
import express from 'express';
import { CoreRouter } from './patterns/mcp-gateway/routing/core-router';

const app = express();
const router = new CoreRouter(routingConfig);

// Middleware to route all MCP requests
app.use('/api/mcp/*', async (req, res) => {
  const result = await router.routeRequest({
    method: req.method,
    path: req.path,
    headers: req.headers as Record<string, string>,
    query: req.query as Record<string, string>,
    body: req.body,
    timestamp: Date.now(),
  });

  if (result.success) {
    res.status(200).json(result.response);
  } else {
    res.status(500).json({ error: result.error });
  }
});
```

### Service Registration
```typescript
// Dynamic service registration
router.addServiceTarget('new-service', {
  serviceId: 'new-service',
  endpoint: 'http://new-service:3002',
  weight: 1,
  healthy: true,
  lastHealthCheck: new Date(),
  responseTime: 0,
  activeConnections: 0,
});

router.addRoute({
  id: 'new-service-route',
  path: '/api/mcp/new-service/*',
  target: {
    serviceId: 'new-service',
    endpoint: 'http://new-service:3002',
    weight: 1,
    healthy: true,
    lastHealthCheck: new Date(),
    responseTime: 0,
    activeConnections: 0,
  },
  priority: 3,
  enabled: true,
});
```

This routing pattern provides a robust, scalable foundation for the Forge MCP Gateway with intelligent load balancing, health checking, and fault tolerance! 🚀

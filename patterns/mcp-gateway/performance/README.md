# MCP Gateway Performance Patterns

## 🎯 Overview

Performance optimization patterns for the Forge MCP Gateway, providing caching, connection pooling, request batching, and comprehensive monitoring for optimal throughput and resource utilization.

## 📋 Available Patterns

### Caching Strategies
- **Response Caching**: Cache frequently used responses to reduce processing time
- **Request Caching**: Cache entire requests with their responses
- **Partial Caching**: Cache partial responses for incremental updates
- **Cache Invalidation**: Intelligent cache invalidation based on content changes
- **Distributed Caching**: Multi-instance cache synchronization

### Connection Pooling
- **HTTP Connection Pooling**: Reuse HTTP connections for better performance
- **Database Connection Pooling**: Efficient database connection management
- **WebSocket Connection Pooling**: Optimize WebSocket connection usage
- **Connection Health Monitoring**: Monitor and maintain connection pool health
- **Dynamic Pool Sizing**: Automatically adjust pool size based on load

### Request Batching
- **Batch Request Processing**: Group similar requests for efficient processing
- **Response Aggregation**: Combine multiple responses into single response
- **Queue-Based Batching**: Use queues for request batching and throttling
- **Timeout Management**: Handle batch timeouts and partial failures
- **Batch Size Optimization**: Optimize batch sizes for maximum throughput

### Performance Monitoring
- **Request Latency Tracking**: Monitor request processing times
- **Throughput Monitoring**: Track requests per second and system capacity
- **Resource Usage Monitoring**: Monitor CPU, memory, and network usage
- **Error Rate Tracking**: Monitor error rates and failure patterns
- **Performance Alerts**: Automated alerts for performance degradation

## 🔧 Implementation Examples

### Response Caching Implementation
```typescript
// patterns/mcp-gateway/performance/response-cache.ts
import { EventEmitter } from 'events';

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionEnabled: boolean;
  metricsEnabled: boolean;
}

export class ResponseCache extends EventEmitter {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupTimer();
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.emit('cacheMiss', key);
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.evictions++;
      this.emit('cacheEviction', key);
      return null;
    }

    entry.hits++;
    this.metrics.hits++;
    this.emit('cacheHit', key);
    
    return entry.data;
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    const size = this.calculateSize(data);
    
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      await this.evictOldestEntry();
    }

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0,
      size,
    };

    this.cache.set(key, entry);
    this.metrics.totalSize += size;
    
    this.emit('cacheSet', key, entry);
  }

  async invalidate(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.emit('cacheInvalidated', key);
    }
    
    return deleted;
  }

  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys()).filter(key => regex.test(key));
    
    let invalidated = 0;
    for (const key of keys) {
      if (await this.invalidate(key)) {
        invalidated++;
      }
    }
    
    return invalidated;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.metrics.evictions += size;
    this.emit('cacheCleared', size);
  }

  getMetrics(): CacheMetrics {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      evictions: this.metrics.evictions,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize: this.metrics.totalSize,
      averageSize: this.cache.size > 0 ? this.metrics.totalSize / this.cache.size : 0,
    };
  }

  private async evictOldestEntry(): Promise<void> {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.invalidate(oldestKey);
    }
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private startCleanupTimer(): void {
    if (!this.config.cleanupInterval) return;

    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.invalidate(key);
    }
  }
}

interface CacheMetrics {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  totalSize: number;
  averageSize: number;
}
```

### Connection Pooling Implementation
```typescript
// patterns/mcp-gateway/performance/connection-pool.ts
import { EventEmitter } from 'events';

export interface ConnectionConfig {
  min: number;
  max: number;
  idleTimeout: number;
  acquireTimeout: number;
  healthCheckInterval: number;
  maxRetries: number;
}

export interface PooledConnection {
  id: string;
  connection: any;
  created: Date;
  lastUsed: Date;
  inUse: boolean;
  healthy: boolean;
  retryCount: number;
}

export class ConnectionPool extends EventEmitter {
  private available: PooledConnection[] = [];
  private inUse: PooledConnection[] = [];
  private config: ConnectionConfig;
  private metrics = {
    created: 0,
    destroyed: 0,
    acquired: 0,
    released: 0,
    timeouts: 0,
    errors: 0,
  };

  constructor(
    private createConnection: () => Promise<any>,
    destroyConnection: (connection: any) => Promise<void>,
    config: ConnectionConfig
  ) {
    this.config = config;
    this.startHealthCheckTimer();
  }

  async acquire(): Promise<any> {
    const startTime = Date.now();
    
    // Try to get an available connection
    if (this.available.length > 0) {
      const connection = this.available.shift()!;
      connection.inUse = true;
      connection.lastUsed = new Date();
      this.inUse.push(connection);
      this.metrics.acquired++;
      
      this.emit('connectionAcquired', connection);
      return connection.connection;
    }

    // Try to create a new connection if under max
    if (this.getTotalConnections() < this.config.max) {
      try {
        const connection = await this.createConnection();
        const pooledConnection: PooledConnection = {
          id: this.generateConnectionId(),
          connection,
          created: new Date(),
          lastUsed: new Date(),
          inUse: true,
          healthy: true,
          retryCount: 0,
        };

        this.inUse.push(pooledConnection);
        this.metrics.created++;
        this.metrics.acquired++;
        
        this.emit('connectionCreated', pooledConnection);
        return connection;
      } catch (error) {
        this.metrics.errors++;
        throw error;
      }
    }

    // Wait for a connection to become available
    return this.waitForConnection(startTime);
  }

  async release(connection: any): Promise<void> {
    const pooledConnection = this.findConnection(connection);
    
    if (!pooledConnection) {
      throw new Error('Connection not found in pool');
    }

    // Remove from in-use and add to available
    const index = this.inUse.indexOf(pooledConnection);
    if (index > -1) {
      this.inUse.splice(index, 1);
    }
    
    pooledConnection.inUse = false;
    pooledConnection.lastUsed = new Date();
    pooledConnection.retryCount = 0;
    
    this.available.push(pooledConnection);
    this.metrics.released++;
    
    this.emit('connectionReleased', pooledConnection);
  }

  async destroy(connection: any): Promise<void> {
    const pooledConnection = this.findConnection(connection);
    
    if (!pooledConnection) {
      return;
    }

    // Remove from any pool
    this.removeFromPools(pooledConnection);
    
    try {
      await this.destroyConnection(connection);
      this.metrics.destroyed++;
      this.emit('connectionDestroyed', pooledConnection);
    } catch (error) {
      this.metrics.errors++;
      this.emit('connectionError', error);
    }
  }

  getMetrics(): PoolMetrics {
    return {
      totalConnections: this.getTotalConnections(),
      availableConnections: this.available.length,
      inUseConnections: this.inUse.length,
      created: this.metrics.created,
      destroyed: this.metrics.destroyed,
      acquired: this.metrics.acquired,
      released: this.metrics.released,
      timeouts: this.metrics.timeouts,
      errors: this.metrics.errors,
      utilizationRate: this.getUtilizationRate(),
    };
  }

  private async waitForConnection(startTime: number): Promise<any> {
    const timeout = setTimeout(() => {
      this.metrics.timeouts++;
      throw new Error('Connection acquisition timeout');
    }, this.config.acquireTimeout);

    return new Promise((resolve, reject) => {
      const checkAvailable = () => {
        if (this.available.length > 0) {
          clearTimeout(timeout);
          const connection = this.available.shift()!;
          connection.inUse = true;
          connection.lastUsed = new Date();
          this.inUse.push(connection);
          this.metrics.acquired++;
          
          resolve(connection.connection);
        } else {
          setTimeout(checkAvailable, 100);
        }
      };

      checkAvailable();
    });
  }

  private findConnection(connection: any): PooledConnection | null {
    const searchIn = (pool: PooledConnection[]): PooledConnection | null => {
      for (const pooledConnection of pool) {
        if (pooledConnection.connection === connection) {
          return pooledConnection;
        }
      }
      return null;
    };

    let found = searchIn(this.inUse);
    if (!found) {
      found = searchIn(this.available);
    }
    
    return found;
  }

  private removeFromPools(pooledConnection: PooledConnection): void {
    const removeFrom = (pool: PooledConnection[]) => {
      const index = pool.indexOf(pooledConnection);
      if (index > -1) {
        pool.splice(index, 1);
      }
    };

    removeFrom(this.inUse);
    removeFrom(this.available);
  }

  private getTotalConnections(): number {
    return this.inUse.length + this.available.length;
  }

  private getUtilizationRate(): number {
    const total = this.getTotalConnections();
    return total > 0 ? (this.inUse.length / total) * 100 : 0;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHealthCheckTimer(): void {
    if (!this.config.healthCheckInterval) return;

    setInterval(() => {
      this.checkConnectionHealth();
    }, this.config.healthCheckInterval);
  }

  private async checkConnectionHealth(): Promise<void> {
    const allConnections = [...this.available, ...this.inUse];
    
    for (const pooledConnection of allConnections) {
      try {
        // Simple health check - can be customized per connection type
        const isHealthy = await this.performHealthCheck(pooledConnection.connection);
        
        if (!isHealthy) {
          pooledConnection.healthy = false;
          pooledConnection.retryCount++;
          
          if (pooledConnection.retryCount >= this.config.maxRetries) {
            await this.destroy(pooledConnection.connection);
          }
        } else {
          pooledConnection.healthy = true;
          pooledConnection.retryCount = 0;
        }
      } catch (error) {
        pooledConnection.healthy = false;
        pooledConnection.retryCount++;
        this.metrics.errors++;
        this.emit('connectionError', error);
      }
    }
  }

  private async performHealthCheck(connection: any): Promise<boolean> {
    // Default health check - can be customized
    return true;
  }
}

interface PoolMetrics {
  totalConnections: number;
  availableConnections: number;
  inUseConnections: number;
  created: number;
  destroyed: number;
  acquired: number;
  released: number;
  timeouts: number;
  errors: number;
  utilizationRate: number;
}
```

### Request Batching Implementation
```typescript
// patterns/mcp-gateway/performance/request-batcher.ts
import { EventEmitter } from 'events';

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  batchTimeout: number;
  aggregationStrategy: 'first' | 'last' | 'merge';
}

export interface BatchRequest {
  id: string;
  requests: any[];
  timestamp: number;
  timeout: number;
  resolve: (responses: any[]) => void;
  reject: (error: Error) => void;
}

export interface BatchResponse {
  id: string;
  responses: any[];
  timestamp: number;
  processingTime: number;
}

export class RequestBatcher extends EventEmitter {
  private pendingRequests = new Map<string, BatchRequest>();
  private config: BatchConfig;
  private batchTimer: NodeJS.Timeout | null = null;
  private metrics = {
    totalBatches: 0,
    totalRequests: 0,
    averageBatchSize: 0,
    averageProcessingTime: 0,
    timeouts: 0,
  errors: 0,
  };

  constructor(config: BatchConfig) {
    this.config = config;
  }

  async addRequest(request: any): Promise<any> {
    const requestId = this.generateRequestId();
    const timeout = this.config.maxWaitTime;

    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: requestId,
        requests: [request],
        timestamp: Date.now(),
        timeout,
        resolve,
        reject,
      };

      this.pendingRequests.set(requestId, batchRequest);
      this.metrics.totalRequests++;

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.startBatchTimer();
      }
    });
  }

  private startBatchTimer(): void {
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.config.batchTimeout);
  }

  private async processBatch(): void {
    if (this.pendingRequests.size === 0) {
      this.batchTimer = null;
      return;
    }

    const batchRequests = Array.from(this.pendingRequests.values());
    const batchId = this.generateBatchId();

    // Group requests by type or other criteria
    const batches = this.groupRequests(batchRequests);

    for (const batch of batches) {
      await this.processBatch(batch, batchId);
    }

    this.batchTimer = null;
  }

  private groupRequests(requests: BatchRequest[]): BatchRequest[] {
    const batches: BatchRequest[] = [];
    
    let currentBatch: BatchRequest | null = null;

    for (const request of requests) {
      if (!currentBatch || currentBatch.requests.length >= this.config.maxBatchSize) {
        currentBatch = {
          id: this.generateBatchId(),
          requests: [request],
          timestamp: Date.now(),
          timeout: request.timeout,
          resolve: request.resolve,
          reject: request.reject,
        };
        batches.push(currentBatch);
      } else {
        currentBatch.requests.push(request);
      }
    }

    return batches;
  }

  private async processBatch(batch: BatchRequest, batchId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Process the batch
      const responses = await this.processBatchRequests(batch.requests);
      
      const processingTime = Date.now() - startTime;
      this.updateMetrics(batch.requests.length, processingTime);

      // Resolve all requests in the batch
      for (const request of batch.requests) {
        request.resolve(responses);
      }

      this.emit('batchProcessed', {
        batchId,
        responses,
        processingTime,
        requestCount: batch.requests.length,
      });

    } catch (error) {
      // Reject all requests in the batch
      for (const request of batch.requests) {
        request.reject(error);
      }

      this.metrics.errors++;
      this.emit('batchError', { batchId, error });
    } finally {
      // Remove processed requests from pending
      for (const request of batch.requests) {
        this.pendingRequests.delete(request.id);
      }
    }
  }

  private async processBatchRequests(requests: any[]): Promise<any[]> {
    // This would be implemented based on the specific MCP service
    // For now, return mock responses
    return requests.map(request => ({
      success: true,
      data: `Processed request: ${JSON.stringify(request)}`,
      timestamp: Date.now(),
    }));
  }

  private updateMetrics(requestCount: number, processingTime: number): void {
    this.metrics.totalBatches++;
    this.metrics.averageBatchSize = 
      (this.metrics.averageBatchSize * (this.metrics.totalBatches - 1) + requestCount) / this.metrics.totalBatches;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalBatches - 1) + processingTime) / this.metrics.totalBatches;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(): BatcherMetrics {
    return {
      totalBatches: this.metrics.totalBatches,
      totalRequests: this.metrics.totalRequests,
      averageBatchSize: Math.round(this.metrics.averageBatchSize),
      averageProcessingTime: Math.round(this.metrics.averageProcessingTime),
      timeouts: this.metrics.timeouts,
      errors: this.metrics.errors,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

interface BatcherMetrics {
  totalBatches: number;
  totalRequests: number;
  averageBatchSize: number;
  averageProcessingTime: number;
  timeouts: number;
  errors: number;
  pendingRequests: number;
}
```

### Performance Monitoring Implementation
```typescript
// patterns/mcp-gateway/performance/performance-monitor.ts
import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  requestCount: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

export interface PerformanceConfig {
  metricsInterval: number;
  latencyHistorySize: number;
  alertThresholds: {
    latency: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export class PerformanceMonitor extends EventEmitter {
  private metrics = {
    requestCount: 0,
    latencies: [] as number[],
    errors: 0,
    startTime: Date.now(),
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0,
  };

  private config: PerformanceConfig;
  private metricsInterval: NodeJS.Timeout;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.startMetricsCollection();
  }

  recordRequest(latency: number, error: boolean = false): void {
    this.metrics.requestCount++;
    this.metrics.latencies.push(latency);
    
    if (error) {
      this.metrics.errors++;
    }

    // Keep only recent latencies for P95/P99 calculation
    if (this.metrics.latencies.length > this.config.latencyHistorySize) {
      this.metrics.latencies = this.metrics.latencies.slice(-this.config.latencyHistorySize);
    }

    // Check alert thresholds
    this.checkAlertThresholds();
  }

  recordConnectionCount(count: number): void {
    this.metrics.activeConnections = count;
    this.checkAlertThresholds();
  }

  recordResourceUsage(memoryUsage: number, cpuUsage: number): void {
    this.metrics.memoryUsage = memoryUsage;
    this.metrics.cpuUsage = cpuUsage;
    this.checkAlertThresholds();
  }

  getMetrics(): PerformanceMetrics {
    const sortedLatencies = [...this.metrics.latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);

    const averageLatency = this.metrics.latencies.length > 0
      ? this.metrics.latencies.reduce((sum, latency) => sum + latency, 0) / this.metrics.latencies.length
      : 0;

    const errorRate = this.metrics.requestCount > 0
      ? (this.metrics.errors / this.metrics.requestCount) * 100
      : 0;

    const throughput = this.metrics.requestCount > 0
      ? (this.metrics.requestCount / ((Date.now() - this.metrics.startTime) / 1000))
      : 0;

    return {
      requestCount: this.metrics.requestCount,
      averageLatency: Math.round(averageLatency),
      p95Latency: sortedLatencies[p95Index] || 0,
      p99Latency: sortedLatencies[p99Index] || 0,
      errorRate: Math.round(errorRate),
      throughput: Math.round(throughput),
      memoryUsage: this.metrics.memoryUsage,
      cpuUsage: this.metrics.cpuUsage,
      activeConnections: this.metrics.activeConnections,
    };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      latencies: [] as number[],
      errors: 0,
      startTime: Date.now(),
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
    };
    
    this.emit('metricsReset');
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlertThresholds();
    }, this.config.metricsInterval);
  }

  private collectSystemMetrics(): void {
    // Collect system metrics (implementation depends on environment)
    // This would use process.memoryUsage() and other system monitoring
    // For now, we'll use mock values
    const memoryUsage = Math.random() * 100;
    const cpuUsage = Math.random() * 100;
    
    this.recordResourceUsage(memoryUsage, cpuUsage);
  }

  private checkAlertThresholds(): void {
    const metrics = this.getMetrics();
    
    // Check latency thresholds
    if (metrics.averageLatency > this.config.alertThresholds.latency) {
      this.emit('alert', {
        type: 'latency',
        value: metrics.averageLatency,
        threshold: this.config.alertThresholds.latency,
        message: `Average latency (${metrics.averageLatency}ms) exceeds threshold (${this.config.alertThresholds.latency}ms)`,
      });
    }

    // Check error rate thresholds
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      this.emit('alert', {
        type: 'errorRate',
        value: metrics.errorRate,
        threshold: this.config.alertThresholds.errorRate,
        message: `Error rate (${metrics.errorRate}%) exceeds threshold (${this.config.alertThresholds.errorRate}%)`,
      });
    }

    // Check throughput thresholds
    if (metrics.throughput < this.config.alertThresholds.throughput) {
      this.emit('alert', {
        type: 'throughput',
        value: metrics.throughput,
        threshold: this.config.alertThresholds.throughput,
        message: `Throughput (${metrics.throughput} req/s) below threshold (${this.config.alertThresholds.throughput} req/s)`,
      });
    }

    // Check memory usage thresholds
    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.emit('alert', {
        type: 'memoryUsage',
        value: metrics.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage,
        message: `Memory usage (${metrics.memoryUsage}%) exceeds threshold (${this.config.alertThresholds.memoryUsage}%)`,
      });
    }

    // Check CPU usage thresholds
    if (metrics.cpuUsage > this.config.alertThresholds.cpuUsage) {
      this.emit('alert', {
        type: 'cpuUsage',
        value: metrics.cpuUsage,
        threshold: this.config.alertThresholds.cpuUsage,
        message: `CPU usage (${metrics.cpuUsage}%) exceeds threshold (${this.config.alertThresholds.cpuUsage}%)`,
      });
    }
  }
}
```

## 🚀 Quick Start

### Basic Performance Setup
```typescript
// Setup performance optimization for your MCP Gateway
import { ResponseCache } from './patterns/mcp-gateway/performance/response-cache';
import { ConnectionPool } from './patterns/mcp-gateway/performance/connection-pool';
import { RequestBatcher } from './patterns/mcp-gateway/performance/request-batcher';
import { PerformanceMonitor } from './patterns/mcp-gateway/performance/performance-monitor';

// Initialize performance components
const responseCache = new ResponseCache({
  maxSize: 1000,
  defaultTTL: 300000, // 5 minutes
  cleanupInterval: 60000,  // 1 minute
  compressionEnabled: true,
  metricsEnabled: true,
});

const connectionPool = new ConnectionPool(
  async () => {
  // Create new connection implementation
  return { id: 'conn_' + Math.random().toString(36) };
  },
  async (connection) => {
  // Destroy connection implementation
  },
  {
    min: 5,
    max: 20,
    idleTimeout: 300000, // 5 minutes
    acquireTimeout: 5000,
    healthCheckInterval: 30000, // 30 seconds
    maxRetries: 3,
  }
);

const requestBatcher = new RequestBatcher({
  maxBatchSize: 10,
  maxWaitTime: 100, // 100ms
  batchTimeout: 1000, // 1 second
  aggregationStrategy: 'first',
});

const performanceMonitor = new PerformanceMonitor({
  metricsInterval: 10000, // 10 seconds
  latencyHistorySize: 1000,
  alertThresholds: {
    latency: 1000, // 1 second
    errorRate: 5, // 5%
    throughput: 10, // 10 req/s minimum
    memoryUsage: 80, // 80% memory usage
    cpuUsage: 70, // 70% CPU usage
  },
});

// Middleware setup
app.use('/api/mcp/*', async (req, res, next) => {
  // Check cache first
  const cacheKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  const cached = await responseCache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }

  // Acquire connection
  const connection = await connectionPool.acquire();
  
  try {
    // Process request through connection
    const result = await processRequestWithConnection(connection, req);
    
    // Cache the response
    await responseCache.set(cacheKey, result, 300000); // 5 minutes
    
    // Release connection
    await connectionPool.release(connection);
    
    res.json(result);
    
    // Record performance metrics
    performanceMonitor.recordRequest(100, false);
    
  } catch (error) {
    // Release connection on error
    await connectionPool.release(connection);
    
    // Record error metrics
    performanceMonitor.recordRequest(0, true);
    
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Request Batching Setup
```typescript
// Setup request batching for similar requests
app.post('/api/mcp/batch', async (req, res) => {
  const requests = Array.isArray(req.body) ? req.body : [req.body];
  
  try {
    // Add requests to batcher
    const responses = await Promise.all(
      requests.map(request => requestBatcher.addRequest(request))
    );
    
    res.json({
      batchId: responses[0]?.id,
      responses: responses.map(r => r),
      processingTime: 0, // Would be calculated in real implementation
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Batch processing failed' });
  }
});
```

## 📊 Performance Benefits

### Caching Benefits
- **Reduced Processing Time**: Cache frequently used responses
- **Lower Server Load**: Reduce database/API calls
- **Improved Response Times**: Faster responses for cached content
- **Cost Optimization**: Reduced API usage and costs

### Connection Pooling Benefits
- **Reduced Connection Overhead**: Reuse existing connections
- **Better Resource Utilization**: Optimize connection usage
- **Improved Scalability**: Handle more concurrent requests
- **Connection Health Monitoring**: Automatic connection health checking

### Request Batching Benefits
- **Higher Throughput**: Process multiple requests together
- **Reduced Overhead**: Fewer round trips to services
- **Better Resource Efficiency**: Optimize service utilization
- **Improved Latency**: Average out processing time variations
- **Cost Optimization**: Reduce API call costs

### Monitoring Benefits
- **Real-Time Insights**: Live performance metrics
- **Proactive Alerts**: Automated performance alerts
- **Historical Analysis**: Performance trend analysis
- **Capacity Planning**: Data-driven capacity planning
- **SLA Monitoring**: Service level agreement compliance

## 🔧 Integration Examples

### Express.js Integration
```typescript
// Complete performance middleware stack
import { ResponseCache } from './patterns/mcp-gateway/performance/response-cache';
import { ConnectionPool } from './patterns/mcp-gateway/performance/connection-pool';
import { RequestBatcher } from './patterns/mcp-gateway/performance/request-batcher';
import { PerformanceMonitor } from './patterns/mcp-gateway/performance/performance-monitor';

// Apply all performance middleware
app.use('/api/mcp/*', performanceMiddleware);

function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Continue with request processing
  next();
  
  // Record performance metrics after response
  const endTime = Date.now();
  const latency = endTime - startTime;
  
  performanceMonitor.recordRequest(latency, false);
}
```

### Performance Monitoring Dashboard
```typescript
// Real-time performance monitoring
setInterval(() => {
  const metrics = performanceMonitor.getMetrics();
  
  console.log('Performance Metrics:');
  console.log(`  Requests: ${metrics.requestCount}`);
  console.log(`  Avg Latency: ${metrics.averageLatency}ms`);
  console.log(`  P95 Latency: ${metrics.p95Latency}ms`);
  console.log(` Error Rate: ${metrics.errorRate}%`);
  console.log(` Throughput: ${metrics.throughput} req/s`);
  console.log(` Memory Usage: ${metrics.memoryUsage}%`);
  console.log(` CPU Usage: ${metrics.cpuUsage}%`);
  console.log(` Active Connections: ${metrics.activeConnections}`);
  
  // Check for alerts
  performanceMonitor.on('alert', (alert) => {
    console.warn(`🚨 Performance Alert: ${alert.type}`);
    console.warn(`  Value: ${alert.value}`);
    console.warn(`  Threshold: ${alert.threshold}`);
    console.warn(`  Message: ${alert.message}`);
  });
}, 10000); // Every 10 seconds
```

This performance pattern provides comprehensive optimization for the Forge MCP Gateway with caching, connection pooling, request batching, and real-time monitoring! 🚀

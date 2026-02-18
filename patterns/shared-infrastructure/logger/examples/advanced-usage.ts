import {
  LoggerFactory,
  ConfigBuilder,
  LogLevel,
  ConsoleTransport,
  JsonTransport,
  FileTransport,
  MetricsCollector,
  DistributedTracer,
  HealthChecker,
  AlertManager
} from '../index.js';

// Example 1: Custom Transport Configuration
console.log('=== Custom Transport Configuration ===');

const customLogger = LoggerFactory.create(
  ConfigBuilder.create()
    .service('custom-service')
    .version('2.1.0')
    .environment('production')
    .level(LogLevel.INFO)
    .enableConsole(true)
    .enableStructured(true)
    .enableFile('./logs/custom.log', 25 * 1024 * 1024, 5)
    .redactFields(['password', 'token', 'secret', 'api-key'])
    .defaultContext({
      region: 'us-west-2',
      datacenter: 'dc1',
      cluster: 'production'
    })
    .build()
);

customLogger.info('Custom configured logger initialized');

// Example 2: Multiple Transports
console.log('\n=== Multiple Transports ===');

const multiLogger = LoggerFactory.create({
  service: 'multi-transport-service',
  version: '1.0.0',
  environment: 'development',
  level: LogLevel.DEBUG,
  transports: [
    new ConsoleTransport(LogLevel.DEBUG),
    new JsonTransport(LogLevel.INFO),
    new FileTransport('./logs/multi.log', LogLevel.WARN, 10 * 1024 * 1024, 3)
  ]
});

multiLogger.debug('Debug message to all transports');
multiLogger.info('Info message to JSON and file transports');
multiLogger.warn('Warning to all transports');
multiLogger.error('Error to all transports');

// Example 3: Metrics Collection
console.log('\n=== Metrics Collection ===');

const metricsCollector = new MetricsCollector();

// Simulate API requests
const simulateApiRequests = () => {
  for (let i = 0; i < 100; i++) {
    const method = ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)];
    const status = [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)];
    const duration = Math.floor(Math.random() * 1000) + 50;

    metricsCollector.incrementCounter('api.requests', 1, {
      method,
      status: status.toString()
    });

    metricsCollector.recordHistogram('api.response_time', duration, {
      method,
      endpoint: '/api/data'
    });

    if (i % 10 === 0) {
      metricsCollector.setGauge('memory.usage', Math.random() * 100, {
        type: 'heap'
      });
    }
  }
};

simulateApiRequests();

// Get metrics summary
const metrics = metricsCollector.getMetrics();
console.log('API Metrics Summary:');
console.log('Total requests:', metrics.counters['api.requests{method=GET,status=200}'] || 0);
console.log(
  'Average response time:',
  metrics.histograms['api.response_time{method=GET,endpoint=/api/data}']?.avg || 0
);

// Example 4: Distributed Tracing
console.log('\n=== Distributed Tracing ===');

const tracer = new DistributedTracer();

// Simulate a request flow
const simulateRequestFlow = async () => {
  // Start root span
  const rootSpan = tracer.startSpan('http-request', {
    'http.method': 'POST',
    'http.url': '/api/process',
    'user.id': '12345'
  });

  tracer.addTags(rootSpan.spanId, {
    'service.name': 'api-gateway',
    'service.version': '1.0.0'
  });

  // Database operation
  const dbSpan = tracer.startSpan('database-query', {
    'db.operation': 'SELECT',
    'db.table': 'users'
  });

  tracer.addEvent(dbSpan.spanId, 'query.start', {
    query: 'SELECT * FROM users WHERE id = ?'
  });

  // Simulate database work
  await new Promise(resolve => setTimeout(resolve, 50));

  tracer.addEvent(dbSpan.spanId, 'query.complete', {
    rowsAffected: 1
  });

  tracer.finishSpan(dbSpan.spanId);

  // Cache operation
  const cacheSpan = tracer.startSpan('cache-operation', {
    'cache.operation': 'get',
    'cache.key': 'user:12345'
  });

  await new Promise(resolve => setTimeout(resolve, 10));

  tracer.finishSpan(cacheSpan.spanId);

  // Finish root span
  tracer.finishSpan(rootSpan.spanId);

  console.log('Request flow completed');
};

simulateRequestFlow();

// Example 5: Health Checks
console.log('\n=== Health Checks ===');

const healthChecker = new HealthChecker();

// Register various health checks
healthChecker.registerCheck('database', {
  async execute() {
    // Simulate database health check
    const isHealthy = Math.random() > 0.1; // 90% success rate
    return {
      healthy: isHealthy,
      message: isHealthy ? 'Database connection healthy' : 'Database connection failed',
      details: {
        connectionPool: 'active',
        activeConnections: Math.floor(Math.random() * 20) + 5,
        maxConnections: 25
      }
    };
  }
});

healthChecker.registerCheck('external-api', {
  async execute() {
    try {
      // Simulate external API check
      const response = await fetch('https://httpbin.org/status/200');
      return {
        healthy: response.ok,
        message: 'External API responding',
        details: {
          status: response.status,
          responseTime: Date.now()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'External API unavailable',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
});

healthChecker.registerCheck('disk-space', {
  async execute() {
    // Simulate disk space check
    const usagePercent = Math.random() * 100;
    const isHealthy = usagePercent < 90;

    return {
      healthy: isHealthy,
      message: `Disk usage: ${usagePercent.toFixed(1)}%`,
      details: {
        usagePercent,
        totalSpace: '100GB',
        usedSpace: `${usagePercent.toFixed(1)}GB`,
        availableSpace: `${(100 - usagePercent).toFixed(1)}GB`
      }
    };
  }
});

// Run health checks
healthChecker.runChecks().then(healthReport => {
  console.log('Health Report:');
  console.log('Overall Status:', healthReport.status);
  console.log('Total Checks:', healthReport.summary.total);
  console.log('Healthy Checks:', healthReport.summary.healthy);
  console.log('Unhealthy Checks:', healthReport.summary.unhealthy);

  healthReport.checks.forEach(check => {
    console.log(`- ${check.name}: ${check.status} (${check.duration}ms)`);
  });
});

// Example 6: Alerting System
console.log('\n=== Alerting System ===');

const alertManager = new AlertManager();

// Configure alert rules
alertManager.addRule({
  name: 'high-error-rate',
  severity: 'high',
  message: 'High error rate detected - immediate attention required',
  conditions: {
    level: LogLevel.ERROR,
    rateLimit: {
      maxAlerts: 2,
      windowMs: 30000 // 30 seconds
    }
  }
});

alertManager.addRule({
  name: 'critical-errors',
  severity: 'critical',
  message: 'Critical system error - immediate response required',
  conditions: {
    level: LogLevel.FATAL,
    rateLimit: {
      maxAlerts: 1,
      windowMs: 60000 // 1 minute
    }
  }
});

alertManager.addRule({
  name: 'database-connection-failures',
  severity: 'medium',
  message: 'Database connection failures detected',
  conditions: {
    messagePattern: 'database.*connection.*failed',
    rateLimit: {
      maxAlerts: 3,
      windowMs: 60000 // 1 minute
    }
  }
});

// Simulate various log events that trigger alerts
const alertLogger = LoggerFactory.createDefault('alert-service', '1.0.0');

// These will trigger alerts based on the rules above
setTimeout(() => {
  alertLogger.error('Database connection failed', new Error('Connection timeout'));
  alertLogger.error('Database connection failed', new Error('Connection refused'));
  alertLogger.error('Database connection failed', new Error('Authentication failed'));
}, 1000);

setTimeout(() => {
  alertLogger.fatal('System out of memory', new Error('Cannot allocate memory'));
}, 2000);

// Check alert history after some time
setTimeout(() => {
  const alerts = alertManager.getAlertHistory(10);
  console.log('Recent Alerts:');
  alerts.forEach(alert => {
    console.log(`- ${alert.severity.toUpperCase()}: ${alert.message} (${alert.timestamp})`);
  });
}, 3000);

// Example 7: Environment-based Configuration
console.log('\n=== Environment-based Configuration ===');

import { ConfigUtils } from '../config/index.js';

// Create logger for current environment
const envLogger = LoggerFactory.create(ConfigUtils.createForEnvironment('env-service', '1.0.0'));

envLogger.info('Environment-based logger initialized');
envLogger.info(`Running in: ${process.env.NODE_ENV || 'development'}`);

// Example 8: Performance Optimization
console.log('\n=== Performance Optimization ===');

const perfOptLogger = LoggerFactory.create({
  service: 'perf-opt-service',
  version: '1.0.0',
  environment: 'production',
  level: LogLevel.INFO,
  enableConsole: false, // Disable console in production
  enableStructured: true,
  enableFile: true,
  filePath: './logs/perf-opt.log',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  enableCorrelationIds: true,
  enableMetrics: true
});

// Batch logging for performance
const logBatch = [];
const batchSize = 100;

for (let i = 0; i < 500; i++) {
  logBatch.push({
    message: `Batch log entry ${i}`,
    batchId: Math.floor(i / batchSize),
    timestamp: Date.now()
  });

  if (logBatch.length >= batchSize) {
    perfOptLogger.info(`Processing batch ${Math.floor(i / batchSize)}`, {
      batchSize: logBatch.length,
      totalProcessed: i + 1
    });
    logBatch.length = 0;
  }
}

// Example 9: Integration Patterns
console.log('\n=== Integration Patterns ===');

// Express.js middleware pattern
const expressMiddlewareLogger = LoggerFactory.createDefault('express-app', '1.0.0');

const mockRequest = {
  method: 'POST',
  url: '/api/users',
  headers: {
    'user-agent': 'Mozilla/5.0...',
    'x-request-id': 'req_123456'
  },
  user: { id: 'user_789' },
  session: { id: 'sess_abc123' }
};

// Simulate request middleware
expressMiddlewareLogger.setCorrelation({
  requestId: mockRequest.headers['x-request-id'],
  userId: mockRequest.user?.id,
  sessionId: mockRequest.session?.id
});

expressMiddlewareLogger.info('Request started', {
  method: mockRequest.method,
  url: mockRequest.url,
  userAgent: mockRequest.headers['user-agent']
});

// Error handling middleware
expressMiddlewareLogger.error('Request failed', new Error('Validation failed'), {
  method: mockRequest.method,
  url: mockRequest.url,
  statusCode: 400,
  validationErrors: ['Invalid email format', 'Missing required field']
});

// Example 10: Microservices Correlation
console.log('\n=== Microservices Correlation ===');

const serviceA = LoggerFactory.createDefault('service-a', '1.0.0');
const serviceB = LoggerFactory.createDefault('service-b', '1.0.0');

// Service A initiates a request
const correlationId = serviceA.startTimer('cross-service-call');
serviceA.setCorrelation({
  correlationId,
  traceId: `trace_${Date.now()}`,
  userId: 'user_123'
});

serviceA.info('Initiating cross-service call');

// Simulate network call to Service B
setTimeout(() => {
  // Service B receives the correlation
  serviceB.setCorrelation({
    correlationId,
    traceId: `trace_${Date.now()}`,
    userId: 'user_123'
  });

  serviceB.info('Processing cross-service request');
  serviceB.info('Request completed');
}, 100);

serviceA.endTimer(correlationId, {
  service: 'service-b',
  status: 'success'
});

console.log('Microservices correlation example completed');

console.log('\n=== Advanced Examples Complete ===');

import { LoggerFactory, LogLevel } from '../index.js';

// Example 1: Basic Usage
console.log('=== Basic Usage Example ===');

const basicLogger = LoggerFactory.createDefault('example-service', '1.0.0');

basicLogger.info('Application started');
basicLogger.debug('Debug information', { debug: true });
basicLogger.warn('Warning message');
basicLogger.error('Error occurred', new Error('Sample error'));

// Example 2: Structured Logging
console.log('\n=== Structured Logging Example ===');

const structuredLogger = LoggerFactory.createDefault('api-service', '2.0.0');

structuredLogger.info('User authenticated', {
  userId: '12345',
  email: 'user@example.com',
  roles: ['admin', 'user'],
  loginMethod: 'oauth',
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});

structuredLogger.error('Database query failed', new Error('Connection timeout'), {
  query: 'SELECT * FROM users WHERE id = $1',
  database: 'postgres',
  host: 'db.example.com',
  port: 5432,
  retryCount: 3,
  executionTime: 5000
});

// Example 3: Performance Tracking
console.log('\n=== Performance Tracking Example ===');

const perfLogger = LoggerFactory.createDefault('performance-service', '1.0.0');

// Manual timing
const timerId = perfLogger.startTimer('database-query');
setTimeout(() => {
  perfLogger.endTimer(timerId, {
    query: 'SELECT * FROM products',
    rows: 150,
    affectedRows: 25
  });
}, 150);

// Automatic timing with wrapper
const asyncFunction = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return 'result';
};

perfLogger
  .trackAsync('api-call', asyncFunction, {
    endpoint: '/api/data',
    method: 'GET'
  })
  .then(result => {
    console.log('Async result:', result);
  });

// Example 4: Child Loggers
console.log('\n=== Child Logger Example ===');

const parentLogger = LoggerFactory.createDefault('parent-service', '1.0.0');
parentLogger.setContext({ requestId: 'req_123', sessionId: 'sess_456' });

const childLogger = parentLogger.child({
  userId: 'user_789',
  module: 'authentication'
});

parentLogger.info('Parent log entry');
childLogger.info('Child log entry - user action');
childLogger.error('Child error - authentication failed');

// Example 5: Context Management
console.log('\n=== Context Management Example ===');

const contextLogger = LoggerFactory.createDefault('context-service', '1.0.0');

contextLogger.setContext({
  region: 'us-west-2',
  cluster: 'production',
  pod: 'api-server-123'
});

contextLogger.info('Context-aware log');

contextLogger.setContext({
  region: 'us-west-2',
  cluster: 'production',
  pod: 'api-server-456', // Updated
  deployment: 'blue-green'
});

contextLogger.info('Updated context');

contextLogger.clearContext();
contextLogger.info('Cleared context');

// Example 6: Correlation IDs
console.log('\n=== Correlation IDs Example ===');

const correlationLogger = LoggerFactory.createDefault('correlation-service', '1.0.0');

correlationLogger.setCorrelation({
  correlationId: 'corr_abc123',
  userId: 'user_456',
  sessionId: 'sess_789',
  requestId: 'req_def012'
});

correlationLogger.info('Request started');
correlationLogger.info('Processing user data');
correlationLogger.info('Request completed');

correlationLogger.setCorrelation({
  correlationId: 'corr_xyz789',
  userId: 'user_456',
  sessionId: 'sess_789',
  requestId: 'req_ghi345'
});

correlationLogger.info('New request with same user');

// Example 7: Error Handling
console.log('\n=== Error Handling Example ===');

const errorLogger = LoggerFactory.createDefault('error-service', '1.0.0');

// Different error types
errorLogger.error('Network error', new Error('ECONNREFUSED'), {
  host: 'api.example.com',
  port: 443,
  timeout: 5000
});

errorLogger.fatal('Critical system error', new Error('OUT_OF_MEMORY'), {
  memoryUsage: '95%',
  heapSize: '1.8GB',
  systemLoad: 4.5
});

// Error with context object
errorLogger.error(
  'Validation error',
  {
    field: 'email',
    value: 'invalid-email',
    message: 'Invalid email format',
    code: 'VALIDATION_ERROR'
  },
  {
    userId: '12345',
    endpoint: '/api/users'
  }
);

// Example 8: Different Log Levels
console.log('\n=== Log Levels Example ===');

const levelLogger = LoggerFactory.createDefault('level-service', '1.0.0');

levelLogger.trace('Trace message - very detailed debugging');
levelLogger.debug('Debug message - development info');
levelLogger.info('Info message - general information');
levelLogger.warn('Warning message - potential issue');
levelLogger.error('Error message - actual error');
levelLogger.fatal('Fatal message - critical system failure');

// Example 9: Tags and Metadata
console.log('\n=== Tags and Metadata Example ===');

const tagsLogger = LoggerFactory.createDefault('tags-service', '1.0.0');

tagsLogger.info('API request processed', {
  endpoint: '/api/users',
  method: 'GET',
  statusCode: 200,
  responseTime: 150,
  tags: ['api', 'http', 'success']
});

tagsLogger.warn('Slow query detected', {
  query: 'SELECT * FROM large_table',
  duration: 5000,
  threshold: 1000,
  tags: ['database', 'performance', 'slow-query']
});

// Example 10: Redacted Sensitive Data
console.log('\n=== Sensitive Data Redaction Example ===');

const secureLogger = LoggerFactory.create({
  service: 'secure-service',
  version: '1.0.0',
  environment: 'production',
  level: LogLevel.INFO,
  enableConsole: true,
  enableStructured: false,
  redactFields: ['password', 'token', 'secret', 'key', 'auth', 'ssn', 'creditcard']
});

secureLogger.info('User login attempt', {
  userId: '12345',
  email: 'user@example.com',
  password: process.env.EXAMPLE_PASSWORD || '<redacted>', // Will be redacted
  token: process.env.EXAMPLE_TOKEN || '<redacted>', // Will be redacted
  apiKey: process.env.EXAMPLE_API_KEY || '<redacted>' // Will be redacted
});

// Example 11: Metrics and Health
console.log('\n=== Metrics and Health Example ===');

const metricsLogger = LoggerFactory.createDefault('metrics-service', '1.0.0');

// Simulate some activity
for (let i = 0; i < 10; i++) {
  metricsLogger.info(`Processing item ${i}`);
}

// Get metrics
const metrics = metricsLogger.getMetrics();
console.log('Logger Metrics:', {
  totalLogs: metrics.totalLogs,
  logsByLevel: metrics.logsByLevel,
  errorRate: metrics.errorRate,
  averageLogSize: metrics.averageLogSize,
  transportErrors: metrics.transportErrors
});

// Health check
metricsLogger.health().then(isHealthy => {
  console.log('Logger Health:', isHealthy);
});

// Example 12: Cleanup
console.log('\n=== Cleanup Example ===');

const cleanupLogger = LoggerFactory.createDefault('cleanup-service', '1.0.0');

cleanupLogger.info('Service shutting down...');
cleanupLogger.warn('Cleaning up resources');

// Close the logger (important for file transports)
cleanupLogger
  .close()
  .then(() => {
    console.log('Logger closed successfully');
  })
  .catch(error => {
    console.error('Error closing logger:', error);
  });

console.log('\n=== Examples Complete ===');

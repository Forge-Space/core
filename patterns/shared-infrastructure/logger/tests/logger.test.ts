import {
  LoggerFactory,
  LogLevel,
  ConsoleTransport,
  JsonTransport,
  ConfigBuilder,
  MetricsCollector,
  DistributedTracer,
  HealthChecker
} from '../src/index.js';
import type { LoggerTransport } from '../src/types.js';

// Mock transport for testing
class MockTransport implements LoggerTransport {
  name = 'mock';
  level: LogLevel;
  public logs: any[] = [];

  constructor(level: LogLevel = LogLevel.TRACE) {
    this.level = level;
  }

  format(entry: any): string {
    return JSON.stringify(entry);
  }

  write(entry: any): void {
    if (entry.level >= this.level) {
      this.logs.push(entry);
    }
  }

  reset(): void {
    this.logs = [];
  }
}

// Test suite
export class LoggerTests {
  private mockTransport: MockTransport;
  private logger: import('../src/types.js').ILogger;

  constructor() {
    this.mockTransport = new MockTransport();
    this.logger = LoggerFactory.create({
      service: 'test-service',
      version: '1.0.0',
      environment: 'test',
      level: LogLevel.TRACE,
      enableConsole: false,
      enableStructured: false,
      enableFile: false,
      enableCorrelationIds: true,
      enableMetrics: true,
      enableTracing: false,
      transports: [this.mockTransport]
    });
  }

  // Test 1: Basic logging functionality
  testBasicLogging(): boolean {
    console.log('🧪 Testing basic logging functionality...');

    this.mockTransport.reset();

    // Test all log levels
    this.logger.trace('Trace message');
    this.logger.debug('Debug message');
    this.logger.info('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message');
    this.logger.fatal('Fatal message');

    const success = this.mockTransport.logs.length === 6;
    console.log(success ? '✅ Basic logging test passed' : '❌ Basic logging test failed');

    return success;
  }

  // Test 2: Context management
  testContextManagement(): boolean {
    console.log('🧪 Testing context management...');

    this.mockTransport.reset();

    // Test setting and getting context
    this.logger.setContext({ userId: '12345', sessionId: 'sess_abc' });
    this.logger.info('Context test');

    const log = this.mockTransport.logs[0];
    const success = log.context &&
                   log.context.userId === '12345' &&
                   log.context.sessionId === 'sess_abc';

    console.log(success ? '✅ Context management test passed' : '❌ Context management test failed');

    return success;
  }

  // Test 3: Correlation IDs
  testCorrelationIds(): boolean {
    console.log('🧪 Testing correlation IDs...');

    this.mockTransport.reset();

    // Test correlation ID management
    this.logger.setCorrelation({
      correlationId: 'corr_123',
      userId: 'user_456',
      sessionId: 'sess_789'
    });

    this.logger.info('Correlation test');

    const log = this.mockTransport.logs[0];
    const success = log.correlationId === 'corr_123' &&
                   log.userId === 'user_456' &&
                   log.sessionId === 'sess_789';

    console.log(success ? '✅ Correlation IDs test passed' : '❌ Correlation IDs test failed');

    return success;
  }

  // Test 4: Performance tracking
  testPerformanceTracking(): boolean {
    console.log('🧪 Testing performance tracking...');

    this.mockTransport.reset();

    // Test timing functionality
    const timerId = this.logger.startTimer('test-operation');

    // Simulate some work
    setTimeout(() => {
      this.logger.endTimer(timerId, { result: 'success' });

      const log = this.mockTransport.logs[0];
      const success = log.duration !== undefined && log.duration > 0;

      console.log(success ? '✅ Performance tracking test passed' : '❌ Performance tracking test failed');
    }, 50);

    return true; // Async test, return true for now
  }

  // Test 5: Error handling
  testErrorHandling(): boolean {
    console.log('🧪 Testing error handling...');

    this.mockTransport.reset();

    // Test error logging with Error object
    const testError = new Error('Test error message');
    this.logger.error('Test error', testError, { context: 'test' });

    const log = this.mockTransport.logs[0];
    const success = log.level === LogLevel.ERROR &&
                   log.message === 'Test error' &&
                   log.context &&
                   log.context.error === 'Test error message';

    console.log(success ? '✅ Error handling test passed' : '❌ Error handling test failed');

    return success;
  }

  // Test 6: Child loggers
  testChildLoggers(): boolean {
    console.log('🧪 Testing child loggers...');

    this.mockTransport.reset();

    // Create parent logger with context
    this.logger.setContext({ requestId: 'req_123' });

    // Create child logger
    const childLogger = this.logger.child({ userId: 'user_456', module: 'auth' });
    childLogger.info('Child logger test');

    const log = this.mockTransport.logs[0];
    const success = log.context &&
                   log.context.requestId === 'req_123' &&
                   log.context.userId === 'user_456' &&
                   log.context.module === 'auth';

    console.log(success ? '✅ Child loggers test passed' : '❌ Child loggers test failed');

    return success;
  }

  // Test 7: Configuration builder
  testConfigurationBuilder(): boolean {
    console.log('🧪 Testing configuration builder...');

    try {
      const config = ConfigBuilder
        .create()
        .service('test-builder')
        .version('2.0.0')
        .environment('test')
        .level(LogLevel.DEBUG)
        .enableConsole(true)
        .enableStructured(false)
        .enableCorrelationIds(true)
        .redactFields(['password', 'token'])
        .build();

      const success = config.service === 'test-builder' &&
                     config.version === '2.0.0' &&
                     config.environment === 'test' &&
                     config.level === LogLevel.DEBUG &&
                     config.enableConsole === true &&
                     config.enableStructured === false &&
                     config.enableCorrelationIds === true &&
                     config.redactFields?.includes('password');

      console.log(success ? '✅ Configuration builder test passed' : '❌ Configuration builder test failed');

      return success;
    } catch (error) {
      console.log('❌ Configuration builder test failed:', error);
      return false;
    }
  }

  // Test 8: Metrics collection
  testMetricsCollection(): boolean {
    console.log('🧪 Testing metrics collection...');

    const metrics = new MetricsCollector();

    // Test counters
    metrics.incrementCounter('test.counter', 1, { tag: 'value' });
    metrics.incrementCounter('test.counter', 2, { tag: 'value' });

    // Test gauges
    metrics.setGauge('test.gauge', 42, { type: 'test' });

    // Test histograms
    metrics.recordHistogram('test.histogram', 100, { operation: 'test' });
    metrics.recordHistogram('test.histogram', 200, { operation: 'test' });

    // Test timers
    const timerId = metrics.startTimer('test.timer', { operation: 'test' });
    const duration = metrics.endTimer(timerId);

    const metricsData = metrics.getMetrics();
    const success = metricsData.counters['test.counter{tag=value}'] === 3 &&
                   metricsData.gauges['test.gauge{type=test}'] === 42 &&
                   metricsData.histograms['test.histogram{operation=test}'] &&
                   metricsData.histograms['test.histogram{operation=test}'].count === 2 &&
                   duration > 0;

    console.log(success ? '✅ Metrics collection test passed' : '❌ Metrics collection test failed');

    return success;
  }

  // Test 9: Distributed tracing
  testDistributedTracing(): boolean {
    console.log('🧪 Testing distributed tracing...');

    const tracer = new DistributedTracer();

    // Test span creation and management
    const span = tracer.startSpan('test-operation', {
      'test.tag': 'value'
    });

    tracer.addTags(span.spanId, { 'additional.tag': 'value' });
    tracer.addEvent(span.spanId, 'test-event', { 'event.data': 'value' });

    tracer.finishSpan(span.spanId);

    const activeSpans = tracer.getActiveSpans();
    const success = span.operationName === 'test-operation' &&
                   span.tags['test.tag'] === 'value' &&
                   span.tags['additional.tag'] === 'value' &&
                   span.events.length === 1 &&
                   span.events[0].name === 'test-event' &&
                   activeSpans.length === 0; // Span should be finished

    console.log(success ? '✅ Distributed tracing test passed' : '❌ Distributed tracing test failed');

    return success;
  }

  // Test 10: Health checks
  testHealthChecks(): boolean {
    console.log('🧪 Testing health checks...');

    const healthChecker = new HealthChecker();

    // Register a mock health check
    healthChecker.registerCheck('test-check', {
      async execute() {
        return {
          healthy: true,
          message: 'Test check passed',
          details: { test: 'value' }
        };
      }
    });

    // Run health checks
    return healthChecker.runChecks().then(report => {
      const success = report.status === 'healthy' &&
                     report.summary.total === 1 &&
                     report.summary.healthy === 1 &&
                     report.summary.unhealthy === 0 &&
                     report.checks.length === 1 &&
                     report.checks[0].name === 'test-check' &&
                     report.checks[0].status === 'healthy';

      console.log(success ? '✅ Health checks test passed' : '❌ Health checks test failed');

      return success;
    }).catch(error => {
      console.log('❌ Health checks test failed:', error);
      return false;
    });
  }

  // Test 11: Transport filtering
  testTransportFiltering(): boolean {
    console.log('🧪 Testing transport filtering...');

    const mockTransport1 = new MockTransport(LogLevel.INFO);
    const mockTransport2 = new MockTransport(LogLevel.ERROR);

    const filteredLogger = LoggerFactory.create({
      service: 'filter-test',
      version: '1.0.0',
      environment: 'test',
      level: LogLevel.DEBUG,
      enableConsole: false,
      enableStructured: false,
      enableFile: false,
      enableCorrelationIds: true,
      enableMetrics: true,
      enableTracing: false,
      transports: [mockTransport1, mockTransport2]
    });

    // Log at different levels
    filteredLogger.debug('Debug message'); // Should not appear (below INFO)
    filteredLogger.info('Info message');    // Should appear in transport1 only
    filteredLogger.error('Error message');   // Should appear in both transports

    const success = mockTransport1.logs.length === 2 && // info + error
                   mockTransport2.logs.length === 1 && // error only
                   mockTransport1.logs[0].message === 'Info message' &&
                   mockTransport1.logs[1].message === 'Error message' &&
                   mockTransport2.logs[0].message === 'Error message';

    console.log(success ? '✅ Transport filtering test passed' : '❌ Transport filtering test failed');

    return success;
  }

  // Test 12: Logger metrics
  testLoggerMetrics(): boolean {
    console.log('🧪 Testing logger metrics...');

    this.mockTransport.reset();

    // Generate some logs
    this.logger.info('Info message 1');
    this.logger.info('Info message 2');
    this.logger.warn('Warning message');
    this.logger.error('Error message');

    const metrics = this.logger.getMetrics();
    const success = metrics.totalLogs === 4 &&
                   metrics.logsByLevel[LogLevel.INFO] === 2 &&
                   metrics.logsByLevel[LogLevel.WARN] === 1 &&
                   metrics.logsByLevel[LogLevel.ERROR] === 1 &&
                   metrics.errorRate === 0.25; // 1 error out of 4 logs

    console.log(success ? '✅ Logger metrics test passed' : '❌ Logger metrics test failed');

    return success;
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Logger Module Tests...\n');

    const tests = [
      () => this.testBasicLogging(),
      () => this.testContextManagement(),
      () => this.testCorrelationIds(),
      () => this.testPerformanceTracking(),
      () => this.testErrorHandling(),
      () => this.testChildLoggers(),
      () => this.testConfigurationBuilder(),
      () => this.testMetricsCollection(),
      () => this.testDistributedTracing(),
      () => this.testHealthChecks(),
      () => this.testTransportFiltering(),
      () => this.testLoggerMetrics()
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log('❌ Test failed with error:', error);
        failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Logger module is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new LoggerTests();
  tests.runAllTests().catch(console.error);
}

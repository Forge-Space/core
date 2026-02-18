import {
  ILogger,
  LogLevel,
  LogEntry,
  LoggerConfig,
  LoggerMetrics,
  CorrelationContext,
  PerformanceTracker,
  LoggerTransport
} from './types.js';
import {
  ConsoleTransport,
  JsonTransport,
  FileTransport
} from './transports.js';

/**
 * Performance Tracker Implementation
 */
class PerformanceTrackerImpl implements PerformanceTracker {
  private timers = new Map<string, { startTime: number; operation: string; context?: Record<string, any> }>();

  start(operation: string, context?: Record<string, any>): string {
    const trackingId = this.generateTrackingId();
    this.timers.set(trackingId, {
      startTime: Date.now(),
      operation,
      context: context || {}
    });
    return trackingId;
  }

  end(trackingId: string, context?: Record<string, any>): void {
    const timer = this.timers.get(trackingId);
    if (!timer) return;

    const duration = Date.now() - timer.startTime;
    this.timers.delete(trackingId);

    // This would be handled by the logger instance
    // We'll emit a performance event that the logger can capture
    this.emitPerformanceEvent({
      operation: timer.operation,
      duration,
      startTime: timer.startTime,
      endTime: Date.now(),
      context: { ...timer.context, ...context }
    });
  }

  track<T>(operation: string, fn: () => T, context?: Record<string, any>): T {
    const trackingId = this.start(operation, context);
    try {
      const result = fn();
      this.end(trackingId, { success: true });
      return result;
    } catch (error) {
      this.end(trackingId, { success: false, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async trackAsync<T>(operation: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    const trackingId = this.start(operation, context);
    try {
      const result = await fn();
      this.end(trackingId, { success: true });
      return result;
    } catch (error) {
      this.end(trackingId, { success: false, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitPerformanceEvent(event: any): void {
    // This would be handled by the logger instance
    // In a real implementation, we'd use an event emitter or callback
    (globalThis as any).__performanceEvent = event;
  }
}

/**
 * Main Logger Implementation
 */
export class Logger implements ILogger {
  private config: LoggerConfig;
  private transports: LoggerTransport[];
  private context: Record<string, any> = {};
  private correlation: CorrelationContext;
  private metrics: LoggerMetrics;
  private performanceTracker: PerformanceTrackerImpl;
  private isClosed = false;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.correlation = this.initializeCorrelation();
    this.performanceTracker = new PerformanceTrackerImpl();
    this.metrics = this.initializeMetrics();
    this.transports = this.initializeTransports();
  }

  // Logging methods
  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    const errorContext = this.processError(error);
    this.log(LogLevel.ERROR, message, { ...context, ...errorContext });
  }

  fatal(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    const errorContext = this.processError(error);
    this.log(LogLevel.FATAL, message, { ...context, ...errorContext });
  }

  // Performance tracking
  startTimer(operation: string, context?: Record<string, any>): string {
    return this.performanceTracker.start(operation, context);
  }

  endTimer(trackingId: string, context?: Record<string, any>): void {
    this.performanceTracker.end(trackingId, context);
  }

  // Context management
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): Record<string, any> {
    return { ...this.context };
  }

  clearContext(): void {
    this.context = {};
  }

  // Correlation management
  setCorrelation(correlation: Partial<CorrelationContext>): void {
    this.correlation = { ...this.correlation, ...correlation };
  }

  getCorrelation(): CorrelationContext {
    return { ...this.correlation };
  }

  clearCorrelation(): void {
    this.correlation = this.initializeCorrelation();
  }

  // Child logger
  child(context: Record<string, any>): ILogger {
    const childConfig = { ...this.config };
    const childLogger = new Logger(childConfig);
    childLogger.setContext({ ...this.context, ...context });
    childLogger.setCorrelation(this.correlation);
    return childLogger;
  }

  // Metrics and health
  getMetrics(): LoggerMetrics {
    return { ...this.metrics };
  }

  async health(): Promise<boolean> {
    try {
      // Check if transports are healthy
      for (const transport of this.transports) {
        if ('health' in transport) {
          const isHealthy = await (transport as any).health();
          if (!isHealthy) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  // Lifecycle
  async close(): Promise<void> {
    if (this.isClosed) return;

    this.isClosed = true;

    // Close transports that support closing
    await Promise.all(
      this.transports
        .filter(t => 'close' in t)
        .map(t => (t as any).close())
    );
  }

  // Private methods
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (this.isClosed || level < this.config.level) return;

    const entry = this.createLogEntry(level, message, context);
    this.updateMetrics(entry);
    this.writeToTransports(entry);
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.service,
      version: this.config.version,
      environment: this.config.environment,
      correlationId: this.correlation.correlationId,
      context: { ...this.config.defaultContext, ...this.context, ...context }
    };

    // Add optional correlation fields
    if (this.correlation.userId) entry.userId = this.correlation.userId;
    if (this.correlation.sessionId) entry.sessionId = this.correlation.sessionId;
    if (this.correlation.requestId) entry.requestId = this.correlation.requestId;

    // Add stack trace for errors
    if (level >= LogLevel.ERROR && context?.error instanceof Error) {
      entry.stackTrace = context.error.stack;
    }

    // Add duration if available
    if (context?.duration) {
      entry.duration = context.duration;
    }

    // Add tags if available
    if (context?.tags) {
      entry.tags = Array.isArray(context.tags) ? context.tags : [context.tags];
    }

    // Redact sensitive fields
    if (this.config.redactFields && this.config.redactFields.length > 0) {
      this.redactSensitiveData(entry);
    }

    return entry;
  }

  private updateMetrics(entry: LogEntry): void {
    this.metrics.totalLogs++;
    this.metrics.logsByLevel[entry.level] = (this.metrics.logsByLevel[entry.level] || 0) + 1;

    // Calculate error rate
    const errorLogs = this.metrics.logsByLevel[LogLevel.ERROR] + this.metrics.logsByLevel[LogLevel.FATAL];
    this.metrics.errorRate = this.metrics.totalLogs > 0 ? errorLogs / this.metrics.totalLogs : 0;

    // Update average log size (simplified)
    const logSize = JSON.stringify(entry).length;
    this.metrics.averageLogSize = (this.metrics.averageLogSize * (this.metrics.totalLogs - 1) + logSize) / this.metrics.totalLogs;
  }

  private writeToTransports(entry: LogEntry): void {
    for (const transport of this.transports) {
      try {
        transport.write(entry);
      } catch (error) {
        // Track transport errors but don't let them break logging
        const transportName = transport.name || 'unknown';
        this.metrics.transportErrors[transportName] = (this.metrics.transportErrors[transportName] || 0) + 1;

        // Try to log the error to console as fallback
        if (transport.name !== 'console') {
          console.error(`Transport ${transportName} failed:`, error);
        }
      }
    }
  }

  private processError(error?: Error | Record<string, any>): Record<string, any> {
    if (!error) return {};

    if (error instanceof Error) {
      return {
        error: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    if (typeof error === 'object' && error !== null) {
      return { error };
    }

    return { error: String(error) };
  }

  private redactSensitiveData(entry: LogEntry): void {
    if (!this.config.redactFields || !entry.context) return;

    for (const field of this.config.redactFields) {
      if (entry.context[field] !== undefined) {
        entry.context[field] = '[REDACTED]';
      }
    }
  }

  private initializeCorrelation(): CorrelationContext {
    return {
      correlationId: this.generateCorrelationId()
    };
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): LoggerMetrics {
    return {
      totalLogs: 0,
      logsByLevel: {} as Record<LogLevel, number>,
      errorRate: 0,
      averageLogSize: 0,
      transportErrors: {}
    };
  }

  private initializeTransports(): LoggerTransport[] {
    const transports: LoggerTransport[] = [];

    if (this.config.enableConsole) {
      transports.push(new ConsoleTransport(this.config.level));
    }

    if (this.config.enableStructured) {
      transports.push(new JsonTransport(this.config.level));
    }

    if (this.config.enableFile && this.config.filePath) {
      transports.push(new FileTransport(
        this.config.filePath,
        this.config.level,
        this.config.maxFileSize,
        this.config.maxFiles
      ));
    }

    // Add custom transports if provided
    if (this.config.transports) {
      transports.push(...this.config.transports);
    }

    return transports.length > 0 ? transports : [new ConsoleTransport(this.config.level)];
  }
}

/**
 * Logger Factory
 * Provides convenient methods to create loggers
 */
export class LoggerFactory {
  private static defaultConfig: Partial<LoggerConfig> = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableStructured: false,
    enableFile: false,
    enableCorrelationIds: true,
    enableMetrics: true,
    enableTracing: false,
    redactFields: ['password', 'token', 'secret', 'key', 'auth']
  };

  static create(config: LoggerConfig): ILogger {
    const finalConfig = { ...this.defaultConfig, ...config };
    return new Logger(finalConfig as LoggerConfig);
  }

  static createDefault(service: string, version: string = '1.0.0'): ILogger {
    return this.create({
      ...this.defaultConfig,
      service,
      version,
      environment: process.env.NODE_ENV || 'development'
    } as LoggerConfig);
  }

  static createDevelopment(service: string): ILogger {
    return this.create({
      ...this.defaultConfig,
      service,
      version: 'dev',
      environment: 'development',
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStructured: false
    } as LoggerConfig);
  }

  static createProduction(service: string, version: string): ILogger {
    return this.create({
      ...this.defaultConfig,
      service,
      version,
      environment: 'production',
      level: LogLevel.INFO,
      enableConsole: false,
      enableStructured: true,
      enableFile: true,
      filePath: `./logs/${service}.log`
    } as LoggerConfig);
  }

  static createTest(service: string): ILogger {
    return this.create({
      ...this.defaultConfig,
      service,
      version: 'test',
      environment: 'test',
      level: LogLevel.WARN,
      enableConsole: false,
      enableStructured: false
    } as LoggerConfig);
  }
}

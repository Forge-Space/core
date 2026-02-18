/**
 * Logger Level Enum
 * Defines the severity levels for logging
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

/**
 * Log Entry Interface
 * Structure for a single log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  correlationId?: string;
  service?: string;
  version?: string;
  environment?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stackTrace?: string;
  duration?: number;
  tags?: string[];
}

/**
 * Logger Transport Interface
 * Defines how log entries are output
 */
export interface LoggerTransport {
  name: string;
  level: LogLevel;
  format(entry: LogEntry): string;
  write(entry: LogEntry): Promise<void> | void;
}

/**
 * Logger Configuration Interface
 */
export interface LoggerConfig {
  level: LogLevel;
  service: string;
  version: string;
  environment: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableStructured: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  enableCorrelationIds: boolean;
  enableMetrics: boolean;
  enableTracing: boolean;
  transports?: LoggerTransport[];
  redactFields?: string[];
  defaultContext?: Record<string, any>;
}

/**
 * Logger Metrics Interface
 */
export interface LoggerMetrics {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  errorRate: number;
  averageLogSize: number;
  transportErrors: Record<string, number>;
}

/**
 * Performance Tracking Interface
 */
export interface PerformanceTracker {
  start(operation: string, context?: Record<string, any>): string;
  end(trackingId: string, context?: Record<string, any>): void;
  track<T>(operation: string, fn: () => T, context?: Record<string, any>): T;
  trackAsync<T>(operation: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T>;
}

/**
 * Correlation Context Interface
 */
export interface CorrelationContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
}

/**
 * Logger Interface
 * Main logger contract
 */
export interface ILogger {
  trace(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void;
  fatal(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void;

  // Performance tracking
  startTimer(operation: string, context?: Record<string, any>): string;
  endTimer(trackingId: string, context?: Record<string, any>): void;

  // Context management
  setContext(context: Record<string, any>): void;
  getContext(): Record<string, any>;
  clearContext(): void;

  // Correlation management
  setCorrelation(correlation: Partial<CorrelationContext>): void;
  getCorrelation(): CorrelationContext;
  clearCorrelation(): void;

  // Child logger with context
  child(context: Record<string, any>): ILogger;

  // Metrics and health
  getMetrics(): LoggerMetrics;
  health(): Promise<boolean>;

  // Lifecycle
  close(): Promise<void>;
}

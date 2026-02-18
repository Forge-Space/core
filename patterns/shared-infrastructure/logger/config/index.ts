import { LogLevel, LoggerConfig } from '../src/types.js';

/**
 * Environment-based configuration loader
 */
export class ConfigLoader {
  static loadFromEnvironment(): Partial<LoggerConfig> {
    const config: Partial<LoggerConfig> = {};

    // Basic configuration
    config.service = process.env.LOGGER_SERVICE || 'unknown-service';
    config.version = process.env.LOGGER_VERSION || '1.0.0';
    config.environment = process.env.NODE_ENV || process.env.LOGGER_ENVIRONMENT || 'development';

    // Log level
    config.level = this.parseLogLevel(process.env.LOGGER_LEVEL || process.env.LOG_LEVEL);

    // Transport configuration
    config.enableConsole = this.parseBoolean(process.env.LOGGER_ENABLE_CONSOLE || 'true');
    config.enableStructured = this.parseBoolean(process.env.LOGGER_ENABLE_STRUCTURED || 'false');
    config.enableFile = this.parseBoolean(process.env.LOGGER_ENABLE_FILE || 'false');

    // File configuration
    config.filePath = process.env.LOGGER_FILE_PATH;
    config.maxFileSize = this.parseNumber(process.env.LOGGER_MAX_FILE_SIZE, 10 * 1024 * 1024);
    config.maxFiles = this.parseNumber(process.env.LOGGER_MAX_FILES, 5);

    // Feature flags
    config.enableCorrelationIds = this.parseBoolean(
      process.env.LOGGER_ENABLE_CORRELATION || 'true'
    );
    config.enableMetrics = this.parseBoolean(process.env.LOGGER_ENABLE_METRICS || 'true');
    config.enableTracing = this.parseBoolean(process.env.LOGGER_ENABLE_TRACING || 'false');

    // Security
    const redactFields = process.env.LOGGER_REDACT_FIELDS;
    if (redactFields) {
      config.redactFields = redactFields.split(',').map(field => field.trim());
    }

    return config;
  }

  static loadFromFile(configPath: string): Partial<LoggerConfig> {
    try {
      // In a real implementation, this would read from a file
      // For now, return empty config
      console.debug(`[CONFIG] Would load config from: ${configPath}`);
      return {};
    } catch (error) {
      console.error(`[CONFIG] Failed to load config from ${configPath}:`, error);
      return {};
    }
  }

  static mergeConfigs(...configs: Partial<LoggerConfig>[]): Partial<LoggerConfig> {
    return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
  }

  private static parseLogLevel(level?: string): LogLevel {
    if (!level) return LogLevel.INFO;

    switch (level.toLowerCase()) {
      case 'trace':
        return LogLevel.TRACE;
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      case 'fatal':
        return LogLevel.FATAL;
      default:
        return LogLevel.INFO;
    }
  }

  private static parseBoolean(value?: string): boolean {
    if (!value) return false;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }

  private static parseNumber(value?: string, defaultValue: number = 0): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}

/**
 * Configuration validator
 */
export class ConfigValidator {
  static validate(config: Partial<LoggerConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.service) {
      errors.push('Service name is required');
    }

    if (!config.version) {
      errors.push('Version is required');
    }

    if (!config.environment) {
      errors.push('Environment is required');
    }

    // Log level validation
    if (config.level !== undefined && !Object.values(LogLevel).includes(config.level)) {
      errors.push('Invalid log level');
    }

    // File configuration validation
    if (config.enableFile && !config.filePath) {
      errors.push('File path is required when file logging is enabled');
    }

    if (config.maxFileSize !== undefined && config.maxFileSize <= 0) {
      errors.push('Max file size must be greater than 0');
    }

    if (config.maxFiles !== undefined && config.maxFiles <= 0) {
      errors.push('Max files must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Default configurations for different environments
 */
export class DefaultConfigs {
  static development(): Partial<LoggerConfig> {
    return {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStructured: false,
      enableFile: false,
      enableCorrelationIds: true,
      enableMetrics: true,
      enableTracing: false,
      redactFields: ['password', 'token', 'secret', 'key', 'auth'],
      defaultContext: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }

  static production(): Partial<LoggerConfig> {
    return {
      level: LogLevel.INFO,
      enableConsole: false,
      enableStructured: true,
      enableFile: true,
      filePath: './logs/app.log',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      enableCorrelationIds: true,
      enableMetrics: true,
      enableTracing: true,
      redactFields: ['password', 'token', 'secret', 'key', 'auth', 'ssn', 'creditcard'],
      defaultContext: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }

  static test(): Partial<LoggerConfig> {
    return {
      level: LogLevel.WARN,
      enableConsole: false,
      enableStructured: false,
      enableFile: false,
      enableCorrelationIds: false,
      enableMetrics: false,
      enableTracing: false,
      redactFields: ['password', 'token', 'secret', 'key', 'auth']
    };
  }

  static staging(): Partial<LoggerConfig> {
    return {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStructured: true,
      enableFile: true,
      filePath: './logs/staging.log',
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxFiles: 5,
      enableCorrelationIds: true,
      enableMetrics: true,
      enableTracing: true,
      redactFields: ['password', 'token', 'secret', 'key', 'auth'],
      defaultContext: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }
}

/**
 * Configuration builder for fluent API
 */
export class ConfigBuilder {
  private config: Partial<LoggerConfig> = {};

  static create(): ConfigBuilder {
    return new ConfigBuilder();
  }

  service(name: string): ConfigBuilder {
    this.config.service = name;
    return this;
  }

  version(version: string): ConfigBuilder {
    this.config.version = version;
    return this;
  }

  environment(env: string): ConfigBuilder {
    this.config.environment = env;
    return this;
  }

  level(level: LogLevel): ConfigBuilder {
    this.config.level = level;
    return this;
  }

  enableConsole(enable: boolean = true): ConfigBuilder {
    this.config.enableConsole = enable;
    return this;
  }

  enableStructured(enable: boolean = true): ConfigBuilder {
    this.config.enableStructured = enable;
    return this;
  }

  enableFile(filePath: string, maxSize?: number, maxFiles?: number): ConfigBuilder {
    this.config.enableFile = true;
    this.config.filePath = filePath;
    if (maxSize) this.config.maxFileSize = maxSize;
    if (maxFiles) this.config.maxFiles = maxFiles;
    return this;
  }

  enableCorrelationIds(enable: boolean = true): ConfigBuilder {
    this.config.enableCorrelationIds = enable;
    return this;
  }

  enableMetrics(enable: boolean = true): ConfigBuilder {
    this.config.enableMetrics = enable;
    return this;
  }

  enableTracing(enable: boolean = true): ConfigBuilder {
    this.config.enableTracing = enable;
    return this;
  }

  redactFields(fields: string[]): ConfigBuilder {
    this.config.redactFields = fields;
    return this;
  }

  defaultContext(context: Record<string, any>): ConfigBuilder {
    this.config.defaultContext = context;
    return this;
  }

  build(): LoggerConfig {
    const validation = ConfigValidator.validate(this.config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    return this.config as LoggerConfig;
  }
}

/**
 * Utility functions for configuration
 */
export class ConfigUtils {
  static createForEnvironment(
    service: string,
    version: string,
    environment: string = process.env.NODE_ENV || 'development'
  ): LoggerConfig {
    const envConfig = ConfigLoader.loadFromEnvironment();
    const defaultConfig = this.getDefaultConfig(environment);
    const merged = ConfigLoader.mergeConfigs(defaultConfig, envConfig, {
      service,
      version,
      environment
    });

    const validation = ConfigValidator.validate(merged);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    return merged as LoggerConfig;
  }

  private static getDefaultConfig(environment: string): Partial<LoggerConfig> {
    switch (environment.toLowerCase()) {
      case 'production':
      case 'prod':
        return DefaultConfigs.production();
      case 'test':
        return DefaultConfigs.test();
      case 'staging':
      case 'stage':
        return DefaultConfigs.staging();
      case 'development':
      case 'dev':
      default:
        return DefaultConfigs.development();
    }
  }

  static validateEnvironment(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for required environment variables
    if (!process.env.LOGGER_SERVICE && !process.env.SERVICE_NAME) {
      issues.push('LOGGER_SERVICE or SERVICE_NAME environment variable should be set');
    }

    // Check for common misconfigurations
    if (process.env.NODE_ENV === 'production' && process.env.LOGGER_ENABLE_CONSOLE === 'true') {
      issues.push('Console logging should be disabled in production');
    }

    if (process.env.LOGGER_ENABLE_FILE === 'true' && !process.env.LOGGER_FILE_PATH) {
      issues.push('LOGGER_FILE_PATH should be set when file logging is enabled');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

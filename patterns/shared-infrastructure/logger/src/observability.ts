import { LogLevel, LogEntry } from '../src/types.js';

/**
 * Metrics collection for observability
 */
export class MetricsCollector {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private timers = new Map<string, { startTime: number; count: number }>();

  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    this.counters.set(key, (this.counters.get(key) || 0) + value);
  }

  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    this.gauges.set(key, value);
  }

  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);

    // Keep only last 1000 values to prevent memory issues
    if (values.length > 1000) {
      values.shift();
    }

    this.histograms.set(key, values);
  }

  startTimer(name: string, tags?: Record<string, string>): string {
    const key = this.buildKey(name, tags);
    const timerId = `${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, { startTime: Date.now(), count: 1 });
    return timerId;
  }

  endTimer(timerId: string): number {
    const timer = this.timers.get(timerId);
    if (!timer) return 0;

    const duration = Date.now() - timer.startTime;
    this.timers.delete(timerId);

    // Extract metric name from timer ID
    const [metricName, ...tagParts] = timerId.split('_');
    const tags = this.parseTagParts(tagParts.slice(0, -2)); // Remove timestamp and random parts

    this.recordHistogram(metricName, duration, tags);

    return duration;
  }

  getMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<
      string,
      { count: number; min: number; max: number; avg: number; p95: number; p99: number }
    >;
  } {
    const histograms: Record<string, any> = {};

    for (const [key, values] of this.histograms.entries()) {
      if (values.length === 0) continue;

      const sorted = [...values].sort((a, b) => a - b);
      const count = values.length;
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const avg = values.reduce((sum, val) => sum + val, 0) / count;

      const p95Index = Math.floor(count * 0.95);
      const p99Index = Math.floor(count * 0.99);

      histograms[key] = {
        count,
        min,
        max,
        avg,
        p95: sorted[p95Index] || max,
        p99: sorted[p99Index] || max
      };
    }

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms
    };
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }

  private buildKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagPairs = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return `${name}{${tagPairs}}`;
  }

  private parseTagParts(parts: string[]): Record<string, string> {
    const tags: Record<string, string> = {};

    for (const part of parts) {
      if (part.includes('=')) {
        const [key, value] = part.split('=');
        tags[key] = value;
      }
    }

    return tags;
  }
}

/**
 * Distributed tracing implementation
 */
export class DistributedTracer {
  private activeSpans = new Map<string, TracingSpan>();
  private rootSpan?: TracingSpan;

  startSpan(name: string, context?: Record<string, any>): TracingSpan {
    const span: TracingSpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId: this.rootSpan?.spanId,
      operationName: name,
      startTime: Date.now(),
      tags: context || {},
      events: [],
      status: 'ok'
    };

    // Set as root span if none exists
    if (!this.rootSpan) {
      this.rootSpan = span;
    }

    this.activeSpans.set(span.spanId, span);
    return span;
  }

  finishSpan(spanId: string, error?: Error): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    if (error) {
      span.status = 'error';
      span.tags.error = true;
      span.tags.errorType = error.constructor.name;
      span.tags.errorMessage = error.message;
      span.events.push({
        timestamp: Date.now(),
        name: 'error',
        attributes: {
          'error.kind': error.constructor.name,
          'error.message': error.message
        }
      });
    }

    this.activeSpans.delete(spanId);

    // Clear root span if this was the last one
    if (this.activeSpans.size === 0) {
      this.rootSpan = undefined;
    }
  }

  setActiveSpan(span: TracingSpan): void {
    // In a real implementation, this would set the active span in context
    // For now, we'll just store it
    (globalThis as any).__activeSpan = span;
  }

  getActiveSpan(): TracingSpan | undefined {
    return (globalThis as any).__activeSpan;
  }

  getCurrentTraceId(): string | undefined {
    const activeSpan = this.getActiveSpan();
    return activeSpan?.traceId;
  }

  addTags(spanId: string, tags: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags = { ...span.tags, ...tags };
    }
  }

  addEvent(spanId: string, name: string, attributes?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.events.push({
        timestamp: Date.now(),
        name,
        attributes: attributes || {}
      });
    }
  }

  getActiveSpans(): TracingSpan[] {
    return Array.from(this.activeSpans.values());
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * Tracing span interface
 */
export interface TracingSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  events: TracingEvent[];
  status: 'ok' | 'error';
}

export interface TracingEvent {
  timestamp: number;
  name: string;
  attributes: Record<string, any>;
}

/**
 * Health check implementation
 */
export class HealthChecker {
  private checks = new Map<string, HealthCheck>();

  registerCheck(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<HealthReport> {
    const results: HealthCheckResult[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, check] of this.checks.entries()) {
      try {
        const startTime = Date.now();
        const result = await check.execute();
        const duration = Date.now() - startTime;

        const checkResult: HealthCheckResult = {
          name,
          status: result.healthy ? 'healthy' : 'unhealthy',
          message: result.message || '',
          duration,
          timestamp: new Date().toISOString(),
          details: result.details || {}
        };

        results.push(checkResult);

        if (!result.healthy) {
          overallStatus = 'unhealthy';
        } else if (check.status === 'degraded') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          timestamp: new Date().toISOString(),
          details: { error: String(error) }
        });
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length
      }
    };
  }
}

export interface HealthCheck {
  execute(): Promise<HealthCheckResultData>;
  status?: 'healthy' | 'degraded' | 'unhealthy';
}

export interface HealthCheckResultData {
  healthy: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  duration: number;
  timestamp: string;
  details: Record<string, any>;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
}

/**
 * Alerting system
 */
export class AlertManager {
  private rules: AlertRule[] = [];
  private alertHistory: Alert[] = [];

  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  evaluateLog(entry: LogEntry): void {
    for (const rule of this.rules) {
      if (this.matchesRule(entry, rule)) {
        const alert: Alert = {
          id: this.generateAlertId(),
          ruleName: rule.name,
          severity: rule.severity,
          message: rule.message || `Alert triggered for ${LogLevel[entry.level]}: ${entry.message}`,
          timestamp: new Date().toISOString(),
          logEntry: entry,
          context: rule.context || {}
        };

        this.alertHistory.push(alert);
        this.sendAlert(alert);
      }
    }
  }

  getAlertHistory(limit?: number): Alert[] {
    return limit ? this.alertHistory.slice(-limit) : this.alertHistory;
  }

  private matchesRule(entry: LogEntry, rule: AlertRule): boolean {
    // Check level condition
    if (rule.conditions.level && entry.level !== rule.conditions.level) {
      return false;
    }

    // Check message pattern
    if (rule.conditions.messagePattern) {
      const pattern = new RegExp(rule.conditions.messagePattern);
      if (!pattern.test(entry.message)) {
        return false;
      }
    }

    // Check context conditions
    if (rule.conditions.context) {
      for (const [key, value] of Object.entries(rule.conditions.context)) {
        if (entry.context?.[key] !== value) {
          return false;
        }
      }
    }

    // Check rate limiting
    if (rule.conditions.rateLimit) {
      const recentAlerts = this.alertHistory.filter(
        alert =>
          alert.ruleName === rule.name &&
          Date.now() - new Date(alert.timestamp).getTime() < rule.conditions.rateLimit.windowMs
      );

      if (recentAlerts.length >= rule.conditions.rateLimit.maxAlerts) {
        return false;
      }
    }

    return true;
  }

  private sendAlert(alert: Alert): void {
    // In a real implementation, this would send to alerting systems
    console.warn(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, alert);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

export interface AlertRule {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  conditions: {
    level?: LogLevel;
    messagePattern?: string;
    context?: Record<string, any>;
    rateLimit?: {
      maxAlerts: number;
      windowMs: number;
    };
  };
  context?: Record<string, any>;
}

export interface Alert {
  id: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  logEntry: LogEntry;
  context: Record<string, any>;
}

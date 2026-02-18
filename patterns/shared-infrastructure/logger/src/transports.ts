import { LoggerTransport, LogEntry, LogLevel } from './types.js';

/**
 * Console Transport
 * Outputs logs to the console with colors and formatting
 */
export class ConsoleTransport implements LoggerTransport {
  name = 'console';
  level: LogLevel;

  private colors = {
    [LogLevel.TRACE]: '\x1b[90m', // Gray
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m', // Magenta
  };

  private reset = '\x1b[0m';

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  format(entry: LogEntry): string {
    const color = this.colors[entry.level];
    const levelName = LogLevel[entry.level].padEnd(5);
    const { timestamp } = entry;
    const service = entry.service ? `[${entry.service}]` : '';
    const correlation = entry.correlationId ? `[${entry.correlationId}]` : '';

    let message = `${color}${timestamp} ${levelName}${this.reset} ${service}${correlation} ${entry.message}`;

    if (entry.duration) {
      message += ` (${entry.duration}ms)`;
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `\n${color}Context:${this.reset} ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.stackTrace) {
      message += `\n${color}Stack Trace:${this.reset}\n${entry.stackTrace}`;
    }

    return message;
  }

  write(entry: LogEntry): void {
    if (entry.level < this.level) return;

    const formatted = this.format(entry);

    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

/**
 * JSON Transport
 * Outputs logs as structured JSON for machine processing
 */
export class JsonTransport implements LoggerTransport {
  name = 'json';
  level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  write(entry: LogEntry): void {
    if (entry.level < this.level) return;

    console.log(this.format(entry));
  }
}

/**
 * File Transport
 * Outputs logs to a file with rotation support
 */
export class FileTransport implements LoggerTransport {
  name = 'file';
  level: LogLevel;
  private filePath: string;
  private maxSize: number;
  private maxFiles: number;
  private currentSize: number = 0;

  constructor(
    filePath: string,
    level: LogLevel = LogLevel.INFO,
    maxSize: number = 10 * 1024 * 1024, // 10MB
    maxFiles: number = 5
  ) {
    this.filePath = filePath;
    this.level = level;
    this.maxSize = maxSize;
    this.maxFiles = maxFiles;
  }

  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  async write(entry: LogEntry): Promise<void> {
    if (entry.level < this.level) return;

    const formatted = this.format(entry) + '\n';

    try {
      // In a real implementation, this would write to the file system
      // For now, we'll simulate file writing
      this.currentSize += formatted.length;

      if (this.currentSize > this.maxSize) {
        await this.rotateFile();
      }

      // Simulate file write
      console.debug(`[FILE] Writing to ${this.filePath}:`, formatted.trim());
    } catch (error) {
      console.error('Failed to write to file:', error);
    }
  }

  private async rotateFile(): Promise<void> {
    // In a real implementation, this would rotate the file
    console.debug(`[FILE] Rotating log file: ${this.filePath}`);
    this.currentSize = 0;
  }
}

/**
 * Remote Transport
 * Sends logs to a remote logging service
 */
export class RemoteTransport implements LoggerTransport {
  name = 'remote';
  level: LogLevel;
  private endpoint: string;
  private apiKey?: string;
  private batchSize: number;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(
    endpoint: string,
    level: LogLevel = LogLevel.INFO,
    apiKey?: string,
    batchSize: number = 10
  ) {
    this.endpoint = endpoint;
    this.level = level;
    this.apiKey = apiKey;
    this.batchSize = batchSize;

    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  write(entry: LogEntry): void {
    if (entry.level < this.level) return;

    this.buffer.push(entry);

    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.batchSize);

    try {
      // In a real implementation, this would send to the remote endpoint
      console.debug(`[REMOTE] Sending ${batch.length} logs to ${this.endpoint}`);
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error);
      // Re-add failed logs to buffer for retry
      this.buffer.unshift(...batch);
    }
  }

  async close(): Promise<void> {
    clearInterval(this.flushInterval);
    await this.flush();
  }
}

/**
 * Filtered Transport
 * Wraps another transport and filters logs based on criteria
 */
export class FilteredTransport implements LoggerTransport {
  name = 'filtered';
  level: LogLevel;
  private transport: LoggerTransport;
  private filter: (entry: LogEntry) => boolean;

  constructor(
    transport: LoggerTransport,
    filter: (entry: LogEntry) => boolean,
    level?: LogLevel
  ) {
    this.transport = transport;
    this.filter = filter;
    this.level = level ?? transport.level;
  }

  format(entry: LogEntry): string {
    return this.transport.format(entry);
  }

  write(entry: LogEntry): void {
    if (entry.level < this.level) return;

    if (this.filter(entry)) {
      this.transport.write(entry);
    }
  }
}

/**
 * Multi Transport
 * Combines multiple transports
 */
export class MultiTransport implements LoggerTransport {
  name = 'multi';
  level: LogLevel;
  private transports: LoggerTransport[];

  constructor(transports: LoggerTransport[]) {
    this.transports = transports;
    this.level = Math.min(...transports.map(t => t.level));
  }

  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  write(entry: LogEntry): void {
    if (entry.level < this.level) return;

    this.transports.forEach(transport => {
      transport.write(entry);
    });
  }

  async close(): Promise<void> {
    await Promise.all(
      this.transports
        .filter(t => 'close' in t)
        .map(t => (t as any).close())
    );
  }
}

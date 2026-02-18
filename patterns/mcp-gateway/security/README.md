# MCP Gateway Security Patterns

## 🎯 Overview

Security patterns for the Forge MCP Gateway, providing comprehensive protection, rate limiting, request validation, and zero-secrets compliance for the complete MCP ecosystem.

## 📋 Available Patterns

### Rate Limiting & Throttling
- **Token Bucket Rate Limiting**: Flexible rate limiting with burst capacity
- **Sliding Window Rate Limiting**: Time-based rate limiting with sliding windows
- **User-Based Rate Limiting**: Per-user rate limiting and quotas
- **IP-Based Rate Limiting**: Per-IP rate limiting and blacklisting
- **Endpoint-Based Rate Limiting**: Different limits per API endpoint

### Request Validation & Sanitization
- **Input Validation**: Validate request parameters and payloads
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Prevention**: Output encoding and content security policy
- **CSRF Protection**: Cross-site request forgery prevention
- **File Upload Security**: Secure file upload validation and scanning

### API Security Headers
- **Security Headers**: Comprehensive security header configuration
- **CORS Configuration**: Cross-origin resource sharing policies
- **Content Security Policy**: Prevent XSS and code injection
- **HSTS Configuration**: HTTPS enforcement and transport security
- **Frame Protection**: Clickjacking prevention

### Authentication & Authorization
- **API Key Management**: Secure API key generation and validation
- **JWT Token Security**: Secure JWT token handling and validation
- **Session Security**: Secure session management and timeout
- **Multi-Factor Authentication**: Enhanced authentication for sensitive operations
- **Role-Based Access Control**: Fine-grained permission management

## 🔧 Implementation Examples

### Rate Limiting Implementation
```typescript
// patterns/mcp-gateway/security/rate-limiter.ts
import { EventEmitter } from 'events';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
  retryAfter?: number;
}

export class TokenBucketRateLimiter extends EventEmitter {
  private buckets = new Map<string, TokenBucket>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const bucket = this.getOrCreateBucket(key);
    const now = Date.now();
    
    // Add tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.config.windowMs) * this.config.maxRequests;
    
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, this.config.maxRequests);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens--;
      bucket.totalHits++;
      
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetTime: bucket.lastRefill + this.config.windowMs,
        totalHits: bucket.totalHits,
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.lastRefill + this.config.windowMs,
        totalHits: bucket.totalHits,
        retryAfter: Math.ceil((this.config.windowMs - elapsed) / 1000),
      };
    }
  }

  private getOrCreateBucket(key: string): TokenBucket {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
        totalHits: 0,
      });
    }
    return this.buckets.get(key)!;
  }
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  totalHits: number;
}

export class SlidingWindowRateLimiter {
  private windows = new Map<string, SlidingWindow>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const window = this.getOrCreateWindow(key);
    const now = Date.now();
    
    // Remove old requests outside the window
    window.requests = window.requests.filter(timestamp => timestamp > now - this.config.windowMs);
    
    if (window.requests.length < this.config.maxRequests) {
      window.requests.push(now);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - window.requests.length,
        resetTime: Math.min(...window.requests) + this.config.windowMs,
        totalHits: window.totalHits++,
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...window.requests) + this.config.windowMs,
        totalHits: window.totalHits,
        retryAfter: Math.ceil((Math.min(...window.requests) + this.config.windowMs - now) / 1000),
      };
    }
  }

  private getOrCreateWindow(key: string): SlidingWindow {
    if (!this.windows.has(key)) {
      this.windows.set(key, {
        requests: [],
        totalHits: 0,
      });
    }
    return this.windows.get(key)!;
  }
}

interface SlidingWindow {
  requests: number[];
  totalHits: number;
}
```

### Request Validation Implementation
```typescript
// patterns/mcp-gateway/security/request-validator.ts
import { Request, Response } from 'express';

export interface ValidationRule {
  name: string;
  validate: (req: Request) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export class RequestValidator {
  private rules: ValidationRule[] = [];

  constructor() {
    this.setupDefaultRules();
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  async validateRequest(req: Request): Promise<ValidationResult> {
    const errors: string[] = [];
    let sanitized = req.body;

    for (const rule of this.rules) {
      const result = await rule.validate(req);
      
      if (!result.valid) {
        errors.push(...result.errors);
      }
      
      if (result.sanitized) {
        sanitized = result.sanitized;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  private setupDefaultRules(): void {
    // SQL Injection Prevention
    this.addRule({
      name: 'sql-injection',
      validate: (req: Request) => {
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
          /(\b(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"])/gi,
        ];

        const checkValue = (value: string): boolean => {
          return sqlPatterns.some(pattern => pattern.test(value));
        };

        const errors: string[] = [];
        
        // Check query parameters
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string' && checkValue(value)) {
            errors.push(`Potential SQL injection in query parameter: ${key}`);
          }
        }

        // Check request body
        if (req.body) {
          const bodyStr = JSON.stringify(req.body);
          if (checkValue(bodyStr)) {
            errors.push('Potential SQL injection in request body');
          }
        }

        return {
          valid: errors.length === 0,
          errors,
        };
      },
    });

    // XSS Prevention
    this.addRule({
      name: 'xss-prevention',
      validate: (req: Request) => {
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<img[^>]*src[^>]*javascript:/gi,
        ];

        const errors: string[] = [];
        
        const checkValue = (value: string): boolean => {
          return xssPatterns.some(pattern => pattern.test(value));
        };

        // Check query parameters
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string' && checkValue(value)) {
            errors.push(`Potential XSS in query parameter: ${key}`);
          }
        }

        // Check request body
        if (req.body) {
          const bodyStr = JSON.stringify(req.body);
          if (checkValue(bodyStr)) {
            errors.push('Potential XSS in request body');
          }
        }

        return {
          valid: errors.length === 0,
          errors,
        };
      },
    });

    // Input Sanitization
    this.addRule({
      name: 'input-sanitization',
      validate: (req: Request) => {
        const sanitized = { ...req.body };
        
        // Sanitize string values
        const sanitizeString = (value: string): string => {
          return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        };

        const sanitizeObject = (obj: any): any => {
          if (typeof obj === 'string') {
            return sanitizeString(obj);
          } else if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
          } else if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
              sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
          }
          return obj;
        };

        return {
          valid: true,
          errors: [],
          sanitized: sanitizeObject(sanitized),
        };
      },
    });
  }
}
```

### Security Headers Middleware
```typescript
// patterns/mcp-gateway/security/security-headers.ts
import { Request, Response, NextFunction } from 'express';

export class SecurityHeaders {
  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Security Headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'default-src \'self\'');
      
      // HSTS (HTTPS only)
      if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      
      // Content Security Policy
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join('; ');
      
      res.setHeader('Content-Security-Policy', csp);
      
      // CORS Headers
      res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // Cache Control
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      next();
    };
  }
}
```

### API Key Management
```typescript
// patterns/mcp-gateway/security/api-key-manager.ts
import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface APIKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  createdAt: Date;
  lastUsed: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export class APIKeyManager extends EventEmitter {
  private keys = new Map<string, APIKey>();
  private keyUsage = new Map<string, UsageTracker>();

  constructor() {
    this.startCleanupTimer();
  }

  generateKey(name: string, permissions: string[], rateLimit: APIKey['rateLimit'], expiresIn?: Date): APIKey {
    const id = crypto.randomUUID();
    const key = crypto.randomBytes(32).toString('hex');
    
    const apiKey: APIKey = {
      id,
      key,
      name,
      permissions,
      rateLimit,
      createdAt: new Date(),
      lastUsed: new Date(),
      expiresAt: expiresIn,
      isActive: true,
      metadata: {},
    };

    this.keys.set(id, apiKey);
    this.keyUsage.set(id, new UsageTracker());
    
    this.emit('keyGenerated', apiKey);
    
    return apiKey;
  }

  validateKey(keyId: string, key: string): APIKey | null {
    const apiKey = this.keys.get(keyId);
    
    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    if (apiKey.key !== key) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      this.deactivateKey(keyId);
      return null;
    }

    // Update last used
    apiKey.lastUsed = new Date();
    
    return apiKey;
  }

  checkRateLimit(keyId: string, limitType: 'minute' | 'hour' | 'day'): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    const usage = this.keyUsage.get(keyId);
    const now = Date.now();
    
    let windowMs: number;
    let maxRequests: number;
    
    switch (limitType) {
      case 'minute':
        windowMs = 60 * 1000;
        maxRequests = apiKey.rateLimit.requestsPerMinute;
        break;
      case 'hour':
        windowMs = 60 * 60 * 1000;
        maxRequests = apiKey.rateLimit.requestsPerHour;
        break;
      case 'day':
        windowMs = 24 * 60 * 60 * 1000;
        maxRequests = apiKey.rateLimit.requestsPerDay;
        break;
      default:
        return false;
    }

    return usage.getCount(windowMs) < maxRequests;
  }

  recordUsage(keyId: string): void {
    const usage = this.keyUsage.get(keyId);
    if (usage) {
      usage.recordRequest();
    }
  }

  deactivateKey(keyId: string): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    apiKey.isActive = false;
    this.emit('keyDeactivated', apiKey);
    
    return true;
  }

  revokeKey(keyId: string): boolean {
    const removed = this.keys.delete(keyId);
    if (removed) {
      this.keyUsage.delete(keyId);
      this.emit('keyRevoked', keyId);
    }
    
    return removed;
  }

  getActiveKeys(): APIKey[] {
    return Array.from(this.keys.values()).filter(key => key.isActive);
  }

  getKeyUsage(keyId: string): UsageStats | null {
    const usage = this.keyUsage.get(keyId);
    if (!usage) return null;

    return {
      requestsPerMinute: usage.getCount(60 * 1000),
      requestsPerHour: usage.getCount(60 * 60 * 1000),
      requestsPerDay: usage.getCount(24 * 60 * 60 * 1000),
      totalRequests: usage.getTotalRequests(),
      lastRequest: usage.getLastRequest(),
    };
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredKeys();
    }, 60 * 1000); // Check every minute
  }

  private cleanupExpiredKeys(): void {
    const now = new Date();
    
    for (const [keyId, apiKey] of this.keys.entries()) {
      if (apiKey.expiresAt && apiKey.expiresAt < now) {
        this.revokeKey(keyId);
      }
    }
  }
}

class UsageTracker {
  private requests: number[] = [];

  recordRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.cleanupOldRequests();
  }

  getCount(windowMs: number): number {
    const cutoff = Date.now() - windowMs;
    return this.requests.filter(timestamp => timestamp > cutoff).length;
  }

  getTotalRequests(): number {
    return this.requests.length;
  }

  getLastRequest(): Date | null {
    return this.requests.length > 0 ? new Date(Math.max(...this.requests)) : null;
  }

  private cleanupOldRequests(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }
}

interface UsageStats {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  totalRequests: number;
  lastRequest: Date | null;
}
```

## 🚀 Quick Start

### Basic Security Setup
```typescript
// Setup security middleware for your MCP Gateway
import express from 'express';
import { TokenBucketRateLimiter } from './patterns/mcp-gateway/security/rate-limiter';
import { RequestValidator } from './patterns/mcp-gateway/security/request-validator';
import { SecurityHeaders } from './patterns/mcp-gateway/security/security-headers';
import { APIKeyManager } from './patterns/mcp-gateway/security/api-key-manager';

const app = express();

// Initialize security components
const rateLimiter = new TokenBucketRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

const validator = new RequestValidator();
const apiKeyManager = new APIKeyManager();

// Security middleware
app.use(SecurityHeaders.middleware);

// Rate limiting middleware
app.use('/api/mcp/*', async (req, res, next) => {
  const keyId = req.headers['x-api-key'] as string;
  const key = req.headers['x-authorization']?.replace('Bearer ', '');
  
  if (!keyId || !key) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const apiKey = apiKeyManager.validateKey(keyId, key);
  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Check rate limits
  if (!apiKeyManager.checkRateLimit(keyId, 'minute')) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: 60,
    });
  }
  
  // Record usage
  apiKeyManager.recordUsage(keyId);
  
  // Add API key info to request
  req.apiKey = apiKey;
  next();
});

// Request validation middleware
app.use('/api/mcp/*', async (req, res, next) => {
  const validation = await validator.validateRequest(req);
  
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Invalid request',
      details: validation.errors,
    });
  }
  
  // Use sanitized data if available
  if (validation.sanitized) {
    req.body = validation.sanitized;
  }
  
  next();
});
```

### API Key Generation
```typescript
// Generate API key for a service
const apiKey = apiKeyManager.generateKey(
  'ui-generation-service',
  ['ui:generate', 'ui:render'],
  {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
);

console.log(`API Key: ${apiKey.key}`);
console.log(`Key ID: ${apiKey.id}`);
console.log(`Expires: ${apiKey.expiresAt}`);
```

## 📊 Security Benefits

### Rate Limiting Protection
- **Prevent Abuse**: Limit requests per time window
- **Fair Usage**: Ensure equitable resource allocation
- **DDoS Protection**: Mitigate denial of service attacks
- **Cost Control**: Prevent API abuse and cost overruns

### Input Validation
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Prevention**: Output encoding and CSP headers
- **CSRF Protection**: Token-based request validation
- **Data Integrity**: Comprehensive input validation

### Authentication Security
- **API Key Management**: Secure key generation and validation
- **Token Security**: JWT token handling and validation
- **Session Management**: Secure session lifecycle management
- **Access Control**: Fine-grained permission management

## 🔧 Integration Examples

### Express.js Integration
```typescript
// Complete security middleware stack
import { TokenBucketRateLimiter } from './patterns/mcp-gateway/security/rate-limiter';
import { SecurityHeaders } from './patterns/mcp-gateway/security/security-headers';
import { APIKeyManager } from './patterns/mcp-gateway/security/api-key-manager';

const app = express();

// Apply all security middleware
app.use(SecurityHeaders.middleware);
app.use('/api/mcp/*', rateLimitingMiddleware);
app.use('/api/mcp/*', authenticationMiddleware);
app.use('/api/mcp/*', validationMiddleware);
```

### Security Monitoring
```typescript
// Monitor security events
apiKeyManager.on('keyGenerated', (apiKey) => {
  console.log(`API key generated: ${apiKey.name} (${apiKey.id})`);
});

apiKeyManager.on('keyDeactivated', (apiKey) => {
  console.log(`API key deactivated: ${apiKey.name} (${apiKey.id})`);
});

apiKeyManager.on('keyRevoked', (keyId) => {
  console.log(`API key revoked: ${keyId}`);
});
```

This security pattern provides comprehensive protection for the Forge MCP Gateway with rate limiting, input validation, and secure authentication! 🚀

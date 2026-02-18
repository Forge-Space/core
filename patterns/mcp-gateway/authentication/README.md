# MCP Gateway Authentication Patterns

## 🎯 Overview

Authentication patterns for the Forge MCP Gateway, providing secure, centralized authentication and authorization for the entire Forge ecosystem.

## 📋 Available Patterns

### JWT Token Management
- **Token Generation**: Secure JWT token creation and signing
- **Token Validation**: Token verification and refresh mechanisms
- **Token Propagation**: Secure token passing to MCP servers
- **Token Revocation**: Secure token invalidation and blacklisting

### Authentication Strategies
- **API Key Authentication**: For service-to-service communication
- **OAuth Integration**: For third-party service integration
- **Session Management**: User session lifecycle management
- **Multi-Factor Authentication**: Enhanced security for sensitive operations

### Authorization Patterns
- **Role-Based Access Control (RBAC)**: Permission management by roles
- **Resource-Based Access Control**: Fine-grained resource permissions
- **Policy-Based Access Control**: Dynamic policy evaluation
- **Attribute-Based Access Control**: Context-aware authorization

## 🔧 Implementation Examples

### JWT Token Generation
```typescript
// patterns/mcp-gateway/authentication/jwt-token-generation.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

export class JWTTokenManager {
  private readonly secretKey: string;
  private readonly issuer: string;

  constructor(secretKey: string, issuer: string) {
    this.secretKey = secretKey;
    this.issuer = issuer;
  }

  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + (60 * 60), // 1 hour expiration
    };

    return jwt.sign(tokenPayload, this.secretKey, {
      issuer: this.issuer,
      algorithm: 'HS256',
    });
  }

  validateToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secretKey, {
        issuer: this.issuer,
        algorithms: ['HS256'],
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  refreshToken(token: string): string | null {
    const payload = this.validateToken(token);
    if (!payload) return null;

    return this.generateToken({
      userId: payload.userId,
      roles: payload.roles,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
    });
  }
}
```

### Authentication Middleware
```typescript
// patterns/mcp-gateway/authentication/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTTokenManager } from './jwt-token-generation';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
    permissions: string[];
    sessionId: string;
  };
}

export class AuthenticationMiddleware {
  constructor(private tokenManager: JWTTokenManager) {}

  authenticate() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const payload = this.tokenManager.validateToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = {
        userId: payload.userId,
        roles: payload.roles,
        permissions: payload.permissions,
        sessionId: payload.sessionId,
      };

      next();
    };
  }

  authorize(requiredPermissions: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const hasPermission = requiredPermissions.every(permission =>
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }
}
```

### Session Management
```typescript
// patterns/mcp-gateway/authentication/session-management.ts
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  metadata: Record<string, any>;
}

export class SessionManager extends EventEmitter {
  private sessions = new Map<string, Session>();
  private readonly sessionTimeout: number;

  constructor(sessionTimeout: number = 30 * 60 * 1000) { // 30 minutes
    super();
    this.sessionTimeout = sessionTimeout;
    this.startCleanupTimer();
  }

  createSession(userId: string, metadata: Record<string, any> = {}): Session {
    const session: Session = {
      id: randomUUID(),
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeout),
      metadata,
    };

    this.sessions.set(session.id, session);
    this.emit('sessionCreated', session);

    return session;
  }

  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.sessionTimeout);
    
    return session;
  }

  destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);
    this.emit('sessionDestroyed', session);

    return true;
  }

  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => {
      this.destroySession(sessionId);
    });
  }
}
```

## 🔐 Security Best Practices

### Token Security
- Use strong, randomly generated secret keys
- Implement proper token expiration (short-lived access tokens)
- Use HTTPS for all token transmission
- Implement token blacklisting for compromised tokens

### Session Security
- Use cryptographically secure session IDs
- Implement session timeout and cleanup
- Store session data securely (encrypted if needed)
- Implement session fixation protection

### Authorization Security
- Follow principle of least privilege
- Implement proper permission checking
- Use secure policy evaluation
- Log all authorization decisions

## 🚀 Quick Start

### Basic Authentication Setup
```typescript
// Setup authentication in your MCP Gateway
import { JWTTokenManager } from './patterns/mcp-gateway/authentication/jwt-token-generation';
import { AuthenticationMiddleware } from './patterns/mcp-gateway/authentication/auth-middleware';
import { SessionManager } from './patterns/mcp-gateway/authentication/session-management';

const tokenManager = new JWTTokenManager(
  process.env.JWT_SECRET!,
  'forge-mcp-gateway'
);

const authMiddleware = new AuthenticationMiddleware(tokenManager);
const sessionManager = new SessionManager();

// Apply authentication middleware
app.use('/api/mcp', authMiddleware.authenticate());
app.use('/api/mcp/admin', authMiddleware.authorize(['admin']));
```

### Token Generation Example
```typescript
// Generate token for authenticated user
const token = tokenManager.generateToken({
  userId: 'user-123',
  roles: ['user', 'developer'],
  permissions: ['mcp:read', 'mcp:write'],
  sessionId: sessionManager.createSession('user-123').id,
});
```

## 📊 Performance Considerations

### Token Validation
- Cache token validation results for frequently used tokens
- Use efficient token parsing algorithms
- Implement token validation at edge locations

### Session Management
- Use in-memory session storage for high performance
- Implement session cleanup to prevent memory leaks
- Consider distributed session storage for scalability

### Authorization Caching
- Cache permission evaluation results
- Use efficient permission lookup algorithms
- Implement permission invalidation on role changes

## 🔧 Integration with MCP Servers

### Token Propagation
```typescript
// Forward authentication to MCP servers
app.use('/api/mcp/*', async (req, res, next) => {
  if (req.user) {
    // Add user context to MCP server request
    req.headers['x-user-id'] = req.user.userId;
    req.headers['x-user-roles'] = req.user.roles.join(',');
    req.headers['x-user-permissions'] = req.user.permissions.join(',');
  }
  next();
});
```

### Service-to-Service Authentication
```typescript
// API key authentication for MCP servers
export class ServiceAuthMiddleware {
  private readonly apiKeys = new Map<string, { service: string; permissions: string[] }>();

  constructor() {
    // Register API keys for MCP services
    this.registerApiKey('mcp-ui-service-123', 'mcp-ui-service', ['ui:generate', 'ui:render']);
    this.registerApiKey('mcp-translation-service-456', 'mcp-translation-service', ['translate:text']);
  }

  authenticateService() {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey || !this.apiKeys.has(apiKey)) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const serviceInfo = this.apiKeys.get(apiKey)!;
      req.service = {
        name: serviceInfo.service,
        permissions: serviceInfo.permissions,
      };

      next();
    };
  }
}
```

## 📋 Monitoring and Logging

### Authentication Events
```typescript
// Monitor authentication events
sessionManager.on('sessionCreated', (session) => {
  console.log(`Session created: ${session.id} for user ${session.userId}`);
});

sessionManager.on('sessionDestroyed', (session) => {
  console.log(`Session destroyed: ${session.id} for user ${session.userId}`);
});
```

### Security Logging
```typescript
// Log security events
export class SecurityLogger {
  logAuthenticationAttempt(userId: string, success: boolean, ip: string) {
    console.log({
      event: 'authentication_attempt',
      userId,
      success,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  logAuthorizationCheck(userId: string, resource: string, granted: boolean) {
    console.log({
      event: 'authorization_check',
      userId,
      resource,
      granted,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 🔍 Testing Authentication

### Unit Testing
```typescript
// Test JWT token generation and validation
describe('JWTTokenManager', () => {
  let tokenManager: JWTTokenManager;

  beforeEach(() => {
    tokenManager = new JWTTokenManager('test-secret', 'test-issuer');
  });

  test('should generate valid token', () => {
    const token = tokenManager.generateToken({
      userId: 'test-user',
      roles: ['user'],
      permissions: ['read'],
      sessionId: 'session-123',
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should validate valid token', () => {
    const token = tokenManager.generateToken({
      userId: 'test-user',
      roles: ['user'],
      permissions: ['read'],
      sessionId: 'session-123',
    });

    const payload = tokenManager.validateToken(token);
    expect(payload).toBeTruthy();
    expect(payload!.userId).toBe('test-user');
  });

  test('should reject invalid token', () => {
    const payload = tokenManager.validateToken('invalid-token');
    expect(payload).toBeNull();
  });
});
```

This authentication pattern provides a secure, scalable foundation for the Forge MCP Gateway ecosystem! 🚀

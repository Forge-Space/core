# Cloud-Native Patterns

Patterns for building and deploying cloud-native applications using serverless, microservices, and container-based architectures.

## 📁 Directory Structure

```text
cloud-native/
├── serverless/         # Serverless function patterns
├── microservices/      # Microservice architecture patterns
├── service-mesh/       # Service mesh and observability
├── event-driven/       # Event-driven architecture patterns
└── README.md
```

## 🎯 Available Patterns

### Serverless

- **Function-as-a-Service**: AWS Lambda, Google Cloud Functions, Azure Functions
- **Edge Functions**: Cloudflare Workers, Vercel Edge, Supabase Edge Functions
- **Scheduled Jobs**: Cron-based serverless execution
- **Event Triggers**: Queue, storage, and HTTP-triggered functions

### Microservices

- **Service Decomposition**: Domain-driven service boundaries
- **API Gateway**: Centralized routing, auth, and rate limiting
- **Service Discovery**: Health checks and dynamic routing
- **Circuit Breaker**: Resilience and fault tolerance patterns

### Event-Driven

- **Message Queue**: Async communication via queues (SQS, RabbitMQ, Redis)
- **Event Streaming**: High-throughput event processing (Kafka, Kinesis)
- **CQRS**: Command/Query Responsibility Segregation
- **Saga Pattern**: Distributed transaction management

## 🚀 Serverless Patterns

### AWS Lambda — Node.js Handler Pattern

```javascript
// Structured Lambda handler with error handling and logging
const { Logger } = require('@aws-lambda-powertools/logger');
const { Tracer } = require('@aws-lambda-powertools/tracer');
const { Metrics, MetricUnits } = require('@aws-lambda-powertools/metrics');

const logger = new Logger({ serviceName: '{{SERVICE_NAME}}' });
const tracer = new Tracer({ serviceName: '{{SERVICE_NAME}}' });
const metrics = new Metrics({ namespace: '{{NAMESPACE}}', serviceName: '{{SERVICE_NAME}}' });

exports.handler = async (event, context) => {
  logger.addContext(context);
  logger.info('Processing event', { eventType: event.source });

  try {
    const result = await processEvent(event);

    metrics.addMetric('SuccessfulInvocations', MetricUnits.Count, 1);
    metrics.publishStoredMetrics();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    logger.error('Handler error', { error: error.message });
    metrics.addMetric('FailedInvocations', MetricUnits.Count, 1);
    metrics.publishStoredMetrics();

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function processEvent(event) {
  // Business logic here
  return { processed: true, timestamp: new Date().toISOString() };
}
```

### Supabase Edge Function Pattern

```typescript
// Supabase Edge Function with auth and structured response
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface RequestBody {
  action: string;
  payload: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    const result = await handleAction(body.action, body.payload, supabase);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function handleAction(action: string, payload: Record<string, unknown>, supabase: unknown) {
  // Route to action handlers
  return { action, processed: true };
}
```

## 🏗️ Microservices Patterns

### Circuit Breaker

```javascript
// Circuit breaker implementation for service resilience
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 60s
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN — service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return { state: this.state, failureCount: this.failureCount };
  }
}

// Usage
const breaker = new CircuitBreaker({ failureThreshold: 3, timeout: 30000 });

async function callExternalService(data) {
  return breaker.call(() => fetch('https://api.example.com/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  }));
}
```

### Health Check Endpoint

```javascript
// Standardized health check pattern for microservices
const express = require('express');
const app = express();

app.get('/health', async (req, res) => {
  const checks = await runHealthChecks();
  const status = checks.every(c => c.status === 'ok') ? 'healthy' : 'degraded';
  const httpStatus = status === 'healthy' ? 200 : 503;

  res.status(httpStatus).json({
    status,
    version: process.env.APP_VERSION || '0.0.0',
    timestamp: new Date().toISOString(),
    checks
  });
});

app.get('/ready', async (req, res) => {
  const ready = await isReady();
  res.status(ready ? 200 : 503).json({ ready });
});

async function runHealthChecks() {
  return Promise.all([
    checkDatabase(),
    checkCache(),
    checkExternalDependencies()
  ]);
}

async function checkDatabase() {
  try {
    // await db.query('SELECT 1');
    return { name: 'database', status: 'ok' };
  } catch {
    return { name: 'database', status: 'error', message: 'Database unreachable' };
  }
}

async function checkCache() {
  try {
    // await redis.ping();
    return { name: 'cache', status: 'ok' };
  } catch {
    return { name: 'cache', status: 'error', message: 'Cache unreachable' };
  }
}

async function checkExternalDependencies() {
  return { name: 'external-apis', status: 'ok' };
}

async function isReady() {
  return true; // Check if app has finished initializing
}
```

## 📨 Event-Driven Patterns

### Message Queue Consumer

```javascript
// Resilient queue consumer with dead-letter handling
class QueueConsumer {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.handlers = new Map();
  }

  register(eventType, handler) {
    this.handlers.set(eventType, handler);
    return this;
  }

  async process(message) {
    const { type, payload, attempt = 1 } = message;
    const handler = this.handlers.get(type);

    if (!handler) {
      console.warn(`No handler registered for event type: ${type}`);
      return { status: 'skipped', reason: 'no_handler' };
    }

    try {
      await handler(payload);
      return { status: 'processed', type, attempt };
    } catch (error) {
      if (attempt < this.maxRetries) {
        await this.delay(this.retryDelay * attempt);
        return this.process({ ...message, attempt: attempt + 1 });
      }
      await this.sendToDeadLetter(message, error);
      return { status: 'dead_lettered', type, error: error.message };
    }
  }

  async sendToDeadLetter(message, error) {
    console.error('Message sent to dead-letter queue', { message, error: error.message });
    // Implement DLQ logic here
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const consumer = new QueueConsumer({ maxRetries: 3 });
consumer
  .register('user.created', async (payload) => { /* handle user created */ })
  .register('order.placed', async (payload) => { /* handle order placed */ });
```

## 🔒 Security Considerations

- All service credentials use `{{PLACEHOLDER}}` syntax — never hardcode
- Enforce mTLS between microservices in production
- Apply least-privilege IAM roles for serverless functions
- Validate and sanitize all event payloads before processing
- Use secrets managers (AWS Secrets Manager, Vault) for runtime secrets

## 📊 Performance Targets

| Pattern | Target |
| --- | --- |
| Serverless cold start | < 500ms |
| Serverless warm invocation | < 50ms |
| Circuit breaker response (open) | < 1ms |
| Health check response | < 100ms |
| Queue message processing | < 5 seconds (p99) |

## 🔗 Related Patterns

- [`patterns/docker/`](../docker/) — Container patterns
- [`patterns/security/`](../security/) — Auth and middleware
- [`patterns/shared-infrastructure/logger/`](../shared-infrastructure/logger/) — Structured logging
- [`patterns/plugin-system/`](../plugin-system/) — Extensibility patterns

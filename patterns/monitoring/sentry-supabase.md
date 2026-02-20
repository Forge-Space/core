# Sentry Supabase Monitoring Pattern

## Overview
Sentry error tracking and performance monitoring with Supabase integration for the UIForge ecosystem.

## Category
Monitoring

## Tags
sentry, supabase, monitoring, error-tracking, performance

## Framework Support
- Python (mcp-gateway)
- Node.js (uiforge-mcp)
- Next.js (uiforge-webapp)

## Dependencies

### Required
- sentry
- supabase

### Optional
- nextjs
- python
- nodejs

## Configuration

### Environment Variables

#### Core Configuration
- `SENTRY_DSN` (string, required): Sentry Data Source Name
- `SENTRY_ORG` (string, optional): Sentry organization
- `SENTRY_PROJECT` (string, optional): Sentry project name
- `SENTRY_ENVIRONMENT` (string, default: development): Environment (development/staging/production)
- `SENTRY_SAMPLE_RATE` (number, default: 0.1): Transaction sampling rate (0-1)
- `SENTRY_PROFILES_SAMPLE_RATE` (number, default: 0.05): Profiling sampling rate (0-1)

#### Supabase Configuration
- `SUPABASE_URL` (string, required): Supabase project URL
- `SUPABASE_KEY` (string, required): Supabase anonymous key

#### Next.js Public Variables
- `NEXT_PUBLIC_SENTRY_DSN` (string, required): Public Sentry DSN for client-side
- `NEXT_PUBLIC_SUPABASE_URL` (string, required): Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (string, required): Public Supabase anonymous key

## Setup Steps

### 1. Set up Self-Hosted Sentry
Deploy self-hosted Sentry instance using Docker Compose:
```bash
cd sentry
cp .env.example .env
# Update .env with your configuration
./setup.sh
```

### 2. Configure Environment Variables
Set up environment variables for each project in `.env.local`

### 3. Install Dependencies

#### Python (mcp-gateway)
```bash
pip install sentry-sdk[fastapi] structlog psycopg2-binary
```

#### Node.js (uiforge-mcp)
```bash
npm install @sentry/node @sentry/tracing @supabase/sentry-js-integration
```

#### Next.js (uiforge-webapp)
```bash
npm install @sentry/nextjs @supabase/sentry-js-integration
```

### 4. Initialize Sentry
Sentry is automatically initialized when applications start.

## Features

### Error Tracking
Capture and analyze errors across all applications
- **Python Implementation**: `tool_router/sentry_integration.py`
- **Node.js Implementation**: `src/lib/sentry.ts`
- **Next.js Implementation**: `src/lib/sentry.ts`

### Performance Monitoring
Track application performance and database queries
- **Python Implementation**: `tool_router/sentry_integration.py`
- **Node.js Implementation**: `src/lib/sentry.ts`
- **Next.js Implementation**: `src/lib/sentry.ts`

### Supabase Integration
Monitor Supabase database operations, authentication, and storage
- **Python Implementation**: `tool_router/sentry_integration.py`
- **Node.js Implementation**: `src/lib/sentry.ts`
- **Next.js Implementation**: `src/lib/sentry.ts`

### Distributed Tracing
Track requests across microservices
- **Python Implementation**: `tool_router/sentry_integration.py`
- **Node.js Implementation**: `src/lib/sentry.ts`
- **Next.js Implementation**: `src/lib/sentry.ts`

### Real-time Alerts
Get notified about critical issues immediately
- **Implementation**: Sentry Dashboard

## Monitoring Capabilities

### Database Operations
Monitor all database operations with automatic query logging
- **Metrics**: query_latency, error_rate, slow_queries, connection_health

### Authentication
Track authentication events and failures
- **Metrics**: login_success_rate, login_failure_rate, session_duration

### Storage
Monitor file operations and storage usage
- **Metrics**: upload_success_rate, download_speed, storage_usage

### AI Operations
Track AI model usage and performance
- **Metrics**: model_response_time, token_usage, success_rate

## Alert Configuration

### Error Rate Alert
- **Condition**: Error rate > 5% over 5 minutes
- **Severity**: critical

### Performance Alert
- **Condition**: P95 latency > 2 seconds
- **Severity**: warning

### Database Alert
- **Condition**: Connection failures > 3/minute
- **Severity**: critical

### Authentication Alert
- **Condition**: Failed sign-ins > 10/minute
- **Severity**: warning

## Best Practices

### Environment Configuration
- Use separate Sentry projects for each environment
- Configure appropriate sampling rates for production
- Never commit sensitive credentials to version control

### Error Handling
- Add meaningful context to errors
- Use structured logging for better searchability
- Filter out expected errors to reduce noise

### Performance Monitoring
- Monitor database query performance
- Track API response times
- Set appropriate thresholds for alerts

### Security
- Sanitize sensitive data before sending to Sentry
- Use environment variables for configuration
- Regularly review Sentry access permissions

## Troubleshooting

### Common Issues

#### Sentry not receiving events
- Check DSN configuration
- Verify network connectivity
- Review Sentry logs

#### Supabase integration not working
- Verify Supabase credentials
- Check Supabase integration initialization
- Review browser console for errors

#### Performance monitoring not working
- Verify tracing configuration
- Check sampling rates
- Review transaction names

## Maintenance

### Regular Tasks
- Review error trends weekly
- Update Sentry SDK dependencies
- Monitor Sentry usage and costs
- Backup Sentry configuration and data

### Performance Optimization
- Adjust sampling rates based on traffic
- Refine error filtering to reduce noise
- Set appropriate data retention periods
- Optimize Sentry indexes for better performance

## Security Considerations
- Ensure no sensitive data is sent to Sentry
- Limit Sentry dashboard access to authorized users
- Use HTTPS for all Sentry communications
- Ensure compliance with data protection regulations

## Documentation

### Main Documentation
- `SENTRY_INTEGRATION.md`

### Environment Templates
- `.env.sentry.example`

### Implementation Guides
- Python integration: `tool_router/sentry_integration.py`
- Node.js integration: `src/lib/sentry.ts`
- Next.js integration: `src/lib/sentry.ts`

## Support Resources
- Sentry Documentation: https://docs.sentry.io/
- Supabase Integration Guide: https://supabase.com/docs/guides/platform/sentry
- UIForge Documentation
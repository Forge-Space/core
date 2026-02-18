# Forge Patterns Documentation

## 📚 Documentation Structure

### 🎯 Project Overview

- [Project Context](project/PROJECT_CONTEXT.MD) - Complete project guide and
  context
- [Getting Started](project/getting-started.md) - Quick start guide for new
  users

### 🏗️ Architecture

- [Architecture Decisions](architecture-decisions/) - ADRs and design decisions
  - [Ecosystem Design](architecture-decisions/ADR-001-ecosystem-design.md)
  - [Gateway Central Hub](architecture-decisions/ADR-002-gateway-central-hub.md)
  - [MCP Server Design](architecture-decisions/ADR-003-mcp-server-design.md)
  - [Webapp Architecture](architecture-decisions/ADR-004-webapp-architecture.md)
  - [Integration Patterns](architecture-decisions/ADR-005-integration-patterns.md)
  - [Centralized Feature Toggles](architecture-decisions/ADR-006-centralized-feature-toggles.md)
- [Ecosystem Overview](ecosystem/) - System architecture and integration
  - [Architecture](ecosystem/ARCHITECTURE.md)
  - [Integration Guide](ecosystem/INTEGRATION_GUIDE.md)
  - [Overview](ecosystem/OVERVIEW.md)

### 📖 Guides & Standards

- [User Guides](guides/) - Deployment and user journey guides
  - [Deployment Playbook](guides/DEPLOYMENT_PLAYBOOK.md)
  - [Developer Onboarding](guides/DEVELOPER_ONBOARDING.md)
  - [Troubleshooting Guide](guides/TROUBLESHOOTING_GUIDE.md)
  - [User Journey](guides/USER_JOURNEY.md)
- [Development Standards](standards/) - Coding and security standards
  - [Development Standards](standards/DEVELOPMENT.md)
  - [Security Standards](standards/SECURITY.md)
- [Operations](operations/) - Maintenance and automation
  - [Maintenance Automation](operations/MAINTENANCE_AUTOMATION.md)

### 🔧 Pattern Documentation

- [UI/UX Development Patterns](patterns/ui-ux-development/) - Web application
  patterns
- [MCP Gateway Patterns](patterns/mcp-gateway/) - Gateway architecture patterns
- [MCP Server Patterns](patterns/mcp-servers/) - AI-powered server patterns
- [Shared Infrastructure Patterns](patterns/shared-infrastructure/) - Common
  infrastructure patterns

### 📦 Release History

- [v1.0.0 Release](archive/implementation-summaries/RELEASE_V1.0.0.md) - Initial
  release

## 🚀 Quick Navigation

### For Web Developers

1. **Start Here**: [Project Context](project/PROJECT_CONTEXT.MD)
2. **Code Quality**: See `../patterns/code-quality/`
3. **Docker Patterns**: See `../patterns/docker/`
4. **Cost Monitoring**: See `../patterns/cost/`
5. **Logging**: See `../patterns/shared-infrastructure/logger/`

### For MCP Developers

1. **Gateway Architecture**:
   [Gateway Central Hub](architecture-decisions/ADR-002-gateway-central-hub.md)
2. **Server Design**:
   [MCP Server Design](architecture-decisions/ADR-003-mcp-server-design.md)
3. **Sleep Architecture**: See
   `../patterns/shared-infrastructure/sleep-architecture/`
4. **Logging & Observability**: See `../patterns/shared-infrastructure/logger/`

### For Project Managers

1. **Project Overview**: [Project Context](project/PROJECT_CONTEXT.MD)
2. **Architecture**: [Ecosystem Overview](ecosystem/OVERVIEW.md)
3. **Deployment**: [Deployment Playbook](guides/DEPLOYMENT_PLAYBOOK.md)

## 📋 Pattern Categories

### 🎨 UI/UX Development Patterns

- **Code Quality**: ESLint, Prettier, TypeScript configurations
- **Docker**: Containerization for Node.js, Python, Next.js
- **Cost Monitoring**: Development environment cost tracking
- **Feature Toggles**: Feature flag management

### 🤖 MCP Gateway & Server Patterns

- **Gateway Architecture**: Central authentication, routing, authority
- **Server Design**: AI-powered UI generation patterns
- **Sleep Architecture**: Serverless-like sleep/wake patterns

### 🔧 Shared Infrastructure Patterns

- **Logger Module**: Structured logging, observability, distributed tracing
- **Docker Optimization**: Multi-stage builds and lightweight containers
- **Sleep Architecture**: Resource optimization patterns

## 🎯 Getting Started

### New to Forge Patterns?

1. Read [Project Context](project/PROJECT_CONTEXT.MD) for overview
2. Check [Getting Started](project/getting-started.md) for quick setup
3. Explore pattern categories based on your needs
4. Follow integration guides for your use case

### Setting Up a New Project?

1. Bootstrap with: `./scripts/bootstrap/project.sh my-project node`
2. Apply patterns from `../patterns/`
3. Configure for your specific needs
4. Follow validation procedures

### Integrating MCP Services?

1. Review
   [Gateway Architecture](architecture-decisions/ADR-002-gateway-central-hub.md)
2. Implement
   [Server Design](architecture-decisions/ADR-003-mcp-server-design.md)
3. Add observability with the
   [Logger Module](../patterns/shared-infrastructure/logger/README.md)

## 🔍 Search & Discovery

Looking for something specific?

- **UI Patterns**: Check `../patterns/code-quality/`, `../patterns/docker/`
- **MCP Patterns**: Check `../patterns/mcp-gateway/`, `../patterns/mcp-servers/`
- **Architecture**: Check `architecture-decisions/` and `ecosystem/`
- **Guides**: Check `guides/` for step-by-step instructions
- **Logging**: Check `../patterns/shared-infrastructure/logger/`

---

_Last updated: February 2026_

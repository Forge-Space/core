# UIForge Patterns

Shared configuration, workflows, and architectural patterns for the UIForge ecosystem with zero secrets and comprehensive security.

## 🎯 Overview

UIForge Patterns provides a comprehensive set of shared configurations, workflows, and architectural patterns designed to ensure consistency, security, and high-quality code across all UIForge projects.

### Key Features

- 🔒 **Zero Secrets**: Public repository with comprehensive security validation
- 🏗️ **Architectural Patterns**: Proven patterns for scalable applications
- 🔄 **Automation**: Scripts and workflows for consistent project setup
- 📊 **Quality Standards**: 80% test coverage, linting, and security scanning
- 🛡️ **Security First**: Built-in security scanning and validation
- 🐳 **Docker Patterns**: Containerization and deployment patterns

## 📋 Projects Using These Patterns

- **mcp-gateway**: Python/Node.js MCP gateway with comprehensive CI/CD
- **uiforge-webapp**: Next.js web application with multi-environment deployment
- **uiforge-mcp**: Node.js MCP server with security-focused workflows

## � Documentation

For complete documentation, see our **[Documentation Hub](docs/README.md)** which includes:

- **[Project Context](docs/project/PROJECT_CONTEXT.MD)** - Complete project guide and context
- **[Implementation Reports](docs/reports/)** - Integration and analysis reports
- **[Pattern Documentation](docs/patterns/)** - All pattern documentation
- **[Architecture Decisions](docs/architecture-decisions/)** - System design decisions
- **[User Guides](docs/guides/)** - Deployment and user journey guides
- **[Development Standards](docs/standards/)** - Coding and security standards

## �🚀 Quick Start

### Bootstrap a New Project

```bash
# Clone the patterns repository
git clone https://github.com/LucasSantana-Dev/uiforge-patterns.git
cd uiforge-patterns

# Bootstrap a new project with Docker support
./scripts/bootstrap/project.sh my-new-project node

# Or for Python projects
./scripts/bootstrap/project.sh my-python-project python

# Or for Next.js projects
./scripts/bootstrap/project.sh my-nextjs-app nextjs
```

### Apply Patterns to Existing Project

```bash
# Copy patterns to your project
cp -r patterns/code-quality/eslint/base.config.js .eslintrc.js
cp -r patterns/code-quality/prettier/base.config.json .prettierrc.json
cp -r patterns/coverage/jest.config.template.js jest.config.js
cp -r patterns/coverage/codecov.template.yml .codecov.yml

# Add Docker patterns
cp patterns/docker/Dockerfile.node.template Dockerfile
cp patterns/docker/docker-compose.dev.yml docker-compose.yml
cp patterns/docker/.dockerignore .dockerignore

# Set up Git hooks
cp patterns/git/pre-commit/base.sh .git/hooks/pre-commit
cp patterns/git/commit-msg/conventional.sh .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit .git/hooks/commit-msg
```

## 📁 Repository Structure

```
uiforge-patterns/
├── .github/
│   ├── workflows/          # CI/CD workflow templates
│   └── templates/          # GitHub templates (PR, issues)
├── patterns/
│   ├── code-quality/       # ESLint, Prettier configurations
│   ├── git/               # Git hooks and workflows
│   ├── security/          # Security patterns and env templates
│   ├── coverage/          # Test coverage configurations
│   └── docker/            # Docker and containerization patterns
├── rules/                  # ✅ NEW: Development rules and guidelines
│   ├── README.md          # Rules library overview
│   ├── agent-rules.md     # Core agent behavior rules
│   ├── security-secrets.md # Security and secrets management
│   ├── testing-quality.md  # Testing standards and QA
│   ├── ci-cd.md           # CI/CD pipeline standards
│   └── [35+ rule files]   # Comprehensive rule library
├── workflows/              # ✅ NEW: Development workflows and procedures
│   ├── README.md          # Workflows library overview
│   ├── quality-checks.md  # Quality validation workflow
│   ├── deploy-checklist.md # Deployment preparation
│   ├── skill-*.md         # Specialized skill workflows
│   └── [16+ workflow files] # Complete workflow library
├── skills/                 # ✅ NEW: Specialized development skills
│   ├── README.md          # Skills library overview
│   ├── code-generation-templates.md # Code generation expertise
│   ├── design-output.md   # System design skills
│   ├── docker-deployment.md # Docker deployment expertise
│   └── [5+ skill files]    # Expert-level capabilities
├── plans/                  # ✅ NEW: Project plans and documentation
│   ├── README.md          # Plans library overview
│   ├── high-efficiency-docker-standards-c1f908.md
│   └── [5+ plan files]    # Comprehensive project plans
├── scripts/
│   ├── security/          # Security validation scripts
│   ├── bootstrap/         # Project bootstrap scripts
│   └── sync/             # Pattern synchronization scripts
└── docs/                 # Comprehensive documentation
```

## 🔧 Available Patterns

### Code Quality Patterns

#### ESLint Configuration
```javascript
// Base ESLint config for TypeScript projects
module.exports = {
  root: true,
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  // ... comprehensive rules
};
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Docker Patterns

#### **NEW**: High-Efficiency Docker Standards
```yaml
# Three-state service model with sleep/wake architecture
services:
  [service-name]:
    resources:
      memory: "512M"
      cpu: "0.5"
      memory_reservation: "256M"
    sleep_policy:
      enabled: true
      idle_timeout: 300
      priority: "normal"
    auto_start: false
```

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:22-alpine AS builder
# ... build process

# Production stage
FROM node:22-alpine AS runtime
# ... optimized production image
```

#### Docker Compose Development
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: npm run dev
```

### Test Coverage Patterns

#### Jest Configuration (TypeScript)
```javascript
module.exports = {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Codecov Configuration
```yaml
codecov:
  coverage:
    status:
      project:
        default:
          target: 80%
          threshold: 1%
```

### Git Workflow Patterns

#### Pre-commit Hook
```bash
#!/bin/bash
# Comprehensive pre-commit validation
echo "🚀 Running UIForge pre-commit validations..."
# Security validation, linting, testing, etc.
```

#### Conventional Commits
```bash
# Enforces conventional commit format
# feat, fix, docs, style, refactor, test, chore, etc.
```

### Security Patterns

#### Environment Template
```bash
# SECURITY NOTICE: PUBLIC REPOSITORY TEMPLATE
JWT_SECRET_KEY=REPLACE_WITH_STRONG_SECRET
DATABASE_URL=REPLACE_WITH_DATABASE_URL
API_KEY=REPLACE_WITH_API_KEY
```

#### Security Validation
```bash
# Automated secret detection and validation
./scripts/security/validate-no-secrets.sh
./scripts/security/validate-placeholders.sh
```

## 🐳 Docker Development

### Quick Start with Docker

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop environment
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -t my-app .

# Run production container
docker run -p 3000:3000 my-app

# Or use production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Available Docker Patterns

- **🆕 High-Efficiency Standards**: Serverless-like efficiency with sleep/wake architecture
- **Multi-stage builds**: Optimized production images
- **Development environments**: Hot reload and debugging
- **Production deployments**: Scaling and monitoring
- **Security best practices**: Non-root users, minimal images
- **Resource Optimization**: 50-80% memory reduction, 80-95% CPU reduction
- **Fast Wake Times**: ~100-200ms vs 2-5 second cold starts
- **Costless Scalability**: Serverless efficiency with container benefits

### 📋 **Rules Library** (35+ Rules)

#### **Core Development Rules**
- **agent-rules.md**: Code partner philosophy and minimal changes
- **documentation-first.md**: Documentation-driven development
- **error-handling.md**: Consistent error handling patterns

#### **Code Quality & Standards**
- **code-quality-analysis.md**: Comprehensive code quality standards
- **testing-quality.md**: Testing standards and quality assurance
- **ts-js-rules.md**: TypeScript/JavaScript coding standards

#### **Security & Dependencies**
- **security-secrets.md**: Security and secrets management
- **dependencies-security.md**: Dependency vulnerability management
- **snyk_rules.md**: Snyk security scanning rules

#### **CI/CD & Automation**
- **ci-cd.md**: CI/CD pipeline standards
- **enforcement-automation.md**: Automated enforcement of standards

#### **Project Management**
- **commit-pr-release.md**: Commit, PR, and release standards
- **version-management.md**: Comprehensive version management
- **plan-context.md**: Project context and state management

#### **Frontend & UI**
- **react-patterns.md**: React development patterns
- **nextjs-app-router.md**: Next.js App Router patterns
- **accessibility-openness.md**: Accessibility guidelines

#### **Backend & Architecture**
- **pattern.md**: Architectural patterns and SOLID principles
- **dependency-injection.md**: Dependency injection patterns
- **db-migrations.md**: Database migration standards

### 🔄 **Workflows Library** (16+ Workflows)

#### **Development Workflows**
- **quality-checks.md**: Comprehensive quality validation (// turbo)
- **run-tests.md**: Testing workflow execution
- **verify.md**: Implementation verification

#### **Tool & Framework Workflows**
- **add-framework-template.md**: Framework template addition
- **implement-tool.md**: Tool implementation procedures
- **deploy-checklist.md**: Deployment preparation

#### **MCP & Documentation Workflows**
- **mcp-docs-and-tools.md**: MCP documentation usage
- **skill-mcp-docs-search.md**: Documentation search skills

#### **Infrastructure Workflows**
- **start-and-register-gateway.md**: Gateway setup
- **connect-ide-to-mcp-gateway.md**: IDE integration
- **change-gateways-prompts-resources.md**: Gateway configuration

#### **Specialized Skill Workflows**
- **skill-backend-express.md**: Express.js development
- **skill-frontend-react-vite.md**: React + Vite development
- **skill-e2e-playwright.md**: E2E testing

#### **Planning Workflows**
- **use-plan-context.md**: Plan context loading
- **update-plan.md**: Plan maintenance

#### **Safety Workflows**
- **safety-shell-commands.md**: Safe command execution

### 🎯 **Skills Library** (5+ Skills)

#### **Development & Engineering Skills**
- **code-generation-templates.md**: Code generation and templating
- **design-output.md**: System design and specification
- **docker-deployment.md**: Docker deployment expertise

#### **Documentation & Research Skills**
- **mcp-docs-search.md**: Documentation research and lookup
- **mcp-tool-development.md**: MCP tool development

### 📋 **Plans Library** (5+ Plans)

#### **Comprehensive Project Plans**
- **high-efficiency-docker-standards-c1f908.md**: Complete Docker standards
- **docker-standards-implementation-summary-c1f908.md**: Implementation overview
- **serverless-mcp-sleep-architecture-c1f908.md**: Sleep/wake architecture
- **scalable-docker-compose-architecture-c1f908.md**: Dynamic scaling
- **docker-optimization-lightweight-mcp-c1f908.md**: Docker optimization

## 🛡️ Security

### Zero Secrets Policy

This repository is designed to be **completely public** with zero secrets:

- ✅ No actual secrets in any files
- ✅ All sensitive values use `REPLACE_WITH_[TYPE]` format
- ✅ Automated secret scanning and validation
- ✅ Comprehensive security workflows

### Security Validation

```bash
# Run comprehensive security scan
./scripts/security/scan-for-secrets.sh

# Validate no secrets
./scripts/security/validate-no-secrets.sh

# Validate placeholder formats
./scripts/security/validate-placeholders.sh
```

### Security Features

- **Trufflehog**: Secret detection with verified secrets only
- **Gitleaks**: Custom secret detection rules
- **Custom Validation**: Placeholder format validation
- **Continuous Monitoring**: Daily security scans

## 📊 Quality Standards

### Test Coverage Requirements

- **Minimum Coverage**: 80% across all metrics
- **Coverage Types**: Branches, Functions, Lines, Statements
- **Quality Gates**: Fail builds below 80%
- **Reporting**: XML, HTML, Terminal formats

### Code Quality Requirements

- **Linting**: ESLint/Prettier for consistency
- **Type Checking**: TypeScript strict mode
- **Security Auditing**: npm audit for vulnerabilities
- **Pre-commit**: Automated quality validation

## 🔄 Automation

### Bootstrap Scripts

```bash
# Create new project with full patterns
./scripts/bootstrap/project.sh my-project node

# Bootstrap specific project types
./scripts/bootstrap/gateway.sh      # mcp-gateway style
./scripts/bootstrap/webapp.sh       # uiforge-webapp style
./scripts/bootstrap/mcp.sh          # uiforge-mcp style
```

### Synchronization Scripts

```bash
# Sync patterns to all projects
./scripts/sync/patterns.sh

# Sync configurations
./scripts/sync/configs.sh

# Sync templates
./scripts/sync/templates.sh
```

### Validation Scripts

```bash
# Validate pattern consistency
./scripts/validate/patterns.sh

# Validate security configs
./scripts/validate/security.sh

# Validate code quality
./scripts/validate/quality.sh
```

## 🚀 CI/CD Integration

### GitHub Actions Workflows

```yaml
# Security scanning (automated)
- name: Security Scan
  uses: trufflesecurity/trufflehog@v3.93.3
- name: Gitleaks Secret Scan
  uses: gitleaks/gitleaks-action@v2

# Quality checks
- name: Lint and Format
- name: Type Check
- name: Test with Coverage
- name: Security Audit
```

### Quality Gates

- ✅ All linting checks pass
- ✅ All tests pass (100% success)
- ✅ Code coverage ≥ 80%
- ✅ Security scans pass
- ✅ Build verification succeeds

## 📚 Documentation

### Getting Started

- [Setup Guide](docs/getting-started.md) - Complete setup instructions
- [Customization Guide](docs/customization-guide.md) - How to adapt patterns
- [Maintenance Guide](docs/maintenance-guide.md) - Ongoing maintenance
- [Docker Guide](docs/docker-guide.md) - Containerization patterns

### Architecture

- [Architecture Overview](docs/ARCHITECTURE.md) - System architecture
- [Security Guidelines](docs/SECURITY.md) - Security best practices
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment patterns

### Reference

- [Pattern Catalog](docs/pattern-catalog.md) - All available patterns
- [Configuration Reference](docs/configuration-reference.md) - All options
- [Troubleshooting](docs/troubleshooting.md) - Common issues

## 🤝 Contributing

We welcome contributions to UIForge Patterns! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run all validation scripts
5. Submit a pull request

### Requirements for Contributions

- ✅ Follow security guidelines (no secrets)
- ✅ Pass all automated tests
- ✅ Maintain 80% test coverage
- ✅ Follow conventional commit format
- ✅ Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/LucasSantana-Dev/uiforge-patterns
- **Issues**: https://github.com/LucasSantana-Dev/uiforge-patterns/issues
- **Discussions**: https://github.com/LucasSantana-Dev/uiforge-patterns/discussions

## 📞 Support

For questions, issues, or suggestions:

- 📧 Create an issue on GitHub
- 💬 Start a discussion
- 📖 Check the documentation
- 🔍 Search existing issues

---

**UIForge Patterns** - Consistency, Security, Quality, Automation, Docker 🚀

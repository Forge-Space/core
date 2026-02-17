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

## 📋 Projects Using These Patterns

- **mcp-gateway**: Python/Node.js MCP gateway with comprehensive CI/CD
- **uiforge-webapp**: Next.js web application with multi-environment deployment  
- **uiforge-mcp**: Node.js MCP server with security-focused workflows

## 🚀 Quick Start

### Bootstrap a New Project

```bash
# Clone the patterns repository
git clone https://github.com/LucasSantana-Dev/uiforge-patterns.git
cd uiforge-patterns

# Bootstrap a new project
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
│   └── documentation/     # Documentation templates
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

## 📚 Documentation

### Getting Started

- [Setup Guide](docs/getting-started.md) - Complete setup instructions
- [Customization Guide](docs/customization-guide.md) - How to adapt patterns
- [Maintenance Guide](docs/maintenance-guide.md) - Ongoing maintenance

### Architecture

- [Architecture Overview](docs/ARCHITECTURE.md) - System architecture
- [Security Guidelines](docs/SECURITY.md) - Security best practices
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment patterns

### Reference

- [Pattern Catalog](docs/pattern-catalog.md) - All available patterns
- [Configuration Reference](docs/configuration-reference.md) - All options
- [Troubleshooting](docs/troubleshooting.md) - Common issues

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

**UIForge Patterns** - Consistency, Security, Quality, Automation 🚀
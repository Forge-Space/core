# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **UIForge Context MCP Server v2** (`src/mcp-context-server/`): Centralized context store — the MCP server is now the absolute source of truth for all UIForge project contexts
  - `store.ts` — Read/write/list operations on `context-store/` with slug validation and path-confinement security (0 Snyk issues)
  - `context-store/` — Seeded with all 4 project contexts (`forge-patterns`, `uiforge-webapp`, `uiforge-mcp`, `mcp-gateway`) as `.md` + `.meta.json` pairs
  - `update_project_context` tool — Writes/overwrites any project's context document in the store; supports adding new projects dynamically
  - `resources.ts` — Rewritten to enumerate projects dynamically from the store (no hardcoded paths)
  - `tools.ts` — All 3 tools (`get_project_context`, `update_project_context`, `list_projects`) read/write from the centralized store
  - `index.ts` — Bumped to v2.0.0, wires all 3 tool handlers
  - `docs/guides/MCP_CONTEXT_SERVER.md` — Setup and IDE integration guide
- `mcp-context:build` and `mcp-context:start` npm scripts
- `@modelcontextprotocol/sdk` dependency
- `test:plugins`, `test:feature-toggles`, `test:integration`, `test:all` npm scripts

### Fixed
- Removed reference to deleted `scripts/prevent-duplicates.sh` from `pre-commit` script
- README.md markdown lint warnings (MD031, MD012, MD032)
- ESLint errors in cross-project integration, feature toggle validation, performance benchmark, advanced feature toggles, and AI code analyzer
- Hardcoded secrets in Kubernetes manifest replaced with secure placeholders
- GitHub Pages deployment updated to actions v4 with proper permissions

## [1.1.0] - 2026-02-18

### Added
- **Plugin System** (`patterns/plugin-system/`): Complete extensible architecture with dynamic plugin loading, hot reload, hook system, dependency management, and per-plugin configuration
  - `plugin-manager.js` — Core `PluginManager` class extending `EventEmitter`
  - `examples/analytics-plugin.js` — Analytics and event tracking example
  - `examples/feature-enhancer-plugin.js` — A/B testing and feature enhancement example
  - `examples/plugin-demo.js` — Full demonstration script
  - `plugins/analytics-plugin.js` — Production-ready analytics plugin
  - `plugins/config/analytics-plugin.json` — Plugin configuration
  - `README.md` — Comprehensive plugin system documentation
- **Shared Infrastructure Logger** (`patterns/shared-infrastructure/logger/`): TypeScript structured logging with multiple transports, observability, and correlation context
- **Multi-Language Pattern Stubs**: Go, Java, Rust, and AI project template READMEs
- **Plugin System Validation Test** (`test/plugin-system-validation.js`): 5-test validation suite
- **Phase 5 Validation Report** (`docs/reports/PHASE_5_VALIDATION_REPORT.md`)
- **Plugin System Implementation Report** (`docs/reports/PLUGIN_SYSTEM_IMPLEMENTATION_REPORT.md`)

### Fixed
- Security vulnerabilities in logger examples: replaced hardcoded credentials with `process.env` references (CWE-547, CWE-798)
- Duplicate files and backup files created by bootstrap script
- `.vimrc` added to disable Vim backup and swap files
- Pre-commit hook updated to prevent backup files from being committed

### Removed
- Kubernetes configurations (`patterns/kubernetes/`) — replaced by cloud-native patterns approach
- Duplicate plan files from `.windsurf/plans/`
- `dist/` compiled output directory
- `scripts/prevent-duplicates.sh` and `scripts/remove-duplicates.sh` (consolidated into pre-commit)
- Stale reports: `ALL_ISSUES_RESOLVED.md`, `COMPLETE_INTEGRATION_SUMMARY.md`, `COMPLETE_PROJECT_ANALYSIS.md`, and others

## [1.0.0] - 2026-02-10

### Added
- **Centralized Feature Toggle System** (`patterns/feature-toggles/`): Cross-project feature management with unified control via Unleash
  - Node.js SDK (`libraries/nodejs/index.js`)
  - Advanced library with A/B testing and analytics (`libraries/advanced/index.js`)
  - Centralized YAML configuration (`config/centralized-config.yml`)
  - `forge-features` CLI tool for feature management across all projects
- **AI-Powered Code Analyzer** (`patterns/ai-tools/code-analyzer.js`): Pattern recognition, security analysis, performance analysis, and code quality metrics
- **Advanced Feature Toggle System**: A/B testing, analytics, rollout strategies
- **Cross-Project Integration Tests** (`test/cross-project-integration.js`)
- **Feature Toggle Validation Tests** (`test/feature-toggle-validation.js`)
- **Performance Benchmark Suite** (`test/performance-benchmark.js`)
- **Integration Script** (`scripts/integrate.js`): Automated integration for mcp-gateway, uiforge-mcp, uiforge-webapp
- **Architecture Decision Records**: ADR-001 through ADR-006 covering ecosystem design, gateway hub, MCP server design, and centralized feature toggles
- **Integration Guides**: MCP Gateway, UIForge MCP, troubleshooting, and developer onboarding guides
- **Code Quality Patterns** (`patterns/code-quality/`): ESLint, Prettier, TypeScript configurations
- **Docker Patterns** (`patterns/docker/`): High-efficiency three-state service model (Running/Sleeping/Stopped)
- **Cost Patterns** (`patterns/cost/`): Zero-cost tracking and optimization strategies
- **Security Patterns** (`patterns/security/`): Authentication, middleware, zero-secrets architecture
- **MCP Gateway Patterns** (`patterns/mcp-gateway/`): Rate limiting, request validation, security headers
- **MCP Server Patterns** (`patterns/mcp-servers/`): AI providers, streaming, template management
- **Git Patterns** (`patterns/git/`): Hooks, workflows, conventional commits
- **Config Patterns** (`patterns/config/`): Centralized configuration management
- **Terraform Patterns** (`patterns/terraform/`): Infrastructure as code templates
- **LocalStack Patterns** (`patterns/localstack/`): Local AWS service emulation
- **Security Scripts** (`scripts/security/`): `scan-for-secrets.sh`, `validate-no-secrets.sh`, `validate-placeholders.sh`
- **Bootstrap Script** (`scripts/bootstrap/project.sh`): Automated project setup
- **Gitleaks Configuration** (`.gitleaks.yml`): Secret detection rules
- **35+ Windsurf Rules** (`.windsurf/rules/`): Development standards and guidelines
- **16+ Windsurf Workflows** (`.windsurf/workflows/`): Development procedures
- **5+ Windsurf Skills** (`.windsurf/skills/`): Specialized development capabilities
- **GitHub Actions CI/CD**: Lint, type-check, build, test, coverage, security scan pipeline
- **GitHub Pages**: Automated documentation deployment

### Security
- BR-001 Zero-Secrets policy enforced across all patterns
- Multi-layer secret scanning with Trufflehog, Gitleaks, and custom scripts
- All sensitive values use `{{PLACEHOLDER}}` syntax

[Unreleased]: https://github.com/LucasSantana-Dev/forge-patterns/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/LucasSantana-Dev/forge-patterns/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/LucasSantana-Dev/forge-patterns/releases/tag/v1.0.0

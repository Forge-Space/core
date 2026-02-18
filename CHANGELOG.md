# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`patterns/python/`**: Python project template and tooling patterns for Forge ecosystem use cases (AI/ML scripts, automation, MCP server extensions) — `pyproject.toml` with ruff + mypy + pytest, entry point template, and test template; mirrors `scripts/bootstrap/project.sh python` type
- **`patterns/shell/`**: Shell scripting conventions for all Forge bash scripts — `conventions/header.sh` (standard `set -euo pipefail`, colour helpers, `require_cmd`/`guard_cmd`) and `conventions/guard.sh` (`ensure_dir`, `safe_copy`, `require_env`, `make_tmpfile`); extracted from patterns in `scripts/security/` and `scripts/bootstrap/`
- **`patterns/code-quality/eslint/base.config.mjs`**: new composable ESLint 9 flat-config base for Node.js/TypeScript projects — uses `typescript-eslint` unified package with `strictTypeChecked` + `stylisticTypeChecked` presets, `projectService: true` for full type-aware linting, and `eslint-plugin-import` for cycle/duplicate detection
- **`patterns/code-quality/eslint/react.config.mjs`**: new React/Next.js ESLint layer — adds `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y` rules; composable on top of `base.config.mjs`
- **`patterns/code-quality/tsconfig/base.json`**: canonical Node.js/TypeScript tsconfig preset (`NodeNext` module resolution, full strict suite, `exactOptionalPropertyTypes`)
- **`patterns/code-quality/tsconfig/nextjs.json`**: Next.js/React tsconfig preset extending base (`Bundler` resolution, `jsx: preserve`, `noEmit`)
- **`patterns/code-quality/tsconfig/library.json`**: publishable library tsconfig preset extending base (`composite`, `declarationMap`, `importHelpers`)
- **`typescript-eslint`** unified meta-package added to devDependencies (re-exports `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser`)
- **`eslint-plugin-import`** + **`eslint-import-resolver-typescript`** added to devDependencies

### Removed

- **`patterns/cost/`**: Removed entirely — AWS free-tier tracking, budget alerts, and cost analysis scripts are out of scope for the current project focus
- **`patterns/terraform/`**: Removed entirely — Terraform/IaC infrastructure management is not needed at this stage
- **`patterns/localstack/`**: Removed entirely — LocalStack (AWS emulation) has no purpose without Terraform/AWS context
- **`patterns/go/`**: Removed — Go is not used in the Forge ecosystem (TypeScript/Node.js only); generic templates added unnecessary package weight
- **`patterns/java/`**: Removed — Java/Spring Boot is not used in the Forge ecosystem; generic templates added unnecessary package weight
- **`patterns/rust/`**: Removed — Rust is not used in the Forge ecosystem; generic templates added unnecessary package weight

### Changed

- **`patterns/cloud-native/README.md`**: Removed AWS Lambda handler section and all AWS-specific service references (SQS, SNS, Kinesis, IAM, KMS, CloudFront, Route 53, CloudWatch); retained Supabase Edge Function pattern, circuit breaker, health checks, and generic event-driven patterns
- **`patterns/config/patterns-config.yml`**: Removed `learning` block (aws-solutions-architect certification) and `cost-optimization` feature flag from `uiforge-mcp` project features
- **`src/mcp-context-server/context-store/forge-patterns.md`**: Removed all references to `cost/`, `terraform/`, `localstack/`, Kubernetes, and AWS from file structure, roadmap, and metrics sections
- **`eslint.config.mjs`** (root): migrated to `tseslint.config()` wrapper; upgraded from `recommended` to `strictTypeChecked` + `stylisticTypeChecked`; enabled `projectService: true`; added `eslint-plugin-import`; removed style rules now fully owned by Prettier (`quotes`, `semi`, `comma-dangle`); added `disableTypeChecked` override for plain JS files
- **`.prettierrc.json`** (root): expanded to multi-line human-readable format; reconciled `trailingComma: "all"`, `arrowParens: "always"`; added `objectWrap: "collapse"` (Prettier 3.5+); added `$schema`
- **`patterns/code-quality/prettier/base.config.json`**: synced with root — same canonical options, added `$schema`, `jsxSingleQuote`, `objectWrap`
- **`tsconfig.json`** (root): upgraded `module`/`moduleResolution` from `ESNext`/`node` to `NodeNext`/`NodeNext`; added `composite: true`; removed redundant explicit strict flags already implied by `strict: true`
- **`prettier`** bumped to `^3.5.0` in devDependencies

### Fixed

- **Duplicate configuration files in integration scripts**: replaced blind `cp` of forge-patterns' own root `.eslintrc.js` / `.prettierrc.json` into target projects with an existence-guarded "extend via reference" writer — integration scripts now write a thin wrapper config only when no config of that type exists, preventing conflicts with projects that manage their own tooling configs
- **Orphaned `.forge-patterns`-suffixed stub files removed from `uiforge-webapp`**: deleted `.eslintrc.forge-patterns.js`, `.prettierrc.forge-patterns.json`, `.dockerignore.forge-patterns`, and `Dockerfile.forge-patterns` which were leftover stubs from a prior cleanup
- **ESLint peer dependency conflict**: upgraded `@typescript-eslint/eslint-plugin` from `^6.0.0` to `^8.56.0` to match `@typescript-eslint/parser@^8.56.0` (same major version required)
- **ESLint version incompatibility**: downgraded `eslint` from `^10.0.0` to `^9.0.0`; ESLint 10 dropped legacy `.eslintrc.*` config support entirely
- **ESLint flat config migration**: replaced `.eslintrc.js` with `eslint.config.mjs` (ESLint 9 flat config format); added `@eslint/js` and `globals` dev dependencies
- **ESLint scripts**: removed deprecated `--ext .js,.ts` flag from `lint` and `lint:check` scripts (flat config handles file matching)
- **ESLint zero-warnings**: resolved all remaining ESLint errors and warnings across the codebase — 0 errors, 0 warnings
  - Disabled base `no-unused-vars` in favour of `@typescript-eslint/no-unused-vars` (eliminates false positives on TS enum/interface members)
  - Added config overrides for `test/**`, `patterns/**/examples/**`, `patterns/**/tests/**`, `patterns/shared-infrastructure/**`, `patterns/plugin-system/**`, `patterns/ai-tools/**`, and `scripts/**` to suppress context-appropriate `no-console`, `no-magic-numbers`, and `@typescript-eslint/no-explicit-any` warnings
  - Fixed `NodeJS.Timeout` not-defined error in `transports.ts` — replaced with `ReturnType<typeof setInterval>`
  - Fixed inline `import()` in `implements` clause in `logger.test.ts` — replaced with top-level `import type`
  - Fixed duplicate `config` key and `eventsToSend` scope bug in `analytics-plugin.js`
  - Fixed `prefer-destructuring` in `forge-patterns-cli.js` using destructuring assignment
  - Prefixed all unused function parameters with `_` across `code-analyzer.js`, `plugin-manager.js`, `feature-enhancer-plugin.js`, and `feature-toggles/libraries/advanced/index.js`
  - Replaced unused catch bindings with empty `catch {}` in `src/index.ts`, `test/plugin-system-validation.js`, `plugin-manager.js`, `logger.ts`, and `feature-toggles/libraries/advanced/index.js`
  - Removed unused imports (`RemoteTransport`, `FilteredTransport`, `MultiTransport`) from `logger.ts` and (`ConsoleTransport`, `JsonTransport`) from `logger.test.ts`
  - Removed all now-redundant `eslint-disable-next-line no-console` inline comments from test files and pattern libraries

## [1.2.0] - 2026-02-17

### Added

- **`patterns/go/`**: Go project templates (cli-app with Cobra/Viper, web-service with net/http + slog)
- **`patterns/java/`**: Java Spring Boot 3.2 web service template (pom.xml, controllers, exception handlers, application.yml)
- **`patterns/rust/`**: Rust Axum web service template (Cargo.toml, handlers, models, error types)
- **`docs/guides/IDE_EXTENSION_GUIDE.md`**: VS Code extensions + settings, JetBrains plugins, Windsurf workflows, `.editorconfig`

> **Note**: `patterns/go/`, `patterns/java/`, and `patterns/rust/` were added in v1.2.0 and immediately removed in the next unreleased cycle after determining they are not used in the Forge ecosystem.

## [1.1.0] - 2026-02-10

### Added

- **Plugin System** (`patterns/plugin-system/`): Full plugin architecture with `plugin-manager.js`, hook system, hot reload, dependency management, and configuration
- **Analytics Plugin** (`patterns/plugin-system/plugins/analytics-plugin.js`): Production-ready analytics plugin with event tracking and batch processing
- **Plugin Examples** (`patterns/plugin-system/examples/`): `analytics-plugin.js`, `feature-enhancer-plugin.js`, `plugin-demo.js` demonstrating plugin capabilities
- **AI/ML Patterns** (`patterns/ai/ml-integration/README.md`): Model serving, inference optimization, feature store, and monitoring patterns
- **AI Workflow Patterns** (`patterns/ai/workflows/README.md`): Training pipelines, evaluation gates, deployment workflows, and data validation
- **Cloud-Native Patterns** (`patterns/cloud-native/README.md`): Serverless, microservices, and event-driven architecture patterns
- **Forge Patterns CLI** (`scripts/forge-patterns-cli.js`): Pattern discovery (`list`, `search`), application (`apply`), and validation (`validate`) against BR-001/BR-002/BR-004
- **CONTRIBUTING.md**: Full contribution guidelines with BR-001 to BR-005 requirements, submission checklist, and review process
- **Plugin System Validation** (`test/plugin-system-validation.js`): Comprehensive test suite for plugin system
- **Plugin System Report** (`docs/reports/PLUGIN_SYSTEM_IMPLEMENTATION_REPORT.md`): Implementation details and validation results

### Changed

- **`package.json`**: Added `patterns`, `patterns:list`, `patterns:search`, `patterns:validate` npm scripts; added `test:plugins`, `test:feature-toggles`, `test:integration`, `test:all` scripts
- **`README.md`**: Updated to reflect Phase 1 progress and new pattern categories

## [1.0.0] - 2026-01-15

### Added

- **Core Pattern Library**: Initial release with code-quality, docker, security, config, coverage, git, and shared-infrastructure patterns
- **Logger Pattern** (`patterns/shared-infrastructure/logger/`): Structured logging with TypeScript, multiple transports, and log rotation
- **Feature Toggle Pattern** (`patterns/feature-toggles/`): Centralized feature toggle management with Unleash integration
- **Docker Patterns** (`patterns/docker/`): Optimized Dockerfile templates with sleep architecture for resource efficiency
- **Security Framework**: Gitleaks configuration, secret scanning scripts, placeholder validation
- **MCP Gateway Patterns** (`patterns/mcp-gateway/`): Routing, authentication, performance, and security patterns
- **MCP Server Patterns** (`patterns/mcp-servers/`): AI provider integration, UI generation, and streaming templates
- **Integration Scripts** (`scripts/integrate*.sh`): Automated pattern integration for mcp-gateway, uiforge-mcp, and uiforge-webapp
- **Bootstrap Script** (`scripts/bootstrap/project.sh`): Project scaffolding for Node.js, Python, and Next.js project types
- **Architecture Decision Records** (`docs/architecture-decisions/`): ADR-001 through ADR-007 documenting key design decisions

[Unreleased]: https://github.com/LucasSantana-Dev/forge-patterns/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/LucasSantana-Dev/forge-patterns/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/LucasSantana-Dev/forge-patterns/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/LucasSantana-Dev/forge-patterns/releases/tag/v1.0.0

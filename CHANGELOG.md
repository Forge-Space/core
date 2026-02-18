# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.2] - 2026-02-18

### Added

- **`husky`**: bumped from 8.0.3 to 9.1.7 in devDependencies

## [1.1.1] - 2026-02-18

### Security

- **Path Traversal fix (CWE-23)**: Added explicit `validateProjectSlug()` calls at entry points in `src/mcp-context-server/tools.ts` and `src/mcp-context-server/resources.ts` — sanitization is now visible to static analysis at the boundary where untrusted input enters, before it reaches `readFileSync`/`writeFileSync`. Resolves 4 High-severity findings (score 900) reported by Snyk Code Analysis.

### Fixed

- **`.github/dependabot.yml`**: Removed invalid `reviewers` property from all 3 ecosystem blocks (`npm`, `pip`, `github-actions`) — not supported in Dependabot v2 schema.
- **`.github/workflows/ci.yml`**: Restored `workflow-summary` job to correct 2-space indentation inside the `jobs:` block.
- **`.github/workflows/security-scan.yml`**: Fixed invalid Gitleaks action inputs, added `continue-on-error` to Snyk step, upgraded CodeQL from v3 to v4.
- **`scripts/security/validate-no-secrets.sh`**: Excluded `dist/`, `package-lock.json`, `node_modules`; added false-positive filters for `author`, `authentication`, `Object.entries`, and `private` keyword patterns.
- **`scripts/security/validate-placeholders.sh`**: Added `--exclude-dir` for `node_modules`, `.git`, `dist`, `docs/`, `patterns/`, `.windsurf/`; prevents false positives from example code and vendored packages.
- **`patterns/feature-toggles/README.md`**: Fixed MD022/MD025/MD031/MD032/MD040 markdownlint violations — blank lines around headings/fences/lists, removed duplicate H1, added language tag to bare fence block.
- **`CHANGELOG.md`**: Added `<!-- markdownlint-disable MD024 -->` to suppress intentional duplicate section headings across version entries.

## [1.1.0] - 2026-02-18

### Added

- **`patterns/python/`**: Python project template and tooling patterns — `pyproject.toml` with ruff + mypy + pytest, entry point and test templates
- **`patterns/shell/`**: Shell scripting conventions — `conventions/header.sh` and `conventions/guard.sh` with standard `set -euo pipefail` helpers
- **`patterns/code-quality/eslint/base.config.mjs`**: composable ESLint 9 flat-config base for Node.js/TypeScript projects
- **`patterns/code-quality/eslint/react.config.mjs`**: React/Next.js ESLint layer composable on top of base config
- **`patterns/code-quality/tsconfig/base.json`**, **`nextjs.json`**, **`library.json`**: canonical TSConfig presets
- **`typescript-eslint`**, **`eslint-plugin-import`**, **`eslint-import-resolver-typescript`** added to devDependencies
- **VS Code Extension stub** (`patterns/ide-extensions/vscode/`): Alpha scaffold with command palette integration and MCP context server integration docs
- **UIForge Context MCP Server v2** (`src/mcp-context-server/`): Centralized context store as the absolute source of truth for all UIForge project contexts
- **`patterns/shared-constants/`**: Centralised reusable constants — `network.ts`, `mcp-protocol.ts`, `environments.ts`, `ai-providers.ts`, `feature-flags.ts`, `storage.ts`, `index.ts`
- **`.shellcheckrc`** (root): project-level shellcheck config

### Removed

- **`patterns/cost/`**, **`patterns/terraform/`**, **`patterns/localstack/`**: Removed — out of scope for current project focus
- **`patterns/go/`**, **`patterns/java/`**, **`patterns/rust/`**: Removed — not used in the Forge ecosystem

### Changed

- **Node.js minimum version**: bumped from `>=20.11.0` to `>=22.0.0`; CI node-version updated to 24
- **`eslint.config.mjs`** (root): migrated to `tseslint.config()` wrapper with `strictTypeChecked` + `stylisticTypeChecked`
- **`.prettierrc.json`** (root): expanded with `objectWrap: "collapse"` (Prettier 3.5+), `$schema`
- **`tsconfig.json`** (root): upgraded to `NodeNext`/`NodeNext` module resolution, added `composite: true`

### Fixed

- **`src/mcp-context-server/store.ts`**: `STORE_DIR` now uses `import.meta.url` to anchor path resolution
- **`.github/workflows/branch-protection.yml`**: `actions/checkout@v6` → `@v4`; commit message check rewritten
- ESLint errors in cross-project integration, feature toggle validation, performance benchmark, and AI code analyzer

## [1.0.0] - 2026-02-18

### Added

- Initial release with core patterns: MCP Gateway, MCP Servers, Shared Infrastructure, Code Quality, Docker, Cost, Config, Feature Toggles, Plugin System
- Security scanning with Gitleaks and custom scripts
- CI/CD pipeline with GitHub Actions
- Bootstrap script for new projects

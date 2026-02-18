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
- **VS Code Extension stub** (`patterns/ide-extensions/vscode/`): Alpha scaffold for forge-patterns VS Code extension with command palette integration (`listPatterns`, `applyPattern`, `validateCompliance`), TypeScript entry point, and MCP context server integration docs
- **UIForge Context MCP Server v2** (`src/mcp-context-server/`): Centralized context store — the MCP server is now the absolute source of truth for all UIForge project contexts
- `mcp-context:build` and `mcp-context:start` npm scripts
- `@modelcontextprotocol/sdk` dependency
- `test:plugins`, `test:feature-toggles`, `test:integration`, `test:all` npm scripts
- **`patterns/shared-constants/`**: Centralised reusable constants from the Forge ecosystem — `network.ts`, `mcp-protocol.ts`, `environments.ts`, `ai-providers.ts`, `feature-flags.ts`, `storage.ts`, `index.ts` (barrel re-export)
- `test:shared-constants` npm script (44 tests, 0 failures)
- **`patterns/shell/linting/.shellcheckrc`**: strict shellcheck configuration — `shell=bash`, `enable=all`, disables only SC1091 and SC2034
- **`scripts/lint-shell.sh`**: unified shell linting runner — runs `shellcheck` and `shfmt` on all `.sh` files; `STRICT=1` mode for CI

### Removed

- **`patterns/go/`**: Removed — Go is not used in the Forge ecosystem
- **`patterns/java/`**: Removed — Java/Spring Boot is not used in the Forge ecosystem
- **`patterns/rust/`**: Removed — Rust is not used in the Forge ecosystem

### Changed

- **`eslint.config.mjs`** (root): migrated to `tseslint.config()` wrapper; upgraded from `recommended` to `strictTypeChecked` + `stylisticTypeChecked`
- **`.prettierrc.json`** (root): expanded to multi-line human-readable format; added `objectWrap: "collapse"` (Prettier 3.5+)
- **`patterns/code-quality/prettier/base.config.json`**: synced with root
- **`tsconfig.json`** (root): upgraded `module`/`moduleResolution` to `NodeNext`/`NodeNext`; added `composite: true`
- **`prettier`** bumped to `^3.5.0` in devDependencies

### Fixed

- Removed reference to deleted `scripts/prevent-duplicates.sh` from `pre-commit` script
- README.md markdown lint warnings (MD031, MD012, MD032)
- ESLint errors in cross-project integration, feature toggle validation, performance benchmark, advanced feature toggles, and AI code analyzer
- Hardcoded secrets in Kubernetes manifest replaced with secure placeholders
- GitHub Pages deployment updated to actions v4 with proper permissions

## [1.1.0] - 2026-02-18

### Added

- **Python patterns** (`patterns/python/`): `pyproject.toml` template with ruff + mypy + pytest; entry point and test templates
- **Shell patterns** (`patterns/shell/`): `conventions/header.sh` and `conventions/guard.sh` with standard helpers
- **ESLint base config** (`patterns/code-quality/eslint/base.config.mjs`): composable ESLint 9 flat-config for Node.js/TypeScript
- **ESLint React config** (`patterns/code-quality/eslint/react.config.mjs`): React/Next.js ESLint layer
- **TSConfig presets** (`patterns/code-quality/tsconfig/`): `base.json`, `nextjs.json`, `library.json`

### Changed

- Migrated root `eslint.config.mjs` to ESLint 9 flat config
- Upgraded `@typescript-eslint` to v8, `eslint` to v9
- Added `typescript-eslint`, `eslint-plugin-import`, `eslint-import-resolver-typescript` to devDependencies

## [1.0.0] - 2026-02-18

### Added

- Initial release with core patterns: MCP Gateway, MCP Servers, Shared Infrastructure, Code Quality, Docker, Cost, Config, Feature Toggles, Plugin System
- Security scanning with Gitleaks and custom scripts
- CI/CD pipeline with GitHub Actions
- Bootstrap script for new projects

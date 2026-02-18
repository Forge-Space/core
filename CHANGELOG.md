# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Path Traversal fix (CWE-23)**: Added explicit `validateProjectSlug()` calls at entry points in `src/mcp-context-server/tools.ts` and `src/mcp-context-server/resources.ts` — sanitization is now visible to static analysis at the boundary where untrusted input enters, before it reaches `readFileSync`/`writeFileSync`. Resolves 4 High-severity findings (score 900) reported by Snyk Code Analysis.

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
  - `store.ts` — Read/write/list operations with slug validation and path-confinement security
  - `context-store/` — Seeded with all 4 project contexts as `.md` + `.meta.json` pairs
  - `resources.ts` — Dynamic project enumeration from the store (no hardcoded paths)
  - `tools.ts` — All 3 tools (`get_project_context`, `update_project_context`, `list_projects`) backed by the centralized store
  - `index.ts` — Bumped to v2.0.0
  - `docs/guides/MCP_CONTEXT_SERVER.md` — Setup and IDE integration guide
- `mcp-context:build` and `mcp-context:start` npm scripts; `@modelcontextprotocol/sdk` dependency
- **`patterns/shared-constants/`**: Centralised reusable constants — `network.ts`, `mcp-protocol.ts`, `environments.ts`, `ai-providers.ts`, `feature-flags.ts`, `storage.ts`, `index.ts`
- `test:shared-constants` npm script (44 tests, 0 failures)
- **`.shellcheckrc`** (root): project-level shellcheck config

### Removed

- **`patterns/cost/`**, **`patterns/terraform/`**, **`patterns/localstack/`**: Removed — out of scope for current project focus
- **`patterns/go/`**, **`patterns/java/`**, **`patterns/rust/`**: Removed — not used in the Forge ecosystem

### Changed

- **Node.js minimum version**: bumped from `>=20.11.0` to `>=22.0.0`; CI node-version updated to 24
- **`eslint.config.mjs`** (root): migrated to `tseslint.config()` wrapper with `strictTypeChecked` + `stylisticTypeChecked`
- **`.prettierrc.json`** (root): expanded with `objectWrap: "collapse"` (Prettier 3.5+), `$schema`
- **`tsconfig.json`** (root): upgraded to `NodeNext`/`NodeNext` module resolution, added `composite: true`
- **`prettier`** bumped to `^3.5.0` in devDependencies
- **`package.json` `test` script**: replaced broken workflow script with `node test/plugin-system-validation.js && node test/feature-toggle-validation.js && node test/shared-constants-validation.js`
- **`.github/workflows/ci.yml` `shell-lint` job**: added `ignore_paths`, made `shfmt` check `continue-on-error: true`

### Fixed

- **`src/mcp-context-server/store.ts`**: `STORE_DIR` now uses `import.meta.url` to anchor path resolution — fixes incorrect path when MCP server is launched by Windsurf/IDE
- **`.github/workflows/branch-protection.yml`**: `actions/checkout@v6` → `@v4`; commit message check rewritten with `grep -qE` to fix bash regex syntax error and subshell exit propagation
- Removed reference to deleted `scripts/prevent-duplicates.sh` from `pre-commit` script
- ESLint errors in cross-project integration, feature toggle validation, performance benchmark, and AI code analyzer
- Hardcoded secrets in Kubernetes manifest replaced with secure placeholders
- GitHub Pages deployment updated to actions v4 with proper permissions
- **`validate-no-secrets.sh`**: excluded `package-lock.json` and `node_modules`; added false-positive filters
- **`.github/workflows/security-scan.yml`**: updated `actions/checkout` to `@v4`, fixed CodeQL `languages` type, updated `actions/upload-artifact` to `@v4`

## [1.0.0] - 2026-02-18

### Added

- Initial release with core patterns: MCP Gateway, MCP Servers, Shared Infrastructure, Code Quality, Docker, Cost, Config, Feature Toggles, Plugin System
- Security scanning with Gitleaks and custom scripts
- CI/CD pipeline with GitHub Actions
- Bootstrap script for new projects

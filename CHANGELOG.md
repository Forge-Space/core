# Changelog

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
- **Node.js 24 support**: `engines` field updated to `>=20`, CI matrix extended to include Node 24

### Fixed

- `actions/checkout@v6` → `@v4` in `.github/workflows/branch-protection.yml` (v6 does not exist)
- Bash regex syntax in commit-message check (replaced `[[ =~ ]]` with POSIX `case` for portability)
- `validate-no-secrets.sh`: exclude `dist/` from scans; add false-positive filters for `author`, `authentication`, `Object.entries`, `private` keyword, `API keys`, `${key}:` variable
- `validate-placeholders.sh`: add `--exclude-dir` for `node_modules`, `dist`, `patterns`, `docs`, `.windsurf`, `context-store` to prevent false positives from installed packages and documentation examples
- `security-scan.yml`: remove invalid `version`/`config` inputs from `gitleaks/gitleaks-action@v2`; use `GITLEAKS_CONFIG` env var instead
- `security-scan.yml`: add `continue-on-error: true` to Snyk job (token may not be configured)
- `security-scan.yml`: upgrade `github/codeql-action` v3 → v4

## [1.0.0] - 2026-01-15

### Added

- Initial release of forge-patterns
- Core pattern libraries: code-quality, docker, cost, config
- Development rules and standards (35+ rules)
- Development workflows (16+ workflows)
- Security scanning scripts: `scan-for-secrets.sh`, `validate-no-secrets.sh`, `validate-placeholders.sh`
- Bootstrap scripts: `scripts/bootstrap/project.sh`
- CI/CD workflows: branch protection, security scan, continuous security
- Documentation: architecture decisions, ecosystem docs, developer guides
- MCP Context Server v1 (`src/mcp-context-server/`)
- Integration scripts for mcp-gateway, uiforge-mcp, UIForge projects

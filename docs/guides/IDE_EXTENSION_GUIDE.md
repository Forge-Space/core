# IDE Extension Guide

Setup guide for VS Code and JetBrains IDEs to get the best development experience with UIForge Patterns.

## VS Code

### Recommended Extensions

Install individually:

```bash
# TypeScript / JavaScript
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next

# Go
code --install-extension golang.go

# Rust
code --install-extension rust-lang.rust-analyzer
code --install-extension vadimcn.vscode-lldb

# Java
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-spring-boot

# Docker & containers
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-vscode-remote.remote-containers

# General quality
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension DavidAnson.vscode-markdownlint
code --install-extension tamasfe.even-better-toml
code --install-extension redhat.vscode-yaml
```

### `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[go]": { "editor.defaultFormatter": "golang.go" },
  "[rust]": { "editor.defaultFormatter": "rust-lang.rust-analyzer" },
  "[java]": { "editor.defaultFormatter": "redhat.java" },
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": "package",
  "rust-analyzer.check.command": "clippy",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/target": true,
    "**/bin": true
  }
}
```

### `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "golang.go",
    "rust-lang.rust-analyzer",
    "vscjava.vscode-java-pack",
    "vmware.vscode-spring-boot",
    "ms-azuretools.vscode-docker",
    "ms-vscode-remote.remote-containers",
    "DavidAnson.vscode-markdownlint",
    "tamasfe.even-better-toml",
    "redhat.vscode-yaml",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "forge: validate patterns",
      "type": "shell",
      "command": "npm run patterns:validate",
      "group": "test"
    },
    {
      "label": "forge: list patterns",
      "type": "shell",
      "command": "npm run patterns:list"
    },
    {
      "label": "test: all",
      "type": "shell",
      "command": "npm run test:all",
      "group": { "kind": "test", "isDefault": true }
    }
  ]
}
```

---

## JetBrains IDEs

Covers IntelliJ IDEA, GoLand, CLion (Rust), and WebStorm.

### Recommended Plugins

Install via **Settings → Plugins → Marketplace**:

| Plugin | Purpose |
| --- | --- |
| **Prettier** | Code formatting (JS/TS) |
| **ESLint** | JavaScript/TypeScript linting |
| **Go** | Go language support (IntelliJ) |
| **Rust** | Rust language support |
| **Docker** | Docker integration |
| **Makefile Language** | Makefile syntax |
| **TOML** | Cargo.toml support |
| **Conventional Commit** | Commit message helper |
| **GitToolBox** | Enhanced Git integration |
| **SonarLint** | Local code quality analysis |

### Code Style

**TypeScript/JavaScript**: Settings → Languages & Frameworks → JavaScript → Prettier → enable **Run on save**

**Go** (GoLand): Settings → Editor → Code Style → Go → enable **Run gofmt on save**, set **golangci-lint** as linter

**Rust** (CLion): Settings → Languages & Frameworks → Rust → set **Rustfmt** formatter, enable **Clippy**

**Java** (IntelliJ): Settings → Editor → Code Style → Java → import Google Java Style, enable **Optimize imports on save**

---

## `.editorconfig`

Create at project root — works across all IDEs:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,ts,jsx,tsx,json,yml,yaml}]
indent_style = space
indent_size = 2

[*.go]
indent_style = tab
indent_size = 4

[*.rs]
indent_style = space
indent_size = 4

[*.java]
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab

[*.md]
trim_trailing_whitespace = false
```

---

## Windsurf / Cursor

The repo ships with pre-configured rules and workflows under `.windsurf/`.

### Available Workflows

| Command | Description |
| --- | --- |
| `/quality-checks` | Run lint + test |
| `/security-scan` | Run all security scripts |
| `/verify` | Full pre-PR verification |
| `/run-tests` | Complete test suite |
| `/pattern-compliance` | Validate BR-001 to BR-005 |
| `/bootstrap-project` | Set up a new project |

### Active Rules

Rules in `.windsurf/rules/` applied automatically:

- `forge-patterns-project.md` — always active, project context
- `zero-secrets-security.md` — BR-001 enforcement
- `pattern-library.md` — apply when editing `patterns/`
- `mcp-server-patterns.md` — apply when building MCP tools

---

## Related

- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — contribution guidelines
- [`patterns/code-quality/`](../../patterns/code-quality/) — ESLint and Prettier configs
- [`.windsurf/workflows/`](../../.windsurf/workflows/) — Windsurf workflow definitions

# IDE Extension Guide

Setup guide for VS Code and JetBrains IDEs to get the best development experience with UIForge Patterns.

## VS Code

### Recommended Extensions

Install the full recommended set with one command:

```bash
cat .vscode/extensions.json | jq -r '.recommendations[]' | xargs -I {} code --install-extension {}
```

Or install individually:

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

### Workspace Settings

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.formatOnSave": true
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer",
    "editor.formatOnSave": true
  },
  "[java]": {
    "editor.defaultFormatter": "redhat.java"
  },
  "eslint.validate": ["javascript", "typescript"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/target": true,
    "**/bin": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/target": true
  },
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": "package",
  "go.testOnSave": false,
  "rust-analyzer.check.command": "clippy",
  "rust-analyzer.cargo.features": "all"
}
```

### Recommended Extensions File

Create `.vscode/extensions.json`:

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

### Launch Configurations

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node.js: Debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--inspect"],
      "program": "${workspaceFolder}/src/index.js",
      "env": { "NODE_ENV": "development" },
      "console": "integratedTerminal"
    },
    {
      "name": "Go: Debug",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}",
      "env": { "GO_ENV": "development" }
    },
    {
      "name": "Rust: Debug",
      "type": "lldb",
      "request": "launch",
      "program": "${workspaceFolder}/target/debug/${workspaceFolderBasename}",
      "args": [],
      "cwd": "${workspaceFolder}",
      "preLaunchTask": "cargo build"
    }
  ]
}
```

### Tasks

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "forge: validate patterns",
      "type": "shell",
      "command": "npm run patterns:validate",
      "group": "test",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "forge: list patterns",
      "type": "shell",
      "command": "npm run patterns:list",
      "group": "none",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "forge: security scan",
      "type": "shell",
      "command": "./scripts/security/scan-for-secrets.sh",
      "group": "test",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "test: all",
      "type": "shell",
      "command": "npm run test:all",
      "group": { "kind": "test", "isDefault": true },
      "presentation": { "reveal": "always", "panel": "shared" }
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
| **Makefile Language** | Makefile syntax support |
| **TOML** | TOML file support (Cargo.toml) |
| **Conventional Commit** | Commit message helper |
| **GitToolBox** | Enhanced Git integration |
| **SonarLint** | Local code quality analysis |

Install via CLI (IntelliJ IDEA):

```bash
# Using the JetBrains Toolbox or IDE script
idea installPlugins \
  com.intellij.plugins.html.instantEditing \
  com.jetbrains.plugins.ini4idea \
  org.toml.lang \
  com.github.copilot
```

### Code Style Configuration

**For TypeScript/JavaScript** — import Prettier config:

1. **Settings → Editor → Code Style → JavaScript**
2. Click **Set from… → Prettier**
3. Enable **Run on save** under **Settings → Languages & Frameworks → JavaScript → Prettier**

**For Go** (GoLand):

1. **Settings → Editor → Code Style → Go**
2. Enable **Run gofmt on save**
3. Set **golangci-lint** as the external linter under **Settings → Tools → Go Linter**

**For Rust** (CLion):

1. Install **Rust** plugin
2. **Settings → Languages & Frameworks → Rust**
3. Set **Rustfmt** as formatter, enable **Run rustfmt on save**
4. Enable **Clippy** as the external linter

**For Java** (IntelliJ IDEA):

1. **Settings → Editor → Code Style → Java**
2. Import Google Java Style: download from [google/styleguide](https://github.com/google/styleguide) and import via **Manage → Import**
3. Enable **Optimize imports on save** and **Reformat code on save**

### Run Configurations

**Node.js script** (WebStorm / IntelliJ):

```xml
<!-- .idea/runConfigurations/forge_validate.xml -->
<component name="ProjectRunConfigurationManager">
  <configuration name="forge: validate" type="NodeJSConfigurationType">
    <node-parameters value="--experimental-vm-modules" />
    <script-path value="$PROJECT_DIR$/scripts/forge-patterns-cli.js" />
    <script-parameters value="validate" />
    <working-dir value="$PROJECT_DIR$" />
  </configuration>
</component>
```

### `.editorconfig` (works across all IDEs)

Create `.editorconfig` at the project root:

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

[*.{go}]
indent_style = tab
indent_size = 4

[*.{rs}]
indent_style = space
indent_size = 4

[*.{java}]
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab

[*.md]
trim_trailing_whitespace = false
```

---

## Windsurf / Cursor

The forge-patterns repo ships with pre-configured Windsurf rules and workflows under `.windsurf/`.

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

Rules in `.windsurf/rules/` are automatically applied:

- `forge-patterns-project.md` — always active, project context
- `zero-secrets-security.md` — always active, BR-001 enforcement
- `pattern-library.md` — apply when editing `patterns/`
- `mcp-server-patterns.md` — apply when building MCP tools

---

## Quick Setup Script

Run this once to configure your IDE environment:

```bash
#!/usr/bin/env bash
# scripts/bootstrap/ide-setup.sh

set -euo pipefail

echo "Setting up IDE configuration..."

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Copy VS Code settings if not present
if [ ! -f .vscode/settings.json ]; then
  cp patterns/config/vscode/settings.json .vscode/settings.json
  echo "✓ VS Code settings installed"
fi

if [ ! -f .vscode/extensions.json ]; then
  cp patterns/config/vscode/extensions.json .vscode/extensions.json
  echo "✓ VS Code extensions list installed"
fi

# Install EditorConfig if not present
if [ ! -f .editorconfig ]; then
  cp patterns/config/.editorconfig .editorconfig
  echo "✓ EditorConfig installed"
fi

echo "IDE setup complete!"
```

## 🔗 Related

- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — contribution guidelines
- [`patterns/code-quality/`](../../patterns/code-quality/) — ESLint and Prettier configs
- [`.windsurf/workflows/`](../../.windsurf/workflows/) — Windsurf workflow definitions

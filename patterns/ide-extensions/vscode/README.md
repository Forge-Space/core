# Forge Patterns — VS Code Extension

A VS Code extension for discovering, applying, and validating [forge-patterns](https://github.com/LucasSantana-Dev/forge-patterns) within your development environment.

## Status

> **Alpha stub** — commands are registered but scaffold/validation logic is not yet implemented. Contributions welcome.

## Features (Planned)

- **List Patterns** — Browse all available forge-patterns templates
- **Apply Pattern** — Scaffold a selected pattern into the current workspace
- **Validate Compliance** — Check the current project against forge-patterns standards

## Commands

| Command | Description |
|---------|-------------|
| `Forge Patterns: List Available Patterns` | Show all available patterns |
| `Forge Patterns: Apply Pattern` | Scaffold a pattern into the workspace |
| `Forge Patterns: Validate Pattern Compliance` | Run compliance checks |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `forgePatterns.repoPath` | `""` | Path to local forge-patterns repo |
| `forgePatterns.mcpServerUrl` | `""` | MCP context server URL for project context |

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Open in VS Code and press F5 to launch Extension Development Host
```

## MCP Integration

This extension is designed to work alongside the [UIForge Context MCP Server](../../src/mcp-context-server/README.md), which provides AI agents with project context. Set `forgePatterns.mcpServerUrl` to connect.

## Roadmap

- [ ] Pattern discovery from local repo or bundled index
- [ ] One-click pattern scaffolding into workspace
- [ ] Real-time compliance validation with inline diagnostics
- [ ] MCP context server integration
- [ ] Publish to VS Code Marketplace

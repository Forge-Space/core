# IDE Extensions

IDE integrations for forge-patterns, enabling pattern discovery, application, and validation directly within development environments.

## Available Extensions

### VS Code (`vscode/`)

Alpha stub with command palette integration. See [`vscode/README.md`](./vscode/README.md) for setup and development instructions.

**Status**: Alpha — structure and commands in place, scaffold/validation logic pending.

## Planned

- **JetBrains Plugin** — IntelliJ IDEA, PyCharm, WebStorm support
- **Pattern Marketplace** — Centralized pattern discovery and versioning

## MCP-First Strategy

For AI-assisted IDEs (Windsurf, Cursor, Claude Desktop), the [UIForge Context MCP Server](../../src/mcp-context-server/) provides the primary integration path — giving AI agents direct access to project context and forge-patterns documentation without requiring a native extension.

Native extensions complement this by providing GUI-driven pattern application for developers who prefer not to use AI agents.

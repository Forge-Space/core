# UIForge Context MCP Server

The `uiforge-context-server` is a local stdio MCP server that exposes the four UIForge project context documents as MCP **resources** and a query **tool**. Connect it to any MCP-compatible IDE to give AI agents live access to project plans, architecture, and status for all UIForge repos.

## Resources

| URI                                  | Document                                          |
| ------------------------------------ | ------------------------------------------------- |
| `uiforge://context/forge-patterns`   | `forge-patterns/docs/project/PROJECT_CONTEXT.MD`  |
| `uiforge://context/uiforge-webapp`   | `uiforge-webapp/plan.MD`                          |
| `uiforge://context/uiforge-mcp`      | `uiforge-mcp/plan.MD`                             |
| `uiforge://context/mcp-gateway`      | `mcp-gateway/PROJECT_CONTEXT.md`                  |

## Tools

| Tool                  | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `get_project_context` | Returns the full markdown content for a given project  |
| `list_projects`       | Lists all available projects with descriptions         |

## Setup

### 1. Install dependencies and build

```bash
# From forge-patterns root
npm install
npm run mcp-context:build
```

### 2. Verify the build

```bash
node dist/mcp-context-server/index.js
# Should print: UIForge Context MCP Server running on stdio
# (then wait for stdin — Ctrl+C to exit)
```

## IDE Configuration

### Windsurf

Add to your Windsurf MCP config (`.windsurf/mcp.json` or global settings):

```json
{
  "mcpServers": {
    "uiforge-context": {
      "command": "node",
      "args": [
        "/Users/lucassantana/Desenvolvimento/forge-patterns/dist/mcp-context-server/index.js"
      ]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "uiforge-context": {
      "command": "node",
      "args": [
        "/Users/lucassantana/Desenvolvimento/forge-patterns/dist/mcp-context-server/index.js"
      ]
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uiforge-context": {
      "command": "node",
      "args": [
        "/Users/lucassantana/Desenvolvimento/forge-patterns/dist/mcp-context-server/index.js"
      ]
    }
  }
}
```

## Usage Examples

Once connected, agents can:

```text
# Read a resource directly
uiforge://context/uiforge-mcp

# Call the tool
get_project_context({ project: "mcp-gateway" })

# List all projects
list_projects()
```

## Rebuilding After Changes

The server reads files at request time — no rebuild needed when plan files change. Only rebuild when the TypeScript source changes:

```bash
npm run mcp-context:build
```

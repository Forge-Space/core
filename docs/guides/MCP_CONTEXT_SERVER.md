# UIForge Context MCP Server

The `uiforge-context-server` (v2) is a local stdio MCP server and the **absolute source of truth** for all UIForge project contexts. It manages a centralized `context-store/` directory — agents can read any project's context and write updates back through the same interface.

## Architecture

```
src/mcp-context-server/
├── context-store/          # Source of truth — one .md + .meta.json per project
│   ├── forge-patterns.md
│   ├── forge-patterns.meta.json
│   ├── uiforge-webapp.md
│   ├── uiforge-webapp.meta.json
│   ├── uiforge-mcp.md
│   ├── uiforge-mcp.meta.json
│   ├── mcp-gateway.md
│   └── mcp-gateway.meta.json
├── store.ts                # Read/write/list with path-confinement security
├── resources.ts            # Dynamic MCP resources from store
├── tools.ts                # Tool handlers
└── index.ts                # Server entry point (v2.0.0)
```

## Resources

Resources are enumerated dynamically from the store. Each registered project is exposed at:

```
uiforge://context/<project-slug>
```

Current projects: `forge-patterns`, `uiforge-webapp`, `uiforge-mcp`, `mcp-gateway`

## Tools

| Tool                     | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `get_project_context`    | Returns the full context document for a project from the store              |
| `update_project_context` | Writes/overwrites a project's context in the store (creates if new)         |
| `list_projects`          | Lists all registered projects with slugs, descriptions, and last-updated    |

### `update_project_context` parameters

| Parameter     | Type   | Required | Description                                              |
| ------------- | ------ | -------- | -------------------------------------------------------- |
| `project`     | string | ✅       | Kebab-case slug (e.g. `my-project`)                      |
| `title`       | string | ✅       | Human-readable title                                     |
| `description` | string | ✅       | One-sentence description for the resource listing        |
| `content`     | string | ✅       | Full markdown content — completely replaces existing doc |

## Setup

### 1. Install dependencies and build

```bash
# From forge-patterns root
npm install
npm run mcp-context:build
```

### 2. Verify the build

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/mcp-context-server/index.js
# Should return JSON with get_project_context, update_project_context, list_projects
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

```text
# List all registered projects
list_projects()

# Read a project's full context
get_project_context({ project: "mcp-gateway" })

# Read via MCP resource URI
uiforge://context/uiforge-mcp

# Update a project's context (replaces existing)
update_project_context({
  project: "uiforge-webapp",
  title: "uiforge-webapp Project Plan",
  description: "Zero-cost AI-powered UI generation platform.",
  content: "# UIForge Web App\n\n..."
})

# Add a brand-new project to the store
update_project_context({
  project: "my-new-project",
  title: "My New Project",
  description: "Short description for the listing.",
  content: "# My New Project\n\n..."
})
```

## Rebuilding After Changes

Only rebuild when the TypeScript source changes. The store is read at request time — updating context via `update_project_context` takes effect immediately without a rebuild.

```bash
npm run mcp-context:build
```

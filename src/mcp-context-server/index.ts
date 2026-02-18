import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import {
  getProjectResources,
  findResourceByUri,
  readResourceContent
} from './resources.js';
import {
  TOOLS,
  handleGetProjectContext,
  handleUpdateProjectContext,
  handleListProjects
} from './tools.js';

const server = new Server(
  {
    name: 'uiforge-context-server',
    version: '2.0.0'
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: getProjectResources().map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType
    }))
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const resource = findResourceByUri(uri);

  if (!resource) {
    throw new Error(`Resource not found: ${uri}`);
  }

  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: readResourceContent(resource.project)
      }
    ]
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case 'get_project_context':
        result = handleGetProjectContext(args ?? {});
        break;
      case 'update_project_context':
        result = handleUpdateProjectContext(args ?? {});
        break;
      case 'list_projects':
        result = handleListProjects();
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: 'text', text: result }]
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('UIForge Context MCP Server v2.0.0 running on stdio\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

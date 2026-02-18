import { PROJECT_RESOURCES, findResourceByProject, readResourceContent } from './resources.js';

export const TOOLS = [
  {
    name: 'get_project_context',
    description:
      'Returns the full project context document for a UIForge project. Use this to get up-to-date architecture, status, requirements, and roadmap information for any project in the UIForge ecosystem.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project: {
          type: 'string',
          description:
            'The project to retrieve context for. One of: forge-patterns, uiforge-webapp, uiforge-mcp, mcp-gateway',
          enum: ['forge-patterns', 'uiforge-webapp', 'uiforge-mcp', 'mcp-gateway']
        }
      },
      required: ['project']
    }
  },
  {
    name: 'list_projects',
    description:
      'Lists all UIForge projects available in this context server with their descriptions.',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  }
];

export function handleGetProjectContext(args: Record<string, unknown>): string {
  const project = args['project'] as string;

  if (!project) {
    throw new Error('Missing required argument: project');
  }

  const resource = findResourceByProject(project);

  if (!resource) {
    const available = PROJECT_RESOURCES.map((r) => r.uri.replace('uiforge://context/', '')).join(
      ', '
    );
    throw new Error(`Unknown project: "${project}". Available projects: ${available}`);
  }

  try {
    const content = readResourceContent(resource);
    return content;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read context for "${project}": ${message}`);
  }
}

export function handleListProjects(): string {
  const lines = PROJECT_RESOURCES.map(
    (r) => `- **${r.uri.replace('uiforge://context/', '')}**: ${r.description}`
  );
  return `# UIForge Projects\n\n${lines.join('\n')}`;
}

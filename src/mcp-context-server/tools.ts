import { listProjects, readContext, writeContext, projectExists } from './store.js';

export const TOOLS = [
  {
    name: 'get_project_context',
    description:
      'Returns the full context document for a UIForge project from the centralized store. ' +
      'This is the absolute source of truth for project architecture, status, requirements, and roadmap. ' +
      'Pass the project slug (e.g. "forge-patterns"). Use list_projects to discover available projects.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project: {
          type: 'string',
          description: 'Project slug to retrieve context for (e.g. forge-patterns, uiforge-webapp, uiforge-mcp, mcp-gateway)'
        }
      },
      required: ['project']
    }
  },
  {
    name: 'update_project_context',
    description:
      'Writes or overwrites the context document for a UIForge project in the centralized store. ' +
      'Use this to keep the source of truth up-to-date after architectural decisions, status changes, ' +
      'roadmap updates, or any significant project change. ' +
      'Provide the full markdown content — this completely replaces the existing context.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project: {
          type: 'string',
          description: 'Project slug (e.g. forge-patterns, uiforge-webapp, uiforge-mcp, mcp-gateway). Use a short kebab-case identifier for new projects.'
        },
        title: {
          type: 'string',
          description: 'Human-readable project title (e.g. "forge-patterns Project Context")'
        },
        description: {
          type: 'string',
          description: 'One-sentence description of the project for the resource listing'
        },
        content: {
          type: 'string',
          description: 'Full markdown content of the project context document. This is the complete source of truth.'
        }
      },
      required: ['project', 'title', 'description', 'content']
    }
  },
  {
    name: 'list_projects',
    description:
      'Lists all projects registered in the centralized UIForge context store, with their slugs, titles, descriptions, and last-updated timestamps.',
    inputSchema: {
      type: 'object' as const,
      properties: {}
    }
  }
];

export function handleGetProjectContext(args: Record<string, unknown>): string {
  const project = args['project'] as string;
  if (!project) throw new Error('Missing required argument: project');

  if (!projectExists(project)) {
    const available = listProjects().map((p) => p.project).join(', ');
    throw new Error(
      `No context found for project "${project}". ` +
      `Available projects: ${available || '(none yet — use update_project_context to add one)'}`
    );
  }

  return readContext(project);
}

export function handleUpdateProjectContext(args: Record<string, unknown>): string {
  const project = args['project'] as string;
  const title = args['title'] as string;
  const description = args['description'] as string;
  const content = args['content'] as string;

  if (!project) throw new Error('Missing required argument: project');
  if (!title) throw new Error('Missing required argument: title');
  if (!description) throw new Error('Missing required argument: description');
  if (!content) throw new Error('Missing required argument: content');

  const isNew = !projectExists(project);
  const meta = writeContext(project, content, title, description);

  return (
    `${isNew ? 'Created' : 'Updated'} context for "${project}".\n` +
    `Title: ${meta.title}\n` +
    `Updated at: ${meta.updatedAt}\n` +
    `Content length: ${content.length} characters`
  );
}

export function handleListProjects(): string {
  const projects = listProjects();
  if (projects.length === 0) {
    return '# UIForge Context Store\n\nNo projects registered yet. Use `update_project_context` to add one.';
  }
  const lines = projects.map(
    (p) => `- **${p.project}** — ${p.description}\n  _Last updated: ${p.updatedAt}_`
  );
  return `# UIForge Context Store\n\n${lines.join('\n')}`;
}

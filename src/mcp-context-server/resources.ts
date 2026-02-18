import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

export interface ProjectResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  filePath: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/mcp-context-server/ → ../../.. → Desenvolvimento/
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

export const PROJECT_RESOURCES: ProjectResource[] = [
  {
    uri: 'uiforge://context/forge-patterns',
    name: 'forge-patterns Project Context',
    description:
      'Comprehensive project context for UIForge Patterns — the central pattern library and development framework for the UIForge ecosystem.',
    mimeType: 'text/markdown',
    filePath: resolve(
      REPO_ROOT,
      'forge-patterns',
      'docs',
      'project',
      'PROJECT_CONTEXT.MD'
    )
  },
  {
    uri: 'uiforge://context/uiforge-webapp',
    name: 'uiforge-webapp Project Plan',
    description:
      'Master plan for the UIForge Web Application — a zero-cost AI-powered UI generation platform built on Next.js 15, Supabase, and Cloudflare Workers.',
    mimeType: 'text/markdown',
    filePath: resolve(REPO_ROOT, 'uiforge-webapp', 'plan.MD')
  },
  {
    uri: 'uiforge://context/uiforge-mcp',
    name: 'uiforge-mcp Project Plan',
    description:
      'Master plan for the UIForge MCP Server — a free and open-source MCP server for AI-driven UI component generation with multi-framework support.',
    mimeType: 'text/markdown',
    filePath: resolve(REPO_ROOT, 'uiforge-mcp', 'plan.MD')
  },
  {
    uri: 'uiforge://context/mcp-gateway',
    name: 'mcp-gateway Project Context',
    description:
      'Project context for Forge MCP Gateway — a self-hosted aggregation gateway consolidating multiple MCP servers into a single IDE connection point.',
    mimeType: 'text/markdown',
    filePath: resolve(REPO_ROOT, 'mcp-gateway', 'PROJECT_CONTEXT.md')
  }
];

export function readResourceContent(resource: ProjectResource): string {
  return readFileSync(resource.filePath, 'utf-8');
}

export function findResource(uri: string): ProjectResource | undefined {
  return PROJECT_RESOURCES.find((r) => r.uri === uri);
}

export function findResourceByProject(project: string): ProjectResource | undefined {
  return PROJECT_RESOURCES.find((r) => r.uri === `uiforge://context/${project}`);
}

import { listProjects, readContext, readMeta, projectExists } from './store.js';

export interface ProjectResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  project: string;
}

export function getProjectResources(): ProjectResource[] {
  return listProjects().map(meta => ({
    uri: `uiforge://context/${meta.project}`,
    name: meta.title,
    description: meta.description,
    mimeType: 'text/markdown',
    project: meta.project
  }));
}

export function readResourceContent(project: string): string {
  return readContext(project);
}

export function findResourceByUri(uri: string): ProjectResource | undefined {
  const prefix = 'uiforge://context/';
  if (!uri.startsWith(prefix)) return undefined;
  const project = uri.slice(prefix.length);
  if (!projectExists(project)) return undefined;
  const meta = readMeta(project);
  return {
    uri,
    name: meta.title,
    description: meta.description,
    mimeType: 'text/markdown',
    project
  };
}

export function findResourceByProject(project: string): ProjectResource | undefined {
  return findResourceByUri(`uiforge://context/${project}`);
}

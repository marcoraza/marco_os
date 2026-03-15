import type { StoredEvent, StoredNote } from './models';
import type { Project, Task } from '../lib/appTypes';
import type { Agent } from '../types/agents';

export type QuickCaptureType = 'Nota' | 'Tarefa' | 'Ideia' | 'Decisão';

export function createProject(name: string, color: string): Project {
  return {
    id: `proj-${Date.now()}`,
    name,
    color,
    icon: 'folder',
    deletable: true,
  };
}

export function createTaskFromInput(
  input: { title: string; tag?: string; priority?: Task['priority'] },
  projectId: string,
): Task {
  return {
    id: Date.now(),
    title: input.title,
    tag: input.tag || 'GERAL',
    projectId,
    status: 'assigned',
    priority: input.priority || 'medium',
    deadline: 'A definir',
    assignee: 'MA',
    dependencies: 0,
  };
}

export function createPaletteTask(title: string, projectId: string): Task {
  return createTaskFromInput({ title }, projectId);
}

export function createPaletteNote(title: string, projectId: string, now = new Date().toISOString()): StoredNote {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `note-${Date.now()}`,
    title,
    body: '',
    createdAt: now,
    updatedAt: now,
    projectId,
  };
}

export function createQuickCaptureNote(
  content: string,
  type: Exclude<QuickCaptureType, 'Tarefa'>,
  projectId: string,
  now = new Date().toISOString(),
): StoredNote {
  const cleanContent = content.trim();
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `note-${Date.now()}`,
    title: `[${type}] ${cleanContent.slice(0, 60)}`,
    body: cleanContent,
    createdAt: now,
    updatedAt: now,
    projectId,
  };
}

export function createQuickCaptureTask(content: string, projectId: string): Task {
  return createTaskFromInput({ title: content.trim(), tag: 'CAPTURA' }, projectId);
}

export function createPaletteEvent(title: string, projectId: string, now = new Date().toISOString()): StoredEvent {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `event-${Date.now()}`,
    title,
    date: now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
    projectId,
  };
}

export function mergeLiveAgent(agent: Agent, liveAgent: Partial<Agent> & Pick<Agent, 'id' | 'name' | 'role' | 'status'>): Agent {
  return {
    ...agent,
    ...liveAgent,
    lastHeartbeat: liveAgent.lastHeartbeat || agent.lastHeartbeat || '',
    uptime: liveAgent.uptime || agent.uptime || '',
    tags: liveAgent.tags || agent.tags || [],
  };
}

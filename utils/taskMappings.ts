// utils/taskMappings.ts
// Mapping utilities for Notion ChecklistItem ↔ Task and ProjetoItem ↔ Project

import type { Task, Project } from '../lib/appTypes';
import type { ChecklistItem, ProjetoItem } from '../lib/dataProvider';

// ─── Status Mappings ────────────────────────────────────────────────────────

/** Notion status → Task.status */
const NOTION_STATUS_TO_TASK: Record<string, Task['status']> = {
  'Aberto': 'assigned',
  'Em Planejamento': 'assigned',
  'Em progresso': 'in-progress',
  'Em andamento': 'in-progress',
  'Revisão': 'started',
  'Parcial': 'started',
  'Concluído': 'done',
  'Pausado': 'standby',
};

/** Task.status → Notion status (for PATCH API) */
export const TASK_STATUS_TO_NOTION: Record<Task['status'], string> = {
  'assigned': 'Aberto',
  'started': 'Revisão',
  'in-progress': 'Em progresso',
  'standby': 'Pausado',
  'done': 'Concluído',
};

// ─── Priority Mappings ──────────────────────────────────────────────────────

/** Notion priority → Task.priority */
function mapPriority(notionPriority: string | undefined): Task['priority'] {
  if (!notionPriority) return 'medium';
  if (notionPriority.includes('Urgente') || notionPriority.includes('Alta')) return 'high';
  if (notionPriority.includes('Baixa')) return 'low';
  return 'medium';
}

// ─── Date Formatting ────────────────────────────────────────────────────────

const TZ = 'America/Sao_Paulo';

/** Format due date as relative string (PT-BR) */
export function formatDeadline(dateStr: string | undefined | null): string {
  if (!dateStr) return 'A definir';
  
  const now = new Date();
  const due = new Date(dateStr);
  
  // Reset hours for day comparison
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffMs = dueDay.getTime() - nowDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays < -1) {
    const abs = Math.abs(diffDays);
    return abs <= 7 ? `${abs}d atrás` : due.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: TZ });
  }
  if (diffDays <= 7) return `${diffDays} dias`;
  if (diffDays <= 14) return 'Prox. Semana';
  if (diffDays <= 30) return 'Prox. Mês';
  return due.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: TZ });
}

// ─── ChecklistItem → Task ───────────────────────────────────────────────────

let taskIdCounter = 1000;

export function checklistItemToTask(item: ChecklistItem, projectIdMap: Map<string, string>): Task {
  // Generate numeric ID from Notion UUID
  const numericId = taskIdCounter++;
  
  // Map status
  const status = NOTION_STATUS_TO_TASK[item.status] ?? 'assigned';
  
  // Map priority
  const priority = mapPriority(item.prioridade);
  
  // Format deadline
  const deadline = formatDeadline(item.prazo);
  
  // Get first tag or use 'GERAL'
  // Note: ChecklistItem doesn't have tags array in dataProvider, using projeto as tag fallback
  const tag = item.projeto ? item.projeto.toUpperCase().slice(0, 10) : 'GERAL';
  
  // Map project name to project ID
  const projectName = item.projeto?.toLowerCase().trim() || '';
  const projectId = projectIdMap.get(projectName) || 'pessoal';
  
  return {
    id: numericId,
    title: item.title,
    tag,
    projectId,
    status,
    priority,
    deadline,
    assignee: item.responsavel || 'MA',
    dependencies: 0,
    // Store Notion ID for API calls
    notionId: item.id,
  } as Task & { notionId: string };
}

// ─── ProjetoItem → Project ──────────────────────────────────────────────────

const PROJECT_COLORS = ['#0A84FF', '#BF5AF2', '#FF9F0A', '#FF453A', '#FF5500', '#4CD964', '#5AC8FA'];

export function projetoItemToProject(item: ProjetoItem, index: number): Project {
  return {
    id: item.id,
    name: item.title,
    color: PROJECT_COLORS[index % PROJECT_COLORS.length],
    icon: 'folder',
    deletable: true,
  };
}

// ─── Build project ID map from names ────────────────────────────────────────

export function buildProjectIdMap(projects: Project[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of projects) {
    map.set(p.name.toLowerCase().trim(), p.id);
    // Also map normalized versions
    const normalized = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    map.set(normalized, p.id);
  }
  return map;
}

// ─── API Status sync ────────────────────────────────────────────────────────

/** Kanban status values expected by Bridge API */
const TASK_STATUS_TO_API: Record<Task['status'], string> = {
  'assigned': 'backlog',
  'started': 'revisao',
  'in-progress': 'em-progresso',
  'standby': 'backlog', // API doesn't have standby, map to backlog
  'done': 'concluido',
};

export async function syncTaskStatus(
  notionId: string,
  newStatus: Task['status'],
  apiBase: string,
  apiToken: string
): Promise<boolean> {
  const apiStatus = TASK_STATUS_TO_API[newStatus];
  
  try {
    const response = await fetch(`${apiBase}/api/tasks/${notionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({ status: apiStatus }),
    });
    
    if (!response.ok) {
      console.error('[TaskSync] Failed to update status:', response.status);
      return false;
    }
    
    const data = await response.json();
    return data.ok === true;
  } catch (err) {
    console.error('[TaskSync] Error syncing status:', err);
    return false;
  }
}

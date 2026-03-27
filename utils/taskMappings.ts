// utils/taskMappings.ts
// Mapping utilities for Notion ChecklistItem ↔ Task, ClickUp row ↔ Task, and ProjetoItem ↔ Project

import type { Task, Project } from '../lib/appTypes';
import type { ChecklistItem, ProjetoItem } from '../lib/dataProvider';

// ─── ClickUp DB row (matches clickup_tasks Supabase table) ──────────────────
export interface ClickUpRow {
  id: string
  name: string
  status: string
  status_type: string
  priority: number | null
  priority_name: string | null
  due_date: string | null
  list_id: string
  list_name: string
  folder_name: string
  space_name: string | null
  pilar: string | null
  energia: string | null
  impacto: number | null
  tempo_estimado: number | null
  notion_url: string | null
  recurrence_type: string | null
  kanban_status: string | null
  url: string
  synced_at: string
}

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

/** Format due date as compact relative string (PT-BR) */
export function formatDeadline(dateStr: string | undefined | null): string {
  if (!dateStr) return '';

  const now = new Date();
  const due = new Date(dateStr);

  // Reset hours for day comparison
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueDay.getTime() - nowDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays < 0) return `−${Math.abs(diffDays)}d`;
  if (diffDays <= 7) return `${diffDays}d`;
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

// ─── ClickUp row → Task ─────────────────────────────────────────────────────

/** ClickUp status_type / status name → Task.status */
function mapClickUpStatus(statusType: string, statusName: string): Task['status'] {
  if (statusType === 'closed') return 'done';
  if (statusType === 'inprogress') {
    const name = statusName.toLowerCase();
    if (name.includes('review') || name.includes('revisão') || name.includes('revisao')) return 'started';
    if (name.includes('stand') || name.includes('pause') || name.includes('block')) return 'standby';
    return 'in-progress';
  }
  // open
  const name = statusName.toLowerCase();
  if (name.includes('stand') || name.includes('pause') || name.includes('block')) return 'standby';
  return 'assigned';
}

/** ClickUp priority number (1=urgent, 2=high, 3=normal, 4=low) → Task.priority */
function mapClickUpPriority(priority: number | null): Task['priority'] {
  if (priority === 1) return 'urgent';
  if (priority === 2) return 'high';
  if (priority === 4) return 'low';
  return 'medium'; // 3 (normal) or null
}

/** ClickUp space_name / folder_name → Task.projectId */
function mapClickUpProjectId(spaceName: string | null): string {
  if (!spaceName) return 'pessoal';
  const s = spaceName.toUpperCase();
  if (s.includes('PERSONAL') || s.includes('LIFE') || s.includes('COMMAND CENTER')) return 'pessoal';
  return 'pessoal'; // default — all tasks are Marco's
}

// ─── 6 Fixed Tags by Life Area ───────────────────────────────────────────────

/** folder_name → fixed tag category */
const FOLDER_TO_TAG: Record<string, string> = {
  'hidden': 'DAILY',           // Daily Actions folder
  'marco os': 'BUILD',
  'turboclaw': 'BUILD',
  'frank': 'BUILD',
  'system360': 'BUILD',
  'saude & corpo': 'FÍSICO',
  'saúde & corpo': 'FÍSICO',
  'crescimento & aprendizado': 'MIND',
  'relacionamentos': 'LIFE',
  'ambiente & lifestyle': 'LIFE',
  'marketing & growth': 'BIZ',
  'revenue & operacoes': 'BIZ',
  'revenue & operações': 'BIZ',
};

/** list_name fallback → fixed tag category */
const LIST_TO_TAG: Record<string, string> = {
  'daily actions': 'DAILY',
  'sprint atual': 'BUILD',
  'treinos & exercicio': 'FÍSICO',
  'treinos & exercício': 'FÍSICO',
  'inner circle': 'LIFE',
  'viagens & aventuras': 'LIFE',
  'content calendar': 'BIZ',
  'pricing & strategy': 'BIZ',
  'experimentos & labs': 'MIND',
  'learning': 'MIND',
};

/** Map ClickUp task to one of 6 fixed tags: DAILY, BUILD, FÍSICO, MIND, LIFE, BIZ */
function mapClickUpTag(listName: string | null, folderName?: string): string {
  // Try folder first (more accurate)
  if (folderName) {
    const folderTag = FOLDER_TO_TAG[folderName.toLowerCase()];
    if (folderTag) return folderTag;
  }
  // Fallback to list name
  if (listName) {
    const listTag = LIST_TO_TAG[listName.toLowerCase()];
    if (listTag) return listTag;
  }
  return 'GERAL';
}

/** Simple string hash to generate stable numeric ID from ClickUp string ID */
function hashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Title Normalization ─────────────────────────────────────────────────────

/** Explicit title overrides for known ClickUp task names → clean Marco OS display */
const TITLE_OVERRIDES: Record<string, string> = {
  'treino / movimento': 'Treinar musculação',
  'hidratacao — 2l+ agua': 'Hidratar 2L+',
  'hidratação — 2l+ água': 'Hidratar 2L+',
  'deep work — bloco focado': 'Deep work focado',
  'journal — reflexao do dia': 'Journaling diário',
  'journal — reflexão do dia': 'Journaling diário',
  'leitura — 20 min': 'Ler 20 min',
  'sem telas 1h antes de dormir': 'Detox digital',
  'nutricao — comer direito hoje': 'Nutrir bem',
  'nutrição — comer direito hoje': 'Nutrir bem',
  'meditacao / respiracao — 10 min': 'Meditar 10 min',
  'meditação / respiração — 10 min': 'Meditar 10 min',
};

/** Strip emojis and normalize title for minimal, padronized display (max 28 chars) */
function cleanTitle(raw: string): string {
  // 1. Strip ALL emojis (leading, trailing, inline)
  let stripped = raw.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]+/gu, '').trim();

  // 2. Check explicit overrides (case-insensitive)
  const overrideKey = stripped.toLowerCase();
  if (TITLE_OVERRIDES[overrideKey]) return TITLE_OVERRIDES[overrideKey];

  // 3. Truncate at " — " delimiter (keep the action part, drop the description)
  const dashIdx = stripped.indexOf(' — ');
  if (dashIdx > 0) stripped = stripped.slice(0, dashIdx).trim();

  // 4. Truncate at 28 chars on word boundary
  if (stripped.length > 28) {
    const cut = stripped.lastIndexOf(' ', 28);
    stripped = stripped.slice(0, cut > 10 ? cut : 28);
  }

  // 5. Capitalize first letter
  if (stripped.length > 0) stripped = stripped[0].toUpperCase() + stripped.slice(1);
  return stripped;
}

export function clickupTaskToTask(row: ClickUpRow): Task {
  const deadlineStr = row.due_date
    ? formatDeadline(row.due_date.split('T')[0].split(' ')[0])
    : '';

  // kanban_status (Marco OS authority) > ClickUp status_type
  const status: Task['status'] = row.kanban_status
    ? (row.kanban_status as Task['status'])
    : mapClickUpStatus(row.status_type, row.status);

  return {
    id: hashId(row.id),
    title: cleanTitle(row.name),
    tag: mapClickUpTag(row.list_name, row.folder_name),
    projectId: mapClickUpProjectId(row.space_name),
    status,
    priority: mapClickUpPriority(row.priority),
    deadline: deadlineStr,
    assignee: 'MA',
    dependencies: 0,
    notionId: row.id,
  };
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

// ─── ClickUp write-back ──────────────────────────────────────────────────────

/** Marco OS Task.status → ClickUp status name */
const TASK_STATUS_TO_CLICKUP: Record<Task['status'], string> = {
  'assigned': 'to do',
  'started': 'review',
  'in-progress': 'in progress',
  'standby': 'to do',
  'done': 'complete',
};

/**
 * Syncs a task status change back to ClickUp directly from the browser.
 * Uses the task's notionId field which stores the ClickUp task ID.
 */
export async function syncClickUpTaskStatus(
  clickupTaskId: string,
  newStatus: Task['status'],
): Promise<boolean> {
  const apiKey = import.meta.env.VITE_CLICKUP_API_KEY;
  if (!apiKey) {
    console.warn('[ClickUpSync] VITE_CLICKUP_API_KEY not configured');
    return false;
  }

  const clickupStatus = TASK_STATUS_TO_CLICKUP[newStatus];

  try {
    const res = await fetch(`https://api.clickup.com/api/v2/task/${clickupTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({ status: clickupStatus }),
    });

    if (!res.ok) {
      console.error('[ClickUpSync] Failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[ClickUpSync] Error:', err);
    return false;
  }
}

// ─── API Status sync (Notion/Bridge) ────────────────────────────────────────

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

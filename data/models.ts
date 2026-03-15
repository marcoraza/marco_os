export interface StoredProject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  deletable: boolean;
}

export type StoredTaskStatus = 'assigned' | 'started' | 'in-progress' | 'standby' | 'done';
export type StoredTaskPriority = 'high' | 'medium' | 'low';

export interface StoredTask {
  id: number;
  title: string;
  tag: string;
  projectId: string;
  status: StoredTaskStatus;
  priority: StoredTaskPriority;
  deadline: string;
  assignee: string;
  dependencies?: number;
}

export interface StoredNote {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  projectId?: string;
  tags?: string[];
  starred?: boolean;
  linkedNoteIds?: string[];
}

export interface StoredEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  projectId?: string;
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
export interface StoredContact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  image?: string;
  initials?: string;
  status: 'hot' | 'warm' | 'cold';
  tags: string[];
  lastContact: string;
  notes?: string;
  nextFollowUp?: string;
  interactionLog?: Array<{
    id: string;
    type: 'email' | 'call' | 'meeting' | 'note';
    title: string;
    happenedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Plans ────────────────────────────────────────────────────────────────────
export interface StoredPlanStep {
  text: string;
  done: boolean;
}

export interface StoredPlanRisk {
  risk: string;
  mitigation: string;
}

export interface StoredPlanSuggestedTask {
  title: string;
  tag: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
}

export interface StoredPlan {
  id: string;
  title: string;
  context: string;
  projectId: string;
  summary: string;
  objectives: string[];
  steps: StoredPlanStep[];
  risks: StoredPlanRisk[];
  checklist: string[];
  suggestedTasks: StoredPlanSuggestedTask[];
  exported: boolean;
  exportedAt?: string;
  exportedTaskIds?: number[];
  lastOpenedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Finance Entries ─────────────────────────────────────────────────────────
export interface StoredFinanceEntry {
  id: string;
  name: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  categoria: string;
  data: string; // YYYY-MM-DD
  recorrente: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Health Entries ──────────────────────────────────────────────────────────
export interface StoredHealthEntry {
  id: string;
  name: string;
  tipo: 'treino' | 'peso' | 'habito' | 'sono' | 'humor';
  valor?: number;
  duracao?: number; // minutes
  data: string; // YYYY-MM-DD
  notas?: string;
  // Extended fields (journey + conditional forms)
  intensidade?: number; // 1-10
  grupos?: string[]; // muscle groups or habit categories
  dormiu?: string; // HH:mm
  acordou?: string; // HH:mm
  qualidade?: number; // 1-5
  humor_nivel?: string; // 'otimo' | 'bom' | 'neutro' | 'baixo' | 'pessimo'
  cumprido?: boolean; // for habits
  createdAt: string;
  updatedAt: string;
}

// ─── Reunioes ────────────────────────────────────────────────────────────────
export interface StoredReuniao {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  participants?: string;
  objective?: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  createdAt: string;
  updatedAt: string;
}

// ─── Skills ──────────────────────────────────────────────────────────────────
export interface StoredSkill {
  id: string;
  name: string;
  categoria: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado' | 'expert';
  progresso: number; // 0-100
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Content Entries ────────────────────────────────────────────────────────
export interface StoredContentEntry {
  id: string;
  title: string;
  tipo: 'post' | 'video' | 'thread' | 'artigo' | 'newsletter' | 'outro';
  plataforma: string;
  status: 'ideia' | 'rascunho' | 'producao' | 'publicado' | 'arquivado';
  data?: string; // YYYY-MM-DD
  link?: string;
  notas?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Projetos Entries (distinct from StoredProject which is UI workspace) ────
export interface StoredProjectEntry {
  id: string;
  name: string;
  descricao?: string;
  status: 'ativo' | 'pausado' | 'concluido' | 'arquivado';
  prioridade: 'alta' | 'media' | 'baixa';
  deadline?: string; // YYYY-MM-DD
  linkDrive?: string;
  linkNotion?: string;
  linkGithub?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Agents ───────────────────────────────────────────────────────────────────
export type StoredAgentStatus = 'online' | 'busy' | 'idle' | 'offline';
export type StoredAgentRole = 'coordinator' | 'sub-agent' | 'integration';

export interface StoredAgent {
  id: string;
  name: string;
  role: StoredAgentRole;
  status: StoredAgentStatus;
  tools: string[];
  model: string;
  lastSeen: string; // ISO
  notes: string;
  capabilities: string[];
  // UI extras (carried from types/agents.ts)
  owner?: string;
  domain?: string;
  handle?: string;
  avatarIcon?: string;
  currentMission?: string;
  tags?: string[];
  uptime?: string;
  lastHeartbeat?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type StoredAgentRunStatus = 'running' | 'done' | 'failed' | 'queued';

export interface StoredAgentRun {
  id: string;
  agentId: string;
  name: string;
  status: StoredAgentRunStatus;
  startedAt: string; // ISO
  finishedAt?: string; // ISO
  duration: string;
  output?: string;
  createdAt: string; // ISO
}

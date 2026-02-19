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

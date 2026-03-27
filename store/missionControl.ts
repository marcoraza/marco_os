/**
 * Mission Control Zustand store.
 *
 * Types ported from the MC vendor store (src/store/index.ts).
 * State consumed by all agent-section panels in the V1 shell.
 * Data flows exclusively through lib/mcApi.ts.
 */
import { create } from 'zustand';
import {
  MOCK_AGENTS,
  MOCK_TASKS,
  MOCK_ACTIVITIES,
  MOCK_LOGS,
  MOCK_CRON_JOBS,
  MOCK_TOKEN_USAGE,
} from './mcMockData';

// ── Types (ported from MC) ────────────────────────────────────────────────────

export interface MCAgent {
  id: number;
  name: string;
  role: string;
  session_key?: string;
  status: 'offline' | 'idle' | 'busy' | 'error';
  last_seen?: number;
  last_activity?: string;
  created_at: number;
  updated_at: number;
  hidden?: number;
  config?: Record<string, unknown>;
  taskStats?: {
    total: number;
    assigned: number;
    in_progress: number;
    quality_review: number;
    done: number;
    completed: number;
  };
}

export interface MCTask {
  id: number;
  title: string;
  description?: string;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'quality_review' | 'done' | 'awaiting_owner';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  project_id?: number;
  project_name?: string;
  ticket_ref?: string;
  assigned_to?: string;
  created_by: string;
  created_at: number;
  updated_at: number;
  due_date?: number;
  estimated_hours?: number;
  actual_hours?: number;
  outcome?: 'success' | 'failed' | 'partial' | 'abandoned';
  error_message?: string;
  tags?: string[];
  completed_at?: number;
}

export interface MCSession {
  id: string;
  key: string;
  agent?: string;
  channel?: string;
  kind: string;
  age: string;
  model: string;
  tokens: string;
  flags: string[];
  active: boolean;
  startTime?: number;
  lastActivity?: number;
  messageCount?: number;
  cost?: number;
  label?: string;
}

export interface MCActivity {
  id: number;
  type: string;
  entity_type: string;
  entity_id: number;
  actor: string;
  description: string;
  data?: Record<string, unknown>;
  created_at: number;
  entity?: {
    type: string;
    id?: number;
    title?: string;
    name?: string;
    status?: string;
  };
}

export interface MCLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  session?: string;
  message: string;
  data?: unknown;
}

export interface MCCronJob {
  id?: string;
  name: string;
  schedule: string;
  command: string;
  model?: string;
  agentId?: string;
  timezone?: string;
  delivery?: string;
  enabled: boolean;
  lastRun?: number;
  nextRun?: number;
  lastStatus?: 'success' | 'error' | 'running';
  lastError?: string;
}

export interface MCMemoryFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: number;
  children?: MCMemoryFile[];
}

export interface MCTokenUsage {
  model: string;
  sessionId: string;
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface MCStandupReport {
  date: string;
  generatedAt: string;
  summary: {
    totalAgents: number;
    totalCompleted: number;
    totalInProgress: number;
    totalAssigned: number;
    totalReview: number;
    totalBlocked: number;
    totalActivity: number;
    overdue: number;
  };
  agentReports: Array<{
    agent: { name: string; role: string; status: string; last_seen?: number };
    completedToday: MCTask[];
    inProgress: MCTask[];
    assigned: MCTask[];
    review: MCTask[];
    blocked: MCTask[];
    activity: { actionCount: number; commentsCount: number };
  }>;
  teamAccomplishments: MCTask[];
  teamBlockers: MCTask[];
  overdueTasks: MCTask[];
}

export interface MCProject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  ticket_prefix: string;
  status: string;
  github_repo?: string;
  color?: string;
  task_count?: number;
  assigned_agents?: string[];
}

export interface MCNotification {
  id: number;
  recipient: string;
  type: string;
  title: string;
  message: string;
  read_at?: number;
  created_at: number;
}

export type MCConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type MCAgentTab =
  | 'standup' | 'tasks' | 'activity' | 'logs' | 'tokens'
  | 'cron' | 'memory' | 'webhooks' | 'config' | 'chat'
  | 'skills' | 'overview';

export type MCAgentDetailTab =
  | 'overview' | 'tasks' | 'activity' | 'chat' | 'memory'
  | 'config' | 'cron' | 'tools' | 'models';

// ── Store ─────────────────────────────────────────────────────────────────────

interface MissionControlState {
  // Connection
  connectionStatus: MCConnectionStatus;
  setConnectionStatus: (status: MCConnectionStatus) => void;

  // Agents
  agents: MCAgent[];
  selectedAgentId: number | null;
  setAgents: (agents: MCAgent[]) => void;
  setSelectedAgentId: (id: number | null) => void;

  // Tasks
  tasks: MCTask[];
  setTasks: (tasks: MCTask[]) => void;
  updateTask: (taskId: number, updates: Partial<MCTask>) => void;

  // Sessions
  sessions: MCSession[];
  setSessions: (sessions: MCSession[]) => void;

  // Activities
  activities: MCActivity[];
  setActivities: (activities: MCActivity[]) => void;

  // Logs
  logs: MCLogEntry[];
  setLogs: (logs: MCLogEntry[]) => void;
  addLog: (log: MCLogEntry) => void;

  // Cron
  cronJobs: MCCronJob[];
  setCronJobs: (jobs: MCCronJob[]) => void;

  // Memory
  memoryFiles: MCMemoryFile[];
  setMemoryFiles: (files: MCMemoryFile[]) => void;

  // Token usage
  tokenUsage: MCTokenUsage[];
  setTokenUsage: (usage: MCTokenUsage[]) => void;

  // Standup
  currentStandup: MCStandupReport | null;
  setCurrentStandup: (report: MCStandupReport | null) => void;

  // Projects
  projects: MCProject[];
  setProjects: (projects: MCProject[]) => void;

  // Notifications
  notifications: MCNotification[];
  setNotifications: (notifications: MCNotification[]) => void;

  // UI Navigation
  activeTab: MCAgentTab;
  setActiveTab: (tab: MCAgentTab) => void;
  activeDetailTab: MCAgentDetailTab;
  setActiveDetailTab: (tab: MCAgentDetailTab) => void;
}

export const useMissionControlStore = create<MissionControlState>()((set) => ({
  // Connection
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Agents (seeded with mocks, replaced when MC service connects)
  agents: MOCK_AGENTS,
  selectedAgentId: null,
  setAgents: (agents) => set({ agents }),
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),

  // Tasks (seeded with mocks)
  tasks: MOCK_TASKS,
  setTasks: (tasks) => set({ tasks }),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),

  // Sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),

  // Activities (seeded with mocks)
  activities: MOCK_ACTIVITIES,
  setActivities: (activities) => set({ activities }),

  // Logs (seeded with mocks)
  logs: MOCK_LOGS,
  setLogs: (logs) => set({ logs }),
  addLog: (log) =>
    set((state) => {
      const exists = state.logs.some((l) => l.id === log.id);
      if (exists) return state;
      return { logs: [log, ...state.logs].slice(0, 500) };
    }),

  // Cron (seeded with mocks)
  cronJobs: MOCK_CRON_JOBS,
  setCronJobs: (jobs) => set({ cronJobs: jobs }),

  // Memory
  memoryFiles: [],
  setMemoryFiles: (files) => set({ memoryFiles: files }),

  // Token usage (seeded with mocks)
  tokenUsage: MOCK_TOKEN_USAGE,
  setTokenUsage: (usage) => set({ tokenUsage: usage }),

  // Standup
  currentStandup: null,
  setCurrentStandup: (report) => set({ currentStandup: report }),

  // Projects
  projects: [],
  setProjects: (projects) => set({ projects }),

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),

  // UI Navigation
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeDetailTab: 'overview',
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
}));

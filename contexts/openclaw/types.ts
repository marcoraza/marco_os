import type { ReactNode } from 'react';
import type { OpenClawHttp } from '../../lib/openclawHttp';
import type { ConnectionState, OpenClawConfig } from '../../lib/openclawTypes';
import type {
  Agent,
  CronJob as MockCronJob,
  Execution,
  HeartbeatEvent,
  KanbanTask as MockKanbanTask,
  MemoryArtifact,
  TokenUsage,
} from '../../data/agentMockData';

export interface CrossDomainSummary {
  dashboard: { total: number; done: number; inProgress: number };
  finance: { balance: string; monthExpenses: string };
  health: { energy: number; focus: number; sleep: string };
  planner: { activeMissions: number };
  crm: { hotContacts: number; pendingReconnect: number };
}

export const defaultCrossDomain: CrossDomainSummary = {
  dashboard: { total: 15, done: 3, inProgress: 4 },
  finance: { balance: 'R$ 12.450', monthExpenses: 'R$ 3.280' },
  health: { energy: 78, focus: 85, sleep: '7h 20m' },
  planner: { activeMissions: 3 },
  crm: { hotContacts: 5, pendingReconnect: 2 },
};

export interface OpenClawContextType {
  connectionState: ConnectionState;
  isLive: boolean;
  connect: () => void;
  disconnect: () => void;
  agents: Agent[];
  getAgentStatus: (agentId: string) => Agent | undefined;
  executions: Execution[];
  getExecutionsForAgent: (agentId: string) => Execution[];
  heartbeats: HeartbeatEvent[];
  getHeartbeatsForAgent: (agentId: string) => HeartbeatEvent[];
  cronJobs: MockCronJob[];
  getCronJobsForAgent: (agentId: string) => MockCronJob[];
  updateCronJob: (job: MockCronJob) => void;
  createCronJob: (job: Omit<MockCronJob, 'id'>) => void;
  deleteCronJob: (jobId: string) => void;
  kanbanTasks: MockKanbanTask[];
  getTasksForAgent: (agentId: string) => MockKanbanTask[];
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<boolean>;
  tokenUsages: TokenUsage[];
  memoryArtifacts: MemoryArtifact[];
  fetchMemoryContent: (path: string) => Promise<string>;
  crossDomainSummary: CrossDomainSummary;
  dispatch: (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => Promise<void>;
  dispatchMission: (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => Promise<boolean>;
  memorySearch: (query: string) => Promise<{ results: Array<{ path: string; snippet: string; score: number }> }>;
  memoryGet: (path: string) => Promise<{ content: string; path: string }>;
  createCronJobApi: (job: { name: string; schedule: string; agentId?: string; message?: string; enabled?: boolean }) => Promise<boolean>;
  updateCronJobApi: (jobId: string, updates: { name?: string; schedule?: string; enabled?: boolean; message?: string }) => Promise<boolean>;
  deleteCronJobApi: (jobId: string) => Promise<boolean>;
  updateAgentConfig: (agentId: string, updates: { model?: string }) => Promise<boolean>;
  http: OpenClawHttp | null;
  sendAgentMessage: (agentId: string, message: string) => Promise<boolean>;
  fetchStandup: () => Promise<any>;
  fetchActivities: (limit?: number) => Promise<any[]>;
  fetchTaskComments: (taskId: string) => Promise<any[]>;
  addTaskComment: (taskId: string, text: string) => Promise<boolean>;
  fetchGitHubIssues: () => Promise<any[]>;
}

export interface OpenClawProviderProps {
  children: ReactNode;
  config?: Partial<OpenClawConfig>;
  autoConnect?: boolean;
}
